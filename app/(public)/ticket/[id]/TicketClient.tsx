"use client";

import React, { useState, useEffect, use } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  getAlumniRegistrationById,
  submitPerformanceApplication,
} from "@/lib/actions/alumniActions";
import type { AlumniRegistration } from "@/lib/types";
import Barcode from "@/components/Barcode";
import {
  Ticket,
  Printer,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  Award,
  Sparkles,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Music,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  FileText,
  Video,
  ShieldCheck,
  GraduationCap,
  ArrowRight,
  Info,
} from "lucide-react";

export default function TicketClient({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [registration, setRegistration] = useState<AlumniRegistration | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Performance Application Form state
  const [showPerformerForm, setShowPerformerForm] = useState(false);
  const [category, setCategory] = useState("Music & Singing");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("5-7 minutes");
  const [specialRequirements, setSpecialRequirements] = useState("");
  const [submittingAct, setSubmittingAct] = useState(false);
  const [appError, setAppError] = useState<string | null>(null);
  const [appSuccess, setAppSuccess] = useState<string | null>(null);

  const fetchRecord = () => {
    getAlumniRegistrationById(id)
      .then((res) => {
        if (res.success && res.data) {
          setRegistration(res.data);
        } else {
          setError(res.error || "Alumni record not found");
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRecord();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  const handlePerformanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAppError(null);
    setAppSuccess(null);

    if (!title || !description || !resumeUrl) {
      setAppError("Please fill in Act Title, Description, and a valid Resume/Video URL.");
      return;
    }

    setSubmittingAct(true);
    try {
      const res = await submitPerformanceApplication(id, {
        category,
        title,
        description,
        resumeUrl,
        durationMinutes,
        specialRequirements,
      });

      if (res.success) {
        setAppSuccess("Your performance application has been submitted to the university admin for review!");
        setShowPerformerForm(false);
        fetchRecord();
      } else {
        setAppError(res.error || "Failed to submit application.");
      }
    } catch (err: any) {
      setAppError(err?.message || "An unexpected error occurred.");
    } finally {
      setSubmittingAct(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
        <p className="text-sm text-zinc-500 font-medium">Loading your alumni pass record...</p>
      </div>
    );
  }

  if (error || !registration) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-sm">
          {error || "Registration not found"}
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-orange-600 font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Home
        </Link>
      </div>
    );
  }

  const hasPass = Boolean(
    registration.hasPass ||
    registration.passStatus === "active" ||
    registration.paymentStatus === "completed"
  );

  const performerStatus = registration.performerStatus || registration.performanceApplication?.status || "none";
  const perf = registration.performanceApplication;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 hover:text-orange-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="flex items-center gap-3">
          {hasPass && (
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-zinc-50 text-zinc-800 font-semibold text-xs border border-zinc-200 shadow-2xs transition-all"
            >
              <Printer className="w-4 h-4 text-orange-600" />
              Print / Save Pass (PDF)
            </button>
          )}

          {!hasPass && (
            <Link
              href={`/payment/${registration.id}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs transition-all shadow-xs"
            >
              <Ticket className="w-4 h-4" />
              Get Sanjh 2026 Meet Pass (₹1,000)
            </Link>
          )}
        </div>
      </div>

      {/* CASE 1: NO PASS PURCHASED YET */}
      {!hasPass && (
        <div className="bg-amber-50/80 border-2 border-amber-300 rounded-3xl p-6 sm:p-8 space-y-4 text-left print:hidden">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <Info className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-200/60 px-2.5 py-0.5 rounded-full">
                Alumni Registration Only (₹0)
              </span>
              <h2 className="text-lg font-bold text-zinc-900">
                You do not currently have an active Event Pass for Sanjh 2026
              </h2>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Your details are registered with the university database. If you plan to attend the <strong>1st Alumni Meet & Sanjh 2026</strong> in-person on campus on <strong>November 14, 2026</strong>, you must purchase an official <strong>Event Pass (₹1,000)</strong>. The pass includes gala dinner, high tea, souvenir kit, auditorium seating, and eligibility to apply to perform on stage!
              </p>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <Link
              href={`/payment/${registration.id}`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs transition-colors shadow-xs"
            >
              <Ticket className="w-4 h-4" />
              Buy Sanjh 2026 Event Pass (₹1,000)
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* THE MAIN PASS / IDENTITY CARD */}
      <div className="bg-white rounded-3xl border-2 border-orange-200 shadow-xl overflow-hidden relative">
        {/* Pass Header Banner */}
        <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-emerald-700 p-6 sm:p-8 text-white relative">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="w-16 h-16 bg-white rounded-full p-1.5 shadow-md shrink-0">
                <Image
                  src="/sbssu-logo.png"
                  alt="SBSSU Logo"
                  width={56}
                  height={56}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-orange-200 block">
                  {hasPass ? "Official Event Entry Pass" : "Registered Alumni Record"} • alumni.sbssu.ac.in
                </span>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                  1st Alumni Meet & Sanjh 2026
                </h1>
                <p className="text-xs text-orange-100">
                  Shaheed Bhagat Singh State University (SBSCET • SBSSTC • SBSSU)
                </p>
              </div>
            </div>

            <div className="shrink-0 text-center sm:text-right">
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  hasPass
                    ? "bg-white/20 backdrop-blur-md text-white"
                    : "bg-black/30 backdrop-blur-md text-amber-200"
                }`}
              >
                {hasPass ? "✓ Verified Meet Pass (₹1,000)" : "Alumni Registered (No Pass)"}
              </span>
              <div className="text-[11px] font-mono font-bold text-amber-200 mt-1">
                {registration.regNumber}
              </div>
            </div>
          </div>
        </div>

        {/* Perforated ticket divider */}
        <div className="relative h-6 bg-white flex items-center justify-between">
          <div className="w-4 h-8 bg-[#FDFBF7] rounded-r-full -mt-1 border-r border-orange-200" />
          <div className="flex-1 border-b-2 border-dashed border-orange-200 mx-2" />
          <div className="w-4 h-8 bg-[#FDFBF7] rounded-l-full -mt-1 border-l border-orange-200" />
        </div>

        {/* Pass Body Content */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Performer Status Notification Banner */}
          {performerStatus === "approved" && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md flex items-start gap-3">
              <Sparkles className="w-6 h-6 text-amber-300 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-black/20 px-2 py-0.5 rounded-full inline-block">
                  ★ Official Cultural Performer
                </span>
                <h3 className="text-base font-black">
                  Stage Performance Approved: {perf?.title || "Cultural Act"}
                </h3>
                <p className="text-xs text-emerald-100">
                  Category: <strong>{perf?.category || "Cultural"}</strong>. Please report to the SECA stage coordinator at <strong>4:30 PM</strong> at the main auditorium. 📜 Official Participation Certificate guaranteed!
                </p>
                {perf?.adminRemarks && (
                  <p className="text-xs bg-black/15 p-2 rounded-lg italic mt-1">
                    Coordinator Notes: &ldquo;{perf.adminRemarks}&rdquo;
                  </p>
                )}
              </div>
            </div>
          )}

          {performerStatus === "pending" && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 flex items-start gap-3 text-xs">
              <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-amber-900 font-bold">
                  Stage Performance Request Under Admin Review
                </strong>
                <p className="text-zinc-600 mt-0.5">
                  Your act <strong>&ldquo;{perf?.title}&rdquo;</strong> ({perf?.category}) is currently being reviewed by the university SECA committee. You will see an update here once approved.
                </p>
              </div>
            </div>
          )}

          {performerStatus === "rejected" && (
            <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 text-zinc-700 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>
                Pass Status: <strong>Honored Delegate & Attendee</strong>. Stage request reviewed{perf?.adminRemarks ? `: "${perf.adminRemarks}"` : "."}
              </span>
            </div>
          )}

          {/* Attendee Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1">
              <span className="text-[11px] uppercase font-bold tracking-wider text-zinc-400">
                Alumnus / Attendee Name
              </span>
              <h2 className="text-xl font-black text-zinc-900">
                {registration.fullName}
              </h2>
              <p className="text-xs text-zinc-500">{registration.email}</p>
              <p className="text-xs text-zinc-500">{registration.phone}</p>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] uppercase font-bold tracking-wider text-zinc-400">
                Academic Background
              </span>
              <div className="text-sm font-bold text-zinc-800">
                {registration.degree} – {registration.branch}
              </div>
              <div className="text-xs text-orange-700 font-semibold">
                Batch of {registration.passingYear} ({registration.era} Era)
              </div>
              {registration.currentDesignation && (
                <div className="text-xs text-zinc-500">
                  {registration.currentDesignation} {registration.organization ? `at ${registration.organization}` : ""}
                </div>
              )}
            </div>
          </div>

          {/* Event Schedule Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-orange-50/60 border border-orange-200 text-xs text-orange-950">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-orange-600 shrink-0" />
              <div>
                <span className="text-zinc-500 block text-[10px]">Date</span>
                <span className="font-bold">November 14, 2026</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-600 shrink-0" />
              <div>
                <span className="text-zinc-500 block text-[10px]">Time</span>
                <span className="font-bold">5:00 PM (Sharp)</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-orange-600 shrink-0" />
              <div>
                <span className="text-zinc-500 block text-[10px]">Venue</span>
                <span className="font-bold">Auditorium & Lawns</span>
              </div>
            </div>
          </div>

          {/* Bottom Bar: Barcode (Only if Pass is Active) */}
          {hasPass ? (
            <div className="pt-4 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left space-y-1">
                <div className="text-[10px] uppercase font-bold tracking-widest text-zinc-400">
                  Official Gate Entry Barcode
                </div>
                <div className="font-mono text-sm font-bold text-zinc-800">
                  {registration.regNumber}
                </div>
                <div className="text-[11px] text-zinc-500">
                  Present this barcode at the registration desk for badge collection, dinner coupon, and check-in.
                </div>
              </div>

              {/* Scannable Barcode */}
              <div className="flex flex-col items-center p-3 rounded-2xl border border-zinc-200 bg-white shadow-2xs">
                <Barcode value={registration.regNumber} width={1.8} height={48} />
                <span className="text-[9px] font-mono text-zinc-400 mt-0.5 tracking-wider">
                  SANJH 2026 ACTIVE GATE PASS
                </span>
              </div>
            </div>
          ) : (
            <div className="pt-4 border-t border-zinc-100 p-4 rounded-2xl bg-zinc-50 text-center text-xs text-zinc-500">
              Pass barcode will be activated upon purchase of the ₹1,000 Event Pass.
            </div>
          )}
        </div>
      </div>

      {/* PERFORMANCE APPLICATION SECTION (For Alumni with Pass) */}
      {hasPass && performerStatus === "none" && (
        <div className="bg-white rounded-3xl border border-orange-200 p-6 sm:p-8 shadow-xs space-y-4 print:hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center shrink-0">
                <Music className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-zinc-900">
                  Want to Perform on Stage at Sanjh 2026?
                </h3>
                <p className="text-xs text-zinc-500">
                  Default: All pass holders are attendees. If you wish to showcase your talent, apply below.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowPerformerForm(!showPerformerForm)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-800 font-bold text-xs transition-colors border border-orange-200 self-start sm:self-auto"
            >
              {showPerformerForm ? (
                <>
                  <span>Hide Form</span>
                  <ChevronUp className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>Apply to Perform</span>
                  <ChevronDown className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {appSuccess && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{appSuccess}</span>
            </div>
          )}

          {appError && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>{appError}</span>
            </div>
          )}

          {showPerformerForm && (
            <form
              onSubmit={handlePerformanceSubmit}
              className="pt-4 border-t border-zinc-100 space-y-4 animate-in fade-in duration-200"
            >
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>
                  📜 <strong>Participation Certificates:</strong> Official certificates awarded to all approved alumni performers!
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Performance Domain / Category <span className="text-orange-600">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="Music & Singing">Music & Vocals (Solo / Duet)</option>
                    <option value="Folk Dance (Bhangra / Giddha)">Folk Dance (Bhangra / Giddha / Solo)</option>
                    <option value="Live Band / Instrumental">Instrumental / Band Performance</option>
                    <option value="Stand-up Comedy / Shayari / Poetry">Stand-up Comedy / Shayari / Poetry</option>
                    <option value="Drama / Skit / Mimicry">Drama / Skit / Mimicry</option>
                    <option value="Anchoring & Stage Hosting">Anchoring & Stage Hosting</option>
                    <option value="Special Alumni Showcase">Special Alumni Showcase</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Act / Song / Presentation Title <span className="text-orange-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. 90s Sufi Fusion Medley / Bhangra Revival"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  What do you plan to perform? (Description & Team members if any) <span className="text-orange-600">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your performance, songs chosen, whether solo or group act, and background..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Resume / Portfolio / Video Audition URL <span className="text-orange-600">*</span>
                  </label>
                  <input
                    type="url"
                    required
                    value={resumeUrl}
                    onChange={(e) => setResumeUrl(e.target.value)}
                    placeholder="https://drive.google.com/... or YouTube/LinkedIn link"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <span className="text-[10px] text-zinc-400 mt-0.5 block">
                    Link to your past performance, singing clip, or artistic resume.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Estimated Duration
                  </label>
                  <select
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="3-5 minutes">3 – 5 Minutes</option>
                    <option value="5-7 minutes">5 – 7 Minutes</option>
                    <option value="7-10 minutes">7 – 10 Minutes</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Audio / Stage Technical Requirements (Optional)
                </label>
                <input
                  type="text"
                  value={specialRequirements}
                  onChange={(e) => setSpecialRequirements(e.target.value)}
                  placeholder="e.g. 2 vocal mics, 1 guitar line-in, MP3 track playback on laptop"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPerformerForm(false)}
                  className="px-4 py-2 rounded-xl text-zinc-500 hover:bg-zinc-100 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAct}
                  className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-xs transition-all disabled:opacity-50 flex items-center gap-1.5"
                >
                  {submittingAct ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting Request...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Performance Request</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
