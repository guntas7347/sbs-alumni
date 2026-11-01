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

    // User's attendance selection intent
    const wantsToAttend =
      input.attendanceType === "in-person-pending" ||
      (input.attendingMeet !== false && input.attendanceType !== "supporting");

    // User is ONLY officially marked as attending if payment proof (screenshot & txnId) is uploaded
    const hasUploadedPayment = Boolean(
      input.txnId && input.txnId.trim() &&
      input.screenshotUrl && input.screenshotUrl.trim()
    );

    // 3 distinct states: "in-person", "in-person-pending", "supporting"
    const attendanceType: "in-person" | "in-person-pending" | "supporting" = hasUploadedPayment
      ? "in-person"
      : wantsToAttend
      ? "in-person-pending"
      : "supporting";

    const isAttending = attendanceType === "in-person";

    // Validate accompanying guests (max 3, only Mom, Dad, Spouse, Child)
    let validatedGuests: { name: string; relation: "Mom" | "Dad" | "Spouse" | "Child" }[] = [];
    if (wantsToAttend && input.guests && input.guests.length > 0) {
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

    // Extract and flatten guests (up to 3, Mom/Dad/Spouse/Child)
    const guest1Name = input.guest1Name?.trim() || (validatedGuests[0]?.name || "");
    const guest1Relation = input.guest1Relation || (validatedGuests[0]?.relation || "");
    const guest2Name = input.guest2Name?.trim() || (validatedGuests[1]?.name || "");
    const guest2Relation = input.guest2Relation || (validatedGuests[1]?.relation || "");
    const guest3Name = input.guest3Name?.trim() || (validatedGuests[2]?.name || "");
    const guest3Relation = input.guest3Relation || (validatedGuests[2]?.relation || "");

    const guestListStr: string[] = [];
    if (guest1Name) guestListStr.push(`1. ${guest1Name} (${guest1Relation})`);
    if (guest2Name) guestListStr.push(`2. ${guest2Name} (${guest2Relation})`);
    if (guest3Name) guestListStr.push(`3. ${guest3Name} (${guest3Relation})`);
    const guestsSummary = guestListStr.join(", ");
    const guestCountStr = String(guestListStr.length);

    // Stage Performance Request
    const wantToPerform = Boolean(wantsToAttend && input.wantToPerform);
    const performanceType = wantToPerform ? (input.performanceType?.trim() || "") : "";
    const performanceStatus = wantToPerform ? "pending" : "none";

    // Vice Chancellor Interaction Request
    const wantToInteractWithVC = Boolean(wantsToAttend && input.wantToInteractWithVC);
    const vcInteractionPortfolio = wantToInteractWithVC ? (input.vcInteractionPortfolio?.trim() || "") : "";
    const vcInteractionReason = wantToInteractWithVC ? (input.vcInteractionReason?.trim() || "") : "";
    const vcInteractionStatus = wantToInteractWithVC ? "pending" : "none";

    // Special Request (Default "")
    const specialRequest = input.specialRequest?.trim() || "";

    const registrationData: Omit<AlumniRegistration, "id"> = {
      fullName: input.fullName.trim(),
      email: input.email.trim().toLowerCase(),
      phone: input.phone?.trim() || "",
      whatsapp: input.whatsapp?.trim() || input.phone?.trim() || "",

      era: input.era || "SBSSU",
      degree: input.degree || "",
      branch: input.branch || "",
      passingYear: input.passingYear || "",
      rollNumber: input.rollNumber?.trim() || "",
      currentDesignation: input.currentDesignation?.trim() || "",
      organization: input.organization?.trim() || "",
      city: input.city?.trim() || "",
      state: input.state?.trim() || "",
      country: input.country?.trim() || "India",
      linkedin: input.linkedin?.trim() || "",
      memoriesMessage: input.memoriesMessage?.trim() || "",

      regNumber,
      attendingMeet: isAttending,
      attendanceType,
      hasPass: false,
      passStatus: "none",
      amount: wantsToAttend ? "1000" : "0",

      specialRequest,

      guestCount: guestCountStr,
      guest1Name,
      guest1Relation,
      guest2Name,
      guest2Relation,
      guest3Name,
      guest3Relation,
      guestsSummary,

      wantToPerform,
      performanceType,
      performanceStatus,
      performanceAdminRemarks: "",

      wantToInteractWithVC,
      vcInteractionPortfolio,
      vcInteractionReason,
      vcInteractionStatus,
      vcInteractionAdminRemarks: "",

      paymentMode: isAttending ? "UPI_QR" : "",
      txnId: input.txnId?.trim() || "",
      screenshotUrl: input.screenshotUrl || "",
      verified: false,
      verifiedBy: "",
      verifiedAt: "",

      checkedIn: false,
      checkedInAt: "",
      checkedInBy: "",
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

/**
 * Normalizes an alumni record from Firestore into 3 distinct attendance states:
 * 1. "in-person": Chose to attend AND uploaded payment proof (or verified).
 * 2. "in-person-pending": Chose to attend (₹1,000), but closed website before uploading payment proof.
 * 3. "supporting": Chose directory registration only (Free).
 */
function normalizeRegistrationRecord(id: string, data: any): AlumniRegistration {
  const hasUploadedPayment = Boolean(
    data?.verified ||
    (data?.txnId && String(data.txnId).trim()) ||
    (data?.screenshotUrl && String(data.screenshotUrl).trim()) ||
    (data?.paymentScreenshotUrl && String(data.paymentScreenshotUrl).trim()) ||
    (data?.paymentDetails?.screenshotUrl && String(data.paymentDetails.screenshotUrl).trim())
  );

  // Check if alumnus originally opted to attend Sanjh 2026
  const choseToAttend = Boolean(
    data?.attendanceType === "in-person" ||
    data?.attendanceType === "in-person-pending" ||
    data?.attendingMeet === true ||
    data?.amount === "1000" ||
    data?.passPrice === 1000 ||
    (data?.guestCount && data.guestCount !== "0") ||
    data?.guest1Name
  );

  const attendanceType: "in-person" | "in-person-pending" | "supporting" = hasUploadedPayment
    ? "in-person"
    : choseToAttend
    ? "in-person-pending"
    : "supporting";

  const isAttending = attendanceType === "in-person";

  const hasPass = Boolean(
    data?.hasPass === true ||
    data?.passStatus === "active" ||
    data?.paymentStatus === "completed"
  );

  return {
    ...data,
    id,
    attendingMeet: isAttending,
    attendanceType,
    amount: choseToAttend ? "1000" : "0",
    hasPass,
    passStatus: data?.passStatus || (hasPass ? "active" : "none"),
    passPrice: data?.passPrice || 1000,
    performerStatus: data?.performerStatus || "none",
    txnId: data?.txnId || data?.paymentDetails?.transactionId || "",
    paymentMode: data?.paymentMode || data?.paymentDetails?.paymentMethod || (choseToAttend ? "UPI_QR" : ""),
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
  } as unknown as AlumniRegistration;
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
      data: normalizeRegistrationRecord(docSnap.id, data),
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
        return {
          success: true,
          data: normalizeRegistrationRecord(docSnap.id, docSnap.data()),
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
      return {
        success: true,
        data: normalizeRegistrationRecord(docSnap.id, docSnap.data()),
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
      return {
        success: true,
        data: normalizeRegistrationRecord(docSnap.id, docSnap.data()),
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
    return {
      success: true,
      data: normalizeRegistrationRecord(docSnap.id, docSnap.data()),
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
      attendingMeet: true,
      attendanceType: "in-person",
      txnId: trimmedTxnId,
      paymentMode: "UPI_QR",
      verified: false,
      screenshotUrl: screenshotUrl.trim(),
      paymentScreenshotUrl: screenshotUrl.trim(),
      amount: "1000",
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
        attendingMeet: true,
        attendanceType: "in-person",
        txnId: trimmedTxnId,
        paymentMode: "UPI_QR",
        verified: false,
        screenshotUrl: screenshotUrl.trim(),
        paymentScreenshotUrl: screenshotUrl.trim(),
        amount: "1000",
        paymentStatus: "pending",
      } as unknown as AlumniRegistration;

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
      registrations.push(normalizeRegistrationRecord(doc.id, doc.data()));
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

      const hasUploadedPayment = Boolean(
        data?.verified ||
        (data?.txnId && String(data.txnId).trim()) ||
        (data?.screenshotUrl && String(data.screenshotUrl).trim()) ||
        (data?.paymentScreenshotUrl && String(data.paymentScreenshotUrl).trim()) ||
        (data?.paymentDetails?.screenshotUrl && String(data.paymentDetails.screenshotUrl).trim())
      );
      const isAttending = Boolean(data?.attendingMeet && hasUploadedPayment);

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

      if (isAttending) {
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

/**
 * Update any registration fields (for admin editing)
 */
export async function updateRegistrationDetails(
  id: string,
  updates: Partial<AlumniRegistration>
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!id) return { success: false, error: "Registration ID is required" };

    const docRef = db.collection(collectionName).doc(id);
    const docSnap = await docRef.get();
    if (!docSnap.exists) {
      return { success: false, error: "Record not found" };
    }

    const now = new Date().toISOString();
    const cleanUpdates: Record<string, any> = {
      ...updates,
      updatedAt: now,
    };
    // Don't allow changing ID
    delete cleanUpdates.id;

    // Keep guestsSummary updated if guest names changed
    if (
      cleanUpdates.guest1Name !== undefined ||
      cleanUpdates.guest2Name !== undefined ||
      cleanUpdates.guest3Name !== undefined
    ) {
      const g1 = cleanUpdates.guest1Name ?? docSnap.data()?.guest1Name ?? "";
      const r1 = cleanUpdates.guest1Relation ?? docSnap.data()?.guest1Relation ?? "";
      const g2 = cleanUpdates.guest2Name ?? docSnap.data()?.guest2Name ?? "";
      const r2 = cleanUpdates.guest2Relation ?? docSnap.data()?.guest2Relation ?? "";
      const g3 = cleanUpdates.guest3Name ?? docSnap.data()?.guest3Name ?? "";
      const r3 = cleanUpdates.guest3Relation ?? docSnap.data()?.guest3Relation ?? "";

      const gList: string[] = [];
      if (g1) gList.push(`1. ${g1} (${r1})`);
      if (g2) gList.push(`2. ${g2} (${r2})`);
      if (g3) gList.push(`3. ${g3} (${r3})`);
      cleanUpdates.guestsSummary = gList.join(", ");
      cleanUpdates.guestCount = String(gList.length);
    }

    await docRef.update(cleanUpdates);
    return { success: true };
  } catch (err: any) {
    console.error("Error updating registration:", err);
    return { success: false, error: err?.message || "Failed to update registration" };
  }
}

/**
 * Update stage performance approval status
 */
export async function updatePerformanceStatus(
  id: string,
  status: "pending" | "approved" | "rejected" | "none",
  remarks: string = ""
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!id) return { success: false, error: "Registration ID is required" };
    const docRef = db.collection(collectionName).doc(id);
    await docRef.update({
      performanceStatus: status,
      performanceAdminRemarks: remarks,
      updatedAt: new Date().toISOString(),
    });
    return { success: true };
  } catch (err: any) {
    console.error("Error updating performance status:", err);
    return { success: false, error: err?.message || "Failed to update performance status" };
  }
}

/**
 * Update Vice Chancellor interaction approval status
 */
export async function updateVCInteractionStatus(
  id: string,
  status: "pending" | "approved" | "rejected" | "none",
  remarks: string = ""
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!id) return { success: false, error: "Registration ID is required" };
    const docRef = db.collection(collectionName).doc(id);
    await docRef.update({
      vcInteractionStatus: status,
      vcInteractionAdminRemarks: remarks,
      updatedAt: new Date().toISOString(),
    });
    return { success: true };
  } catch (err: any) {
    console.error("Error updating VC interaction status:", err);
    return { success: false, error: err?.message || "Failed to update VC interaction status" };
  }
}

