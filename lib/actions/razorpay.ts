"use server";

import {
  createOrder,
  verifyPayment,
  getPayments,
  getOrder,
  getPayment,
} from "@/lib/razorpay";
import { db } from "@/lib/firebase/firebase";
import {
  getAlumniRegistrationById,
  updateAlumniPayment,
} from "@/lib/actions/alumniActions";

export interface RazorpayPaymentItem {
  id: string; // e.g. pay_xxxxxxxx
  orderId: string;
  amount: number; // in INR
  currency: string;
  status: string; // captured, authorized, failed, refunded
  method: string; // upi, card, netbanking, wallet, etc.
  email: string;
  contact: string;
  date: string; // formatted IST date
  timestamp: number; // epoch ms
  regNumber?: string;
  fullName?: string;
  notes?: Record<string, string>;
  description?: string;
  fee?: number;
  tax?: number;
}

/**
 * Creates a Razorpay order for an alumni pass registration (₹1,000 / 100,000 paise)
 */
export async function createRazorpayOrderAction(registrationId: string): Promise<{
  success: boolean;
  order?: {
    id: string;
    amount: number;
    currency: string;
  };
  registration?: {
    id: string;
    regNumber: string;
    fullName: string;
    email: string;
    phone: string;
    amount: number;
  };
  error?: string;
}> {
  try {
    if (!registrationId) {
      return { success: false, error: "Registration ID is required." };
    }

    const regRes = await getAlumniRegistrationById(registrationId);
    if (!regRes.success || !regRes.data) {
      return { success: false, error: regRes.error || "Registration not found in Firestore." };
    }

    const reg = regRes.data;
    const amountInINR = reg.amount || 1000;
    const amountInPaise = Math.round(amountInINR * 100);

    // Sanitize receipt to alphanumeric & underscore (max 40 chars)
    const sanitizedReceipt = `rcpt_${reg.regNumber.replace(/[^a-zA-Z0-9]/g, "_").slice(-30)}`;

    const order = await createOrder({
      amount: amountInPaise,
      currency: "INR",
      receipt: sanitizedReceipt,
      notes: {
        registrationId: reg.id,
        regNumber: reg.regNumber,
        fullName: reg.fullName,
        email: reg.email,
        phone: reg.phone,
        type: "alumni",
      },
    });

    // Save order reference on registration
    try {
      await db.collection("alumni_registrations").doc(reg.id).update({
        "paymentDetails.orderId": order.id,
        updatedAt: new Date().toISOString(),
      });
    } catch (dbErr) {
      console.warn("Could not record orderId on registration doc:", dbErr);
    }

    return {
      success: true,
      order: {
        id: order.id,
        amount: Number(order.amount),
        currency: order.currency,
      },
      registration: {
        id: reg.id,
        regNumber: reg.regNumber,
        fullName: reg.fullName,
        email: reg.email,
        phone: reg.phone,
        amount: amountInINR,
      },
    };
  } catch (error: any) {
    console.error("Error creating Razorpay order:", error);
    return {
      success: false,
      error: error?.message || "Failed to create Razorpay order.",
    };
  }
}

/**
 * Verifies Razorpay checkout signature and confirms payment in Firestore
 */
export async function verifyRazorpayPaymentAction(input: {
  registrationId: string;
  orderId: string;
  paymentId: string;
  signature: string;
}): Promise<{ success: boolean; transactionId?: string; error?: string }> {
  try {
    const { registrationId, orderId, paymentId, signature } = input;

    if (!registrationId || !orderId || !paymentId || !signature) {
      return { success: false, error: "Missing required payment verification details." };
    }

    const isValid = verifyPayment({
      orderId,
      paymentId,
      signature,
    });

    if (!isValid) {
      return { success: false, error: "Payment signature verification failed." };
    }

    // Update registration payment status in Firestore
    const updateRes = await updateAlumniPayment(registrationId, {
      transactionId: paymentId,
      paymentMethod: "Razorpay",
      referenceNumber: orderId,
    });

    if (!updateRes.success) {
      return { success: false, error: updateRes.error || "Failed to update registration record." };
    }

    // Also persist in razorpay_transactions collection for audit
    const now = new Date().toISOString();
    try {
      const regRes = await getAlumniRegistrationById(registrationId);
      const reg = regRes.data;

      await db.collection("razorpay_transactions").doc(paymentId).set({
        id: paymentId,
        paymentId,
        orderId,
        signature,
        registrationId,
        regNumber: reg?.regNumber || "",
        fullName: reg?.fullName || "",
        email: reg?.email || "",
        phone: reg?.phone || "",
        amount: reg?.amount || 1000,
        currency: "INR",
        status: "captured",
        method: "Razorpay",
        verifiedAt: now,
        createdAt: now,
      }, { merge: true });
    } catch (saveErr) {
      console.warn("Could not save to razorpay_transactions collection:", saveErr);
    }

    return { success: true, transactionId: paymentId };
  } catch (error: any) {
    console.error("Error verifying Razorpay payment:", error);
    return {
      success: false,
      error: error?.message || "Payment verification encountered an error.",
    };
  }
}

/**
 * Fetches all payments from Razorpay API for the Admin Razorpay page
 */
export async function getRazorpayPaymentsAction(
  options: { count?: number; skip?: number } = {}
): Promise<{
  success: boolean;
  data: RazorpayPaymentItem[];
  total: number;
  error?: string;
}> {
  try {
    const limit = options.count || 100;
    const skip = options.skip || 0;

    let items: any[] = [];
    let totalCount = 0;

    try {
      const res = await getPayments({ count: limit, skip });
      if (res && Array.isArray(res.items)) {
        items = res.items;
        totalCount = res.count || res.items.length;
      }
    } catch (apiErr: any) {
      console.warn("Razorpay API fetch failed, falling back to Firestore records:", apiErr?.message);
    }

    const formattedList: RazorpayPaymentItem[] = items.map((item: any) => {
      const epochSeconds = item.created_at || Math.floor(Date.now() / 1000);
      const dateObj = new Date(epochSeconds * 1000);

      const dateStr = dateObj.toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      return {
        id: item.id || "",
        orderId: item.order_id || "",
        amount: Math.round((Number(item.amount) || 0) / 100),
        currency: item.currency || "INR",
        status: item.status || "captured",
        method: item.method || "card",
        email: item.email || item.notes?.email || "—",
        contact: item.contact || item.notes?.phone || "—",
        date: dateStr,
        timestamp: epochSeconds * 1000,
        regNumber: item.notes?.regNumber || "",
        fullName: item.notes?.fullName || "",
        notes: item.notes || {},
        description: item.description || "",
        fee: item.fee ? Math.round(item.fee / 100) : undefined,
        tax: item.tax ? Math.round(item.tax / 100) : undefined,
      };
    });

    // Also check Firestore razorpay_transactions to merge any that might not yet appear
    try {
      const firestoreSnap = await db
        .collection("razorpay_transactions")
        .orderBy("createdAt", "desc")
        .limit(limit)
        .get();

      const existingIds = new Set(formattedList.map((p) => p.id));

      firestoreSnap.forEach((doc) => {
        const d = doc.data();
        if (!existingIds.has(doc.id)) {
          const dateObj = d.createdAt ? new Date(d.createdAt) : new Date();
          formattedList.push({
            id: doc.id,
            orderId: d.orderId || "",
            amount: Number(d.amount) || 1000,
            currency: d.currency || "INR",
            status: d.status || "captured",
            method: d.method || "Razorpay",
            email: d.email || "—",
            contact: d.phone || "—",
            date: dateObj.toLocaleString("en-IN", {
              timeZone: "Asia/Kolkata",
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            }),
            timestamp: dateObj.getTime(),
            regNumber: d.regNumber || "",
            fullName: d.fullName || "",
          });
        }
      });
    } catch (fsErr) {
      console.warn("Could not read razorpay_transactions from Firestore:", fsErr);
    }

    // Sort by timestamp descending
    formattedList.sort((a, b) => b.timestamp - a.timestamp);

    return {
      success: true,
      data: formattedList,
      total: Math.max(totalCount, formattedList.length),
    };
  } catch (error: any) {
    console.error("Error in getRazorpayPaymentsAction:", error);
    return {
      success: false,
      data: [],
      total: 0,
      error: error?.message || "Failed to load Razorpay payments.",
    };
  }
}
