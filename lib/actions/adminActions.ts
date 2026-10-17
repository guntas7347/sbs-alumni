"use server";

import { db } from "@/lib/firebase/firebase";
import type { AuthorizedAdmin } from "@/lib/types";

export async function verifyAdminEmail(
  email: string
): Promise<{ authorized: boolean; role?: string; name?: string; isInitialBootstrap?: boolean; error?: string }> {
  try {
    if (!email) return { authorized: false, error: "Email is required" };

    const normalizedEmail = email.trim().toLowerCase();

    // Check if authorized_admins collection has any documents
    const adminsSnapshot = await db.collection("authorized_admins").get();

    // If no admin exists yet in the database, allow the first user to bootstrap as superadmin
    if (adminsSnapshot.empty) {
      const now = new Date().toISOString();
      const initialAdmin: Omit<AuthorizedAdmin, "id"> = {
        email: normalizedEmail,
        role: "superadmin",
        name: normalizedEmail.split("@")[0],
        addedAt: now,
        addedBy: "system-bootstrap",
        active: true,
      };

      await db.collection("authorized_admins").doc(normalizedEmail).set(initialAdmin);

      return {
        authorized: true,
        role: "superadmin",
        name: initialAdmin.name,
        isInitialBootstrap: true,
      };
    }

    // Check if this email exists as a doc or in documents
    const docSnap = await db.collection("authorized_admins").doc(normalizedEmail).get();

    if (docSnap.exists) {
      const data = docSnap.data() as AuthorizedAdmin;
      if (data.active !== false) {
        return {
          authorized: true,
          role: data.role || "admin",
          name: data.name || normalizedEmail.split("@")[0],
        };
      }
    }

    // Also check query where email == normalizedEmail
    const querySnap = await db
      .collection("authorized_admins")
      .where("email", "==", normalizedEmail)
      .where("active", "==", true)
      .limit(1)
      .get();

    if (!querySnap.empty) {
      const data = querySnap.docs[0].data() as AuthorizedAdmin;
      return {
        authorized: true,
        role: data.role || "admin",
        name: data.name || normalizedEmail.split("@")[0],
      };
    }

    return { authorized: false, error: "This email is not authorized for administrator access." };
  } catch (error: any) {
    console.error("Error verifying admin email:", error);
    return { authorized: false, error: error?.message || "Verification failed" };
  }
}

export async function verifyFacultyOrAdmin(
  email: string
): Promise<{ authorized: boolean; role?: string; remark?: string; error?: string }> {
  try {
    if (!email) return { authorized: false, error: "Email is required" };

    const normalizedEmail = email.trim().toLowerCase();

    // Check direct document ID lookup
    const docSnap = await db.collection("authorized_admins").doc(normalizedEmail).get();
    if (docSnap.exists) {
      const data = docSnap.data() as AuthorizedAdmin;
      if (data.active !== false) {
        return {
          authorized: true,
          role: data.role || "faculty",
          remark: data.remark || data.name || "",
        };
      }
    }

    // Query by email field
    const querySnap = await db
      .collection("authorized_admins")
      .where("email", "==", normalizedEmail)
      .where("active", "==", true)
      .limit(1)
      .get();

    if (!querySnap.empty) {
      const data = querySnap.docs[0].data() as AuthorizedAdmin;
      return {
        authorized: true,
        role: data.role || "faculty",
        remark: data.remark || data.name || "",
      };
    }

    // If collection is completely empty, allow bootstrap
    const adminsSnapshot = await db.collection("authorized_admins").get();
    if (adminsSnapshot.empty) {
      await addAuthorizedAdmin(normalizedEmail, "superadmin", "bootstrap", "Initial SuperAdmin");
      return {
        authorized: true,
        role: "superadmin",
        remark: "Initial SuperAdmin",
      };
    }

    return {
      authorized: false,
      error: "Your Gmail has not been added as faculty or administrator by an admin.",
    };
  } catch (error: any) {
    console.error("Error verifying faculty access:", error);
    return { authorized: false, error: error?.message || "Verification failed." };
  }
}

export async function getAuthorizedAdmins(): Promise<{
  success: boolean;
  data?: AuthorizedAdmin[];
  error?: string;
}> {
  try {
    const snapshot = await db.collection("authorized_admins").get();
    const admins: AuthorizedAdmin[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      admins.push({
        id: doc.id,
        email: data.email || doc.id,
        role: data.role || "faculty",
        name: data.name || data.remark || "",
        remark: data.remark || "",
        addedAt: data.addedAt || "",
        addedBy: data.addedBy || "admin",
        active: data.active !== false,
      });
    });

    return { success: true, data: admins };
  } catch (error: any) {
    console.error("Error getting authorized admins:", error);
    return { success: false, error: error?.message || "Failed to fetch admins" };
  }
}

export async function addAuthorizedAdmin(
  email: string,
  role: "superadmin" | "admin" | "faculty" | "coordinator" = "faculty",
  addedBy: string = "superadmin",
  remark?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!email) return { success: false, error: "Gmail ID is required" };

    const normalizedEmail = email.trim().toLowerCase();
    const now = new Date().toISOString();

    const adminData: Omit<AuthorizedAdmin, "id"> = {
      email: normalizedEmail,
      role,
      remark: remark?.trim() || "",
      name: remark?.trim() || normalizedEmail.split("@")[0],
      addedAt: now,
      addedBy,
      active: true,
    };

    await db.collection("authorized_admins").doc(normalizedEmail).set(adminData, { merge: true });

    return { success: true };
  } catch (error: any) {
    console.error("Error adding authorized admin:", error);
    return { success: false, error: error?.message || "Failed to add admin" };
  }
}

export async function removeAuthorizedAdmin(
  email: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!email) return { success: false, error: "Email is required" };

    const normalizedEmail = email.trim().toLowerCase();
    await db.collection("authorized_admins").doc(normalizedEmail).delete();

    return { success: true };
  } catch (error: any) {
    console.error("Error removing authorized admin:", error);
    return { success: false, error: error?.message || "Failed to remove admin" };
  }
}

export async function updateRegistrationStatus(
  id: string,
  updates: {
    paymentStatus?: "completed" | "pending" | "failed";
    checkedIn?: boolean;
    adminNotes?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!id) return { success: false, error: "Registration ID is required" };

    const now = new Date().toISOString();
    const docRef = db.collection("alumni_registrations").doc(id);

    const updatePayload: Record<string, any> = {
      ...updates,
      updatedAt: now,
    };

    if (updates.checkedIn === true) {
      updatePayload.checkedInAt = now;
    }

    await docRef.update(updatePayload);

    return { success: true };
  } catch (error: any) {
    console.error("Error updating registration status:", error);
    return { success: false, error: error?.message || "Failed to update registration status" };
  }
}

export async function deleteRegistration(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!id) return { success: false, error: "Registration ID is required" };

    await db.collection("alumni_registrations").doc(id).delete();
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting registration:", error);
    return { success: false, error: error?.message || "Failed to delete registration" };
  }
}
