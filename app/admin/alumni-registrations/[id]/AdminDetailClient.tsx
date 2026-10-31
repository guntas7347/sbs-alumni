"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getAlumniRegistrationById, getAllRegistrations } from "@/lib/actions/alumniActions";
import {
  updateRegistrationStatus,
  deleteRegistration,
  reviewPerformanceApplication,
  issueComplimentaryPass,
  revokePass,
  verifyAlumniPayment,
} from "@/lib/actions/adminActions";
import type { AlumniRegistration } from "@/lib/types";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Trash2,
  Printer,
  ShieldCheck,
  User,
  GraduationCap,
  Briefcase,
  Music,
  MapPin,
  Calendar,
  IndianRupee,
  Loader2,
  AlertCircle,
  AlertTriangle,
  ExternalLink,
  MessageSquare,
  Award,
  Ticket,
  Video,
  FileText,
  FileImage,
  Check,
  X,
  XCircle,
  Eye,
} from "lucide-react";

export default function AdminDetailClient({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [registration, setRegistration] = useState<AlumniRegistration | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingNotes, setSavingNotes] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [actingOnPass, setActingOnPass] = useState(false);
  const [reviewingPerf, setReviewingPerf] = useState(false);
  const [duplicateMatches, setDuplicateMatches] = useState<AlumniRegistration[]>([]);
  const [viewScreenshotModal, setViewScreenshotModal] = useState(false);

  const fetchReg = () => {
    getAlumniRegistrationById(id)
      .then((res) => {
        if (res.success && res.data) {
          setRegistration(res.data);
          setAdminNotes(res.data.adminNotes || "");

          if (res.data.txnId) {
            const tid = res.data.txnId.trim().toLowerCase();
            getAllRegistrations().then((allRes) => {
              if (allRes.success && allRes.data) {
                const matches = allRes.data.filter(
                  (other) =>
                    other.id !== res.data!.id &&
                    other.txnId?.trim().toLowerCase() === tid
                );
                setDuplicateMatches(matches);
              }
            });
          }
        } else {
          setError(res.error || "Registration not found");
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReg();
  }, [id]);

  const handleToggleVerify = async (targetVerified: boolean) => {
    if (!registration) return;
    const confirmMsg = targetVerified
      ? `Verify UPI payment of ₹1,000 for ${registration.fullName} (Txn: ${registration.txnId || "N/A"}) and send their official Pass via email?`
      : `Unverify payment for ${registration.fullName}? This will revoke their active meet pass.`;
    if (!confirm(confirmMsg)) return;

    setActingOnPass(true);
    const res = await verifyAlumniPayment(registration.id, targetVerified, adminNotes, "Admin");
    if (res.success) {
      setActionSuccess(
        targetVerified
          ? "Payment verified & official Event Pass sent via email!"
          : "Payment marked as unverified."
      );
      fetchReg();
      setTimeout(() => setActionSuccess(null), 3500);
    } else {
      alert(res.error || "Failed to update payment verification.");
    }
    setActingOnPass(false);
  };

  const handleGrantComplimentaryPass = async () => {
    if (!registration) return;
    setActingOnPass(true);
    const res = await issueComplimentaryPass(
      registration.id,
      "Faculty / Admin Complimentary Pass",
      "Administrator"
    );
    if (res.success) {
      setActionSuccess("Complimentary Alumni Meet Pass (₹1,000 value) issued successfully!");
      fetchReg();
      setTimeout(() => setActionSuccess(null), 3500);
    } else {
      alert(res.error || "Failed to issue pass.");
    }
    setActingOnPass(false);
  };

  const handleRevokePass = async () => {
    if (!registration) return;
    if (!confirm("Are you sure you want to revoke the Sanjh 2026 Event Pass for this alumnus?")) {
      return;
    }
    setActingOnPass(true);
    const res = await revokePass(registration.id);
    if (res.success) {
      setActionSuccess("Pass revoked. Alumnus remains registered in the free directory.");
      fetchReg();
      setTimeout(() => setActionSuccess(null), 3500);
    } else {
      alert(res.error || "Failed to revoke pass.");
    }
    setActingOnPass(false);
  };

  const handleToggleCheckIn = async () => {
    if (!registration) return;
    const hasPass = Boolean(
      registration.hasPass ||
      registration.passStatus === "active" ||
      registration.paymentStatus === "completed"
    );

    if (!hasPass && !registration.checkedIn) {
      if (
        !confirm(
          "Notice: This alumnus does NOT currently have an active Event Pass (₹1,000). Are you sure you want to bypass and mark them checked-in?"
        )
      ) {
        return;
      }
    }

    const newCheckIn = !registration.checkedIn;
    const res = await updateRegistrationStatus(registration.id, {
      checkedIn: newCheckIn,
    });
    if (res.success) {
      setActionSuccess(newCheckIn ? "Alumnus marked as Checked-In at venue!" : "Check-in revoked.");
      fetchReg();
      setTimeout(() => setActionSuccess(null), 3000);
    }
  };

  const handleReviewPerformance = async (decision: "approved" | "rejected") => {
    if (!registration) return;
    const remarks = prompt(
      decision === "approved"
        ? "Enter any coordinator remarks / stage instructions (optional):"
        : "Enter reason for rejection (optional):"
    );
    if (remarks === null) return; // user cancelled prompt

    setReviewingPerf(true);
    const res = await reviewPerformanceApplication(
      registration.id,
      decision,
      remarks,
      "Admin"
    );

    if (res.success) {
      setActionSuccess(`Stage performance request marked as ${decision.toUpperCase()}!`);
      fetchReg();
      setTimeout(() => setActionSuccess(null), 3500);
    } else {
      alert(res.error || "Failed to update review status.");
    }
    setReviewingPerf(false);
  };

  const handleSaveNotes = async () => {
    if (!registration) return;
    setSavingNotes(true);
    const res = await updateRegistrationStatus(registration.id, {
      adminNotes,
    });
    if (res.success) {
      setActionSuccess("Admin remarks saved successfully.");
      setTimeout(() => setActionSuccess(null), 3000);
    }
    setSavingNotes(false);
  };

  const handleDelete = async () => {
    if (!registration) return;
    if (
      !confirm(
        `Are you sure you want to permanently delete registration ${registration.regNumber} (${registration.fullName}) from Firestore?`
      )
    ) {
      return;
    }
    setDeleting(true);
    const res = await deleteRegistration(registration.id);
    if (res.success) {
      alert("Registration deleted successfully.");
      router.push("/admin/alumni-registrations");
    } else {
      alert(res.error || "Failed to delete registration");
      setDeleting(false);
    }
  };

  const hasPass = Boolean(
    registration?.hasPass ||
    registration?.passStatus === "active" ||
    registration?.paymentStatus === "completed"
  );
  const perf = registration?.performanceApplication;
  const perfStatus = registration?.performerStatus || perf?.status || "none";

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <Link href="/admin" className="hover:text-zinc-900">
            Admin
          </Link>
          <span>/</span>
          <Link href="/admin/alumni-registrations" className="hover:text-zinc-900">
            Alumni Directory
          </Link>
          <span>/</span>
          <span className="font-mono text-zinc-800 font-bold truncate max-w-[150px]">
            {registration?.regNumber || id}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/alumni-registrations"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-zinc-50 text-zinc-700 text-xs font-semibold border border-zinc-200 shadow-2xs transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> All Alumni
          </Link>
          {registration && (
            <Link
              href={`/sanjh-2026/pass/${registration.id}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-800 text-xs font-semibold border border-orange-200 transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5 text-orange-600" />
              View Public Pass
            </Link>
          )}
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
          <span className="text-xs text-zinc-500">Loading alumnus record...</span>
        </div>
      ) : error || !registration ? (
        <div className="p-6 bg-white rounded-3xl border border-rose-200 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-rose-600 mx-auto" />
          <h3 className="font-bold text-zinc-900 text-base">{error || "Record not found"}</h3>
          <Link
            href="/admin/alumni-registrations"
            className="inline-block text-xs font-semibold text-orange-600 hover:underline"
          >
            Return to Alumni Directory
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="bg-white rounded-3xl border border-zinc-200 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-orange-100 text-orange-700 flex items-center justify-center text-xl font-bold shrink-0">
                {registration.fullName[0]}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-black text-zinc-900">
                    {registration.fullName}
                  </h1>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 border border-zinc-200">
                    {registration.regNumber}
                  </span>

                  {hasPass ? (
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                      <Ticket className="w-3 h-3 text-emerald-700" />
                      Pass Active (₹1,000)
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-600 border border-zinc-200">
                      Registered Only (No Pass)
                    </span>
                  )}

                  {perfStatus === "approved" && (
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                      ★ Approved Stage Performer
                    </span>
                  )}
                </div>

                <p className="text-xs text-zinc-500 mt-1">
                  {registration.degree} – {registration.branch} (Batch of {registration.passingYear}) • {registration.era} Era
                </p>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Registered in database on: {new Date(registration.createdAt).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Top Actions */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* UPI Payment Verification Buttons */}
              {registration.verified ? (
                <button
                  onClick={() => handleToggleVerify(false)}
                  disabled={actingOnPass}
                  className="px-3 py-2 rounded-xl text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 transition-all flex items-center gap-1.5"
                >
                  <XCircle className="w-3.5 h-3.5 text-rose-600" />
                  Unverify Payment
                </button>
              ) : registration.txnId ? (
                <button
                  onClick={() => handleToggleVerify(true)}
                  disabled={actingOnPass}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-xs flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verify UPI Payment & Send Pass
                </button>
              ) : null}

              {!hasPass ? (
                <button
                  onClick={handleGrantComplimentaryPass}
                  disabled={actingOnPass}
                  className="px-3 py-2 rounded-xl text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white transition-all shadow-xs flex items-center gap-1.5"
                >
                  <Ticket className="w-3.5 h-3.5" />
                  Issue Complimentary Pass
                </button>
              ) : (
                <button
                  onClick={handleRevokePass}
                  disabled={actingOnPass}
                  className="px-3 py-2 rounded-xl text-xs font-semibold bg-zinc-100 hover:bg-rose-100 text-zinc-700 hover:text-rose-800 border border-zinc-200 transition-all"
                >
                  Revoke Pass
                </button>
              )}

              <button
                onClick={handleToggleCheckIn}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                  registration.checkedIn
                    ? "bg-emerald-600 text-white border-emerald-700"
                    : "bg-white text-zinc-700 border-zinc-300 hover:bg-zinc-50"
                }`}
              >
                {registration.checkedIn ? "✓ Checked-In at Venue" : "Check-in Attendee"}
              </button>

              <button
                onClick={handleDelete}
                disabled={deleting}
                title="Delete record from Firestore"
                className="p-2 text-zinc-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* STAGE PERFORMANCE APPLICATION SECTION */}
          {perf && perf.applied && (
            <div
              className={`rounded-3xl border p-6 sm:p-8 space-y-4 shadow-xs ${
                perfStatus === "approved"
                  ? "bg-emerald-50/50 border-emerald-300"
                  : perfStatus === "rejected"
                  ? "bg-zinc-50 border-zinc-200"
                  : "bg-amber-50/50 border-amber-300"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200/60 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                    <Music className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-zinc-900">
                      Sanjh 2026 Stage Performance Request
                    </h3>
                    <p className="text-xs text-zinc-500">
                      Submitted on: {new Date(perf.appliedAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${
                      perfStatus === "approved"
                        ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                        : perfStatus === "rejected"
                        ? "bg-zinc-200 text-zinc-700 border-zinc-300"
                        : "bg-amber-100 text-amber-900 border-amber-300"
                    }`}
                  >
                    Status: {perfStatus}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-zinc-500 block">Performance Act Title:</span>
                  <strong className="text-sm font-bold text-zinc-900">{perf.title}</strong>
                </div>
                <div>
                  <span className="text-zinc-500 block">Category & Duration:</span>
                  <span className="font-semibold text-zinc-800">
                    {perf.category} ({perf.durationMinutes || "5-7 mins"})
                  </span>
                </div>
                <div className="md:col-span-2">
                  <span className="text-zinc-500 block mb-1">Act Description:</span>
                  <div className="p-3 rounded-xl bg-white border border-zinc-200 text-zinc-700 italic">
                    &ldquo;{perf.description}&rdquo;
                  </div>
                </div>
                <div>
                  <span className="text-zinc-500 block mb-1">Resume / Video Audition URL:</span>
                  {perf.resumeUrl ? (
                    <a
                      href={perf.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-2xs transition-colors"
                    >
                      <Video className="w-3.5 h-3.5" />
                      Open Performance Resume / Video Link
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-zinc-400 italic">No link provided</span>
                  )}
                </div>
                <div>
                  <span className="text-zinc-500 block">Stage / Audio Needs:</span>
                  <span className="text-zinc-700">{perf.specialRequirements || "Standard stage mic"}</span>
                </div>
              </div>

              {perf.reviewedAt && (
                <div className="p-3 rounded-xl bg-white border border-zinc-200 text-xs text-zinc-600 space-y-1">
                  <div className="flex justify-between">
                    <span className="font-semibold">Review Decision:</span>
                    <span className="capitalize font-bold text-zinc-900">{perfStatus}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Reviewed By:</span>
                    <span>{perf.reviewedBy} on {new Date(perf.reviewedAt).toLocaleString()}</span>
                  </div>
                  {perf.adminRemarks && (
                    <div className="pt-1 border-t border-zinc-100">
                      <span className="text-zinc-400 block">Remarks:</span>
                      <p className="italic text-zinc-800">{perf.adminRemarks}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons to Approve or Reject */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleReviewPerformance("approved")}
                  disabled={reviewingPerf}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Check className="w-4 h-4" />
                  Approve as Stage Performer
                </button>

                <button
                  type="button"
                  onClick={() => handleReviewPerformance("rejected")}
                  disabled={reviewingPerf}
                  className="px-4 py-2 rounded-xl bg-zinc-200 hover:bg-rose-100 text-zinc-700 hover:text-rose-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Reject Performer Request
                </button>
              </div>
            </div>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Details */}
            <div className="bg-white rounded-3xl border border-zinc-200 p-6 shadow-2xs space-y-4">
              <h3 className="font-bold text-zinc-900 text-sm flex items-center gap-2 border-b border-zinc-100 pb-2">
                <User className="w-4 h-4 text-orange-600" />
                Personal & Contact Details
              </h3>

              <dl className="space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <dt className="text-zinc-500">Google Email:</dt>
                  <dd className="font-semibold text-zinc-800">{registration.email}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-zinc-500">Phone Number:</dt>
                  <dd className="font-semibold text-zinc-800">{registration.phone}</dd>
                </div>
                {registration.whatsapp && (
                  <div className="flex justify-between">
                    <dt className="text-zinc-500">WhatsApp:</dt>
                    <dd className="text-zinc-800">{registration.whatsapp}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-zinc-500">Location:</dt>
                  <dd className="text-zinc-800">
                    {[registration.city, registration.state, registration.country]
                      .filter(Boolean)
                      .join(", ") || "—"}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Professional Profile */}
            <div className="bg-white rounded-3xl border border-zinc-200 p-6 shadow-2xs space-y-4">
              <h3 className="font-bold text-zinc-900 text-sm flex items-center gap-2 border-b border-zinc-100 pb-2">
                <Briefcase className="w-4 h-4 text-orange-600" />
                Professional Profile
              </h3>

              <dl className="space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <dt className="text-zinc-500">Designation / Role:</dt>
                  <dd className="font-semibold text-zinc-800">
                    {registration.currentDesignation || "—"}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-zinc-500">Organization:</dt>
                  <dd className="font-semibold text-zinc-800">
                    {registration.organization || "—"}
                  </dd>
                </div>
                {registration.linkedin && (
                  <div className="flex justify-between">
                    <dt className="text-zinc-500">LinkedIn Profile:</dt>
                    <dd>
                      <a
                        href={registration.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-orange-600 hover:underline flex items-center gap-1"
                      >
                        View Profile <ExternalLink className="w-3 h-3" />
                      </a>
                    </dd>
                  </div>
                )}
                {registration.rollNumber && (
                  <div className="flex justify-between">
                    <dt className="text-zinc-500">College Roll Number:</dt>
                    <dd className="font-mono text-zinc-800">{registration.rollNumber}</dd>
                  </div>
                )}
              </dl>
            </div>

            {/* UPI QR Payment & Pass Verification Details */}
            <div className="bg-white rounded-3xl border border-zinc-200 p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                <h3 className="font-bold text-zinc-900 text-sm flex items-center gap-2">
                  <Ticket className="w-4 h-4 text-orange-600" />
                  UPI Payment & Event Pass
                </h3>
                <span
                  className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                    registration.verified
                      ? "bg-emerald-100 text-emerald-800"
                      : registration.txnId
                      ? "bg-amber-100 text-amber-800"
                      : "bg-zinc-100 text-zinc-600"
                  }`}
                >
                  {registration.verified
                    ? "✓ Payment Verified"
                    : registration.txnId
                    ? "⏳ Pending Verification"
                    : "No Payment Submitted"}
                </span>
              </div>

              {/* DUPLICATE TXN ID WARNING BANNER IN DETAIL VIEW */}
              {duplicateMatches.length > 0 && (
                <div className="p-3.5 rounded-xl bg-rose-50 border-2 border-rose-300 text-rose-950 text-xs space-y-1">
                  <div className="flex items-center gap-2 font-bold text-rose-900">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>CRITICAL WARNING: DUPLICATE TRANSACTION ID!</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-rose-900">
                    The transaction ID <strong>{registration.txnId}</strong> is also used by{" "}
                    <strong>{duplicateMatches.length}</strong> other applicant(s):
                  </p>
                  <ul className="list-disc list-inside font-mono text-[11px] text-rose-950 pl-1">
                    {duplicateMatches.map((m) => (
                      <li key={m.id}>
                        <Link
                          href={`/admin/alumni-registrations/${m.id}`}
                          className="underline hover:text-rose-700"
                        >
                          {m.regNumber} ({m.fullName})
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <p className="text-[10px] text-rose-800 font-medium pt-1">
                    Please inspect the screenshot below and verify whether this payment was made twice or re-used.
                  </p>
                </div>
              )}

              <dl className="space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <dt className="text-zinc-500">Event Pass Status:</dt>
                  <dd>
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        hasPass
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-zinc-100 text-zinc-600"
                      }`}
                    >
                      {hasPass ? "✓ Active (Pass Issued)" : "No Pass (Registered Only)"}
                    </span>
                  </dd>
                </div>

                <div className="flex justify-between">
                  <dt className="text-zinc-500">Pass Price:</dt>
                  <dd className="font-extrabold text-orange-600 text-sm">
                    {hasPass ? `₹${registration.amount || 1000}` : "₹0 (Registration)"}
                  </dd>
                </div>

                <div className="flex justify-between">
                  <dt className="text-zinc-500">Payment Mode:</dt>
                  <dd className="font-mono text-zinc-800 font-semibold">
                    {registration.paymentMode || registration.paymentDetails?.paymentMethod || "UPI_QR"}
                  </dd>
                </div>

                <div className="flex justify-between items-center">
                  <dt className="text-zinc-500">Transaction ID (TxnId):</dt>
                  <dd className="font-mono text-zinc-900 font-bold bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">
                    {registration.txnId || registration.paymentDetails?.transactionId || "—"}
                  </dd>
                </div>

                <div className="flex justify-between">
                  <dt className="text-zinc-500">Verification Status:</dt>
                  <dd>
                    <span
                      className={`font-bold ${
                        registration.verified ? "text-emerald-700" : "text-amber-700"
                      }`}
                    >
                      {registration.verified ? "✓ Verified by Admin" : "⏳ Unverified"}
                    </span>
                  </dd>
                </div>

                {/* Screenshot section */}
                {registration.screenshotUrl ? (
                  <div className="pt-2 border-t border-zinc-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <dt className="text-zinc-500 font-medium">Payment Screenshot:</dt>
                      <a
                        href={registration.screenshotUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-orange-600 hover:text-orange-700 underline"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Full Size
                      </a>
                    </div>

                    <div
                      onClick={() => setViewScreenshotModal(true)}
                      className="cursor-pointer group relative w-full h-44 rounded-xl overflow-hidden border-2 border-zinc-200 bg-zinc-900 hover:border-orange-500 transition-colors shadow-inner"
                    >
                      <Image
                        src={registration.screenshotUrl}
                        alt="Payment Screenshot"
                        fill
                        className="object-contain group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-xs gap-1">
                        <Eye className="w-4 h-4" />
                        Click to enlarge screenshot
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="pt-2 border-t border-zinc-100 text-zinc-400 italic text-[11px]">
                    No screenshot uploaded yet
                  </div>
                )}
              </dl>

              {/* Quick Card Action Buttons */}
              <div className="pt-3 border-t border-zinc-100 flex items-center gap-2">
                {registration.verified ? (
                  <button
                    onClick={() => handleToggleVerify(false)}
                    disabled={actingOnPass}
                    className="w-full py-2 px-3 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 transition-colors text-center"
                  >
                    Unverify Payment & Revoke Pass
                  </button>
                ) : registration.txnId ? (
                  <button
                    onClick={() => handleToggleVerify(true)}
                    disabled={actingOnPass}
                    className="w-full py-2.5 px-3 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Verify Payment & Send Pass Email
                  </button>
                ) : null}
              </div>
            </div>

            {/* Attendance & Seating Logistics */}
            <div className="bg-white rounded-3xl border border-zinc-200 p-6 shadow-2xs space-y-4">
              <h3 className="font-bold text-zinc-900 text-sm flex items-center gap-2 border-b border-zinc-100 pb-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                Attendance & Seating Logistics
              </h3>

              <dl className="space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <dt className="text-zinc-500">Attendance Mode:</dt>
                  <dd className="font-semibold text-zinc-800 capitalize">
                    {registration.attendanceType || "In-Person"}
                  </dd>
                </div>
                <div className="flex justify-between items-baseline">
                  <dt className="text-zinc-500">Accompanying Guests:</dt>
                  <dd className="font-semibold text-zinc-800">
                    {registration.guests?.length ?? registration.guestCount ?? 0} Guest(s) (Max 3)
                  </dd>
                </div>
                {registration.guests && registration.guests.length > 0 && (
                  <div className="pt-2 border-t border-zinc-100">
                    <dt className="text-zinc-500 font-medium mb-1.5 text-[11px]">
                      Registered Family Members (Mom/Dad/Spouse/Child only):
                    </dt>
                    <div className="space-y-1.5">
                      {registration.guests.map((g, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between bg-zinc-50 border border-zinc-200/80 rounded-lg px-2.5 py-1.5"
                        >
                          <span className="font-semibold text-zinc-900 text-xs">
                            {idx + 1}. {g.name}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 border border-orange-200">
                            {g.relation}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-zinc-500">Venue Gate Check-in:</dt>
                  <dd>
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        registration.checkedIn
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-zinc-100 text-zinc-500"
                      }`}
                    >
                      {registration.checkedIn
                        ? `Checked In (${registration.verifiedBy || "Gate"})`
                        : "Not Checked-In"}
                    </span>
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Nostalgic Message */}
          {registration.memoriesMessage && (
            <div className="bg-orange-50/50 rounded-3xl border border-orange-200 p-6 space-y-2">
              <h3 className="font-bold text-orange-950 text-xs uppercase tracking-wider flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-orange-600" />
                Nostalgic Message for SBSSU:
              </h3>
              <p className="text-sm text-zinc-700 italic leading-relaxed">
                &ldquo;{registration.memoriesMessage}&rdquo;
              </p>
            </div>
          )}

          {/* Admin Internal Remarks */}
          <div className="bg-white rounded-3xl border border-zinc-200 p-6 space-y-3">
            <h3 className="font-bold text-zinc-900 text-sm">
              Administrative Notes & Seating Assignment
            </h3>
            <p className="text-xs text-zinc-500">
              Internal remarks visible only to verified administrators in Firestore.
            </p>
            <textarea
              rows={3}
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="e.g. Pioneer batch felicitation; kit handed over; seated with 2002 batch..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <button
              onClick={handleSaveNotes}
              disabled={savingNotes}
              className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-black text-white font-semibold text-xs transition-colors disabled:opacity-50"
            >
              {savingNotes ? "Saving Remarks..." : "Save Admin Notes"}
            </button>
          </div>
        </div>
      )}

      {/* Screenshot Zoom Modal */}
      {viewScreenshotModal && registration?.screenshotUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-2xl border border-zinc-200">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-orange-700">
                  Payment Verification Screenshot
                </span>
                <h3 className="text-base font-extrabold text-zinc-900">
                  {registration.fullName} ({registration.regNumber})
                </h3>
              </div>
              <button
                onClick={() => setViewScreenshotModal(false)}
                className="p-1.5 rounded-full hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative w-full h-80 sm:h-96 rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-300">
              <Image
                src={registration.screenshotUrl}
                alt="Payment Screenshot"
                fill
                className="object-contain"
              />
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <a
                href={registration.screenshotUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-bold text-orange-600 hover:text-orange-700 underline"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Open Original Image in New Tab
              </a>

              <button
                onClick={() => setViewScreenshotModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
