import "server-only";

import Razorpay from "razorpay";
import { createHmac, timingSafeEqual } from "node:crypto";

const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!;
const keySecret = process.env.RAZORPAY_KEY_SECRET!;

if (!keyId || !keySecret) {
  throw new Error("Missing Razorpay environment variables");
}

// Test Card VISA INDIA 4100 2800 0000 1007 CVV 123 EXP 12/30

const razorpay = new Razorpay({
  key_id: keyId,
  key_secret: keySecret,
});

// Types
export interface CreateOrderInput {
  amount: number; // Amount in paise: ₹500 = 50000
  currency?: string;
  receipt?: string;
  notes?: Record<string, string>;
}

export interface VerifyPaymentInput {
  orderId: string;
  paymentId: string;
  signature: string;
}

// Create an order
export async function createOrder({
  amount,
  currency = "INR",
  receipt,
  notes,
}: CreateOrderInput) {
  if (!Number.isSafeInteger(amount) || amount <= 0) {
    throw new Error("Amount must be a positive integer in paise");
  }

  return razorpay.orders.create({
    amount,
    currency,
    ...(receipt ? { receipt } : {}),
    ...(notes ? { notes } : {}),
  });
}

// Get a single order
export async function getOrder(orderId: string) {
  return razorpay.orders.fetch(orderId);
}

// Get all orders
export async function getOrders(
  options: {
    count?: number;
    skip?: number;
    from?: number;
    to?: number;
  } = {},
) {
  return razorpay.orders.all(options);
}

// Get payments associated with an order
export async function getOrderPayments(orderId: string) {
  return razorpay.orders.fetchPayments(orderId);
}

// Fetch a single payment
export async function getPayment(paymentId: string) {
  return razorpay.payments.fetch(paymentId);
}

// Fetch payments
export async function getPayments(
  options: {
    count?: number;
    skip?: number;
    from?: number;
    to?: number;
  } = {},
) {
  return razorpay.payments.all(options);
}

// Verify Checkout payment signature
export function verifyPayment({
  orderId,
  paymentId,
  signature,
}: VerifyPaymentInput): boolean {
  if (
    !orderId ||
    !paymentId ||
    !signature ||
    !/^[a-f0-9]{64}$/i.test(signature)
  ) {
    return false;
  }

  const expected = createHmac("sha256", keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest();

  const received = Buffer.from(signature, "hex");

  return (
    received.length === expected.length && timingSafeEqual(received, expected)
  );
}

// Capture an authorized payment
export async function capturePayment(
  paymentId: string,
  amount: number,
  currency = "INR",
) {
  if (!Number.isSafeInteger(amount) || amount <= 0) {
    throw new Error("Amount must be a positive integer in paise");
  }

  return razorpay.payments.capture(paymentId, amount, currency);
}

// Create a full or partial refund
export async function refundPayment(
  paymentId: string,
  options: {
    amount?: number;
    speed?: "normal" | "optimum";
    notes?: Record<string, string>;
  } = {},
) {
  if (
    options.amount !== undefined &&
    (!Number.isSafeInteger(options.amount) || options.amount <= 0)
  ) {
    throw new Error("Refund amount must be a positive integer in paise");
  }

  return razorpay.payments.refund(paymentId, options);
}

// Fetch a refund
export async function getRefund(paymentId: string, refundId: string) {
  return razorpay.refunds.fetch(refundId, {
    payment_id: paymentId,
  });
}

// Fetch refunds for a payment
export async function getPaymentRefunds(paymentId: string) {
  return razorpay.payments.fetchMultipleRefund(paymentId);
}

// Verify a Razorpay webhook signature
export function verifyWebhook(
  rawBody: string,
  signature: string,
  webhookSecret: string,
): boolean {
  if (!rawBody || !signature || !webhookSecret) {
    return false;
  }

  if (!/^[a-f0-9]{64}$/i.test(signature)) {
    return false;
  }

  const expected = createHmac("sha256", webhookSecret).update(rawBody).digest();

  const received = Buffer.from(signature, "hex");

  return (
    received.length === expected.length && timingSafeEqual(received, expected)
  );
}

export default razorpay;
