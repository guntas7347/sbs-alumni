"use server";

import { db } from "@/lib/firebase/firebase";
import { sendMail } from "@/lib/emails/nodemailer";
import {
  getRegistrationEmailTemplate,
  getPaymentSubmittedEmailTemplate,
} from "@/lib/emails/templates";
import type {
  AlumniRegistration,
  AlumniRegistrationInput,
  PerformanceApplication,
} from "@/lib/types";

const collectionName = "alumni_registrations_2026";

/**
 * Creates an Alumni Registration in the University Database.
 * Registration is 100% Free (₹0) — used for academic & alumni record keeping.
 * An Event Pass for Sanjh 2026 can be purchased separately for ₹1,000.
 */
export async function createAlumniRegistration(
  input: AlumniRegistrationInput,
): Promise<{
  success: boolean;
  id?: string;
  regNumber?: string;
  isFree?: boolean;
  error?: string;
}> {
  try {
    if (!input.email || !input.fullName) {
      return {
        success: false,
        error: "Full Name and Google Email are required.",
      };
    }

    const currentYear = new Date().getFullYear();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const regNumber = `SBSSU-ALM-${currentYear}-${randomSuffix}`;
    const now = new Date().toISOString();

    // Determine whether user opted to attend the meet
    const isAttending = input.attendingMeet !== false && input.attendanceType !== "supporting";

    // Validate accompanying guests (max 3, only Mom, Dad, Spouse, Child)
    let validatedGuests: { name: string; relation: "Mom" | "Dad" | "Spouse" | "Child" }[] = [];
    if (isAttending && input.guests && input.guests.length > 0) {
      if (input.guests.length > 3) {
        return {
          success: false,
          error: "A maximum of 3 accompanying guests are allowed.",
        };
      }

      const allowedRelations = new Set(["Mom", "Dad", "Spouse", "Child"]);
      for (let i = 0; i < input.guests.length; i++) {
        const g = input.guests[i];
        if (!g.name || !g.name.trim()) {
          return {
            success: false,
            error: `Name is required for Guest ${i + 1}.`,
          };
        }
        if (!g.relation || !allowedRelations.has(g.relation)) {
          return {
            success: false,
            error: `Guest ${i + 1} relation "${g.relation}" is not permitted. Only Mom, Dad, Spouse, or Child are allowed.`,
          };
        }
        validatedGuests.push({
          name: g.name.trim(),
          relation: g.relation as "Mom" | "Dad" | "Spouse" | "Child",
        });
      }
    }

    const registrationData: Omit<AlumniRegistration, "id"> = {
      ...input,
      email: input.email.trim().toLowerCase(),
      fullName: input.fullName.trim(),
      regNumber,
      attendingMeet: isAttending,
      // Accompanying guests
      guestCount: validatedGuests.length,
      guests: validatedGuests,
      // Registration is Free
      amount: 0,
      paymentStatus: "free",
      // Pass is separate - initially not acquired
      hasPass: false,
      passStatus: "none",
      passPrice: 1000,
      paymentDetails: null,
      checkedIn: false,
      // Stage performance default: attendee only
      performerStatus: "none",
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await db.collection(collectionName).add(registrationData);

    const fullRecord: AlumniRegistration = {
      id: docRef.id,
      ...registrationData,
    };

    // Send confirmation email to user upon creating registration
    try {
      const emailTemplate = getRegistrationEmailTemplate(fullRecord);
      await sendMail({
        to: fullRecord.email,
        subject: emailTemplate.subject,
        text: emailTemplate.text,
        html: emailTemplate.html,
      });
    } catch (mailErr) {
      console.error("Failed to send welcome registration email:", mailErr);
    }

    return {
      success: true,
      id: docRef.id,
      regNumber,
      isFree: true,
    };
  } catch (error: any) {
    console.error("Error creating alumni registration:", error);
    return {
      success: false,
      error: error?.message || "Failed to create alumni registration",
    };
  }
}

export async function getAlumniRegistrationById(
  id: string,
): Promise<{ success: boolean; data?: AlumniRegistration; error?: string }> {
  try {
    if (!id) return { success: false, error: "Registration ID is required" };

    const docSnap = await db.collection(collectionName).doc(id).get();

    if (!docSnap.exists) {
      return { success: false, error: "Alumni record not found" };
    }

    const data = docSnap.data();
    return {
      success: true,
      data: {
        id: docSnap.id,
        hasPass: Boolean(
          data?.hasPass ||
          data?.passStatus === "active" ||
          data?.paymentStatus === "completed",
        ),
        passStatus:
          data?.passStatus ||
          (data?.paymentStatus === "completed" ? "active" : "none"),
        passPrice: data?.passPrice || 1000,
        performerStatus: data?.performerStatus || "none",
        txnId: data?.txnId || data?.paymentDetails?.transactionId || "",
        paymentMode:
          data?.paymentMode || data?.paymentDetails?.paymentMethod || "",
        verified: data?.verified ?? data?.paymentDetails?.verified ?? false,
        screenshotUrl:
          data?.screenshotUrl ||
          data?.paymentScreenshotUrl ||
          data?.paymentDetails?.screenshotUrl ||
          "",
        paymentScreenshotUrl:
          data?.paymentScreenshotUrl ||
          data?.screenshotUrl ||
          data?.paymentDetails?.screenshotUrl ||
          "",
        ...data,
      } as AlumniRegistration,
    };
  } catch (error: any) {
    console.error("Error fetching registration by ID:", error);
    return {
      success: false,
      error: error?.message || "Failed to fetch registration",
    };
  }
}

export async function verifyRegistrationCode(
  rawInput: string,
): Promise<{ success: boolean; data?: AlumniRegistration; error?: string }> {
  try {
    if (!rawInput || !rawInput.trim()) {
      return {
        success: false,
        error: "Please enter or scan a barcode or registration code.",
      };
    }

    let code = rawInput.trim();

    // If a full pass or verification URL was scanned, extract the ID
    if (code.includes("/sanjh-2026/pass/")) {
      const parts = code.split("/sanjh-2026/pass/");
      code = parts[parts.length - 1].split("?")[0].split("/")[0].trim();
    } else if (code.includes("/pass/")) {
      const parts = code.split("/pass/");
      code = parts[parts.length - 1].split("?")[0].split("/")[0].trim();
    } else if (code.includes("/ticket/")) {
      const parts = code.split("/ticket/");
      code = parts[parts.length - 1].split("?")[0].split("/")[0].trim();
    } else if (code.includes("code=")) {
      const match = code.match(/code=([^&]+)/);
      if (match) code = decodeURIComponent(match[1]);
    } else if (code.includes("id=")) {
      const match = code.match(/id=([^&]+)/);
      if (match) code = decodeURIComponent(match[1]);
    }

    // 1. Direct Firestore document ID lookup
    try {
      const docSnap = await db.collection(collectionName).doc(code).get();
      if (docSnap.exists) {
        const data = docSnap.data();
        return {
          success: true,
          data: {
            id: docSnap.id,
            hasPass: Boolean(
              data?.hasPass ||
              data?.passStatus === "active" ||
              data?.paymentStatus === "completed",
            ),
            passStatus:
              data?.passStatus ||
              (data?.paymentStatus === "completed" ? "active" : "none"),
            passPrice: data?.passPrice || 1000,
            performerStatus: data?.performerStatus || "none",
            ...data,
          } as AlumniRegistration,
        };
      }
    } catch {
      // ignore doc lookup failure
    }

    // 2. Try regNumber lookup
    const upperCode = code.toUpperCase();
    const querySnapshot = await db
      .collection(collectionName)
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
          hasPass: Boolean(
            data?.hasPass ||
            data?.passStatus === "active" ||
            data?.paymentStatus === "completed",
          ),
          passStatus:
            data?.passStatus ||
            (data?.paymentStatus === "completed" ? "active" : "none"),
          passPrice: data?.passPrice || 1000,
          performerStatus: data?.performerStatus || "none",
          ...data,
        } as AlumniRegistration,
      };
    }

    // 3. Try rollNumber lookup
    const rollSnapshot = await db
      .collection(collectionName)
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
          hasPass: Boolean(
            data?.hasPass ||
            data?.passStatus === "active" ||
            data?.paymentStatus === "completed",
          ),
          passStatus:
            data?.passStatus ||
            (data?.paymentStatus === "completed" ? "active" : "none"),
          passPrice: data?.passPrice || 1000,
          performerStatus: data?.performerStatus || "none",
          ...data,
        } as AlumniRegistration,
      };
    }

    return {
      success: false,
      error: `No alumni record found matching barcode/code "${code}". Please check the registration number.`,
    };
  } catch (error: any) {
    console.error("Error verifying registration code:", error);
    return { success: false, error: error?.message || "Verification failed." };
  }
}

/**
 * Gate Check-In: Requires candidate to have an ACTIVE EVENT PASS (₹1,000 paid)
 */
export async function markCheckInAtGate(
  id: string,
  verifiedByEmail?: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!id) return { success: false, error: "Registration ID is required" };

    const docRef = db.collection(collectionName).doc(id);
    const docSnap = await docRef.get();
    if (!docSnap.exists) {
      return { success: false, error: "Alumni record not found." };
    }

    const data = docSnap.data();
    const hasActivePass = Boolean(
      data?.hasPass === true ||
      data?.passStatus === "active" ||
      data?.paymentStatus === "completed",
    );

    if (!hasActivePass) {
      return {
        success: false,
        error:
          "Candidate does NOT have an active Alumni Meet Pass (₹1,000). Only pass holders are permitted entry to the venue.",
      };
    }

    const now = new Date().toISOString();
    await docRef.update({
      checkedIn: true,
      checkedInAt: now,
      verifiedBy: verifiedByEmail?.trim().toLowerCase() || "faculty",
      verifiedAt: now,
      updatedAt: now,
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error checking in attendee at gate:", error);
    return {
      success: false,
      error: error?.message || "Failed to check in attendee",
    };
  }
}

export async function getAlumniRegistrationByEmail(email: string): Promise<{
  success: boolean;
  data?: AlumniRegistration | null;
  error?: string;
}> {
  try {
    if (!email) return { success: false, error: "Email is required" };

    const normalizedEmail = email.trim().toLowerCase();
    const querySnapshot = await db
      .collection(collectionName)
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
        hasPass: Boolean(
          data?.hasPass ||
          data?.passStatus === "active" ||
          data?.paymentStatus === "completed",
        ),
        passStatus:
          data?.passStatus ||
          (data?.paymentStatus === "completed" ? "active" : "none"),
        passPrice: data?.passPrice || 1000,
        performerStatus: data?.performerStatus || "none",
        ...data,
      } as AlumniRegistration,
    };
  } catch (error: any) {
    console.error("Error fetching registration by email:", error);
    return {
      success: false,
      error: error?.message || "Failed to fetch registration",
    };
  }
}

/**
 * Submit manual UPI QR payment with transaction ID and screenshot.
 * Saves txnId, paymentMode: "UPI_QR", verified: false to Firestore
 * and sends payment submitted notification email to the user.
 */
export async function submitUpiPayment({
  registrationId,
  txnId,
  screenshotUrl,
}: {
  registrationId: string;
  txnId: string;
  screenshotUrl: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    if (!registrationId) {
      return { success: false, error: "Registration ID is required." };
    }
    if (!txnId || !txnId.trim()) {
      return { success: false, error: "UPI Transaction ID is required." };
    }
    if (!screenshotUrl || !screenshotUrl.trim()) {
      return {
        success: false,
        error: "Payment screenshot containing the transaction ID is required.",
      };
    }

    const docRef = db.collection(collectionName).doc(registrationId);
    const docSnap = await docRef.get();
    if (!docSnap.exists) {
      return { success: false, error: "Alumni registration record not found." };
    }

    const regData = docSnap.data();
    const now = new Date().toISOString();
    const trimmedTxnId = txnId.trim();

    await docRef.update({
      txnId: trimmedTxnId,
      paymentMode: "UPI_QR",
      verified: false,
      screenshotUrl: screenshotUrl.trim(),
      paymentScreenshotUrl: screenshotUrl.trim(),
      amount: 1000,
      paymentStatus: "pending",
      passPrice: 1000,
      hasPass: false,
      passStatus: "none",
      paymentDetails: {
        transactionId: trimmedTxnId,
        paymentMethod: "UPI_QR",
        paidAt: now,
        screenshotUrl: screenshotUrl.trim(),
        verified: false,
      },
      updatedAt: now,
    });

    // Send confirmation email to user upon payment submission
    try {
      const updatedReg = {
        ...regData,
        id: registrationId,
        txnId: trimmedTxnId,
        paymentMode: "UPI_QR",
        verified: false,
        screenshotUrl: screenshotUrl.trim(),
        paymentScreenshotUrl: screenshotUrl.trim(),
        amount: 1000,
        paymentStatus: "pending",
      } as AlumniRegistration;

      const emailTemplate = getPaymentSubmittedEmailTemplate(updatedReg);
      await sendMail({
        to: updatedReg.email,
        subject: emailTemplate.subject,
        text: emailTemplate.text,
        html: emailTemplate.html,
      });
    } catch (mailErr) {
      console.error(
        "Failed to send payment submitted confirmation email:",
        mailErr,
      );
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error submitting UPI payment:", error);
    return {
      success: false,
      error: error?.message || "Failed to submit UPI payment details",
    };
  }
}

/**
 * Updates payment status and issues the official Alumni Meet Event Pass (₹1,000)
 */
export async function updateAlumniPayment(
  id: string,
  paymentDetails: {
    transactionId: string;
    paymentMethod: string;
    referenceNumber?: string;
  },
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!id) return { success: false, error: "Registration ID is required" };

    const now = new Date().toISOString();
    await db
      .collection(collectionName)
      .doc(id)
      .update({
        hasPass: true,
        passStatus: "active",
        passPrice: 1000,
        passIssuedAt: now,
        amount: 1000,
        paymentStatus: "completed",
        paymentDetails: {
          ...paymentDetails,
          paidAt: now,
        },
        updatedAt: now,
      });

    return { success: true };
  } catch (error: any) {
    console.error("Error updating payment and issuing pass:", error);
    return {
      success: false,
      error: error?.message || "Failed to issue pass",
    };
  }
}

/**
 * Submit an application to perform on stage at Sanjh 2026.
 * Requirement: Candidate must have an active Alumni Meet Pass (₹1,000 paid).
 */
export async function submitPerformanceApplication(
  registrationId: string,
  application: {
    category: string;
    title: string;
    description: string;
    resumeUrl: string;
    durationMinutes?: string;
    specialRequirements?: string;
  },
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!registrationId) {
      return { success: false, error: "Registration ID is required." };
    }

    if (
      !application.category ||
      !application.title ||
      !application.description
    ) {
      return {
        success: false,
        error: "Performance Category, Act Title, and Description are required.",
      };
    }

    if (!application.resumeUrl || !application.resumeUrl.trim()) {
      return {
        success: false,
        error:
          "A valid Resume, Portfolio, or Performance Video URL is required.",
      };
    }

    const docRef = db.collection(collectionName).doc(registrationId);
    const docSnap = await docRef.get();
    if (!docSnap.exists) {
      return { success: false, error: "Alumni registration record not found." };
    }

    const reg = docSnap.data();
    const hasActivePass = Boolean(
      reg?.hasPass === true ||
      reg?.passStatus === "active" ||
      reg?.paymentStatus === "completed",
    );

    if (!hasActivePass) {
      return {
        success: false,
        error:
          "An active Alumni Meet Pass (₹1,000) is required to apply for stage performance. Please purchase your pass first.",
      };
    }

    const now = new Date().toISOString();
    const performanceData: PerformanceApplication = {
      applied: true,
      category: application.category.trim(),
      title: application.title.trim(),
      description: application.description.trim(),
      resumeUrl: application.resumeUrl.trim(),
      durationMinutes: application.durationMinutes?.trim() || "5-7 minutes",
      specialRequirements:
        application.specialRequirements?.trim() || "Standard stage mic & sound",
      status: "pending",
      appliedAt: now,
    };

    await docRef.update({
      performerStatus: "pending",
      performanceApplication: performanceData,
      culturalInterest: application.category.trim(),
      culturalDetails: `${application.title.trim()}: ${application.description.trim()}`,
      updatedAt: now,
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error submitting performance application:", error);
    return {
      success: false,
      error: error?.message || "Failed to submit performance application",
    };
  }
}

export async function getAllRegistrations(): Promise<{
  success: boolean;
  data?: AlumniRegistration[];
  error?: string;
}> {
  try {
    const snapshot = await db
      .collection(collectionName)
      .orderBy("createdAt", "desc")
      .get();

    const registrations: AlumniRegistration[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      registrations.push({
        id: doc.id,
        hasPass: Boolean(
          data?.hasPass ||
          data?.passStatus === "active" ||
          data?.paymentStatus === "completed",
        ),
        passStatus:
          data?.passStatus ||
          (data?.paymentStatus === "completed" ? "active" : "none"),
        passPrice: data?.passPrice || 1000,
        performerStatus: data?.performerStatus || "none",
        txnId: data?.txnId || data?.paymentDetails?.transactionId || "",
        paymentMode:
          data?.paymentMode || data?.paymentDetails?.paymentMethod || "",
        verified: data?.verified ?? data?.paymentDetails?.verified ?? false,
        screenshotUrl:
          data?.screenshotUrl ||
          data?.paymentScreenshotUrl ||
          data?.paymentDetails?.screenshotUrl ||
          "",
        paymentScreenshotUrl:
          data?.paymentScreenshotUrl ||
          data?.screenshotUrl ||
          data?.paymentDetails?.screenshotUrl ||
          "",
        ...data,
      } as AlumniRegistration);
    });

    return { success: true, data: registrations };
  } catch (error: any) {
    console.error("Error fetching all registrations:", error);
    return {
      success: false,
      error: error?.message || "Failed to fetch registrations",
    };
  }
}

export async function getRegistrationStats(): Promise<{
  totalRegistered: number;
  passHolders: number;
  registeredOnly: number;
  totalRevenue: number;
  performersApplied: number;
  performersApproved: number;
  inPersonAttendees: number;
}> {
  try {
    const snapshot = await db.collection(collectionName).get();

    let totalRegistered = 0;
    let passHolders = 0;
    let registeredOnly = 0;
    let totalRevenue = 0;
    let performersApplied = 0;
    let performersApproved = 0;
    let inPersonAttendees = 0;

    snapshot.forEach((doc) => {
      const data = doc.data();
      totalRegistered += 1;

      const hasPass = Boolean(
        data?.hasPass === true ||
        data?.passStatus === "active" ||
        data?.paymentStatus === "completed",
      );

      if (hasPass) {
        passHolders += 1;
        totalRevenue += Number(data.amount || 1000);
      } else {
        registeredOnly += 1;
      }

      if (
        data?.performerStatus === "pending" ||
        data?.performerStatus === "approved" ||
        data?.performanceApplication?.applied
      ) {
        performersApplied += 1;
      }

      if (
        data?.performerStatus === "approved" ||
        data?.performanceApplication?.status === "approved"
      ) {
        performersApproved += 1;
      }

      if (data.attendanceType === "in-person") {
        inPersonAttendees += 1 + Number(data.guestCount || 0);
      }
    });

    return {
      totalRegistered,
      passHolders,
      registeredOnly,
      totalRevenue,
      performersApplied,
      performersApproved,
      inPersonAttendees,
    };
  } catch (error: any) {
    console.error("Error calculating stats:", error);
    return {
      totalRegistered: 0,
      passHolders: 0,
      registeredOnly: 0,
      totalRevenue: 0,
      performersApplied: 0,
      performersApproved: 0,
      inPersonAttendees: 0,
    };
  }
}
