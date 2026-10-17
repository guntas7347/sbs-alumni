"use server";

import { db } from "@/lib/firebase/firebase";
import type { AlumniRegistration, AlumniRegistrationInput } from "@/lib/types";

export async function createAlumniRegistration(
  input: AlumniRegistrationInput
): Promise<{ success: boolean; id?: string; regNumber?: string; isFree?: boolean; error?: string }> {
  try {
    if (!input.email || !input.fullName) {
      return { success: false, error: "Name and email are required" };
    }

    const currentYear = new Date().getFullYear();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const prefix = input.registrantType === "student" ? "SBSSU-STU" : "SBSSU-ALM";
    const regNumber = `${prefix}-${currentYear}-${randomSuffix}`;

    const now = new Date().toISOString();
    const isStudent = input.registrantType === "student";

    const registrationData: Omit<AlumniRegistration, "id"> = {
      ...input,
      registrantType: input.registrantType || "alumni",
      email: input.email.trim().toLowerCase(),
      fullName: input.fullName.trim(),
      regNumber,
      amount: isStudent ? 0 : 1000,
      paymentStatus: isStudent ? "completed" : "pending",
      paymentDetails: isStudent
        ? {
            transactionId: `STU-FREE-${randomSuffix}`,
            paymentMethod: "Student Complimentary Pass (₹0)",
            paidAt: now,
          }
        : undefined,
      checkedIn: false,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await db.collection("alumni_registrations").add(registrationData);

    return {
      success: true,
      id: docRef.id,
      regNumber,
      isFree: isStudent,
    };
  } catch (error: any) {
    console.error("Error creating registration:", error);
    return { success: false, error: error?.message || "Failed to create registration" };
  }
}

export async function getAlumniRegistrationById(
  id: string
): Promise<{ success: boolean; data?: AlumniRegistration; error?: string }> {
  try {
    if (!id) return { success: false, error: "Registration ID is required" };

    const docSnap = await db.collection("alumni_registrations").doc(id).get();

    if (!docSnap.exists) {
      return { success: false, error: "Registration not found" };
    }

    const data = docSnap.data();
    return {
      success: true,
      data: {
        id: docSnap.id,
        registrantType: data?.registrantType || (data?.era ? "alumni" : "student"),
        ...data,
      } as AlumniRegistration,
    };
  } catch (error: any) {
    console.error("Error fetching registration by ID:", error);
    return { success: false, error: error?.message || "Failed to fetch registration" };
  }
}

export async function verifyRegistrationCode(
  rawInput: string
): Promise<{ success: boolean; data?: AlumniRegistration; error?: string }> {
  try {
    if (!rawInput || !rawInput.trim()) {
      return { success: false, error: "Please enter or scan a barcode/registration code." };
    }

    let code = rawInput.trim();

    // If a full ticket or verification URL was scanned, extract the ID
    if (code.includes("/ticket/")) {
      const parts = code.split("/ticket/");
      code = parts[parts.length - 1].split("?")[0].split("/")[0].trim();
    } else if (code.includes("code=")) {
      const match = code.match(/code=([^&]+)/);
      if (match) code = decodeURIComponent(match[1]);
    } else if (code.includes("id=")) {
      const match = code.match(/id=([^&]+)/);
      if (match) code = decodeURIComponent(match[1]);
    }

    // 1. Try direct Firestore document ID lookup
    try {
      const docSnap = await db.collection("alumni_registrations").doc(code).get();
      if (docSnap.exists) {
        const data = docSnap.data();
        return {
          success: true,
          data: {
            id: docSnap.id,
            registrantType: data?.registrantType || (data?.era ? "alumni" : "student"),
            ...data,
          } as AlumniRegistration,
        };
      }
    } catch {
      // document ID lookup could fail if contains invalid characters, ignore and try query
    }

    // 2. Try regNumber lookup (case-insensitive search)
    const upperCode = code.toUpperCase();
    const querySnapshot = await db
      .collection("alumni_registrations")
      .where("regNumber", "==", upperCode)
      .limit(1)
      .get();

    if (!querySnapshot.empty) {
      const docSnap = querySnapshot.docs[0];
      const data = docSnap.data();
      return {
        success: true,
        data: {
          id: docSnap.id,
          registrantType: data?.registrantType || (data?.era ? "alumni" : "student"),
          ...data,
        } as AlumniRegistration,
      };
    }

    // 3. Try student roll number lookup
    const rollSnapshot = await db
      .collection("alumni_registrations")
      .where("rollNumber", "==", code)
      .limit(1)
      .get();

    if (!rollSnapshot.empty) {
      const docSnap = rollSnapshot.docs[0];
      const data = docSnap.data();
      return {
        success: true,
        data: {
          id: docSnap.id,
          registrantType: data?.registrantType || (data?.era ? "alumni" : "student"),
          ...data,
        } as AlumniRegistration,
      };
    }

    return {
      success: false,
      error: `No candidate found matching barcode/code "${code}". Please check the registration number.`,
    };
  } catch (error: any) {
    console.error("Error verifying registration code:", error);
    return { success: false, error: error?.message || "Verification failed." };
  }
}

export async function markCheckInAtGate(
  id: string,
  verifiedByEmail?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!id) return { success: false, error: "Registration ID is required" };
    const now = new Date().toISOString();
    await db.collection("alumni_registrations").doc(id).update({
      checkedIn: true,
      checkedInAt: now,
      verifiedBy: verifiedByEmail?.trim().toLowerCase() || "faculty",
      verifiedAt: now,
      updatedAt: now,
    });
    return { success: true };
  } catch (error: any) {
    console.error("Error checking in attendee at gate:", error);
    return { success: false, error: error?.message || "Failed to check in attendee" };
  }
}

export async function getAlumniRegistrationByEmail(
  email: string
): Promise<{ success: boolean; data?: AlumniRegistration | null; error?: string }> {
  try {
    if (!email) return { success: false, error: "Email is required" };

    const normalizedEmail = email.trim().toLowerCase();
    const querySnapshot = await db
      .collection("alumni_registrations")
      .where("email", "==", normalizedEmail)
      .limit(1)
      .get();

    if (querySnapshot.empty) {
      return { success: true, data: null };
    }

    const docSnap = querySnapshot.docs[0];
    const data = docSnap.data();
    return {
      success: true,
      data: {
        id: docSnap.id,
        registrantType: data?.registrantType || (data?.era ? "alumni" : "student"),
        ...data,
      } as AlumniRegistration,
    };
  } catch (error: any) {
    console.error("Error fetching registration by email:", error);
    return { success: false, error: error?.message || "Failed to fetch registration" };
  }
}

export async function updateAlumniPayment(
  id: string,
  paymentDetails: {
    transactionId: string;
    paymentMethod: string;
    referenceNumber?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!id) return { success: false, error: "Registration ID is required" };

    const now = new Date().toISOString();
    await db.collection("alumni_registrations").doc(id).update({
      paymentStatus: "completed",
      paymentDetails: {
        ...paymentDetails,
        paidAt: now,
      },
      updatedAt: now,
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error updating payment:", error);
    return { success: false, error: error?.message || "Failed to update payment" };
  }
}

export async function getAllRegistrations(): Promise<{
  success: boolean;
  data?: AlumniRegistration[];
  error?: string;
}> {
  try {
    const snapshot = await db
      .collection("alumni_registrations")
      .orderBy("createdAt", "desc")
      .get();

    const registrations: AlumniRegistration[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      registrations.push({
        id: doc.id,
        registrantType: data?.registrantType || (data?.era ? "alumni" : "student"),
        ...data,
      } as AlumniRegistration);
    });

    return { success: true, data: registrations };
  } catch (error: any) {
    console.error("Error fetching all registrations:", error);
    return { success: false, error: error?.message || "Failed to fetch registrations" };
  }
}

export async function getRegistrationStats(): Promise<{
  total: number;
  paid: number;
  pending: number;
  alumniCount: number;
  studentCount: number;
  totalRevenue: number;
  culturalParticipants: number;
  inPersonAttendees: number;
}> {
  try {
    const snapshot = await db.collection("alumni_registrations").get();

    let total = 0;
    let paid = 0;
    let pending = 0;
    let alumniCount = 0;
    let studentCount = 0;
    let totalRevenue = 0;
    let culturalParticipants = 0;
    let inPersonAttendees = 0;

    snapshot.forEach((doc) => {
      const data = doc.data();
      total += 1;
      const type = data?.registrantType || (data?.era ? "alumni" : "student");
      if (type === "student") {
        studentCount += 1;
      } else {
        alumniCount += 1;
      }

      if (data.paymentStatus === "completed" || data.paymentStatus === "free") {
        paid += 1;
        totalRevenue += Number(data.amount || 0);
      } else {
        pending += 1;
      }

      if (data.culturalInterest && data.culturalInterest !== "none") {
        culturalParticipants += 1;
      }

      if (data.attendanceType === "in-person") {
        inPersonAttendees += 1 + Number(data.guestCount || 0);
      }
    });

    return {
      total,
      paid,
      pending,
      alumniCount,
      studentCount,
      totalRevenue,
      culturalParticipants,
      inPersonAttendees,
    };
  } catch (error: any) {
    console.error("Error calculating stats:", error);
    return {
      total: 0,
      paid: 0,
      pending: 0,
      alumniCount: 0,
      studentCount: 0,
      totalRevenue: 0,
      culturalParticipants: 0,
      inPersonAttendees: 0,
    };
  }
}
