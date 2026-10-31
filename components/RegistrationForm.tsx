"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { useForm } from "@/lib/useForm";
import {
  createAlumniRegistration,
  getAlumniRegistrationByEmail,
} from "@/lib/actions/alumniActions";
import type { AlumniRegistration, AllowedGuestRelation, GuestDetail } from "@/lib/types";
import {
  GraduationCap,
  Sparkles,
  CheckCircle2,
  Lock,
  ArrowRight,
  Loader2,
  AlertCircle,
  AlertTriangle,
  Ticket,
  UserCheck,
  Calendar,
  Clock,
  MapPin,
  Building2,
  Briefcase,
  Music,
  ShieldCheck,
  Check,
  Info,
  DollarSign,
  Users,
} from "lucide-react";

export default function RegistrationForm() {
  const router = useRouter();
  const { user, loading: authLoading, signIn } = useAuth();

  const [existingReg, setExistingReg] = useState<AlumniRegistration | null>(null);
  const [checkingExisting, setCheckingExisting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Success state for "Register Only" flow
  const [newlyRegisteredId, setNewlyRegisteredId] = useState<string | null>(null);
  const [newlyRegNumber, setNewlyRegNumber] = useState<string | null>(null);
  const [newlyRegAttending, setNewlyRegAttending] = useState<boolean>(true);

  // PARTICIPATION CHOICE (Default: Register + Attend ₹1,000)
  const [attendMeet, setAttendMeet] = useState<boolean>(true);

  // Accompanying Guests state (Max 3, only Mom, Dad, Spouse, Child)
  const [guestCount, setGuestCount] = useState<number>(0);
  const [guestList, setGuestList] = useState<GuestDetail[]>([
    { name: "", relation: "Spouse" },
    { name: "", relation: "Child" },
    { name: "", relation: "Mom" },
  ]);

  // Alumni Registration Form state
  const formState = useForm({
    fullName: "",
    email: "",
    phone: "",
    whatsapp: "",
    era: "SBSSU",
    degree: "B.Tech",
    branch: "Computer Science & Engineering (CSE)",
    passingYear: "2022",
    rollNumber: "",
    currentDesignation: "",
    organization: "",
    city: "",
    state: "Punjab",
    country: "India",
    linkedin: "",
    memoriesMessage: "",
  });

  // Pre-fill user data upon Google auth
  useEffect(() => {
    if (user?.email) {
      formState.setFields({
        email: user.email,
        fullName: user.displayName || formState.form.fullName || "",
      });

      setCheckingExisting(true);
      getAlumniRegistrationByEmail(user.email)
        .then((res) => {
          if (res.success && res.data) {
            setExistingReg(res.data);
          }
        })
        .catch((err) => console.error("Error checking existing registration:", err))
        .finally(() => setCheckingExisting(false));
    }
  }, [user]);

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    const f = formState.form;
    if (!f.fullName || !f.email || !f.phone) {
      setServerError("Please fill in all required fields (Full Name, Phone).");
      return;
    }

    // Validate accompanying guests if attending
    let activeGuests: GuestDetail[] = [];
    if (attendMeet && guestCount > 0) {
      if (guestCount > 3) {
        setServerError("A maximum of 3 accompanying guests are allowed.");
        return;
      }

      activeGuests = guestList.slice(0, guestCount);
      const allowedRelations = new Set(["Mom", "Dad", "Spouse", "Child"]);

      for (let i = 0; i < activeGuests.length; i++) {
        const g = activeGuests[i];
        if (!g.name || !g.name.trim()) {
          setServerError(`Please enter the full name for Guest ${i + 1}.`);
          return;
        }
        if (!g.relation || !allowedRelations.has(g.relation)) {
          setServerError(
            `Invalid relation for Guest ${i + 1}. Only Mom, Dad, Spouse, or Child are permitted.`
          );
          return;
        }
      }
    }

    setSubmitting(true);

    try {
      const res = await createAlumniRegistration({
        fullName: f.fullName,
        email: f.email,
        phone: f.phone,
        whatsapp: f.whatsapp || f.phone,
        era: f.era as any,
        degree: f.degree,
        branch: f.branch,
        passingYear: f.passingYear,
        rollNumber: f.rollNumber,
        currentDesignation: f.currentDesignation,
        organization: f.organization,
        city: f.city,
        state: f.state,
        country: f.country,
        linkedin: f.linkedin,
        // If attending: in-person; if info only: supporting
        attendanceType: attendMeet ? "in-person" : "supporting",
        attendingMeet: attendMeet,
        guestCount: attendMeet ? activeGuests.length : 0,
        guests: attendMeet ? activeGuests : [],
        memoriesMessage: f.memoriesMessage,
        amount: 0,
      });

      if (res.success && res.id) {
        if (attendMeet) {
          // If user chose to Attend (₹1,000), redirect immediately to UPI QR payment
          router.push(`/payment/${res.id}`);
        } else {
          // If user chose "Register Only (No Attend)", show confirmation screen
          setNewlyRegisteredId(res.id);
          setNewlyRegNumber(res.regNumber || null);
          setNewlyRegAttending(false);
        }
      } else {
        setServerError(res.error || "Failed to submit alumni registration.");
      }
    } catch (err: any) {
      setServerError(err?.message || "An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || checkingExisting) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
        <p className="text-sm text-zinc-500 font-medium">Verifying authentication status...</p>
      </div>
    );
  }

  // 1. Mandatory Google Sign In
  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="bg-white rounded-3xl border border-orange-200 p-8 sm:p-12 shadow-sm space-y-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-orange-700">
              SBSSU Alumni Portal
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900">
              Sign In to Register with University
            </h1>
            <p className="text-sm text-zinc-600 max-w-md mx-auto leading-relaxed">
              Please sign in with your Google account so the university can verify your identity and link your alumni registration record.
            </p>
          </div>

          {/* Registration Explanation Card */}
          <div className="p-4 rounded-2xl bg-orange-50/70 border border-orange-200 text-xs text-left space-y-1.5">
            <span className="font-bold text-orange-950 block">
              University Directory Registration vs. Sanjh 2026 Event Pass
            </span>
            <p className="text-zinc-600">
              Providing your information to the university alumni directory is <strong>100% Free</strong>. If you wish to physically visit the campus and attend the 1st Alumni Meet & Sanjh 2026 on Nov 14, 2026, an Event Pass is <strong>₹1,000</strong>.
            </p>
          </div>

          <button
            onClick={() => signIn()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-3.5 rounded-xl bg-white hover:bg-orange-50 text-zinc-800 font-bold text-sm border-2 border-zinc-300 hover:border-orange-400 shadow-xs transition-all"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
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
            Sign In with Google to Continue
          </button>
        </div>
      </div>
    );
  }

  // 2. Newly Registered Success Screen (for "Register Only" or confirmation)
  if (newlyRegisteredId) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-14 space-y-6">
        <div className="bg-white rounded-3xl border-2 border-emerald-300 p-8 sm:p-10 shadow-lg text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center animate-bounce">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Registration Recorded • Free (₹0)
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-900">
              Welcome to the SBSSU Alumni Directory!
            </h1>
            <p className="text-sm text-zinc-600 max-w-lg mx-auto">
              Your details have been successfully recorded in the Shaheed Bhagat Singh State University Alumni Directory.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs text-left space-y-2">
            <div className="flex justify-between">
              <span className="text-zinc-500">Alumni Registration Number:</span>
              <strong className="font-mono text-zinc-900 text-sm">{newlyRegNumber}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Registered Email:</span>
              <span className="font-semibold text-zinc-800">{user.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Attendance Option Chosen:</span>
              <span className="font-bold text-zinc-800">
                Directory Info Only (Not Attending Meet)
              </span>
            </div>
          </div>

          {/* Prominent Warning Callout */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-left text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Campus Entry Notice</span>
            </div>
            <p className="text-amber-900 leading-relaxed">
              You chose <strong>Register Only (No Attend)</strong>. This means you do <strong>not</strong> have a venue entry pass for the 1st Alumni Meet & Sanjh 2026 on Nov 14, 2026.
            </p>
            <p className="text-zinc-600">
              If you change your mind and wish to visit the campus, receive the souvenir kit, and attend the grand gala dinner, you can acquire your <strong>Alumni Meet Event Pass (₹1,000)</strong> at any time.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href={`/payment/${newlyRegisteredId}`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs transition-colors shadow-xs"
            >
              <Ticket className="w-4 h-4" />
              Upgrade: Get Event Pass (₹1,000)
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href={`/sanjh-2026/pass/${newlyRegisteredId}`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white hover:bg-zinc-50 text-zinc-700 font-semibold text-xs border border-zinc-200 transition-colors"
            >
              View Alumni Pass Card
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. Existing Registration Found
  if (existingReg) {
    const hasPass = Boolean(existingReg.hasPass || existingReg.passStatus === "active");

    return (
      <div className="max-w-3xl mx-auto px-4 py-14 space-y-6">
        <div className="bg-white rounded-3xl border border-orange-200 p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-orange-100 text-orange-700 flex items-center justify-center shrink-0">
              <UserCheck className="w-7 h-7" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-orange-800 bg-orange-100 px-2.5 py-0.5 rounded-full">
                Alumni Registration On Record
              </span>
              <h2 className="text-2xl font-bold text-zinc-900 mt-1">
                Welcome back, {existingReg.fullName}!
              </h2>
              <p className="text-xs text-zinc-500">
                Linked to {existingReg.email}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs">
            <div>
              <span className="text-zinc-500 block">Alumni Reg ID:</span>
              <span className="font-mono font-bold text-zinc-900 text-sm">
                {existingReg.regNumber}
              </span>
            </div>
            <div>
              <span className="text-zinc-500 block">Batch & Era:</span>
              <span className="font-bold text-zinc-800">
                Class of {existingReg.passingYear} ({existingReg.era})
              </span>
            </div>
            <div>
              <span className="text-zinc-500 block">Sanjh 2026 Meet Pass:</span>
              <span
                className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-md ${
                  hasPass
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-amber-100 text-amber-900"
                }`}
              >
                {hasPass ? "✓ Active Pass (₹1,000 Paid)" : "No Pass Active (Registered Only)"}
              </span>
            </div>
          </div>

          {hasPass ? (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <strong className="block text-emerald-900 font-bold">
                  You have an Active Sanjh 2026 Event Pass!
                </strong>
                <span className="text-emerald-800">
                  You can view your printable gate pass with barcode and apply for stage performances.
                </span>
              </div>
              <Link
                href={`/sanjh-2026/pass/${existingReg.id}`}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shrink-0 shadow-xs"
              >
                <Ticket className="w-4 h-4" />
                View Event Pass & Apply to Perform
              </Link>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-orange-50 border border-orange-200 text-xs text-orange-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <strong className="block text-orange-900 font-bold">
                  Planning to Attend the Alumni Meet in Person?
                </strong>
                <span className="text-zinc-600">
                  Your directory record is on file. To physically visit campus on Nov 14, 2026, get your official Event Pass for ₹1,000.
                </span>
              </div>
              <Link
                href={`/payment/${existingReg.id}`}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs transition-colors shrink-0 shadow-xs"
              >
                <Sparkles className="w-4 h-4" />
                Get Alumni Meet Pass (₹1,000)
              </Link>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-zinc-100 text-xs">
            <Link
              href={`/sanjh-2026/pass/${existingReg.id}`}
              className="text-zinc-600 hover:text-orange-600 font-semibold"
            >
              View Alumni Pass Card →
            </Link>

            <button
              onClick={() => setExistingReg(null)}
              className="text-zinc-400 hover:text-zinc-700 underline"
            >
              Submit another registration
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 4. Main Registration Form
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      {serverError && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-rose-800 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-3xl border border-orange-200 p-6 sm:p-10 shadow-sm space-y-8"
      >
        {/* Title Header */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-900 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-orange-600" />
              SBSSU Alumni Network & Sanjh 2026
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              Directory Registration: 100% Free
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
            Shaheed Bhagat Singh State University Alumni Registration
          </h1>

          {/* CRITICAL UI/UX CLARITY BANNER */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 border border-orange-200 text-xs text-zinc-700 space-y-2">
            <div className="flex items-center gap-2 font-bold text-orange-950 text-sm">
              <Info className="w-4 h-4 text-orange-600 shrink-0" />
              <span>Please Note the Distinction Before Filling:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
              <div className="p-3 rounded-xl bg-white/80 border border-orange-100 space-y-1">
                <strong className="text-zinc-900 font-bold block">
                  1. University Directory Registration (Free ₹0):
                </strong>
                <p className="text-zinc-600 text-[11px] leading-relaxed">
                  Provides your contact and career details so your alma mater knows about you. <strong>Does not grant entry to the campus or Alumni Meet on Nov 14.</strong>
                </p>
              </div>
              <div className="p-3 rounded-xl bg-white/80 border border-orange-100 space-y-1">
                <strong className="text-orange-900 font-bold block">
                  2. Sanjh 2026 Event Pass (₹1,000):
                </strong>
                <p className="text-zinc-600 text-[11px] leading-relaxed">
                  Required to attend the event on campus on Nov 14, 2026. Includes entry barcode, high tea, souvenir kit, and gala dinner.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 1: Personal & Contact */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-700 border-b border-orange-100 pb-2 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-700 text-xs flex items-center justify-center font-mono">1</span>
            Personal & Contact Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Full Name <span className="text-orange-600">*</span>
              </label>
              <input
                type="text"
                name="fullName"
                required
                value={formState.form.fullName}
                onChange={formState.handleChange}
                placeholder="e.g. Jaspreet Singh"
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Verified Google Email (Locked)
              </label>
              <input
                type="email"
                name="email"
                readOnly
                value={formState.form.email}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 text-sm text-zinc-500 cursor-not-allowed font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Phone / Mobile Number <span className="text-orange-600">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                required
                value={formState.form.phone}
                onChange={formState.handleChange}
                placeholder="e.g. +91 9876543210"
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                WhatsApp Number (Optional)
              </label>
              <input
                type="tel"
                name="whatsapp"
                value={formState.form.whatsapp}
                onChange={formState.handleChange}
                placeholder="If different from phone number"
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Academic Background */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-700 border-b border-orange-100 pb-2 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-700 text-xs flex items-center justify-center font-mono">2</span>
            Academic Era & Graduation Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Institution Era
              </label>
              <select
                name="era"
                value={formState.form.era}
                onChange={formState.handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
              >
                <option value="SBSCET">SBSCET (1995 – 2011)</option>
                <option value="SBSSTC">SBSSTC (2011 – 2021)</option>
                <option value="SBSSU">SBSSU (2021 – Present)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Degree Program
              </label>
              <select
                name="degree"
                value={formState.form.degree}
                onChange={formState.handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
              >
                <option value="B.Tech">B.Tech</option>
                <option value="M.Tech">M.Tech</option>
                <option value="BCA">BCA</option>
                <option value="MCA">MCA</option>
                <option value="MBA">MBA</option>
                <option value="BBA">BBA</option>
                <option value="B.Sc">B.Sc</option>
                <option value="Diploma">Diploma</option>
                <option value="PhD">PhD Scholar</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Passing Year / Batch
              </label>
              <select
                name="passingYear"
                value={formState.form.passingYear}
                onChange={formState.handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
              >
                {Array.from({ length: 32 }, (_, i) => 2026 - i).map((yr) => (
                  <option key={yr} value={String(yr)}>
                    {yr}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Branch / Department
              </label>
              <select
                name="branch"
                value={formState.form.branch}
                onChange={formState.handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
              >
                <option value="Computer Science & Engineering (CSE)">Computer Science & Engineering (CSE)</option>
                <option value="Electronics & Communication (ECE)">Electronics & Communication (ECE)</option>
                <option value="Mechanical Engineering (ME)">Mechanical Engineering (ME)</option>
                <option value="Civil Engineering (CE)">Civil Engineering (CE)</option>
                <option value="Electrical Engineering (EE)">Electrical Engineering (EE)</option>
                <option value="Chemical Engineering">Chemical Engineering</option>
                <option value="Information Technology (IT)">Information Technology (IT)</option>
                <option value="Management Studies">Management Studies</option>
                <option value="Applied Sciences">Applied Sciences</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                College Roll Number (Optional)
              </label>
              <input
                type="text"
                name="rollNumber"
                value={formState.form.rollNumber}
                onChange={formState.handleChange}
                placeholder="e.g. 1504562"
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Professional & Location */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-700 border-b border-orange-100 pb-2 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-700 text-xs flex items-center justify-center font-mono">3</span>
            Professional Profile & Location
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Current Designation / Role
              </label>
              <input
                type="text"
                name="currentDesignation"
                value={formState.form.currentDesignation}
                onChange={formState.handleChange}
                placeholder="e.g. Senior Software Engineer / Director / Founder"
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Company / Organization
              </label>
              <input
                type="text"
                name="organization"
                value={formState.form.organization}
                onChange={formState.handleChange}
                placeholder="e.g. Microsoft / Government of Punjab / Freelance"
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Current City & State
              </label>
              <input
                type="text"
                name="city"
                value={formState.form.city}
                onChange={formState.handleChange}
                placeholder="e.g. Chandigarh, Punjab"
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                LinkedIn Profile URL
              </label>
              <input
                type="url"
                name="linkedin"
                value={formState.form.linkedin}
                onChange={formState.handleChange}
                placeholder="https://linkedin.com/in/username"
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
        </div>

        {/* SECTION 4: PARTICIPATION CHOICE (REGISTER + ATTEND ₹1000 VS REGISTER ONLY FREE) */}
        <div className="space-y-4 pt-2">
          <div className="border-b border-orange-100 pb-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-800 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-orange-600 text-white text-xs flex items-center justify-center font-mono font-bold">
                4
              </span>
              <span>Participation & Attendance Choice</span>
            </h2>
            <p className="text-xs text-zinc-500 mt-1">
              Select whether you are attending Sanjh 2026 on campus or only submitting your information to the university directory.
            </p>
          </div>

          {/* Master Checkbox Toggle */}
          <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200">
            <label className="flex items-start gap-3.5 cursor-pointer">
              <input
                type="checkbox"
                checked={attendMeet}
                onChange={(e) => setAttendMeet(e.target.checked)}
                className="w-5 h-5 mt-0.5 rounded text-orange-600 focus:ring-orange-500 cursor-pointer accent-orange-600"
              />
              <div className="space-y-0.5">
                <span className="text-sm font-bold text-zinc-900 block">
                  I want to Register & Attend the Alumni Meet on Campus (Event Pass: ₹1,000)
                </span>
                <p className="text-xs text-zinc-500">
                  {attendMeet
                    ? "Checked: You will be issued an official Event Pass for ₹1,000 to visit campus on Nov 14, 2026."
                    : "Unchecked: You are registering directory information only. You will NOT attend the meet."}
                </p>
              </div>
            </label>
          </div>

          {/* Two Interactive Selection Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card 1: Register + Attend (₹1,000) - DEFAULT */}
            <div
              onClick={() => setAttendMeet(true)}
              className={`p-5 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between space-y-4 ${
                attendMeet
                  ? "border-orange-500 bg-orange-50/50 shadow-md ring-2 ring-orange-500/20"
                  : "border-zinc-200 bg-white hover:border-zinc-300 opacity-70"
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center">
                    <Ticket className="w-5 h-5" />
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                      attendMeet
                        ? "bg-orange-600 text-white"
                        : "bg-zinc-100 text-zinc-600"
                    }`}
                  >
                    {attendMeet ? "✓ Selected (Recommended)" : "Click to Select"}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-extrabold text-zinc-900">
                    Register + Attend Sanjh 2026
                  </h3>
                  <p className="text-xs text-zinc-600 mt-0.5 font-medium">
                    Campus Entry Pass + Dinner + Souvenir Kit
                  </p>
                </div>

                <div className="space-y-1.5 text-xs text-zinc-700 pt-1 border-t border-zinc-200/60">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Official Gate Pass & Barcode Access</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Auditorium Entry on Nov 14, 2026 (5:00 PM)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Alumni Welcome Souvenir Kit & High Tea</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Grand Alumni Gala Dinner Voucher</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Eligible to apply to perform on stage</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-orange-200 flex items-center justify-between">
                <span className="text-xs text-zinc-500 font-medium">Pass Fee:</span>
                <span className="text-lg font-black text-orange-600">
                  ₹1,000 <span className="text-xs font-normal text-zinc-500">(UPI QR)</span>
                </span>
              </div>
            </div>

            {/* Card 2: Register Only (No Attend - Info Only • Free ₹0) */}
            <div
              onClick={() => setAttendMeet(false)}
              className={`p-5 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between space-y-4 ${
                !attendMeet
                  ? "border-zinc-800 bg-zinc-50 shadow-md ring-2 ring-zinc-800/10"
                  : "border-zinc-200 bg-white hover:border-zinc-300 opacity-70"
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-zinc-100 text-zinc-700 flex items-center justify-center">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                      !attendMeet
                        ? "bg-zinc-800 text-white"
                        : "bg-zinc-100 text-zinc-600"
                    }`}
                  >
                    {!attendMeet ? "✓ Selected" : "Click to Select"}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-extrabold text-zinc-900">
                    Register Information Only
                  </h3>
                  <p className="text-xs text-rose-700 font-semibold mt-0.5">
                    Not Attending • Free Directory Record
                  </p>
                </div>

                <div className="space-y-1.5 text-xs text-zinc-700 pt-1 border-t border-zinc-200/60">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Permanent inclusion in SBSSU Alumni Directory</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Stay connected with university milestones</span>
                  </div>
                  <div className="flex items-center gap-2 text-rose-800 font-semibold">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    <span>NO CAMPUS ENTRY on Nov 14, 2026</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-500">
                    <span className="w-3.5 text-center text-zinc-400">✕</span>
                    <span>No event pass, souvenir kit, or dinner</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-500">
                    <span className="w-3.5 text-center text-zinc-400">✕</span>
                    <span>Not eligible for stage performance</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-200 flex items-center justify-between">
                <span className="text-xs text-zinc-500 font-medium">Registration Fee:</span>
                <span className="text-lg font-black text-emerald-700">
                  Free <span className="text-xs font-normal text-zinc-500">(₹0)</span>
                </span>
              </div>
            </div>
          </div>

          {/* DYNAMIC WARNING ALERT WHEN "REGISTER ONLY" IS ACTIVE */}
          {!attendMeet && (
            <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-950 space-y-1.5 animate-in fade-in duration-300">
              <div className="flex items-center gap-2 font-bold text-amber-900 text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                <span>CONFIRMATION: DIRECTORY RECORD ONLY (NOT ATTENDING EVENT)</span>
              </div>
              <p className="text-xs leading-relaxed text-amber-900 font-medium">
                You have chosen to register your details for university records without attending the 1st Alumni Meet. <strong>You will NOT be issued a campus entry pass or dinner ticket for November 14, 2026.</strong> If you later wish to attend, you can purchase an Event Pass (₹1,000) from your profile card.
              </p>
            </div>
          )}
        </div>

        {/* Section 5: Attendance Logistics & Accompanying Guests */}
        {attendMeet ? (
          <div className="space-y-5 pt-2">
            <div className="border-b border-orange-100 pb-2">
              <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-800 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-700 text-xs flex items-center justify-center font-mono">
                  5
                </span>
                <span>Attendance Logistics & Accompanying Guests</span>
              </h2>
              <p className="text-xs text-zinc-500 mt-1">
                Configure accompanying family members for campus catering and seating.
              </p>
            </div>

            {/* STRICT POLICY BANNER: MAX 3 GUESTS, ONLY MOM, DAD, SPOUSE, CHILD */}
            <div className="p-4 rounded-2xl bg-orange-50/80 border border-orange-200 text-xs text-zinc-700 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-orange-950 text-xs">
                <Users className="w-4 h-4 text-orange-600 shrink-0" />
                <span>ACCOMPANYING GUESTS POLICY (MAXIMUM 3 GUESTS)</span>
              </div>
              <p className="text-xs text-zinc-700 leading-relaxed">
                To maintain proper auditorium seating and catering arrangements, each alumnus is allowed a <strong>maximum of 3 accompanying guests</strong>. Permitted relations are strictly restricted to immediate family: <strong>Mom, Dad, Spouse, or Child</strong>. Friends or other relations are not permitted. Full name is required for each guest.
              </p>
            </div>

            <div className="max-w-md">
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Number of Accompanying Guests (Max 3)
              </label>
              <select
                value={guestCount}
                onChange={(e) => setGuestCount(parseInt(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
              >
                <option value="0">Attending Alone (0 Guests)</option>
                <option value="1">1 Accompanying Guest</option>
                <option value="2">2 Accompanying Guests</option>
                <option value="3">3 Accompanying Guests (Max Limit)</option>
              </select>
              <p className="text-[11px] text-zinc-400 mt-1">
                Only immediate family (Mom, Dad, Spouse, Child) allowed.
              </p>
            </div>

            {/* DYNAMIC GUEST INPUT FIELDS (1 to guestCount) */}
            {guestCount > 0 && (
              <div className="p-4 sm:p-5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-200/80 pb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-800 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-orange-600" />
                    <span>Accompanying Guest Details ({guestCount} Guest{guestCount > 1 ? "s" : ""})</span>
                  </h3>
                  <span className="text-[11px] text-orange-700 font-semibold bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200">
                    Mom, Dad, Spouse, Child only
                  </span>
                </div>

                <div className="space-y-3.5">
                  {Array.from({ length: guestCount }).map((_, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-white border border-zinc-200 shadow-2xs space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-orange-800 bg-orange-100 px-2 py-0.5 rounded-md">
                          Guest {idx + 1}
                        </span>
                        <span className="text-[11px] text-zinc-400">Immediate Family Only</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                        <div className="sm:col-span-7">
                          <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                            Guest Full Name <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={guestList[idx]?.name || ""}
                            onChange={(e) => {
                              const updated = [...guestList];
                              updated[idx] = {
                                name: e.target.value,
                                relation: updated[idx]?.relation || "Spouse",
                              };
                              setGuestList(updated);
                            }}
                            placeholder={`e.g. ${
                              guestList[idx]?.relation === "Mom"
                                ? "Mother's Full Name"
                                : guestList[idx]?.relation === "Dad"
                                ? "Father's Full Name"
                                : guestList[idx]?.relation === "Child"
                                ? "Child's Full Name"
                                : "Spouse Full Name"
                            }`}
                            className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
                          />
                        </div>

                        <div className="sm:col-span-5">
                          <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                            Relation to Alumnus <span className="text-rose-500">*</span>
                          </label>
                          <select
                            value={guestList[idx]?.relation || "Spouse"}
                            onChange={(e) => {
                              const updated = [...guestList];
                              updated[idx] = {
                                name: updated[idx]?.name || "",
                                relation: e.target.value as AllowedGuestRelation,
                              };
                              setGuestList(updated);
                            }}
                            className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white font-medium"
                          >
                            <option value="Spouse">Spouse (Husband / Wife)</option>
                            <option value="Child">Child (Son / Daughter)</option>
                            <option value="Mom">Mom (Mother)</option>
                            <option value="Dad">Dad (Father)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-500 flex items-center gap-2">
            <Info className="w-4 h-4 text-zinc-400 shrink-0" />
            <span>
              Dining and guest seating options are hidden because you selected <strong>Register Information Only (No Attend)</strong>.
            </span>
          </div>
        )}

        {/* Section 6: Alumni Memories Message */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-700 border-b border-orange-100 pb-2 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-700 text-xs flex items-center justify-center font-mono">
              {attendMeet ? "6" : "5"}
            </span>
            Nostalgic Message / Words for the University
          </h2>
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Message or Fond Memories (Optional)
            </label>
            <textarea
              name="memoriesMessage"
              rows={3}
              value={formState.form.memoriesMessage}
              onChange={formState.handleChange}
              placeholder="Share a fond memory from your college days, or words of encouragement for current students..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>

        {/* DYNAMIC SUBMIT BUTTON & FOOTER */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-zinc-200">
          <div className="text-xs text-zinc-500 text-center sm:text-left space-y-0.5">
            <div>
              Selected Mode:{" "}
              <strong className={attendMeet ? "text-orange-700" : "text-zinc-900"}>
                {attendMeet
                  ? "Register + Attend Meet (₹1,000 via UPI QR)"
                  : "Register Information Only (Free ₹0 • No Campus Entry)"}
              </strong>
            </div>
            <p className="text-[11px] text-zinc-400">
              {attendMeet
                ? "Clicking below will save your details and take you to UPI QR payment."
                : "Clicking below submits your contact info to the directory with no fee."}
            </p>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl text-white font-extrabold text-sm shadow-md transition-all disabled:opacity-50 ${
              attendMeet
                ? "bg-orange-600 hover:bg-orange-700 shadow-orange-600/20 hover:shadow-lg"
                : "bg-zinc-900 hover:bg-black shadow-zinc-900/20"
            }`}
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Submitting Registration...</span>
              </>
            ) : attendMeet ? (
              <>
                <Ticket className="w-4 h-4" />
                <span>Proceed to Pass Payment (₹1,000)</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <GraduationCap className="w-4 h-4" />
                <span>Complete Directory Registration (Free ₹0)</span>
                <CheckCircle2 className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
