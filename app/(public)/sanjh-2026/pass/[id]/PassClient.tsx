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
  Users,
  ChevronDown,
  ChevronUp,
  FileText,
  Video,
  ShieldCheck,
  GraduationCap,
  ArrowRight,
  Info,
  Copy,
  Check,
} from "lucide-react";

export default function PassClient({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [registration, setRegistration] = useState<AlumniRegistration | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Performer application form state
  const [showPerformerForm, setShowPerformerForm] = useState(false);
  const [category, setCategory] = useState("Vocal & Music");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("5");
  const [specialRequirements, setSpecialRequirements] = useState("");
  const [submittingAct, setSubmittingAct] = useState(false);
  const [appSuccess, setAppSuccess] = useState<string | null>(null);
  const [appError, setAppError] = useState<string | null>(null);

  const fetchRecord = async () => {
    try {
      const res = await getAlumniRegistrationById(id);
      if (res.success && res.data) {
        setRegistration(res.data);
      } else {
        setError(res.error || "Alumni pass record not found");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load pass details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecord();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
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
        <p className="text-sm text-zinc-500 font-medium">Loading official pass...</p>
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

  const guestCount = registration.guests?.length ?? registration.guestCount ?? 0;
  const guests = registration.guests || [];
  const totalAdmit = 1 + guestCount;

  const performerStatus =
    registration.performerStatus || registration.performanceApplication?.status || "none";
  const perf = registration.performanceApplication;

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6">
      <style jsx global>{`
        @media print {
          @page {
            size: portrait;
            margin: 10mm;
          }
          body {
            background: #ffffff !important;
            color: #000000 !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          header, nav, footer, .print\\:hidden {
            display: none !important;
          }
          .standard-pass-badge {
            width: 105mm !important;
            max-width: 105mm !important;
            margin: 0 auto !important;
            box-shadow: none !important;
            border: 2px solid #ea580c !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            border-radius: 14px !important;
            overflow: hidden !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>

      <div className="max-w-md mx-auto space-y-6">
        {/* Top Action Bar (Screen Only) */}
        <div className="flex items-center justify-between gap-3 print:hidden">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 hover:text-orange-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Home
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-zinc-50 text-zinc-700 font-semibold text-xs border border-zinc-200 shadow-2xs transition-all"
              title="Copy public pass URL"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Share Pass</span>
                </>
              )}
            </button>

            {hasPass && (
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-2xs transition-all"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Pass (PDF)</span>
              </button>
            )}
          </div>
        </div>

        {/* NOTICE IF PASS NOT YET PURCHASED */}
        {!hasPass && (
          <div className="bg-amber-50/90 border-2 border-amber-300 rounded-3xl p-5 space-y-3 print:hidden shadow-2xs">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                <Info className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 bg-amber-200/70 px-2 py-0.5 rounded-full inline-block">
                  Registration Complete • Pass Pending
                </span>
                <h2 className="text-sm font-extrabold text-zinc-900">
                  Campus Admission Pass Required (₹1,000)
                </h2>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  You are registered in the SBSSU alumni records. To attend Sanjh 2026 in-person on campus (gala dinner, high tea, souvenir kit & stage access), activate your Event Pass.
                </p>
              </div>
            </div>

            <div className="pt-1">
              <Link
                href={`/payment/${registration.id}`}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-xs transition-all"
              >
                <Ticket className="w-4 h-4" />
                Complete Pass Payment (₹1,000 via UPI QR)
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* THE STANDARD SIZE EVENT PASS BADGE CONTAINER */}
        {/* Standard Dimensions: 4"x6" standard conference badge format */}
        {/* ============================================================== */}
        <div className="standard-pass-badge w-full max-w-[420px] mx-auto bg-white rounded-3xl border-2 border-orange-300 shadow-xl overflow-hidden relative font-sans">
          {/* Lanyard punch hole visual */}
          <div className="w-full flex justify-center pt-2.5 bg-gradient-to-r from-orange-600 via-amber-600 to-emerald-700">
            <div className="w-14 h-2.5 bg-black/30 rounded-full border border-white/20 shadow-inner" />
          </div>

          {/* Pass Header Banner */}
          <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-emerald-700 px-5 pt-3 pb-5 text-white text-center relative">
            <div className="w-14 h-14 bg-white rounded-full p-1.5 shadow-md mx-auto mb-2">
              <Image
                src="/sbssu-logo.png"
                alt="SBSSU Logo"
                width={52}
                height={52}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <div className="text-[10px] font-extrabold uppercase tracking-widest text-orange-100">
              Shaheed Bhagat Singh State University
            </div>
            <div className="text-[9px] text-orange-200/90 font-medium">
              SBSCET (1995) • SBSSTC (2011) • SBSSU (2021)
            </div>
            <h1 className="text-xl font-black tracking-tight mt-1">
              1st Alumni Meet & Sanjh 2026
            </h1>
            <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-white/20 backdrop-blur-md text-white border border-white/30">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
              {hasPass ? "✓ Official Gate Entry Pass" : "Registered Directory Record"}
            </div>
          </div>

          {/* Perforated ticket divider with left/right circular cutouts */}
          <div className="relative h-5 bg-white flex items-center justify-between">
            <div className="w-3.5 h-7 bg-zinc-100 rounded-r-full -mt-1 border-r border-orange-300" />
            <div className="flex-1 border-b-2 border-dashed border-orange-300 mx-2" />
            <div className="w-3.5 h-7 bg-zinc-100 rounded-l-full -mt-1 border-l border-orange-300" />
          </div>

          {/* Pass Body Content */}
          <div className="px-5 py-4 space-y-4">
            {/* Admission Count Strip */}
            <div className="flex items-center justify-between bg-orange-50 border border-orange-200 rounded-2xl px-3.5 py-2">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-orange-700 block">
                  Admission Capacity
                </span>
                <span className="text-sm font-black text-orange-950">
                  ADMIT {totalAdmit} {totalAdmit === 1 ? "PERSON" : "PERSONS"}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 block">
                  Pass Serial Number
                </span>
                <span className="font-mono text-xs font-bold text-zinc-800">
                  {registration.regNumber}
                </span>
              </div>
            </div>

            {/* Approved Performer Badge (if applicable) */}
            {performerStatus === "approved" && (
              <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-sm flex items-start gap-2.5">
                <Sparkles className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="text-[9px] font-black uppercase tracking-wider bg-black/20 px-2 py-0.5 rounded-full inline-block">
                    ★ Official Stage Performer
                  </span>
                  <div className="text-xs font-black">
                    {perf?.title || "Cultural Act"} ({perf?.category || "Performance"})
                  </div>
                  <p className="text-[10px] text-emerald-100">
                    Report to SECA Stage Coordinator at 4:30 PM • Certificate Awardee
                  </p>
                </div>
              </div>
            )}

            {/* 1. Primary Pass Holder (Alumnus) Details */}
            <div className="border border-zinc-200 rounded-2xl p-3.5 bg-zinc-50/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5 text-orange-600" />
                  Primary Pass Holder
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Honored Alumnus
                </span>
              </div>

              <div>
                <h2 className="text-base font-black text-zinc-900 leading-tight">
                  {registration.fullName}
                </h2>
                <div className="text-xs font-semibold text-zinc-700 mt-0.5">
                  {registration.degree} – {registration.branch}
                </div>
                <div className="text-[11px] text-orange-700 font-bold">
                  Class of {registration.passingYear} ({registration.era} Era)
                </div>
                {registration.currentDesignation && (
                  <div className="text-[11px] text-zinc-500 mt-0.5">
                    {registration.currentDesignation}{" "}
                    {registration.organization ? `@ ${registration.organization}` : ""}
                  </div>
                )}
              </div>
            </div>

            {/* 2. Accompanying Guests (Explicitly Mentioning Guest Names & Relations) */}
            <div className="border border-orange-200 rounded-2xl p-3.5 bg-orange-50/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-orange-950 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-orange-600" />
                  Accompanying Guests ({guests.length} / Max 3)
                </span>
                <span className="text-[9px] font-bold text-orange-800 bg-orange-100 px-2 py-0.5 rounded-full">
                  Family Only
                </span>
              </div>

              {guests.length > 0 ? (
                <div className="space-y-1.5 pt-0.5">
                  {guests.map((g, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between bg-white border border-orange-200/90 rounded-xl px-3 py-1.5 text-xs shadow-2xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-800 font-extrabold text-[10px] flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <span className="font-bold text-zinc-900">
                          {g.name}
                        </span>
                      </div>
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 border border-orange-200 shrink-0">
                        {g.relation}
                      </span>
                    </div>
                  ))}
                  <p className="text-[10px] text-zinc-500 italic pt-0.5">
                    Permitted relations: Mom, Dad, Spouse, or Child. Valid with alumnus escort.
                  </p>
                </div>
              ) : (
                <div className="p-2 text-center text-xs text-zinc-500 bg-white/70 rounded-xl border border-dashed border-zinc-200">
                  No accompanying guests registered • <strong>Solo Alumnus Entry</strong>
                </div>
              )}
            </div>

            {/* Event Schedule Info */}
            <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-zinc-50 border border-zinc-200 text-center text-[11px]">
              <div>
                <Calendar className="w-3.5 h-3.5 text-orange-600 mx-auto mb-0.5" />
                <span className="text-zinc-400 block text-[9px] uppercase">Date</span>
                <span className="font-bold text-zinc-800">Nov 14, 2026</span>
              </div>
              <div className="border-x border-zinc-200 px-1">
                <Clock className="w-3.5 h-3.5 text-orange-600 mx-auto mb-0.5" />
                <span className="text-zinc-400 block text-[9px] uppercase">Time</span>
                <span className="font-bold text-zinc-800">5:00 PM</span>
              </div>
              <div>
                <MapPin className="w-3.5 h-3.5 text-orange-600 mx-auto mb-0.5" />
                <span className="text-zinc-400 block text-[9px] uppercase">Venue</span>
                <span className="font-bold text-zinc-800">Auditorium</span>
              </div>
            </div>

            {/* Gate Barcode Area */}
            {hasPass ? (
              <div className="pt-2 border-t border-zinc-100 flex flex-col items-center text-center space-y-1.5">
                <div className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">
                  Official Gate Entry Barcode
                </div>
                <div className="p-2.5 rounded-2xl border border-zinc-200 bg-white shadow-2xs w-full flex flex-col items-center">
                  <Barcode value={registration.regNumber} width={1.8} height={42} />
                  <span className="font-mono text-xs font-black text-zinc-800 mt-1 tracking-wider">
                    {registration.regNumber}
                  </span>
                </div>
                <p className="text-[10px] text-zinc-500 leading-tight">
                  Scan at Gate 1 for badge collection, dinner coupons & venue admission.
                </p>
              </div>
            ) : (
              <div className="pt-2 border-t border-zinc-100 p-3 rounded-xl bg-zinc-50 text-center text-xs text-zinc-500">
                Gate barcode will be activated upon ₹1,000 Event Pass payment.
              </div>
            )}
          </div>

          {/* Pass Footer Security Watermark */}
          <div className="bg-zinc-100 border-t border-zinc-200 px-4 py-2 text-center text-[9px] text-zinc-500 font-mono">
            SBSSU SANJH 2026 • NON-TRANSFERABLE • VALID WITH GOVT ID
          </div>
        </div>

        {/* ============================================================== */}
        {/* PERFORMER APPLICATION SECTION (Alumni with Pass - Screen Only) */}
        {/* ============================================================== */}
        {hasPass && performerStatus === "none" && (
          <div className="bg-white rounded-3xl border border-orange-200 p-5 shadow-xs space-y-4 print:hidden">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center shrink-0">
                  <Music className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-xs text-zinc-900">
                    Want to Perform on Stage at Sanjh 2026?
                  </h3>
                  <p className="text-[11px] text-zinc-500">
                    Default: Attendee. Alumni with a pass can apply to perform.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowPerformerForm(!showPerformerForm)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-800 font-bold text-xs transition-colors border border-orange-200"
              >
                {showPerformerForm ? (
                  <>
                    <span>Close</span>
                    <ChevronUp className="w-3.5 h-3.5" />
                  </>
                ) : (
                  <>
                    <span>Apply</span>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>

            {appSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{appSuccess}</span>
              </div>
            )}

            {appError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{appError}</span>
              </div>
            )}

            {showPerformerForm && (
              <form
                onSubmit={handlePerformanceSubmit}
                className="pt-3 border-t border-zinc-100 space-y-3 text-xs"
              >
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-center gap-2 text-[11px]">
                  <Award className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>
                    📜 <strong>Participation Certificates:</strong> Awarded to all approved performers!
                  </span>
                </div>

                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">
                    Domain / Category <span className="text-orange-600">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="Vocal & Music">Vocal & Music (Singing, Solo/Duet)</option>
                    <option value="Dance Performance">Dance Performance (Bhangra, Giddha, Solo)</option>
                    <option value="Poetry & Shayari">Poetry & Shayari (Kavi Sammelan)</option>
                    <option value="Standup & Comedy">Standup Comedy / Mimicry</option>
                    <option value="Instrumental">Instrumental Music</option>
                    <option value="Dramatic Skit">Dramatic Skit / Theatrics</option>
                    <option value="Nostalgia Address">Special Nostalgia Speech / Address</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">
                    Act / Performance Title <span className="text-orange-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Acoustic Guitar & Retro Bollywood Medley"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">
                    Description of Your Act <span className="text-orange-600">*</span>
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Briefly describe what you plan to perform on stage..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-zinc-700 mb-1">
                    Resume / Portfolio / Video Link <span className="text-orange-600">*</span>
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://drive.google.com/... or https://youtube.com/..."
                    value={resumeUrl}
                    onChange={(e) => setResumeUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-zinc-700 mb-1">
                      Expected Duration
                    </label>
                    <select
                      value={durationMinutes}
                      onChange={(e) => setDurationMinutes(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-zinc-200 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="3">3 Minutes</option>
                      <option value="5">5 Minutes</option>
                      <option value="7">7 Minutes</option>
                      <option value="10">10 Minutes</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-zinc-700 mb-1">
                      Special Stage Needs
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 2 Mics, Guitar DI"
                      value={specialRequirements}
                      onChange={(e) => setSpecialRequirements(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submittingAct}
                  className="w-full py-2.5 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold transition-all shadow-xs flex items-center justify-center gap-2"
                >
                  {submittingAct ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting Act to SECA Committee...</span>
                    </>
                  ) : (
                    <span>Submit Performance Application →</span>
                  )}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Existing Performance Status Banner (Screen Only) */}
        {performerStatus === "pending" && (
          <div className="bg-amber-50 border border-amber-300 rounded-3xl p-4 flex items-start gap-3 print:hidden">
            <Clock className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-xs space-y-0.5">
              <span className="font-extrabold text-amber-900 block">
                Performance Application Under Review: {perf?.title || "Stage Act"}
              </span>
              <p className="text-zinc-600 leading-relaxed">
                The SECA Cultural Committee is reviewing your act submission ({perf?.category}). You will be notified via email once approved.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
