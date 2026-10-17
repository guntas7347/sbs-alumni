"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { useAuth } from "@/components/AuthProvider";
import { useForm } from "@/lib/useForm";
import {
  verifyRegistrationCode,
  markCheckInAtGate,
} from "@/lib/actions/alumniActions";
import { verifyFacultyOrAdmin } from "@/lib/actions/adminActions";
import type { AlumniRegistration } from "@/lib/types";
import Barcode from "@/components/Barcode";
import {
  ScanLine,
  Keyboard,
  CheckCircle2,
  AlertCircle,
  Camera,
  CameraOff,
  Search,
  UserCheck,
  Award,
  Music,
  MapPin,
  Calendar,
  Sparkles,
  Loader2,
  RefreshCw,
  GraduationCap,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  Lock,
  LogOut,
  User,
  Briefcase,
} from "lucide-react";

// Dynamically import BarcodeScanner so it only loads on the client
const BarcodeScanner = dynamic(
  () =>
    import("react-barcode-scanner").then((mod) => ({
      default: mod.BarcodeScanner,
    })),
  { ssr: false }
);

export default function VerifyClient() {
  const { user, loading: authLoading, signIn, signOut } = useAuth();
  const [facultyAuthorized, setFacultyAuthorized] = useState<boolean | null>(null);
  const [checkingFaculty, setCheckingFaculty] = useState(false);
  const [facultyRole, setFacultyRole] = useState<string | null>(null);
  const [facultyRemark, setFacultyRemark] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const initialCode = searchParams.get("code") || searchParams.get("id") || "";

  // Mode: "scan" or "type"
  const [mode, setMode] = useState<"scan" | "type">(initialCode ? "type" : "scan");

  // Camera state
  const [scannerPaused, setScannerPaused] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Verification state
  const [candidate, setCandidate] = useState<AlumniRegistration | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [checkedInSuccess, setCheckedInSuccess] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);

  // Form using requested useForm hook
  const { form, handleChange, setFields } = useForm({
    codeInput: initialCode,
  });

  const lastScannedCodeRef = useRef<string>("");

  useEffect(() => {
    if (!authLoading) {
      if (user?.email) {
        setCheckingFaculty(true);
        verifyFacultyOrAdmin(user.email)
          .then((res) => {
            setFacultyAuthorized(res.authorized);
            setFacultyRole(res.role || "Faculty");
            setFacultyRemark(res.remark || null);
          })
          .catch(() => setFacultyAuthorized(false))
          .finally(() => setCheckingFaculty(false));
      } else {
        setFacultyAuthorized(false);
      }
    }
  }, [user, authLoading]);

  const handleLookup = async (codeToSearch: string) => {
    if (!codeToSearch || !codeToSearch.trim()) return;

    setVerifying(true);
    setErrorMessage(null);
    setCheckedInSuccess(false);

    try {
      const res = await verifyRegistrationCode(codeToSearch.trim());
      if (res.success && res.data) {
        setCandidate(res.data);
        setScannerPaused(true);
      } else {
        setCandidate(null);
        setErrorMessage(
          res.error || `No candidate found matching code "${codeToSearch}".`
        );
      }
    } catch (err: any) {
      setCandidate(null);
      setErrorMessage(err?.message || "Failed to verify candidate code.");
    } finally {
      setVerifying(false);
    }
  };

  // If initial code is in URL, verify automatically
  useEffect(() => {
    if (initialCode) {
      setFields({ codeInput: initialCode });
      handleLookup(initialCode);
    }
  }, [initialCode]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.codeInput) {
      handleLookup(form.codeInput);
    }
  };

  const handleCapture = (barcodes: any[]) => {
    if (!barcodes || barcodes.length === 0 || verifying || candidate) return;

    const raw = barcodes[0]?.rawValue;
    if (raw && raw !== lastScannedCodeRef.current) {
      lastScannedCodeRef.current = raw;
      setFields({ codeInput: raw });
      handleLookup(raw);

      // Reset last scanned ref after 3s to allow re-scans if needed
      setTimeout(() => {
        lastScannedCodeRef.current = "";
      }, 3000);
    }
  };

  const handleCheckInNow = async () => {
    if (!candidate || !user?.email) return;
    setCheckingIn(true);
    try {
      const res = await markCheckInAtGate(candidate.id, user.email);
      if (res.success) {
        const now = new Date().toISOString();
        setCheckedInSuccess(true);
        setCandidate((prev) =>
          prev
            ? {
                ...prev,
                checkedIn: true,
                checkedInAt: now,
                verifiedBy: user.email!,
                verifiedAt: now,
              }
            : prev
        );
      } else {
        alert(res.error || "Failed to mark check-in.");
      }
    } catch (err: any) {
      alert(err?.message || "Failed to mark check-in.");
    } finally {
      setCheckingIn(false);
    }
  };

  const handleScanNext = () => {
    setCandidate(null);
    setErrorMessage(null);
    setCheckedInSuccess(false);
    setScannerPaused(false);
    setFields({ codeInput: "" });
    lastScannedCodeRef.current = "";
  };

  if (authLoading || checkingFaculty) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
        <p className="text-sm text-zinc-500 font-medium">
          Verifying faculty gate permissions in Firestore...
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-6">
        <div className="bg-white rounded-3xl border border-zinc-200 p-8 shadow-sm space-y-5">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center">
            <Lock className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-orange-700 bg-orange-50 px-2 py-0.5 rounded-full">
              Sanjh 2026 • Gate Verification Desk
            </span>
            <h1 className="text-2xl font-extrabold text-zinc-900 mt-2">
              Faculty Sign In Required
            </h1>
            <p className="text-xs text-zinc-500">
              Only authorized faculty and administrators added in Firestore can scan and verify gate passes.
            </p>
          </div>

          <button
            onClick={() => signIn()}
            className="w-full inline-flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-white hover:bg-zinc-50 text-zinc-800 font-bold text-xs border border-zinc-300 shadow-2xs transition-all"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  if (!facultyAuthorized) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center space-y-6">
        <div className="bg-white rounded-3xl border border-rose-200 p-8 shadow-sm space-y-5">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
            <ShieldAlert className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-widest text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full">
              Access Restricted
            </span>
            <h1 className="text-2xl font-extrabold text-zinc-900 mt-2">
              Unauthorized Faculty Account
            </h1>
            <p className="text-xs text-zinc-600">
              The Google account <strong className="text-zinc-900 font-mono">{user.email}</strong> has not been added as faculty by an administrator.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-500 text-left">
            To verify candidate passes and record check-ins, an administrator must first authorize your Gmail ID in the Administrator Console.
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => signOut()}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign in with different account
            </button>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-orange-700 hover:text-orange-800"
            >
              Back to Home <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-emerald-700 text-white rounded-3xl p-6 sm:p-8 shadow-sm space-y-2 text-center sm:text-left">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-full p-1 shadow-md shrink-0">
              <Image
                src="/sbssu-logo.png"
                alt="SBSSU Logo"
                width={48}
                height={48}
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-orange-200 block">
                SECA Gate Desk • Sanjh 2026
              </span>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                Candidate Pass & Barcode Verification
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold text-white border border-white/20 font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
              {user.email}
            </span>
            <button
              onClick={() => signOut()}
              title="Sign Out"
              className="p-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        <p className="text-xs text-orange-100 max-w-xl">
          Authorized Faculty Officer: <strong className="font-mono text-white">{user.email}</strong> {facultyRemark ? `(${facultyRemark})` : ""}. Scan pass barcode or enter registration code to verify candidates. All check-ins record your verified Gmail ID.
        </p>
      </div>

      {/* Input Mode Selector Tabs */}
      <div className="flex items-center justify-center sm:justify-start gap-2 p-1.5 bg-zinc-200/60 rounded-2xl w-full sm:w-fit">
        <button
          onClick={() => {
            setMode("scan");
            setScannerPaused(false);
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            mode === "scan"
              ? "bg-white text-zinc-900 shadow-xs"
              : "text-zinc-600 hover:text-zinc-900"
          }`}
        >
          <ScanLine className="w-4 h-4 text-orange-600" />
          <span>Barcode Scanner</span>
        </button>

        <button
          onClick={() => setMode("type")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            mode === "type"
              ? "bg-white text-zinc-900 shadow-xs"
              : "text-zinc-600 hover:text-zinc-900"
          }`}
        >
          <Keyboard className="w-4 h-4 text-emerald-600" />
          <span>Type Pass Code</span>
        </button>
      </div>

      {/* MODE 1: BARCODE SCANNER VIEW */}
      {mode === "scan" && !candidate && (
        <div className="bg-white rounded-3xl border border-zinc-200 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                <Camera className="w-4 h-4 text-orange-600" />
                Live Camera Barcode Scanner
              </h2>
              <p className="text-xs text-zinc-500">
                Point your mobile or webcam at the candidate pass barcode or QR code.
              </p>
            </div>

            <button
              onClick={() => setScannerPaused(!scannerPaused)}
              className="px-3 py-1.5 rounded-xl border border-zinc-200 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors"
            >
              {scannerPaused ? "Resume Camera" : "Pause Camera"}
            </button>
          </div>

          {cameraError ? (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 space-y-2 text-center">
              <AlertCircle className="w-5 h-5 text-amber-600 mx-auto" />
              <p className="font-semibold">{cameraError}</p>
              <button
                onClick={() => setMode("type")}
                className="px-4 py-1.5 rounded-xl bg-orange-600 text-white font-bold text-xs"
              >
                Switch to Manual Code Entry
              </button>
            </div>
          ) : (
            <div className="relative w-full max-w-md mx-auto aspect-4/3 rounded-2xl overflow-hidden bg-black flex items-center justify-center border-2 border-orange-400 shadow-inner">
              {!scannerPaused ? (
                <BarcodeScanner
                  onCapture={handleCapture}
                  onCameraError={(err) => {
                    console.warn("Camera error:", err);
                    setCameraError(
                      "Camera is not available or access was denied. Please switch to manual code entry."
                    );
                  }}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center text-zinc-400 space-y-2 p-4">
                  <CameraOff className="w-8 h-8 mx-auto" />
                  <p className="text-xs">Camera paused</p>
                </div>
              )}

              {/* Scanning Crosshair Reticle Overlay */}
              {!scannerPaused && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-48 h-32 border-2 border-dashed border-orange-400 rounded-xl relative animate-pulse shadow-[0_0_15px_rgba(249,115,22,0.5)]">
                    <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-bold bg-orange-600 text-white px-2 py-0.5 rounded-full uppercase">
                      Scan Area
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="text-center text-xs text-zinc-500">
            Tip: Having trouble scanning in low light? Switch to the{" "}
            <button
              onClick={() => setMode("type")}
              className="text-orange-600 font-bold hover:underline"
            >
              Type Pass Code
            </button>{" "}
            tab.
          </div>
        </div>
      )}

      {/* MODE 2: MANUAL TYPE-IN FORM */}
      {(mode === "type" || candidate) && (
        <form
          onSubmit={handleManualSubmit}
          className="bg-white rounded-3xl border border-zinc-200 p-6 shadow-2xs space-y-4"
        >
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
              <Keyboard className="w-4 h-4 text-emerald-600" />
              Manual Code Lookup
            </h2>
            <p className="text-xs text-zinc-500">
              Enter Pass Number (e.g. SBSSU-ALM-2026-1234 or SBSSU-STU-2026-5678) or Student Roll Number.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-zinc-400" />
              <input
                type="text"
                name="codeInput"
                value={form.codeInput}
                onChange={handleChange}
                placeholder="Enter Registration Code or Roll Number..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono font-semibold"
              />
            </div>

            <button
              type="submit"
              disabled={verifying || !form.codeInput}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs tracking-wide uppercase transition-colors shadow-2xs disabled:opacity-50 shrink-0"
            >
              {verifying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Verify Pass
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* ERROR MESSAGE DISPLAY */}
      {errorMessage && (
        <div className="p-5 rounded-3xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-3 shadow-2xs">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="font-bold text-sm">Pass Not Recognized</h3>
            <p className="text-xs text-rose-700">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* VERIFIED CANDIDATE DETAILS CARD */}
      {candidate && (
        <div className="bg-white rounded-3xl border-2 border-emerald-300 p-6 sm:p-8 shadow-md space-y-6 animate-in fade-in duration-300">
          {/* Top Verification Status */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  Verified Valid Entry
                </span>
                <h2 className="text-2xl font-black text-zinc-900 mt-1">
                  {candidate.fullName}
                </h2>
                <span className="font-mono text-xs font-bold text-zinc-500">
                  {candidate.regNumber}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {candidate.registrantType === "student" ? (
                <span className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-200 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
                  Student Delegate (Free)
                </span>
              ) : (
                <span className="px-3 py-1.5 rounded-xl bg-orange-100 text-orange-800 font-bold text-xs border border-orange-200 flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-orange-700" />
                  Alumni Pass (₹1,000 Paid)
                </span>
              )}

              <button
                onClick={handleScanNext}
                className="px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-semibold text-xs transition-colors flex items-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Scan Next
              </button>
            </div>
          </div>

          {/* Candidate Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Academic Information */}
            <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-2">
              <span className="font-bold text-zinc-900 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-orange-600" />
                Academic Credentials
              </span>
              <div className="space-y-1.5 text-zinc-600">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Program:</span>
                  <span className="font-semibold text-zinc-800">
                    {candidate.degree} – {candidate.branch}
                  </span>
                </div>
                {candidate.registrantType === "student" ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Current Semester:</span>
                      <span className="font-bold text-emerald-800">
                        {candidate.currentSemester || "Enrolled Student"}
                      </span>
                    </div>
                    {candidate.rollNumber && (
                      <div className="flex justify-between">
                        <span className="text-zinc-400">University Roll No:</span>
                        <span className="font-mono font-bold text-zinc-800">
                          {candidate.rollNumber}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Campus Residence:</span>
                      <span className="text-zinc-700">
                        {candidate.hostelOrDayScholar || "Day Scholar"}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Passing Batch:</span>
                      <span className="font-bold text-orange-800">
                        Class of {candidate.passingYear}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Alma Mater Era:</span>
                      <span className="font-semibold text-zinc-700">
                        {candidate.era} Era
                      </span>
                    </div>
                    {candidate.currentDesignation && (
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Role / Company:</span>
                        <span className="text-zinc-800 text-right">
                          {candidate.currentDesignation} {candidate.organization ? `@ ${candidate.organization}` : ""}
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* SECA Cultural Function Details */}
            <div className="p-4 rounded-2xl bg-orange-50/50 border border-orange-200 space-y-2">
              <span className="font-bold text-orange-950 flex items-center gap-1.5">
                <Music className="w-4 h-4 text-orange-600" />
                Sanjh 2026 Cultural Track
              </span>
              <div className="space-y-1.5 text-xs text-zinc-600">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Cultural Participation:</span>
                  <span className="font-bold capitalize text-orange-800">
                    {candidate.culturalInterest !== "none"
                      ? candidate.culturalInterest
                      : "Audience / Delegate"}
                  </span>
                </div>
                {candidate.culturalDetails && (
                  <div>
                    <span className="text-zinc-500 block text-[11px]">Act Details:</span>
                    <span className="text-zinc-800 font-medium italic">
                      {candidate.culturalDetails}
                    </span>
                  </div>
                )}
                {candidate.guestCount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Accompanying Guests:</span>
                    <span className="font-semibold text-zinc-800">
                      +{candidate.guestCount} Guest(s)
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-zinc-500">Attendance:</span>
                  <span className="capitalize font-medium text-zinc-800">
                    {candidate.attendanceType}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Certificate Guarantee Banner */}
          {candidate.culturalInterest !== "none" && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-950 flex items-center gap-2.5">
              <Award className="w-5 h-5 text-emerald-700 shrink-0" />
              <div>
                <span className="font-bold block">
                  📜 Verified SECA Performer • Participation Certificate Eligible
                </span>
                <span className="text-emerald-800 text-[11px]">
                  Candidate is registered for {candidate.culturalInterest.toUpperCase()}. Official participation certificate is awarded upon performance.
                </span>
              </div>
            </div>
          )}

          {/* Barcode representation */}
          <div className="p-3 rounded-2xl bg-white border border-zinc-200 flex flex-col items-center justify-center">
            <Barcode value={candidate.regNumber} width={1.8} height={42} />
          </div>

          {/* Venue Gate Check-in Action */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-zinc-100">
            <div>
              {candidate.checkedIn || checkedInSuccess ? (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 w-fit">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Checked-In at Sanjh 2026 Venue</span>
                  </div>
                  <div className="text-[11px] text-zinc-500 pl-1">
                    Verified by: <strong className="text-zinc-800 font-mono">{candidate.verifiedBy || user?.email || "Faculty Officer"}</strong>
                    {(candidate.verifiedAt || candidate.checkedInAt) && (
                      <span> • {new Date(candidate.verifiedAt || candidate.checkedInAt!).toLocaleString()}</span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-xs text-zinc-500">
                  Candidate has not yet checked in at the gate.
                </div>
              )}
            </div>

            {!candidate.checkedIn && !checkedInSuccess && (
              <button
                onClick={handleCheckInNow}
                disabled={checkingIn}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs tracking-wide uppercase transition-colors shadow-2xs disabled:opacity-50"
              >
                {checkingIn ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Recording Check-In...
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4" />
                    Confirm Gate Check-In (Verify Pass)
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
