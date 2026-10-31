"use server";

import { db } from "@/lib/firebase/firebase";
import { sendMail } from "@/lib/emails/nodemailer";
import { getPassIssuedEmailTemplate } from "@/lib/emails/templates";
import type { AuthorizedAdmin, AlumniRegistration } from "@/lib/types";

const collectionName = "alumni_registrations_2026";

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
    const docRef = db.collection(collectionName).doc(id);

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

    await db.collection(collectionName).doc(id).delete();
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting registration:", error);
    return { success: false, error: error?.message || "Failed to delete registration" };
  }
}

/**
 * Review an alumnus's application to perform on stage at Sanjh 2026.
 * Admin can approve or reject with optional remarks.
 */
export async function reviewPerformanceApplication(
  id: string,
  decision: "approved" | "rejected",
  adminRemarks?: string,
  reviewedBy?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!id) return { success: false, error: "Registration ID is required" };

    const now = new Date().toISOString();
    const docRef = db.collection(collectionName).doc(id);

    await docRef.update({
      performerStatus: decision,
      "performanceApplication.status": decision,
      "performanceApplication.reviewedAt": now,
      "performanceApplication.reviewedBy": reviewedBy || "Admin",
      "performanceApplication.adminRemarks": adminRemarks?.trim() || "",
      updatedAt: now,
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error reviewing performance application:", error);
    return {
      success: false,
      error: error?.message || "Failed to review performance application",
    };
  }
}

/**
 * Fetch all alumni who applied to perform on stage with their application details.
 */
export async function getPerformanceApplications(
  statusFilter: "all" | "pending" | "approved" | "rejected" = "all"
): Promise<{
  success: boolean;
  data?: any[];
  error?: string;
}> {
  try {
    const snapshot = await db
      .collection(collectionName)
      .orderBy("createdAt", "desc")
      .get();

    const applications: any[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      const perf = data.performanceApplication;
      if (perf && perf.applied) {
        if (statusFilter === "all" || perf.status === statusFilter || data.performerStatus === statusFilter) {
          applications.push({
            id: doc.id,
            regNumber: data.regNumber,
            fullName: data.fullName,
            email: data.email,
            phone: data.phone,
            degree: data.degree,
            branch: data.branch,
            passingYear: data.passingYear,
            era: data.era,
            currentDesignation: data.currentDesignation,
            organization: data.organization,
            hasPass: Boolean(data.hasPass || data.passStatus === "active" || data.paymentStatus === "completed"),
            passStatus: data.passStatus || "none",
            performerStatus: data.performerStatus || perf.status || "pending",
            performance: perf,
            createdAt: data.createdAt,
          });
        }
      }
    });

    return { success: true, data: applications };
  } catch (error: any) {
    console.error("Error fetching performance applications:", error);
    return {
      success: false,
      error: error?.message || "Failed to fetch performance applications",
    };
  }
}

/**
 * Manually verify or unverify an alumnus's UPI payment.
 * When verified === true: sets verified: true, hasPass: true, passStatus: "active",
 * paymentStatus: "completed", and sends the official HTML event pass via email.
 * When verified === false: reverts verification to false and cancels pass.
 */
export async function verifyAlumniPayment(
  id: string,
  verified: boolean,
  adminNotes?: string,
  verifiedBy?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!id) return { success: false, error: "Registration ID is required" };

    const docRef = db.collection(collectionName).doc(id);
    const docSnap = await docRef.get();
    if (!docSnap.exists) {
      return { success: false, error: "Alumni record not found." };
    }

    const regData = docSnap.data();
    const now = new Date().toISOString();

    if (verified) {
      const updateData: Record<string, any> = {
        verified: true,
        hasPass: true,
        passStatus: "active",
        passIssuedAt: now,
        amount: 1000,
        paymentStatus: "completed",
        "paymentDetails.verified": true,
        "paymentDetails.verifiedAt": now,
        "paymentDetails.verifiedBy": verifiedBy || "Admin",
        updatedAt: now,
      };

      if (adminNotes !== undefined) {
        updateData.adminNotes = adminNotes.trim();
      }

      await docRef.update(updateData);

      // Send official Event Pass email in HTML upon verifying payment
      try {
        const fullRecord: AlumniRegistration = {
          ...regData,
          id,
          verified: true,
          hasPass: true,
          passStatus: "active",
          passIssuedAt: now,
          amount: 1000,
          paymentStatus: "completed",
          txnId: regData?.txnId || regData?.paymentDetails?.transactionId || "",
          paymentMode: regData?.paymentMode || "UPI_QR",
        } as AlumniRegistration;

        const passTemplate = getPassIssuedEmailTemplate(fullRecord, false);
        await sendMail({
          to: fullRecord.email,
          subject: passTemplate.subject,
          text: passTemplate.text,
          html: passTemplate.html,
        });
      } catch (mailErr) {
        console.error("Failed to send pass email on verification:", mailErr);
      }
    } else {
      // Unverify
      const updateData: Record<string, any> = {
        verified: false,
        hasPass: false,
        passStatus: "none",
        paymentStatus: "pending",
        "paymentDetails.verified": false,
        updatedAt: now,
      };

      if (adminNotes !== undefined) {
        updateData.adminNotes = adminNotes.trim();
      }

      await docRef.update(updateData);
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error verifying alumni payment:", error);
    return {
      success: false,
      error: error?.message || "Failed to update payment verification status",
    };
  }
}

/**
 * Manually issue a complimentary Alumni Meet Pass (for VIPs, Faculty, or special guests)
 */
export async function issueComplimentaryPass(
  id: string,
  reason?: string,
  issuedBy?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!id) return { success: false, error: "Registration ID is required" };

    const docRef = db.collection(collectionName).doc(id);
    const docSnap = await docRef.get();
    if (!docSnap.exists) {
      return { success: false, error: "Registration record not found" };
    }
    const regData = docSnap.data();
    const now = new Date().toISOString();

    await docRef.update({
      hasPass: true,
      passStatus: "active",
      passPrice: 0,
      passIssuedAt: now,
      amount: 0,
      verified: true,
      paymentStatus: "completed",
      paymentDetails: {
        transactionId: `COMP-${Date.now().toString().slice(-6)}`,
        paymentMethod: `Complimentary Pass (${reason || "Admin Grant"})`,
        paidAt: now,
        referenceNumber: `Issued by ${issuedBy || "Admin"}`,
        verified: true,
        verifiedAt: now,
        verifiedBy: issuedBy || "Admin",
      },
      updatedAt: now,
    });

    // Send official pass in HTML
    try {
      const fullRecord: AlumniRegistration = {
        ...regData,
        id,
        hasPass: true,
        passStatus: "active",
        amount: 0,
        paymentStatus: "completed",
      } as AlumniRegistration;

      const passTemplate = getPassIssuedEmailTemplate(fullRecord, true);
      await sendMail({
        to: fullRecord.email,
        subject: passTemplate.subject,
        text: passTemplate.text,
        html: passTemplate.html,
      });
    } catch (mailErr) {
      console.error("Failed to send complimentary pass email:", mailErr);
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error issuing complimentary pass:", error);
    return {
      success: false,
      error: error?.message || "Failed to issue pass",
    };
  }
}

/**
 * Revoke an event pass
 */
export async function revokePass(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!id) return { success: false, error: "Registration ID is required" };

    const now = new Date().toISOString();
    await db.collection(collectionName).doc(id).update({
      hasPass: false,
      passStatus: "cancelled",
      updatedAt: now,
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error revoking pass:", error);
    return {
      success: false,
      error: error?.message || "Failed to revoke pass",
    };
  }
}

