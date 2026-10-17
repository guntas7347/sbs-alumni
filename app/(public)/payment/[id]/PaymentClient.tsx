"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "@/lib/useForm";
import {
  getAlumniRegistrationById,
  updateAlumniPayment,
} from "@/lib/actions/alumniActions";
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
} from "lucide-react";

export default function PaymentClient({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [registration, setRegistration] = useState<AlumniRegistration | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const { form, handleChange, setFields } = useForm({
    paymentMethod: "upi",
    upiId: "alumni.sbssu@oksbi",
    cardNumber: "4532 8921 7712 9012",
    cardExpiry: "08/29",
    cardCvv: "821",
    cardHolder: "",
    bank: "State Bank of India",
  });

  useEffect(() => {
    getAlumniRegistrationById(id)
      .then((res) => {
        if (res.success && res.data) {
          setRegistration(res.data);
          if (res.data.paymentStatus === "completed") {
            setPaymentSuccess(true);
          }
          setFields({ cardHolder: res.data.fullName });
        } else {
          setError(res.error || "Registration not found");
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleMockPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registration) return;

    setProcessing(true);
    setError(null);

    await new Promise((resolve) => setTimeout(resolve, 1400));

    const txnId = `TXN-SBSSU-${Date.now().toString().slice(-6)}`;
    const methodLabel =
      form.paymentMethod === "upi"
        ? `UPI (${form.upiId})`
        : form.paymentMethod === "card"
        ? `Card (ending in ${form.cardNumber.slice(-4)})`
        : `Net Banking (${form.bank})`;

    try {
      const res = await updateAlumniPayment(registration.id, {
        transactionId: txnId,
        paymentMethod: methodLabel,
        referenceNumber: `REF-2026-${Math.floor(100000 + Math.random() * 900000)}`,
      });

      if (res.success) {
        setPaymentSuccess(true);
        setTimeout(() => {
          router.push(`/ticket/${registration.id}`);
        }, 1200);
      } else {
        setError(res.error || "Payment verification failed. Please try again.");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to complete payment transaction.");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
        <p className="text-sm text-zinc-500">Loading payment details...</p>
      </div>
    );
  }

  if (error || !registration) {
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

  if (paymentSuccess) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center space-y-6">
        <div className="bg-white rounded-3xl border border-emerald-300 p-8 shadow-md space-y-5">
          <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center animate-bounce">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
              Mock Payment Successful
            </span>
            <h2 className="text-2xl font-extrabold text-zinc-900">
              Registration Confirmed!
            </h2>
            <p className="text-xs text-zinc-600">
              Transaction reference generated. Redirecting to your digital pass...
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-600 space-y-1 text-left">
            <div>
              <strong>Attendee:</strong> {registration.fullName}
            </div>
            <div>
              <strong>Reg Number:</strong> {registration.regNumber}
            </div>
            <div>
              <strong>Amount Paid:</strong> ₹{registration.amount}
            </div>
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
          Mock payment simulation for testing and registration confirmation.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Order Summary (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl border border-orange-200 p-6 shadow-xs space-y-4">
            <h2 className="font-bold text-zinc-900 text-base border-b border-orange-100 pb-2">
              Registration Summary
            </h2>

            <div className="space-y-3 text-xs text-zinc-600">
              <div className="flex justify-between">
                <span className="text-zinc-500">Reg ID:</span>
                <span className="font-mono font-bold text-zinc-900">
                  {registration.regNumber}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Attendee:</span>
                <span className="font-semibold text-zinc-900">
                  {registration.fullName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Batch & Branch:</span>
                <span className="text-right font-medium text-zinc-800">
                  {registration.degree} ({registration.passingYear})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Attendance:</span>
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
              {registration.guestCount > 0 && (
                <div className="flex justify-between">
                  <span className="text-zinc-500">Guests:</span>
                  <span className="font-medium text-zinc-800">
                    +{registration.guestCount} Guest(s)
                  </span>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-zinc-100 flex items-center justify-between">
              <span className="text-sm font-bold text-zinc-900">Total Payable:</span>
              <span className="text-2xl font-black text-orange-600">
                ₹{registration.amount}
              </span>
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-[11px] text-emerald-900 space-y-1">
              <div className="font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Includes Sanjh 2026 Package:
              </div>
              <p>• Access to cultural evening & auditorium seating</p>
              <p>• High Tea, Souvenir Alumni Kit & Gala Dinner</p>
              <p>• Participation Certificate for performers</p>
            </div>
          </div>
        </div>

        {/* Mock Payment Gateway Form (7 cols) */}
        <div className="lg:col-span-7">
          <form
            onSubmit={handleMockPayment}
            className="bg-white rounded-3xl border border-zinc-200 p-6 sm:p-8 shadow-xs space-y-6"
          >
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div>
                <h2 className="font-bold text-zinc-900 text-base">
                  Select Payment Method
                </h2>
                <p className="text-xs text-zinc-500">
                  Instant Mock Processing Gateway
                </p>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-orange-100 text-orange-800 border border-orange-200 px-2 py-0.5 rounded-full">
                Mock Sandbox
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setFields({ paymentMethod: "upi" })}
                className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
                  form.paymentMethod === "upi"
                    ? "border-orange-500 bg-orange-50/70 text-orange-950 font-bold"
                    : "border-zinc-200 hover:border-zinc-300 text-zinc-700"
                }`}
              >
                <QrCode className="w-5 h-5 text-orange-600" />
                <span>UPI / QR</span>
              </button>

              <button
                type="button"
                onClick={() => setFields({ paymentMethod: "card" })}
                className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
                  form.paymentMethod === "card"
                    ? "border-orange-500 bg-orange-50/70 text-orange-950 font-bold"
                    : "border-zinc-200 hover:border-zinc-300 text-zinc-700"
                }`}
              >
                <CreditCard className="w-5 h-5 text-orange-600" />
                <span>Card (Mock)</span>
              </button>

              <button
                type="button"
                onClick={() => setFields({ paymentMethod: "netbanking" })}
                className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
                  form.paymentMethod === "netbanking"
                    ? "border-orange-500 bg-orange-50/70 text-orange-950 font-bold"
                    : "border-zinc-200 hover:border-zinc-300 text-zinc-700"
                }`}
              >
                <Building className="w-5 h-5 text-orange-600" />
                <span>Net Banking</span>
              </button>
            </div>

            {form.paymentMethod === "upi" && (
              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-zinc-700">
                  <span>Pay via UPI ID / Apps (GPay, PhonePe, Paytm)</span>
                  <span className="text-emerald-700">Instant</span>
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">
                    Virtual Payment Address (VPA)
                  </label>
                  <input
                    type="text"
                    name="upiId"
                    value={form.upiId}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div className="flex items-center gap-2 text-[11px] text-zinc-500">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Auto-verified sandbox UPI handle. Click below to confirm.</span>
                </div>
              </div>
            )}

            {form.paymentMethod === "card" && (
              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-3">
                <div>
                  <label className="block text-xs text-zinc-500 mb-1">Card Number</label>
                  <input
                    type="text"
                    name="cardNumber"
                    value={form.cardNumber}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs bg-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1">Expiry Date</label>
                    <input
                      type="text"
                      name="cardExpiry"
                      value={form.cardExpiry}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1">CVV</label>
                    <input
                      type="password"
                      name="cardCvv"
                      value={form.cardCvv}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs bg-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {form.paymentMethod === "netbanking" && (
              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-2">
                <label className="block text-xs text-zinc-500">Select Bank</label>
                <select
                  name="bank"
                  value={form.bank}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs bg-white"
                >
                  <option value="State Bank of India">State Bank of India (SBI)</option>
                  <option value="HDFC Bank">HDFC Bank</option>
                  <option value="ICICI Bank">ICICI Bank</option>
                  <option value="Punjab National Bank">Punjab National Bank (PNB)</option>
                  <option value="Bank of Baroda">Bank of Baroda</option>
                </select>
              </div>
            )}

            <div className="p-3 bg-orange-50 border border-orange-200 rounded-xl text-xs text-orange-950 flex items-start gap-2">
              <Lock className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
              <span>
                <strong>Mock Payment Mode:</strong> Clicking below simulates a secure 256-bit payment transaction and updates your registration record in Firestore.
              </span>
            </div>

            <button
              type="submit"
              disabled={processing}
              className="w-full inline-flex items-center justify-center gap-2 py-4 px-6 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold text-sm shadow-md transition-all disabled:opacity-50"
            >
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Simulating Bank Transfer...
                </>
              ) : (
                <>
                  Pay ₹{registration.amount} (Confirm Mock Payment)
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
