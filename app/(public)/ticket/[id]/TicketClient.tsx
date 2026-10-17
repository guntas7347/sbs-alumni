"use client";

import React, { useState, useEffect, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { getAlumniRegistrationById } from "@/lib/actions/alumniActions";
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

  useEffect(() => {
    getAlumniRegistrationById(id)
      .then((res) => {
        if (res.success && res.data) {
          setRegistration(res.data);
        } else {
          setError(res.error || "Registration not found");
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
        <p className="text-sm text-zinc-500">Loading your alumni pass...</p>
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

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 print:hidden">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 hover:text-orange-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-zinc-50 text-zinc-800 font-semibold text-xs border border-zinc-200 shadow-2xs transition-all"
          >
            <Printer className="w-4 h-4 text-orange-600" />
            Print / Save Pass (PDF)
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border-2 border-orange-200 shadow-xl overflow-hidden relative">
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
                  Official Event Pass • alumni.sbssu.ac.in
                </span>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                  Sanjh 2026 – SECA Cultural Function
                </h1>
                <p className="text-xs text-orange-100">
                  Shaheed Bhagat Singh State University (SBSCET • SBSSTC • SBSSU)
                </p>
              </div>
            </div>

            <div className="shrink-0 text-center sm:text-right">
              <span className="inline-block bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white">
                {registration.registrantType === "student"
                  ? "✓ Verified Student Pass (Free)"
                  : registration.paymentStatus === "completed"
                  ? "✓ Confirmed & Paid (₹1,000)"
                  : "⏳ Pending Payment (₹1,000)"}
              </span>
              <div className="text-[11px] font-mono font-bold text-amber-200 mt-1">
                {registration.regNumber}
              </div>
            </div>
          </div>
        </div>

        <div className="relative h-6 bg-white flex items-center justify-between">
          <div className="w-4 h-8 bg-[#FDFBF7] rounded-r-full -mt-1 border-r border-orange-200" />
          <div className="flex-1 border-b-2 border-dashed border-orange-200 mx-2" />
          <div className="w-4 h-8 bg-[#FDFBF7] rounded-l-full -mt-1 border-l border-orange-200" />
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1">
              <span className="text-[11px] uppercase font-bold tracking-wider text-zinc-400">
                {registration.registrantType === "student" ? "Student Delegate Name" : "Alumnus / Attendee Name"}
              </span>
              <h2 className="text-lg font-black text-zinc-900">
                {registration.fullName}
              </h2>
              <p className="text-xs text-zinc-500">{registration.email}</p>
              <p className="text-xs text-zinc-500">{registration.phone}</p>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] uppercase font-bold tracking-wider text-zinc-400">
                {registration.registrantType === "student" ? "SBSSU Student Profile" : "Alma Mater Profile"}
              </span>
              <div className="text-sm font-bold text-zinc-800">
                {registration.degree} – {registration.branch}
              </div>
              {registration.registrantType === "student" ? (
                <div className="text-xs text-emerald-700 font-semibold">
                  {registration.currentSemester || "Enrolled Student"} {registration.rollNumber ? `• Roll: ${registration.rollNumber}` : ""}
                </div>
              ) : (
                <div className="text-xs text-orange-700 font-semibold">
                  Batch of {registration.passingYear} ({registration.era} Era)
                </div>
              )}
              {registration.currentDesignation && (
                <div className="text-xs text-zinc-500">
                  {registration.currentDesignation} {registration.organization ? `at ${registration.organization}` : ""}
                </div>
              )}
            </div>
          </div>

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

          {registration.culturalInterest !== "none" && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 flex items-start gap-3">
              <Award className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-emerald-900">
                  SECA Cultural Performer Registered: {registration.culturalInterest.toUpperCase()}
                </span>
                <p className="text-emerald-800 mt-0.5">
                  📜 Participation Certificate guaranteed upon performance. Please report to the stage coordinator at 4:30 PM.
                </p>
                {registration.culturalDetails && (
                  <p className="text-zinc-600 text-[11px] mt-1 italic">
                    Act details: {registration.culturalDetails}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left space-y-1">
              <div className="text-[10px] uppercase font-bold tracking-widest text-zinc-400">
                Official Verification Code
              </div>
              <div className="font-mono text-sm font-bold text-zinc-800">
                {registration.regNumber}
              </div>
              <div className="text-[11px] text-zinc-500">
                Present this barcode at the venue gate for check-in and certificate collection.
              </div>
            </div>

            {/* Official Scannable Barcode */}
            <div className="flex flex-col items-center p-3 rounded-2xl border border-zinc-200 bg-white shadow-2xs">
              <Barcode value={registration.regNumber} width={1.8} height={48} />
              <span className="text-[9px] font-mono text-zinc-400 mt-0.5 tracking-wider">
                SANJH 2026 OFFICIAL GATE PASS
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
