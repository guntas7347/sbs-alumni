"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getAlumniRegistrationById } from "@/lib/actions/alumniActions";
import {
  updateRegistrationStatus,
  deleteRegistration,
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
  ExternalLink,
  MessageSquare,
  Award,
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

  const fetchReg = () => {
    getAlumniRegistrationById(id)
      .then((res) => {
        if (res.success && res.data) {
          setRegistration(res.data);
          setAdminNotes(res.data.adminNotes || "");
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

  const handleTogglePayment = async () => {
    if (!registration) return;
    const newStatus = registration.paymentStatus === "completed" ? "pending" : "completed";
    const res = await updateRegistrationStatus(registration.id, {
      paymentStatus: newStatus,
    });
    if (res.success) {
      setActionSuccess(`Payment status changed to ${newStatus}.`);
      fetchReg();
      setTimeout(() => setActionSuccess(null), 3000);
    }
  };

  const handleToggleCheckIn = async () => {
    if (!registration) return;
    const newCheckIn = !registration.checkedIn;
    const res = await updateRegistrationStatus(registration.id, {
      checkedIn: newCheckIn,
    });
    if (res.success) {
      setActionSuccess(newCheckIn ? "Alumnus marked as Checked-In!" : "Check-in revoked.");
      fetchReg();
      setTimeout(() => setActionSuccess(null), 3000);
    }
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

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <Link href="/admin" className="hover:text-zinc-900">
              Admin
            </Link>
            <span>/</span>
            <Link href="/admin/alumni-registrations" className="hover:text-zinc-900">
              Registrations
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
              <ArrowLeft className="w-3.5 h-3.5" /> All Registrations
            </Link>
            {registration && (
              <Link
                href={`/ticket/${registration.id}`}
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
              Return to Registrations Table
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
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
                    {registration.registrantType === "student" ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                        🎒 Student (Free)
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 border border-orange-200">
                        🎓 Alumni (₹1,000)
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500 mt-1">
                    {registration.degree} – {registration.branch}{" "}
                    {registration.registrantType === "student"
                      ? `(${registration.currentSemester || "Enrolled Student"})`
                      : `(Batch of ${registration.passingYear}) • ${registration.era} Era`}
                  </p>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Registered on: {new Date(registration.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {registration.registrantType === "student" ? (
                  <span className="px-3 py-2 rounded-xl text-xs font-bold border bg-emerald-50 text-emerald-800 border-emerald-300">
                    ✓ Complimentary Student Pass (₹0)
                  </span>
                ) : (
                  <button
                    onClick={handleTogglePayment}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                      registration.paymentStatus === "completed"
                        ? "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100"
                        : "bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100"
                    }`}
                  >
                    Payment: {registration.paymentStatus === "completed" ? "✓ Paid (₹" + registration.amount + ")" : "⏳ Pending (Click to Mark Paid)"}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-3xl border border-zinc-200 p-6 shadow-2xs space-y-4">
                <h3 className="font-bold text-zinc-900 text-sm flex items-center gap-2 border-b border-zinc-100 pb-2">
                  <User className="w-4 h-4 text-orange-600" />
                  Personal & Contact Details
                </h3>

                <dl className="space-y-2.5 text-xs">
                  <div className="flex justify-between">
                    <dt className="text-zinc-500">Google Verified Email:</dt>
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
                    <dt className="text-zinc-500">Current Location:</dt>
                    <dd className="text-zinc-800">
                      {[registration.city, registration.state, registration.country]
                        .filter(Boolean)
                        .join(", ") || "—"}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="bg-white rounded-3xl border border-zinc-200 p-6 shadow-2xs space-y-4">
                <h3 className="font-bold text-zinc-900 text-sm flex items-center gap-2 border-b border-zinc-100 pb-2">
                  <Briefcase className="w-4 h-4 text-orange-600" />
                  {registration.registrantType === "student" ? "Student Campus Profile" : "Professional Profile"}
                </h3>

                {registration.registrantType === "student" ? (
                  <dl className="space-y-2.5 text-xs">
                    <div className="flex justify-between">
                      <dt className="text-zinc-500">University Roll Number:</dt>
                      <dd className="font-mono font-bold text-zinc-900">{registration.rollNumber || "—"}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-zinc-500">Current Semester / Year:</dt>
                      <dd className="font-semibold text-zinc-800">{registration.currentSemester || "—"}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-zinc-500">Campus Residence:</dt>
                      <dd className="text-zinc-800">{registration.hostelOrDayScholar || "Day Scholar"}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-zinc-500">SECA Organizing Volunteer:</dt>
                      <dd className="font-bold text-emerald-700">
                        {registration.volunteerInterest ? "✓ Yes, Registered Volunteer" : "No"}
                      </dd>
                    </div>
                  </dl>
                ) : (
                  <dl className="space-y-2.5 text-xs">
                    <div className="flex justify-between">
                      <dt className="text-zinc-500">Designation / Role:</dt>
                      <dd className="font-semibold text-zinc-800">
                        {registration.currentDesignation || "—"}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-zinc-500">Company / Organization:</dt>
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
                )}
              </div>

              <div className="bg-white rounded-3xl border border-zinc-200 p-6 shadow-2xs space-y-4">
                <h3 className="font-bold text-zinc-900 text-sm flex items-center gap-2 border-b border-zinc-100 pb-2">
                  <Music className="w-4 h-4 text-emerald-600" />
                  Sanjh 2026 & SECA Cultural Details
                </h3>

                <dl className="space-y-2.5 text-xs">
                  <div className="flex justify-between">
                    <dt className="text-zinc-500">Attendance Mode:</dt>
                    <dd className="font-semibold text-zinc-800 capitalize">
                      {registration.attendanceType}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-zinc-500">Cultural Participation:</dt>
                    <dd>
                      {registration.culturalInterest !== "none" ? (
                        <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {registration.culturalInterest.toUpperCase()} (Cert. Eligible)
                        </span>
                      ) : (
                        <span className="text-zinc-500">Spectator / Audience</span>
                      )}
                    </dd>
                  </div>
                  {registration.culturalDetails && (
                    <div>
                      <dt className="text-zinc-500 mb-0.5">Act Description:</dt>
                      <dd className="p-2 rounded-lg bg-zinc-50 text-zinc-700 italic border border-zinc-100">
                        {registration.culturalDetails}
                      </dd>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <dt className="text-zinc-500">Accompanying Guests:</dt>
                    <dd className="font-semibold text-zinc-800">
                      {registration.guestCount} Guest(s)
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-zinc-500">Dinner Preference:</dt>
                    <dd className="capitalize text-zinc-800">
                      {registration.dietaryPreference || "Veg"}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="bg-white rounded-3xl border border-zinc-200 p-6 shadow-2xs space-y-4">
                <h3 className="font-bold text-zinc-900 text-sm flex items-center gap-2 border-b border-zinc-100 pb-2">
                  <IndianRupee className="w-4 h-4 text-orange-600" />
                  Payment & Transaction Details
                </h3>

                <dl className="space-y-2.5 text-xs">
                  <div className="flex justify-between">
                    <dt className="text-zinc-500">Pass Tier:</dt>
                    <dd className="font-semibold text-zinc-800 capitalize">
                      {registration.contributionTier}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-zinc-500">Amount:</dt>
                    <dd className="font-extrabold text-orange-600 text-sm">
                      ₹{registration.amount}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-zinc-500">Payment Status:</dt>
                    <dd>
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          registration.paymentStatus === "completed"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {registration.paymentStatus}
                      </span>
                    </dd>
                  </div>
                  {registration.paymentDetails && (
                    <>
                      <div className="flex justify-between">
                        <dt className="text-zinc-500">Transaction ID:</dt>
                        <dd className="font-mono text-zinc-800 font-bold">
                          {registration.paymentDetails.transactionId}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-zinc-500">Method:</dt>
                        <dd className="text-zinc-800">
                          {registration.paymentDetails.paymentMethod}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-zinc-500">Paid Timestamp:</dt>
                        <dd className="text-zinc-500">
                          {new Date(registration.paymentDetails.paidAt).toLocaleString()}
                        </dd>
                      </div>
                    </>
                  )}
                </dl>
              </div>
            </div>

            {registration.memoriesMessage && (
              <div className="bg-orange-50/50 rounded-3xl border border-orange-200 p-6 space-y-2">
                <h3 className="font-bold text-orange-950 text-xs uppercase tracking-wider flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-orange-600" />
                  Nostalgic Message for SBSSU / Juniors:
                </h3>
                <p className="text-sm text-zinc-700 italic leading-relaxed">
                  &ldquo;{registration.memoriesMessage}&rdquo;
                </p>
              </div>
            )}

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
                placeholder="e.g. Special felicitations guest; seated with 1999 CSE batch; kit handed over..."
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
      </div>
  );
}
