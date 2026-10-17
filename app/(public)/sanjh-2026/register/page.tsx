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
import type { AlumniRegistration, RegistrantType } from "@/lib/types";
import {
  GraduationCap,
  Users,
  Sparkles,
  Award,
  CheckCircle2,
  Lock,
  ArrowRight,
  ArrowLeft,
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
} from "lucide-react";

export default function SanjhRegisterPage() {
  const router = useRouter();
  const { user, loading: authLoading, signIn } = useAuth();
  const [existingReg, setExistingReg] = useState<AlumniRegistration | null>(null);
  const [checkingExisting, setCheckingExisting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Selection: alumni or student
  const [selectedType, setSelectedType] = useState<RegistrantType | null>(null);

  // Alumni Form (using useForm)
  const alumniForm = useForm({
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
    culturalInterest: "none",
    culturalDetails: "",
    guestCount: "0",
    dietaryPreference: "veg",
    memoriesMessage: "",
  });

  // Student Form (using useForm)
  const studentForm = useForm({
    fullName: "",
    email: "",
    phone: "",
    whatsapp: "",
    degree: "B.Tech",
    branch: "Computer Science & Engineering (CSE)",
    currentSemester: "6th Semester (3rd Year)",
    rollNumber: "",
    hostelOrDayScholar: "Hostel Resident",
    attendanceType: "in-person",
    culturalInterest: "none",
    culturalDetails: "",
    volunteerInterest: "yes",
    dietaryPreference: "veg",
    memoriesMessage: "",
  });

  // Pre-fill user data upon Google auth
  useEffect(() => {
    if (user?.email) {
      alumniForm.setFields({
        email: user.email,
        fullName: user.displayName || alumniForm.form.fullName || "",
      });
      studentForm.setFields({
        email: user.email,
        fullName: user.displayName || studentForm.form.fullName || "",
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

  // Handle Alumni Submission (₹1000 Fee -> redirects to payment)
  const handleAlumniSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    const f = alumniForm.form;
    if (!f.fullName || !f.email || !f.phone || !f.currentDesignation) {
      setServerError("Please fill in all required fields (Name, Phone, Designation).");
      return;
    }

    setSubmitting(true);

    try {
      const res = await createAlumniRegistration({
        registrantType: "alumni",
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
        culturalInterest: f.culturalInterest as any,
        culturalDetails: f.culturalDetails,
        guestCount: parseInt(f.guestCount) || 0,
        dietaryPreference: f.dietaryPreference as any,
        memoriesMessage: f.memoriesMessage,
        amount: 1000,
      });

      if (res.success && res.id) {
        router.push(`/payment/${res.id}`);
      } else {
        setServerError(res.error || "Failed to submit alumni registration.");
      }
    } catch (err: any) {
      setServerError(err?.message || "An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Student Submission (₹0 / Free -> redirects straight to ticket)
  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    const f = studentForm.form;
    if (!f.fullName || !f.email || !f.phone || !f.rollNumber) {
      setServerError("Please fill in all required fields (Name, Phone, Student Roll Number).");
      return;
    }

    setSubmitting(true);

    try {
      const res = await createAlumniRegistration({
        registrantType: "student",
        fullName: f.fullName,
        email: f.email,
        phone: f.phone,
        whatsapp: f.whatsapp || f.phone,
        degree: f.degree,
        branch: f.branch,
        rollNumber: f.rollNumber,
        currentSemester: f.currentSemester,
        hostelOrDayScholar: f.hostelOrDayScholar,
        volunteerInterest: f.volunteerInterest === "yes",
        attendanceType: "in-person",
        culturalInterest: f.culturalInterest as any,
        culturalDetails: f.culturalDetails,
        guestCount: 0,
        dietaryPreference: f.dietaryPreference as any,
        memoriesMessage: f.memoriesMessage,
        amount: 0,
      });

      if (res.success && res.id) {
        router.push(`/ticket/${res.id}`);
      } else {
        setServerError(res.error || "Failed to complete student registration.");
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
              Identity Verification
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900">
              Sign In Before Registering
            </h1>
            <p className="text-sm text-zinc-600 max-w-md mx-auto leading-relaxed">
              To verify applicant authenticity for Sanjh 2026 and link your official participation pass, please sign in with your Google account.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
            <div className="p-3.5 rounded-2xl bg-orange-50/70 border border-orange-200 text-xs">
              <span className="font-bold text-orange-950 block">For Alumni</span>
              <span className="text-zinc-600">
                ₹1,000 registration fee. Includes cultural pass, souvenir kit, and gala dinner.
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs">
              <span className="font-bold text-emerald-950 block">For Current Students</span>
              <span className="text-zinc-600">
                100% Free (₹0). SECA cultural participation and official certificates.
              </span>
            </div>
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

  // 2. Existing Registration Lookup
  if (existingReg) {
    const isStu = existingReg.registrantType === "student";
    return (
      <div className="max-w-3xl mx-auto px-4 py-14 space-y-6">
        <div className="bg-white rounded-3xl border border-emerald-200 p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <UserCheck className="w-7 h-7" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                {isStu ? "Student Registration Active" : "Alumni Registration Active"}
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
              <span className="text-zinc-500 block">Pass / Reg ID:</span>
              <span className="font-mono font-bold text-zinc-900 text-sm">
                {existingReg.regNumber}
              </span>
            </div>
            <div>
              <span className="text-zinc-500 block">Registration Type:</span>
              <span className="font-bold text-zinc-800 capitalize">
                {isStu ? "Current Student (Free)" : "Alumnus (₹1,000)"}
              </span>
            </div>
            <div>
              <span className="text-zinc-500 block">Payment / Pass Status:</span>
              <span
                className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-md ${
                  existingReg.paymentStatus === "completed" || existingReg.paymentStatus === "free"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {existingReg.paymentStatus === "completed" || existingReg.paymentStatus === "free"
                  ? "✓ Confirmed Pass"
                  : `⏳ Pending (₹${existingReg.amount})`}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {existingReg.paymentStatus === "completed" || existingReg.paymentStatus === "free" ? (
              <Link
                href={`/ticket/${existingReg.id}`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-xs"
              >
                <Ticket className="w-4 h-4" />
                View & Print Digital Pass
              </Link>
            ) : (
              <Link
                href={`/payment/${existingReg.id}`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs transition-colors shadow-xs"
              >
                <Sparkles className="w-4 h-4" />
                Complete Alumni Mock Payment (₹1,000)
              </Link>
            )}

            <button
              onClick={() => setExistingReg(null)}
              className="text-xs text-zinc-500 hover:text-zinc-800 underline px-3 py-2"
            >
              Submit another registration
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Step: Choose Alumni or Student if not chosen yet
  if (!selectedType) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-900 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-orange-600" />
            Sanjh 2026 Registration Portal
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight">
            Select Your Registration Category
          </h1>
          <p className="text-sm text-zinc-600">
            Please indicate whether you are an alumnus/alumna of the institution or currently studying as an enrolled student at SBSSU.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card A: Alumni (₹1,000) */}
          <div
            onClick={() => setSelectedType("alumni")}
            className="group cursor-pointer bg-white rounded-3xl border-2 border-orange-200 hover:border-orange-500 p-8 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-orange-100 text-orange-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <GraduationCap className="w-7 h-7" />
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-orange-800 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
                  Alumni Registration
                </span>
                <h2 className="text-2xl font-bold text-zinc-900 mt-2">
                  I am an Alumnus / Alumna
                </h2>
                <p className="text-xs text-zinc-500 mt-1">
                  Graduates of SBSCET (1995-2011), SBSSTC (2011-2021), or SBSSU.
                </p>
              </div>

              <ul className="space-y-2 text-xs text-zinc-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-orange-600 shrink-0" />
                  <span>Entry to Sanjh 2026 Cultural Function</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-orange-600 shrink-0" />
                  <span>High Tea, Souvenir Alumni Kit & Gala Dinner</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-orange-600 shrink-0" />
                  <span>Eligible for Cultural Performances (Cert. included)</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-4 border-t border-zinc-100 flex items-center justify-between">
              <div>
                <span className="text-xs text-zinc-500 block">Registration Fee</span>
                <span className="text-2xl font-black text-orange-600">₹1,000</span>
              </div>
              <button
                type="button"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-600 group-hover:bg-orange-700 text-white font-bold text-xs transition-colors shadow-2xs"
              >
                Proceed as Alumni
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Card B: Student (Free / ₹0) */}
          <div
            onClick={() => setSelectedType("student")}
            className="group cursor-pointer bg-white rounded-3xl border-2 border-emerald-200 hover:border-emerald-500 p-8 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Users className="w-7 h-7" />
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Student Registration
                </span>
                <h2 className="text-2xl font-bold text-zinc-900 mt-2">
                  I am a Current Student
                </h2>
                <p className="text-xs text-zinc-500 mt-1">
                  Currently enrolled in regular degree programs at SBSSU Ferozepur.
                </p>
              </div>

              <ul className="space-y-2 text-xs text-zinc-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Showcase talent: Dance, Music, Drama, Anchoring, Fine Arts</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>📜 <strong>Participation Certificates awarded to all participants!</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>SECA Student Volunteering & Networking with Alumni</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-4 border-t border-zinc-100 flex items-center justify-between">
              <div>
                <span className="text-xs text-zinc-500 block">Registration Fee</span>
                <span className="text-2xl font-black text-emerald-600">FREE (₹0)</span>
              </div>
              <button
                type="button"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 group-hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-2xs"
              >
                Register as Student
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 4. Render Respective Forms
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      {/* Switch Category Button */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setSelectedType(null)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 hover:text-orange-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Change Category (Currently: {selectedType.toUpperCase()})
        </button>

        <span
          className={`text-xs font-bold px-3 py-1 rounded-full border ${
            selectedType === "alumni"
              ? "bg-orange-50 text-orange-800 border-orange-200"
              : "bg-emerald-50 text-emerald-800 border-emerald-200"
          }`}
        >
          {selectedType === "alumni" ? "Alumni Pass: ₹1,000" : "Student Delegate Pass: FREE (₹0)"}
        </span>
      </div>

      {serverError && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-rose-800 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      {/* FORM 1: ALUMNI REGISTRATION FORM (₹1000) */}
      {selectedType === "alumni" && (
        <form
          onSubmit={handleAlumniSubmit}
          className="bg-white rounded-3xl border border-orange-200 p-6 sm:p-10 shadow-sm space-y-8"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-900 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-orange-600" />
              Alumni Registration Form • Sanjh 2026
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
              Alumni Meet 2026 Registration
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500">
              Registration Fee: ₹1,000 (Includes Sanjh 2026 Entry, Kit, High Tea & Gala Dinner).
            </p>
          </div>

          {/* Section: Personal Info */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-700 border-b border-orange-100 pb-2">
              1. Personal & Contact Details
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
                  value={alumniForm.form.fullName}
                  onChange={alumniForm.handleChange}
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
                  value={alumniForm.form.email}
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
                  value={alumniForm.form.phone}
                  onChange={alumniForm.handleChange}
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
                  value={alumniForm.form.whatsapp}
                  onChange={alumniForm.handleChange}
                  placeholder="If different from phone number"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Section: Academic Background */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-700 border-b border-orange-100 pb-2">
              2. Academic Era & Graduation Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Institution Era
                </label>
                <select
                  name="era"
                  value={alumniForm.form.era}
                  onChange={alumniForm.handleChange}
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
                  value={alumniForm.form.degree}
                  onChange={alumniForm.handleChange}
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
                  value={alumniForm.form.passingYear}
                  onChange={alumniForm.handleChange}
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
                  Branch / Specialization
                </label>
                <select
                  name="branch"
                  value={alumniForm.form.branch}
                  onChange={alumniForm.handleChange}
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
                  value={alumniForm.form.rollNumber}
                  onChange={alumniForm.handleChange}
                  placeholder="e.g. 1504562"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Section: Professional */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-700 border-b border-orange-100 pb-2">
              3. Professional Profile & Location
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Current Designation <span className="text-orange-600">*</span>
                </label>
                <input
                  type="text"
                  name="currentDesignation"
                  required
                  value={alumniForm.form.currentDesignation}
                  onChange={alumniForm.handleChange}
                  placeholder="e.g. Senior Tech Lead / Director / Entrepreneur"
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
                  value={alumniForm.form.organization}
                  onChange={alumniForm.handleChange}
                  placeholder="e.g. Google / Infosys / Government of Punjab"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Current City
                </label>
                <input
                  type="text"
                  name="city"
                  value={alumniForm.form.city}
                  onChange={alumniForm.handleChange}
                  placeholder="e.g. Chandigarh / Gurgaon / Toronto"
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
                  value={alumniForm.form.linkedin}
                  onChange={alumniForm.handleChange}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          </div>

          {/* Section: Sanjh 2026 Cultural */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-700 border-b border-orange-100 pb-2">
              4. Sanjh 2026 Cultural Extravaganza
            </h2>

            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-950">
              <span className="font-bold flex items-center gap-1.5 text-emerald-900">
                <Award className="w-4 h-4 text-emerald-700" />
                Participation Certificates Guarantee:
              </span>
              <p className="mt-0.5">
                📜 Participation Certificates will be awarded to all alumni and student participants!
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Cultural Performance Interest
                </label>
                <select
                  name="culturalInterest"
                  value={alumniForm.form.culturalInterest}
                  onChange={alumniForm.handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="none">Attending as Audience / Spectator</option>
                  <option value="dance">Dance (Bhangra / Giddha / Solo)</option>
                  <option value="music">Music (Singing / Instrumental / Band)</option>
                  <option value="drama">Drama / Skit / Mimicry</option>
                  <option value="anchoring">Anchoring & Stage Coordination</option>
                  <option value="fine-arts">Fine Arts & Rangoli</option>
                  <option value="poetry">Poetry / Shayari / Stand-Up</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Accompanying Family Guests
                </label>
                <select
                  name="guestCount"
                  value={alumniForm.form.guestCount}
                  onChange={alumniForm.handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="0">0 (Attending Solo)</option>
                  <option value="1">1 Guest</option>
                  <option value="2">2 Guests</option>
                  <option value="3">3+ Guests</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Nostalgic Memory / Message for SBSSU & Juniors
              </label>
              <textarea
                name="memoriesMessage"
                rows={2}
                value={alumniForm.form.memoriesMessage}
                onChange={alumniForm.handleChange}
                placeholder="Share a fond memory of hostel life, canteen discussions, or professors..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          {/* Alumni Fee Summary */}
          <div className="p-4 rounded-2xl bg-orange-50/70 border border-orange-200 flex items-center justify-between">
            <div>
              <span className="text-xs text-orange-900 font-semibold block">
                Alumni Registration Fee
              </span>
              <span className="text-xs text-zinc-500">
                Fixed standard pass including gala dinner and alumni kit
              </span>
            </div>
            <div className="text-2xl font-black text-orange-600">
              ₹1,000
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-md transition-all disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving Registration...
                </>
              ) : (
                <>
                  Proceed to Payment (₹1,000)
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* FORM 2: CURRENT STUDENT REGISTRATION FORM (FREE / ₹0) */}
      {selectedType === "student" && (
        <form
          onSubmit={handleStudentSubmit}
          className="bg-white rounded-3xl border border-emerald-200 p-6 sm:p-10 shadow-sm space-y-8"
        >
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              Student Registration • Sanjh 2026
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
              SBSSU Student Delegate & Performer Registration
            </h1>
            <p className="text-xs sm:text-sm text-emerald-700 font-medium">
              Free Registration (₹0) for all currently enrolled students of SBSSU. No payment required!
            </p>
          </div>

          {/* Section: Student Identity */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-700 border-b border-emerald-100 pb-2">
              1. Student Details & College ID
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Full Name <span className="text-emerald-600">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  required
                  value={studentForm.form.fullName}
                  onChange={studentForm.handleChange}
                  placeholder="e.g. Simran Kaur"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                  value={studentForm.form.email}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 text-sm text-zinc-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Student University Roll Number <span className="text-emerald-600">*</span>
                </label>
                <input
                  type="text"
                  name="rollNumber"
                  required
                  value={studentForm.form.rollNumber}
                  onChange={studentForm.handleChange}
                  placeholder="e.g. 2104567"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Phone / WhatsApp Number <span className="text-emerald-600">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={studentForm.form.phone}
                  onChange={studentForm.handleChange}
                  placeholder="e.g. +91 9876543210"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Section: Academic Details */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-700 border-b border-emerald-100 pb-2">
              2. Program, Department & Residence
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Degree Program
                </label>
                <select
                  name="degree"
                  value={studentForm.form.degree}
                  onChange={studentForm.handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="B.Tech">B.Tech</option>
                  <option value="M.Tech">M.Tech</option>
                  <option value="BCA">BCA</option>
                  <option value="MCA">MCA</option>
                  <option value="BBA">BBA</option>
                  <option value="MBA">MBA</option>
                  <option value="B.Sc">B.Sc</option>
                  <option value="Diploma">Diploma (Polytechnic)</option>
                  <option value="PhD">PhD</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Branch / Department
                </label>
                <select
                  name="branch"
                  value={studentForm.form.branch}
                  onChange={studentForm.handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Computer Science & Engineering (CSE)">Computer Science (CSE)</option>
                  <option value="Electronics & Communication (ECE)">Electronics (ECE)</option>
                  <option value="Mechanical Engineering (ME)">Mechanical (ME)</option>
                  <option value="Civil Engineering (CE)">Civil (CE)</option>
                  <option value="Electrical Engineering (EE)">Electrical (EE)</option>
                  <option value="Chemical Engineering">Chemical</option>
                  <option value="Information Technology (IT)">IT</option>
                  <option value="Computer Applications">Computer Applications</option>
                  <option value="Management Studies">Management Studies</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Current Semester / Year
                </label>
                <select
                  name="currentSemester"
                  value={studentForm.form.currentSemester}
                  onChange={studentForm.handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="1st / 2nd Sem (1st Year)">1st Year (1st / 2nd Sem)</option>
                  <option value="3rd / 4th Sem (2nd Year)">2nd Year (3rd / 4th Sem)</option>
                  <option value="5th / 6th Sem (3rd Year)">3rd Year (5th / 6th Sem)</option>
                  <option value="7th / 8th Sem (Final Year)">Final Year (7th / 8th Sem)</option>
                  <option value="Postgraduate / PhD">Postgraduate / PhD</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Campus Residence
              </label>
              <select
                name="hostelOrDayScholar"
                value={studentForm.form.hostelOrDayScholar}
                onChange={studentForm.handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Day Scholar">Day Scholar (Local / Commuter)</option>
                <option value="Boys Hostel No. 1">Boys Hostel No. 1</option>
                <option value="Boys Hostel No. 2">Boys Hostel No. 2</option>
                <option value="Boys Hostel No. 3">Boys Hostel No. 3</option>
                <option value="Boys Hostel No. 4">Boys Hostel No. 4</option>
                <option value="Girls Hostel">Girls Hostel</option>
              </select>
            </div>
          </div>

          {/* Section: SECA Cultural Talent */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-700 border-b border-emerald-100 pb-2">
              3. SECA Cultural Participation & Talent
            </h2>

            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-950 space-y-1">
              <span className="font-bold flex items-center gap-1.5 text-emerald-900">
                <Award className="w-4 h-4 text-emerald-700" />
                📜 Official Participation Certificate:
              </span>
              <p>
                Participation Certificates will be awarded to all participants! We encourage maximum participation from all students. Step forward, highlight your skills, and make this event truly memorable.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Showcase Talent in:
                </label>
                <select
                  name="culturalInterest"
                  value={studentForm.form.culturalInterest}
                  onChange={studentForm.handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="none">Attending as Audience / Student Delegate</option>
                  <option value="dance">Dance (Bhangra / Giddha / Solo / Western)</option>
                  <option value="music">Music (Vocal / Instrumental / Rock Band)</option>
                  <option value="drama">Drama / Skit / Mimicry / Nukkad Natak</option>
                  <option value="anchoring">Anchoring & Stage Hosting</option>
                  <option value="fine-arts">Fine Arts & Rangoli Contest</option>
                  <option value="poetry">Poetry / Shayari / Stand-Up Comedy</option>
                  <option value="other">Other Talent</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Volunteer for SECA Organizing Team?
                </label>
                <select
                  name="volunteerInterest"
                  value={studentForm.form.volunteerInterest}
                  onChange={studentForm.handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="yes">Yes, I want to volunteer with SECA</option>
                  <option value="no">No, only participating / attending</option>
                </select>
              </div>
            </div>

            {studentForm.form.culturalInterest !== "none" && (
              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Act Description / Group Team Members
                </label>
                <input
                  type="text"
                  name="culturalDetails"
                  value={studentForm.form.culturalDetails}
                  onChange={studentForm.handleChange}
                  placeholder="e.g. Solo folk singing / 6-member Giddha squad with roll numbers"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            )}
          </div>

          {/* Student Fee Summary (Free) */}
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 flex items-center justify-between">
            <div>
              <span className="text-xs text-emerald-950 font-bold block">
                Student Registration Fee
              </span>
              <span className="text-xs text-emerald-800">
                100% Free for SBSSU Students • Instant Pass Generation
              </span>
            </div>
            <div className="text-2xl font-black text-emerald-700">
              ₹0 (FREE)
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating Student Pass...
                </>
              ) : (
                <>
                  Complete Free Student Registration
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
