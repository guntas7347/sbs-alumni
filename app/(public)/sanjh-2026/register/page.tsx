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
import type { AlumniRegistration } from "@/lib/types";
import {
  GraduationCap,
  Sparkles,
  Award,
  CheckCircle2,
  Lock,
  ArrowRight,
  Loader2,
  AlertCircle,
  Ticket,
  UserCheck,
  Calendar,
  Clock,
  MapPin,
  Building2,
  Briefcase,
  Music,
  ShieldCheck,
  Heart,
  Globe,
  Share2,
} from "lucide-react";

export default function SanjhRegisterPage() {
  const router = useRouter();
  const { user, loading: authLoading, signIn } = useAuth();
  const [existingReg, setExistingReg] = useState<AlumniRegistration | null>(null);
  const [checkingExisting, setCheckingExisting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [newlyRegisteredId, setNewlyRegisteredId] = useState<string | null>(null);
  const [newlyRegNumber, setNewlyRegNumber] = useState<string | null>(null);

  // Alumni Registration Form (Registration is 100% Free)
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
    attendanceType: "in-person",
    guestCount: "0",
    dietaryPreference: "veg",
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

  // Handle Alumni Submission (Free ₹0)
  const handleAlumniSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    const f = formState.form;
    if (!f.fullName || !f.email || !f.phone) {
      setServerError("Please fill in all required fields (Full Name, Phone).");
      return;
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
        attendanceType: f.attendanceType as any,
        guestCount: parseInt(f.guestCount) || 0,
        dietaryPreference: f.dietaryPreference as any,
        memoriesMessage: f.memoriesMessage,
        amount: 0,
      });

      if (res.success && res.id) {
        setNewlyRegisteredId(res.id);
        setNewlyRegNumber(res.regNumber || null);
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

          <div className="p-4 rounded-2xl bg-orange-50/70 border border-orange-200 text-xs text-left space-y-1.5">
            <span className="font-bold text-orange-950 block">Registration is 100% Free (₹0)</span>
            <p className="text-zinc-600">
              Provide your academic and professional details so Shaheed Bhagat Singh State University knows about its proud graduates. Event Passes for the Alumni Meet (₹1,000) are issued separately after registration.
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

  // 2. Newly Registered Success Screen
  if (newlyRegisteredId) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-14 space-y-6">
        <div className="bg-white rounded-3xl border-2 border-emerald-300 p-8 sm:p-10 shadow-lg text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center animate-bounce">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Registration Successful • 100% Free
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-900">
              Welcome to the SBSSU Alumni Network!
            </h1>
            <p className="text-sm text-zinc-600 max-w-lg mx-auto">
              Your details have been registered with Shaheed Bhagat Singh State University. Thank you for staying connected with your alma mater.
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
              <span className="text-zinc-500">Alumni Directory Status:</span>
              <span className="text-emerald-700 font-bold">✓ Active Record</span>
            </div>
          </div>

          {/* Callout: Sanjh 2026 Meet Pass */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 text-left space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-orange-600" />
              <span className="font-extrabold text-sm text-orange-950">
                Attending the 1st Alumni Meet & Sanjh 2026?
              </span>
            </div>
            <p className="text-xs text-zinc-600 leading-relaxed">
              To visit campus on <strong>November 14, 2026</strong>, enjoy high tea, receive your souvenir kit, join the grand gala dinner, and be eligible to perform on stage, get your official <strong>Alumni Meet Event Pass (₹1,000)</strong>.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <Link
                href={`/payment/${newlyRegisteredId}`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs transition-colors shadow-xs"
              >
                <Ticket className="w-4 h-4" />
                Get Alumni Meet Pass (₹1,000)
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href={`/ticket/${newlyRegisteredId}`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white hover:bg-zinc-50 text-zinc-700 font-semibold text-xs border border-zinc-200 transition-colors"
              >
                View Alumni Profile Card
              </Link>
            </div>
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
                href={`/ticket/${existingReg.id}`}
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
                  Registration is complete. To physically attend the celebration on Nov 14, 2026, get your official Event Pass for ₹1,000.
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
              href={`/ticket/${existingReg.id}`}
              className="text-zinc-600 hover:text-orange-600 font-semibold"
            >
              View Alumni Profile Card →
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

  // 4. Main Alumni Registration Form (100% Free)
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      {serverError && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-rose-800 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      <form
        onSubmit={handleAlumniSubmit}
        className="bg-white rounded-3xl border border-orange-200 p-6 sm:p-10 shadow-sm space-y-8"
      >
        {/* Title Header */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-900 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-orange-600" />
              Alumni Directory Registration
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              Registration Fee: 100% FREE (₹0)
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
            Shaheed Bhagat Singh State University Alumni Registration
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
            Provide your details so your alma mater can maintain its permanent alumni directory and stay connected with your journey. If you plan to attend the <strong>1st Alumni Meet & Sanjh 2026</strong> on Nov 14, 2026, you can acquire your official Event Pass (₹1,000) right after completing registration.
          </p>
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
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 text-sm text-zinc-500 cursor-not-allowed"
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
                WhatsApp Number
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
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
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

        {/* Section 4: Alumni Memories Message */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-700 border-b border-orange-100 pb-2 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-700 text-xs flex items-center justify-center font-mono">4</span>
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

        {/* Info Card: Registration vs Event Pass */}
        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950 space-y-1">
          <div className="font-bold flex items-center gap-1.5 text-amber-900">
            <ShieldCheck className="w-4 h-4 text-amber-700" />
            Notice regarding Event Pass & Stage Performances:
          </div>
          <p className="text-zinc-700">
            Registration submits your details to the university alumni database for <strong>free</strong>. Visiting the campus for the Alumni Meet on Nov 14, 2026 requires an <strong>Event Pass (₹1,000)</strong>. Alumni holding a valid event pass can also apply to perform on stage during Sanjh 2026!
          </p>
        </div>

        {/* Submit Button */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-zinc-100">
          <div className="text-xs text-zinc-500">
            By submitting, you agree to share your alumni details with SBSSU.
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-md transition-all disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Registering Details...</span>
              </>
            ) : (
              <>
                <span>Complete Free Registration (₹0)</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
