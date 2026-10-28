"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getAlumniRegistrationById } from "@/lib/actions/alumniActions";
import {
  createRazorpayOrderAction,
  verifyRazorpayPaymentAction,
} from "@/lib/actions/razorpay";
import { NEXT_PUBLIC_RAZORPAY_KEY_ID } from "@/lib/config";
import type { AlumniRegistration } from "@/lib/types";
import {
  CreditCard,
  QrCode,
  Building,
  CheckCircle2,
  Lock,
  ArrowRight,
  Loader2,
  AlertCircle,
  Sparkles,
  Ticket,
  ShieldCheck,
  Check,
  RefreshCw,
} from "lucide-react";
import TestCardModal from "@/components/TestCardModal";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function PaymentClient({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [registration, setRegistration] = useState<AlumniRegistration | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentTxnId, setPaymentTxnId] = useState<string | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // Load Razorpay checkout.js script dynamically
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (window.Razorpay) {
        setScriptLoaded(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => setScriptLoaded(true);
      script.onerror = () => {
        console.error("Failed to load Razorpay checkout script");
      };
      document.body.appendChild(script);
    }
  }, []);

  useEffect(() => {
    getAlumniRegistrationById(id)
      .then((res) => {
        if (res.success && res.data) {
          setRegistration(res.data);
          if (res.data.paymentStatus === "completed") {
            setPaymentSuccess(true);
            setPaymentTxnId(res.data.paymentDetails?.transactionId || null);
          }
        } else {
          setError(res.error || "Registration not found");
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleRazorpayPayment = async () => {
    if (!registration) return;

    setError(null);
    setProcessing(true);

    try {
      // 1. Create order on the server
      const orderRes = await createRazorpayOrderAction(registration.id);

      if (!orderRes.success || !orderRes.order) {
        setError(
          orderRes.error ||
            "Failed to initialize Razorpay order. Please try again.",
        );
        setProcessing(false);
        return;
      }

      const { order } = orderRes;

      // 2. Ensure Razorpay script is available
      if (!window.Razorpay) {
        // Fallback attempt to reload script
        await new Promise<boolean>((resolve) => {
          const s = document.createElement("script");
          s.src = "https://checkout.razorpay.com/v1/checkout.js";
          s.onload = () => resolve(true);
          s.onerror = () => resolve(false);
          document.body.appendChild(s);
        });
      }

      if (!window.Razorpay) {
        setError(
          "Razorpay SDK could not be loaded. Please check your internet connection.",
        );
        setProcessing(false);
        return;
      }

      // 3. Open Razorpay Checkout Modal
      const options = {
        key: NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency || "INR",
        name: "Shaheed Bhagat Singh State University",
        description: `Sanjh 2026 Alumni Pass (${registration.regNumber})`,
        image: "/sbssu-logo.png",
        order_id: order.id,
        prefill: {
          name: registration.fullName,
          email: registration.email,
          contact: registration.phone,
        },
        notes: {
          registrationId: registration.id,
          regNumber: registration.regNumber,
          passingYear: registration.passingYear || "",
          era: registration.era || "SBSSU",
        },
        theme: {
          color: "#ea580c", // SBSSU vibrant orange
        },
        modal: {
          ondismiss: () => {
            setProcessing(false);
          },
        },
        handler: async function (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) {
          setProcessing(true);
          try {
            const verifyRes = await verifyRazorpayPaymentAction({
              registrationId: registration.id,
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            });

            if (verifyRes.success) {
              setPaymentSuccess(true);
              setPaymentTxnId(response.razorpay_payment_id);
              setTimeout(() => {
                router.push(`/ticket/${registration.id}`);
              }, 1500);
            } else {
              setError(
                verifyRes.error ||
                  "Payment verification failed. Please contact admin.",
              );
              setProcessing(false);
            }
          } catch (err: any) {
            setError(err?.message || "Failed to confirm payment signature.");
            setProcessing(false);
          }
        },
      };

      const rzpInstance = new window.Razorpay(options);

      rzpInstance.on("payment.failed", function (response: any) {
        console.error("Razorpay payment failed:", response.error);
        setError(
          response.error?.description || "Payment failed or was declined.",
        );
        setProcessing(false);
      });

      rzpInstance.open();
    } catch (err: any) {
      console.error("Checkout launch error:", err);
      setError(
        err?.message ||
          "An unexpected error occurred while launching Razorpay.",
      );
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
        <p className="text-sm text-zinc-500 font-medium">
          Loading checkout details...
        </p>
      </div>
    );
  }

  if (error && !registration) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-sm">
          {error || "Registration record not found"}
        </div>
        <Link
          href="/register"
          className="inline-flex items-center gap-2 text-sm text-orange-600 font-semibold"
        >
          Return to Registration
        </Link>
      </div>
    );
  }

  if (!registration) return null;

  if (paymentSuccess) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center space-y-6">
        <div className="bg-white rounded-3xl border-2 border-emerald-300 p-8 shadow-md space-y-5">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center animate-bounce">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Razorpay Payment Verified
            </span>
            <h2 className="text-2xl font-black text-zinc-900 mt-2">
              Payment Confirmed!
            </h2>
            <p className="text-xs text-zinc-600">
              Your official Alumni Pass for Sanjh 2026 has been generated.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-700 space-y-2 text-left">
            <div className="flex justify-between">
              <span className="text-zinc-500">Attendee:</span>
              <strong className="text-zinc-900">{registration.fullName}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Pass Number:</span>
              <strong className="font-mono text-zinc-900">
                {registration.regNumber}
              </strong>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Amount Paid:</span>
              <strong className="text-emerald-700 font-bold">
                ₹{registration.amount || 1000} (INR)
              </strong>
            </div>
            {paymentTxnId && (
              <div className="flex justify-between pt-1 border-t border-zinc-200">
                <span className="text-zinc-500">Razorpay ID:</span>
                <span className="font-mono text-zinc-600 text-[11px]">
                  {paymentTxnId}
                </span>
              </div>
            )}
          </div>

          <Link
            href={`/ticket/${registration.id}`}
            className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-colors shadow-xs"
          >
            <Ticket className="w-4 h-4" />
            View Digital Alumni Pass Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="space-y-2 text-center sm:text-left mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-900 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-orange-600" />
          Sanjh 2026 Alumni Pass Checkout
        </div>
        <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">
          Complete Registration Payment
        </h1>
        <p className="text-xs sm:text-sm text-zinc-600">
          Secure online payment of ₹1,000 via official Razorpay Payment Gateway.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-3 text-xs">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold">Payment Issue:</span>
            <p>{error}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Order Summary (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl border border-orange-200 p-6 shadow-xs space-y-4">
            <h2 className="font-bold text-zinc-900 text-base border-b border-orange-100 pb-2 flex items-center justify-between">
              <span>Pass Order Summary</span>
              <span className="font-mono text-xs text-orange-700 font-bold px-2 py-0.5 rounded bg-orange-50 border border-orange-200">
                {registration.regNumber}
              </span>
            </h2>

            <div className="space-y-3 text-xs text-zinc-600">
              <div className="flex justify-between">
                <span className="text-zinc-500">Attendee Name:</span>
                <span className="font-semibold text-zinc-900">
                  {registration.fullName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Email:</span>
                <span className="text-zinc-800 font-mono text-[11px]">
                  {registration.email}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Mobile / WhatsApp:</span>
                <span className="text-zinc-800 font-mono">
                  {registration.phone}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Batch & Branch:</span>
                <span className="text-right font-medium text-zinc-800">
                  {registration.degree} ({registration.passingYear})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Alma Mater Era:</span>
                <span className="font-medium text-zinc-800">
                  {registration.era || "SBSSU"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Attendance Mode:</span>
                <span className="capitalize font-medium text-zinc-800">
                  {registration.attendanceType}
                </span>
              </div>
              {registration.culturalInterest !== "none" && (
                <div className="flex justify-between">
                  <span className="text-zinc-500">Cultural Act:</span>
                  <span className="capitalize font-semibold text-orange-700">
                    {registration.culturalInterest} (Cert. Eligible)
                  </span>
                </div>
              )}
              {Boolean(registration.guestCount && registration.guestCount > 0) && (
                <div className="flex justify-between">
                  <span className="text-zinc-500">Accompanying Guests:</span>
                  <span className="font-medium text-zinc-800">
                    +{registration.guestCount} Guest(s)
                  </span>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-zinc-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-zinc-500 block">
                  Total Payable:
                </span>
                <span className="text-2xl font-black text-orange-600">
                  ₹{registration.amount || 1000}
                </span>
              </div>
              <span className="text-[11px] font-bold px-2 py-1 rounded-full bg-emerald-100 text-emerald-800">
                Alumni Delegate
              </span>
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-[11px] text-emerald-900 space-y-1">
              <div className="font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Includes Sanjh 2026 Delegate Package:
              </div>
              <p>• Reserved auditorium seat for Sanjh 2026 Cultural Function</p>
              <p>• High Tea, Souvenir Alumni Kit & Grand Alumni Dinner</p>
              <p>• Official Participation Certificate for performers</p>
              <p>• Lifetime University Alumni Network access</p>
            </div>
          </div>
        </div>

        {/* Razorpay Gateway Card (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-3xl border border-zinc-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
              <div>
                <h2 className="font-bold text-zinc-900 text-base flex items-center gap-2">
                  <span>Pay with Razorpay</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                    OFFICIAL GATEWAY
                  </span>
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Fast, secure checkout supporting all major Indian payment
                  methods.
                </p>
              </div>

              <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-200 p-1 shrink-0 flex items-center justify-center">
                <Image
                  src="/sbssu-logo.png"
                  alt="SBSSU Logo"
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
            </div>

            {/* Supported Payment Channels */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-2xl border border-zinc-200 bg-zinc-50/70 flex flex-col items-center text-center gap-1.5">
                <QrCode className="w-6 h-6 text-orange-600" />
                <span className="text-xs font-bold text-zinc-800">
                  UPI / QR
                </span>
                <span className="text-[10px] text-zinc-400">
                  GPay, PhonePe, Paytm
                </span>
              </div>

              <div className="p-3 rounded-2xl border border-zinc-200 bg-zinc-50/70 flex flex-col items-center text-center gap-1.5">
                <CreditCard className="w-6 h-6 text-orange-600" />
                <span className="text-xs font-bold text-zinc-800">Cards</span>
                <span className="text-[10px] text-zinc-400">
                  Visa, Mastercard, RuPay
                </span>
              </div>

              <div className="p-3 rounded-2xl border border-zinc-200 bg-zinc-50/70 flex flex-col items-center text-center gap-1.5">
                <Building className="w-6 h-6 text-orange-600" />
                <span className="text-xs font-bold text-zinc-800">
                  Net Banking
                </span>
                <span className="text-[10px] text-zinc-400">
                  All Major Banks
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-orange-50/60 border border-orange-200 space-y-2 text-xs text-orange-950">
              <div className="font-bold flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-orange-600 shrink-0" />
                <span>Bank-Grade 256-bit SSL Encryption</span>
              </div>
              <p className="text-zinc-600 leading-relaxed text-[11px]">
                Payments are processed directly by Razorpay Payment Gateway.
                Your banking and card credentials are never stored on our
                servers. Once payment succeeds, your pass barcode and ticket
                number will be instantly unlocked.
              </p>
            </div>

            {/* Action Button */}
            <button
              type="button"
              onClick={handleRazorpayPayment}
              disabled={processing}
              className="w-full inline-flex items-center justify-center gap-3 py-4 px-6 rounded-2xl bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 hover:from-orange-700 hover:to-amber-700 text-white font-extrabold text-sm sm:text-base shadow-md hover:shadow-lg transition-all disabled:opacity-60 cursor-pointer"
            >
              {processing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Connecting to Razorpay...</span>
                </>
              ) : (
                <>
                  <span>Proceed to Pay ₹{registration.amount || 1000}</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-4 text-[11px] text-zinc-400 pt-2">
              <span className="flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                Zero Convenience Fee
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                Instant Confirmation
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                Official SBSSU Receipt
              </span>
            </div>
          </div>
        </div>
      </div>
      <TestCardModal />
    </div>
  );
}
