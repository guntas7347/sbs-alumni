"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  getAlumniRegistrationById,
  submitUpiPayment,
} from "@/lib/actions/alumniActions";
import { uploadFile } from "@/lib/uploader";
import type { AlumniRegistration } from "@/lib/types";
import {
  QrCode,
  CheckCircle2,
  Clock,
  Ticket,
  AlertCircle,
  Upload,
  FileImage,
  ShieldCheck,
  ArrowRight,
  Loader2,
  RefreshCw,
  Sparkles,
  ExternalLink,
  Info,
  Check,
  Eye,
  Camera,
} from "lucide-react";
import { extractText } from "@/lib/ocr";
import { generateUpiQR, isValidUpiTransactionId } from "@/lib/upi";

export default function PaymentClient({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [registration, setRegistration] = useState<AlumniRegistration | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [txnId, setTxnId] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [qrImage, setQrImage] = useState<string>("");
  const [qrUri, setQrUri] = useState<string>("");

  const fetchRecord = () => {
    getAlumniRegistrationById(id)
      .then((res) => {
        if (res.success && res.data) {
          setRegistration(res.data);
          if (res.data.txnId) {
            setTxnId(res.data.txnId);
          }
        } else {
          setError(res.error || "Alumni registration record not found.");
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRecord();

    generateUpiQR("Alumni Meet - Sanjh 2026", id)
      .then(({ qrImage, uri }) => {
        setQrImage(qrImage);
        setQrUri(uri);
      })
      .catch(console.error);
  }, [id]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file (JPG, PNG, or WebP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Screenshot image size must not exceed 5 MB.");
      return;
    }

    const extractedTextArray = await extractText(file);
    const upiTxnId = extractedTextArray.find(isValidUpiTransactionId);
    setTxnId(upiTxnId || "");

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registration) return;

    setError(null);

    const cleanTxnId = txnId.trim();
    if (!cleanTxnId) {
      setError("Please enter your UPI Transaction ID / UTR Number.");
      return;
    }

    // Must have a newly selected file or an existing screenshot URL
    if (!selectedFile && !registration.screenshotUrl) {
      setError(
        "Please upload the payment screenshot containing the Transaction ID.",
      );
      return;
    }

    setSubmitting(true);

    try {
      let finalScreenshotUrl = registration.screenshotUrl || "";

      // If user provided a new file, upload it
      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);

        const uploadRes = await uploadFile(formData);
        if (!uploadRes.success || !uploadRes.url) {
          setError(
            uploadRes.error ||
              "Failed to upload payment screenshot. Please try again.",
          );
          setSubmitting(false);
          return;
        }

        finalScreenshotUrl = uploadRes.url;
      }

      // Submit UPI payment to Firestore
      const submitRes = await submitUpiPayment({
        registrationId: registration.id,
        txnId: cleanTxnId,
        screenshotUrl: finalScreenshotUrl,
      });

      if (!submitRes.success) {
        setError(
          submitRes.error ||
            "Failed to submit payment details. Please try again.",
        );
        setSubmitting(false);
        return;
      }

      setSubmitSuccess(true);
      setIsEditing(false);
      fetchRecord();
    } catch (err: any) {
      console.error("Payment submission error:", err);
      setError(
        err?.message ||
          "An unexpected error occurred while submitting payment.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
        <p className="text-sm text-zinc-500 font-medium">
          Loading payment and registration details...
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

  // Case 1: Payment has been verified by admin
  const isVerified = Boolean(
    registration.verified === true ||
    (registration.hasPass === true && registration.verified !== false),
  );

  if (isVerified) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="bg-white rounded-3xl border-2 border-emerald-300 p-8 shadow-sm space-y-5">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center animate-bounce">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              ✓ Admin Verified & Approved
            </span>
            <h2 className="text-2xl font-black text-zinc-900 mt-2">
              Pass Payment Confirmed!
            </h2>
            <p className="text-xs text-zinc-600">
              Your official Alumni Meet Pass for Sanjh 2026 is active. A copy
              has also been sent to your email.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-700 space-y-2.5 text-left">
            <div className="flex justify-between">
              <span className="text-zinc-500">Attendee Name:</span>
              <strong className="text-zinc-900">{registration.fullName}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Registration Number:</span>
              <strong className="font-mono text-zinc-900">
                {registration.regNumber}
              </strong>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Amount Paid:</span>
              <strong className="text-emerald-700 font-bold">
                ₹1,000 (INR)
              </strong>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Payment Mode:</span>
              <strong className="text-zinc-800">
                {registration.paymentMode || "UPI_QR"}
              </strong>
            </div>
            {registration.txnId && (
              <div className="flex justify-between pt-1 border-t border-zinc-200">
                <span className="text-zinc-500">Transaction ID (TxnId):</span>
                <span className="font-mono text-zinc-800 font-bold text-[11px]">
                  {registration.txnId}
                </span>
              </div>
            )}
          </div>

          <Link
            href={`/sanjh-2026/pass/${registration.id}`}
            className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-colors shadow-xs"
          >
            <Ticket className="w-4 h-4" />
            View Digital Event Pass Online
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  // Case 2: Payment has been submitted, awaiting admin manual verification
  const isPendingVerification = Boolean(
    registration.txnId && !registration.verified && !isEditing,
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      {/* Top Banner Header */}
      <div className="space-y-2 text-center sm:text-left mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-900 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-orange-600" />
          Sanjh 2026 Alumni Meet Event Pass (₹1,000)
        </div>
        <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight">
          UPI QR Payment & Verification
        </h1>
        <p className="text-xs sm:text-sm text-zinc-600">
          Pay ₹1,000 via official SBSSU UPI QR code, upload your transaction
          screenshot, and provide your Transaction ID for manual verification.
        </p>
      </div>

      {/* Error alert */}
      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-3 text-xs">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold">Payment Error:</span>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Success banner after submission */}
      {submitSuccess && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start gap-3 text-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold">
              Payment Details Submitted Successfully!
            </span>
            <p>
              Your Transaction ID and screenshot have been saved. An email
              confirmation has been sent to{" "}
              <strong>{registration.email}</strong>. Our admin team will verify
              it shortly.
            </p>
          </div>
        </div>
      )}

      {/* Pending Verification Notice Card */}
      {isPendingVerification && (
        <div className="mb-8 bg-amber-50/80 border-2 border-amber-300 rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-200 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 bg-amber-200/70 px-2 py-0.5 rounded-md">
                  Status: Pending Admin Verification
                </span>
                <h2 className="text-xl font-bold text-zinc-900 mt-1">
                  Payment Submitted & Under Review
                </h2>
              </div>
            </div>

            <button
              onClick={() => setIsEditing(true)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 transition-colors"
            >
              Update Transaction Details
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-zinc-700">
            <div className="space-y-2 p-4 rounded-2xl bg-white/80 border border-amber-200">
              <div className="flex justify-between">
                <span className="text-zinc-500">Submitted Txn ID:</span>
                <span className="font-mono font-bold text-zinc-900 text-sm">
                  {registration.txnId}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Payment Mode:</span>
                <span className="font-semibold text-zinc-800">
                  {registration.paymentMode || "UPI_QR"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Amount:</span>
                <span className="font-bold text-emerald-700">₹1,000 (INR)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Verification Status:</span>
                <span className="text-amber-800 font-bold">
                  ● Awaiting Admin Review
                </span>
              </div>
            </div>

            {/* Screenshot preview */}
            {registration.screenshotUrl && (
              <div className="p-4 rounded-2xl bg-white/80 border border-amber-200 flex flex-col justify-between space-y-2">
                <span className="text-zinc-500 block font-medium">
                  Uploaded Payment Screenshot:
                </span>
                <div className="flex items-center gap-3">
                  <div className="relative w-16 h-16 rounded-xl border border-zinc-200 overflow-hidden shrink-0 bg-zinc-100">
                    <img
                      src={registration.screenshotUrl}
                      alt="Uploaded Screenshot"
                      className="object-cover"
                    />
                  </div>
                  <div className="space-y-1">
                    <a
                      href={registration.screenshotUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-bold text-orange-600 hover:text-orange-700 underline"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View Full Screenshot
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <p className="text-[11px] text-zinc-500">
                      Must show transaction ID clearly
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="text-xs text-amber-900 bg-amber-100/60 p-3 rounded-xl flex items-start gap-2">
            <Info className="w-4 h-4 shrink-0 text-amber-700 mt-0.5" />
            <span>
              Every payment must be manually verified by the administrative
              finance team. You will receive an official email with your
              barcoded Event Pass as soon as your payment is confirmed.
            </span>
          </div>
        </div>
      )}

      {/* Main Grid: Left Side QR & Instructions, Right Side Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: UPI QR Code & Instructions (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white rounded-3xl border border-orange-200 p-6 shadow-xs space-y-5 text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-orange-800 text-[11px] font-bold border border-orange-200">
              <QrCode className="w-3.5 h-3.5 text-orange-600" />
              Official SBSSU UPI QR Code
            </div>

            {/* QR Code Image */}
            <div className="p-1 bg-gradient-to-b from-orange-50 to-white rounded-2xl border border-orange-200/80 inline-block shadow-inner">
              <div className="relative w-64 h-64 sm:w-72 sm:h-72 mx-auto rounded-xl overflow-hidden shadow-xs">
                <img
                  src={qrImage}
                  alt="SBSSU Alumni Meet UPI QR Code"
                  className="object-contain"
                />
              </div>
            </div>
            {qrUri && (
              <a
                href={qrUri}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-orange-600 bg-orange-50 px-4 py-2 rounded-lg hover:bg-orange-100 hover:text-orange-700 font-bold flex items-center gap-1.5 justify-center"
              >
                Pay with UPI <ExternalLink className="w-3 h-3" />
              </a>
            )}

            <div className="space-y-1">
              <div className="text-xs uppercase tracking-wider text-zinc-500 font-bold">
                Pass Fee to Pay
              </div>
              <div className="text-3xl font-black text-orange-600">
                ₹1,000{" "}
                <span className="text-xs font-normal text-zinc-500">INR</span>
              </div>
              <p className="text-xs text-zinc-500">
                Shaheed Bhagat Singh State University, Ferozepur
              </p>
            </div>

            {/* Step-by-Step Payment Instructions */}
            <div className="text-left text-xs text-zinc-600 space-y-2.5 pt-3 border-t border-zinc-100">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-800 font-bold flex items-center justify-center shrink-0 text-[10px]">
                  1
                </span>
                <span>Open Google Pay, PhonePe, Paytm, or any UPI app.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-800 font-bold flex items-center justify-center shrink-0 text-[10px]">
                  2
                </span>
                <span>
                  Scan the QR code above and pay exactly <strong>₹1,000</strong>
                  .
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-800 font-bold flex items-center justify-center shrink-0 text-[10px]">
                  3
                </span>
                <span>
                  <strong>Take a screenshot</strong> that clearly shows the{" "}
                  <strong>Transaction ID / UTR Number</strong>.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-800 font-bold flex items-center justify-center shrink-0 text-[10px]">
                  4
                </span>
                <span>
                  Upload screenshot and enter the Transaction ID below.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Upload & Transaction ID Form (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Attendee Summary Card */}
          <div className="bg-white rounded-3xl border border-zinc-200 p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3 mb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-orange-700">
                  Alumni Meet Registration
                </span>
                <h3 className="text-base font-extrabold text-zinc-900">
                  {registration.fullName}
                </h3>
              </div>
              <span className="font-mono text-xs font-bold text-orange-800 bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-200">
                {registration.regNumber}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-zinc-600">
              <div>
                <span className="text-zinc-400 block text-[11px]">
                  Academic Batch:
                </span>
                <span className="font-medium text-zinc-800">
                  Class of {registration.passingYear} ({registration.era})
                </span>
              </div>
              <div>
                <span className="text-zinc-400 block text-[11px]">
                  Program:
                </span>
                <span className="font-medium text-zinc-800 truncate block">
                  {registration.degree} – {registration.branch}
                </span>
              </div>
              <div>
                <span className="text-zinc-400 block text-[11px]">Email:</span>
                <span className="font-mono text-[11px] text-zinc-800 truncate block">
                  {registration.email}
                </span>
              </div>
              <div>
                <span className="text-zinc-400 block text-[11px]">
                  Event Date:
                </span>
                <span className="font-medium text-zinc-800">
                  Nov 14, 2026 (5:00 PM)
                </span>
              </div>
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-3xl border border-orange-200 p-6 sm:p-7 shadow-xs space-y-6">
            <div className="border-b border-zinc-100 pb-4">
              <h2 className="text-lg font-extrabold text-zinc-900">
                Submit Payment Verification Details
              </h2>
              <p className="text-xs text-zinc-500 mt-1">
                All fields are required. Please double check that your
                transaction ID matches your screenshot.
              </p>
            </div>

            {/* MANDATORY WARNING ALERT BANNER */}
            <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-950 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-xs text-amber-900">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>CRITICAL VERIFICATION REQUIREMENT</span>
              </div>
              <p className="text-xs leading-relaxed text-amber-900 font-medium">
                Make sure your payment screenshot{" "}
                <strong>
                  clearly displays the Transaction ID (UTR / Reference number)
                </strong>
                , amount (₹1,000), and payment timestamp. Screenshots without a
                visible Transaction ID will be rejected during admin
                verification.
              </p>
            </div>

            <form onSubmit={handleSubmitPayment} className="space-y-5">
              {/* Field 2: Screenshot file upload */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-zinc-800 uppercase tracking-wide">
                  Upload Payment Screenshot{" "}
                  <span className="text-rose-500">*</span>
                </label>

                <div className="border-2 border-dashed border-zinc-300 hover:border-orange-400 rounded-2xl p-6 text-center transition-colors bg-zinc-50/40 relative">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/jpg"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />

                  {previewUrl || registration.screenshotUrl ? (
                    <div className="space-y-3">
                      <div className="relative w-36 h-36 mx-auto rounded-xl overflow-hidden border-2 border-orange-300 shadow-sm">
                        <img
                          src={previewUrl || registration.screenshotUrl || ""}
                          alt="Screenshot Preview"
                          className="object-cover"
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          <Check className="w-3.5 h-3.5" />
                          Screenshot Attached
                        </div>
                        <p className="text-[11px] text-zinc-500">
                          Click or drag to replace with a different screenshot
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="w-12 h-12 mx-auto rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center">
                        <Camera className="w-6 h-6" />
                      </div>
                      <div className="text-xs font-bold text-zinc-800">
                        Click or drag to upload payment screenshot
                      </div>
                      <p className="text-[11px] text-zinc-500">
                        Supports JPG, PNG, WebP (Max 10 MB). Make sure
                        transaction ID is visible.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Field 1: Transaction ID string input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-zinc-800 uppercase tracking-wide">
                  UPI Transaction ID{" "}
                  <span className="text-zinc-500 font-normal text-xs">
                    {" "}
                    (Auto-detected from screenshot)
                  </span>
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={txnId}
                  onChange={(e) => setTxnId(e.target.value)}
                  placeholder="e.g. 431289123456"
                  className="w-full px-4 py-3 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm font-mono tracking-wide text-zinc-900 bg-zinc-50/50"
                />
                <p className="text-[11px] text-zinc-500">
                  Enter the 12-digit UTR or alphanumeric Transaction ID shown in
                  your Google Pay, PhonePe, or Paytm receipt.
                  <span className="text-zinc-500"> </span>
                  <span className="text-orange-600 font-bold">
                    (Auto-detected from screenshot)!
                  </span>
                </p>
              </div>

              {/* Payment Mode Note */}
              <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-600 flex items-center justify-between">
                <span className="text-zinc-500">Payment Mode:</span>
                <span className="font-bold text-zinc-800 font-mono">
                  UPI_QR (₹1,000)
                </span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 px-6 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Uploading Screenshot & Submitting...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5" />
                    <span>Submit Payment for Verification</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
