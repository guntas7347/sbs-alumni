import Link from "next/link";
import Image from "next/image";
import {
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  Award,
  GraduationCap,
  Users,
  Music,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  HeartHandshake,
  Building2,
  BookOpen,
} from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-orange-50/60 via-white to-emerald-50/40 border-b border-orange-100/70 pt-8 pb-16 lg:pt-14 lg:pb-24">
        {/* Decorative soft backdrop circles */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-orange-200/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Heading & CTAs */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-100/90 border border-orange-300/80 text-orange-900 text-xs font-semibold shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                <span>Shaheed Bhagat Singh State University • alumni.sbssu.ac.in</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-zinc-900 tracking-tight leading-[1.15]">
                Welcome Home, <span className="text-orange-600">Alumni!</span>
                <br />
                <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-zinc-700">
                  Relive the Glory of SBSCET • SBSSTC • SBSSU
                </span>
              </h1>

              <p className="text-base sm:text-lg text-zinc-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                A grand celebration of nostalgia, lifelong bonds, and Punjab’s vibrant spirit. Reconnect with beloved professors, batchmates, and junior students at our historic 98-acre campus in Ferozepur.
              </p>

              {/* Event highlight pills */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5 pt-1">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-orange-200 text-xs font-medium text-orange-900 shadow-2xs">
                  <Calendar className="w-3.5 h-3.5 text-orange-600" />
                  <span>Sanjh 2026: Nov 14, 2026</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-emerald-200 text-xs font-medium text-emerald-900 shadow-2xs">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>5:00 PM Onwards</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-zinc-200 text-xs font-medium text-zinc-800 shadow-2xs">
                  <Award className="w-3.5 h-3.5 text-amber-500" />
                  <span>Participation Certificates for All</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-3">
                <Link
                  href="/sanjh-2026/register"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  Register for Sanjh 2026
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>

                <Link
                  href="/sanjh-2026"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-emerald-50 text-emerald-900 font-semibold text-sm border border-emerald-300 shadow-2xs transition-all"
                >
                  <Music className="w-4 h-4 text-emerald-600" />
                  SECA Cultural Function Details
                </Link>

                <Link
                  href="/about"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-transparent hover:bg-zinc-100 text-zinc-700 font-medium text-sm transition-all"
                >
                  University Legacy
                </Link>
              </div>

              {/* Historical Badges */}
              <div className="pt-4 border-t border-orange-100 flex flex-wrap items-center justify-center lg:justify-start gap-3 text-xs text-zinc-500">
                <span className="font-semibold text-zinc-700">Evolution Milestones:</span>
                <span className="bg-orange-50 text-orange-800 border border-orange-200 px-2.5 py-1 rounded-md">
                  1995: SBSCET Established
                </span>
                <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-md">
                  2011: Upgraded to SBSSTC
                </span>
                <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-md">
                  2021-22: Full State University (SBSSU)
                </span>
              </div>
            </div>

            {/* Right Column: Sanjh 2026 Highlight Card */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-2xl border border-orange-200 p-6 sm:p-7 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-gradient-to-l from-orange-500 to-amber-500 text-white text-[11px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                  Flagship Event
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-orange-700">
                      <Music className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-xs uppercase font-bold text-orange-700 tracking-wider">
                        SECA Cultural Extravaganza
                      </span>
                      <h2 className="text-2xl font-black text-zinc-900">
                        Sanjh 2026
                      </h2>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-600 leading-relaxed">
                    SECA (Society for Extracurricular Activities) proudly organizes its Annual Cultural Function as the pinnacle feature of the Alumni Meet 2026!
                  </p>

                  <div className="bg-gradient-to-br from-emerald-50/70 to-emerald-50/20 border border-emerald-200 rounded-xl p-3.5 space-y-2 text-xs">
                    <div className="flex items-center justify-between font-semibold text-emerald-950">
                      <span>📅 November 14, 2026</span>
                      <span>⏰ 5:00 PM</span>
                    </div>
                    <div className="text-emerald-800">
                      📍 Main University Auditorium & Lawns, SBSSU Ferozepur
                    </div>
                    <div className="text-[11px] font-semibold text-emerald-700 bg-emerald-100/60 p-2 rounded-lg">
                      📜 Note: Participation Certificates will be awarded to all registered participants!
                    </div>
                  </div>

                  <div className="space-y-2 text-xs text-zinc-600">
                    <p className="font-semibold text-zinc-800">
                      Showcase your energy & talent in:
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center gap-1.5 p-2 rounded-lg bg-orange-50/60 border border-orange-100">
                        <CheckCircle2 className="w-3.5 h-3.5 text-orange-600" />
                        <span>Bhangra & Dance</span>
                      </div>
                      <div className="flex items-center gap-1.5 p-2 rounded-lg bg-orange-50/60 border border-orange-100">
                        <CheckCircle2 className="w-3.5 h-3.5 text-orange-600" />
                        <span>Music & Singing</span>
                      </div>
                      <div className="flex items-center gap-1.5 p-2 rounded-lg bg-emerald-50/60 border border-emerald-100">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Drama & Skits</span>
                      </div>
                      <div className="flex items-center gap-1.5 p-2 rounded-lg bg-emerald-50/60 border border-emerald-100">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Fine Arts & Anchoring</span>
                      </div>
                    </div>
                  </div>

                  <Link
                    href="/sanjh-2026/register"
                    className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs tracking-wide uppercase transition-colors shadow-xs"
                  >
                    Register as Alumni / Performer
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. HONORABLE VICE CHANCELLOR'S WELCOME ADDRESS */}
      <section className="py-16 bg-white border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-orange-50/50 via-white to-emerald-50/40 rounded-3xl border border-orange-200/80 p-6 sm:p-10 lg:p-12 shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* VC Image */}
              <div className="lg:col-span-4 flex flex-col items-center text-center">
                <div className="relative w-48 h-56 sm:w-56 sm:h-64 rounded-2xl overflow-hidden border-4 border-white shadow-md bg-zinc-100">
                  <Image
                    src="https://sbssu.ac.in/BusinessImage/0ecd9ea3-8b99-4889-ac12-4be307aee55a.png"
                    alt="Dr. Suresh Kumar Sharma, Honorable Vice Chancellor, SBSSU"
                    fill
                    sizes="(max-width: 768px) 100vw, 300px"
                    className="object-cover object-top"
                  />
                </div>
                <div className="mt-4 space-y-1">
                  <h3 className="font-bold text-lg sm:text-xl text-zinc-900">
                    Dr. Suresh Kumar Sharma
                  </h3>
                  <p className="text-xs font-semibold text-orange-700 uppercase tracking-wider">
                    Honorable Vice Chancellor
                  </p>
                  <p className="text-xs text-zinc-500">
                    Shaheed Bhagat Singh State University, Ferozepur
                  </p>
                </div>
              </div>

              {/* VC Message */}
              <div className="lg:col-span-8 space-y-4 text-zinc-700">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                  Vice Chancellor&apos;s Welcome Message
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
                  &ldquo;Our Alumni Are The Living Ambassadors Of Our University&apos;s Great Heritage&rdquo;
                </h2>

                <div className="space-y-3 text-sm leading-relaxed text-zinc-600">
                  <p>
                    Dear Alumni, Faculty Members, and Students,
                  </p>
                  <p>
                    It is with great pride and affection that I welcome each one of you to our official Alumni Portal. From our humble beginnings in 1995 as Shaheed Bhagat Singh College of Engineering & Technology (SBSCET), our campus has continually evolved—first becoming a State Technical Campus (SBSSTC) in 2011, and now standing tall as a premier State University (SBSSU).
                  </p>
                  <p>
                    The indelible contributions made by our alumni across multinational corporations, scientific institutions, public governance, and entrepreneurial ventures worldwide inspire our current batches of students every single day.
                  </p>
                  <p>
                    I warmly invite all our alumni back home to Ferozepur for <strong className="text-zinc-900">Sanjh 2026</strong>. Come revisit your favorite campus spots, share your invaluable experiences with our budding engineers, and celebrate the timeless bond of togetherness.
                  </p>
                </div>

                <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-medium text-zinc-500">
                  <span className="flex items-center gap-1.5 text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    University Patronage
                  </span>
                  <span className="flex items-center gap-1.5 text-orange-800 bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-200">
                    <Building2 className="w-4 h-4 text-orange-600" />
                    Ferozepur Campus (152004)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. THREE PILLARS (Alumni, Students, Faculty) */}
      <section className="py-16 bg-[#FDFBF7] border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <h2 className="text-xs font-bold text-orange-700 uppercase tracking-widest">
              Our Community
            </h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-zinc-900">
              One University, Three Strong Pillars
            </h3>
            <p className="text-xs sm:text-sm text-zinc-500">
              This alumni portal serves our cherished alumni, our vibrant student community, and our dedicated faculty.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Alumni (Primary) */}
            <div className="bg-white rounded-2xl border-2 border-orange-200 p-6 shadow-xs hover:border-orange-400 transition-all flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-orange-700 bg-orange-50 px-2 py-0.5 rounded">
                    Primary Audience
                  </span>
                  <h4 className="text-xl font-bold text-zinc-900 mt-2">
                    Distinguished Alumni
                  </h4>
                </div>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Reconnect with your batchmates from SBSCET, SBSSTC, and SBSSU. Attend Sanjh 2026, receive your official alumni badge, mentor students, and share your journey.
                </p>
                <ul className="space-y-1.5 text-xs text-zinc-600">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-orange-600" />
                    <span>Official Alumni Meet 2026 Registration</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-orange-600" />
                    <span>Digital Alumni Card & Ticket Pass</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-orange-600" />
                    <span>Revisit Campus Lawns & Hostels</span>
                  </li>
                </ul>
              </div>

              <div className="pt-6 mt-6 border-t border-zinc-100">
                <Link
                  href="/sanjh-2026/register"
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs transition-colors"
                >
                  Register as Alumni
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Card 2: Current Students (Secondary) */}
            <div className="bg-white rounded-2xl border border-emerald-200 p-6 shadow-xs hover:border-emerald-400 transition-all flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    Secondary Audience
                  </span>
                  <h4 className="text-xl font-bold text-zinc-900 mt-2">
                    Current Students & SECA
                  </h4>
                </div>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Step forward and showcase your creativity! Perform at Sanjh 2026 in Dance, Drama, Music, or Anchoring and earn prestigious university Participation Certificates.
                </p>
                <ul className="space-y-1.5 text-xs text-zinc-600">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Participation Certificates for All Performers</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Connect with Alumni in Tech & Core Industries</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Student Volunteer Opportunities</span>
                  </li>
                </ul>
              </div>

              <div className="pt-6 mt-6 border-t border-zinc-100">
                <Link
                  href="/sanjh-2026"
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors"
                >
                  SECA Cultural Guidelines
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Card 3: Faculty & Staff (Secondary) */}
            <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-xs hover:border-zinc-400 transition-all flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
                    Secondary Audience
                  </span>
                  <h4 className="text-xl font-bold text-zinc-900 mt-2">
                    Faculty & Mentors
                  </h4>
                </div>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Celebrating the professors, mentors, and lab instructors who shaped thousands of engineering careers since 1995. Department-level meetups and research synergy.
                </p>
                <ul className="space-y-1.5 text-xs text-zinc-600">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                    <span>Departmental Alumni Reconnect</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                    <span>Guest Lectures & Industry Collaboration</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                    <span>Honoring Retired & Emeritus Faculty</span>
                  </li>
                </ul>
              </div>

              <div className="pt-6 mt-6 border-t border-zinc-100">
                <Link
                  href="/about"
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-900 text-white font-semibold text-xs transition-colors"
                >
                  Read University Legacy
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SANJH 2026 EVENT SCHEDULE & CALLOUT */}
      <section className="py-16 bg-white border-b border-orange-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-emerald-700 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10 max-w-3xl space-y-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" /> November 14, 2026 • 5:00 PM
              </span>

              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Sanjh 2026 – SECA Annual Cultural Function
              </h2>

              <p className="text-sm sm:text-base text-orange-50 leading-relaxed">
                Organized by SECA (Society for Extracurricular Activities). Every year, SECA provides this special platform for you to showcase your talent, creativity, and enthusiasm.
                <br />
                <span className="font-semibold underline decoration-white/50">
                  Participation Certificates will be awarded to all participants!
                </span>
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/sanjh-2026/register"
                  className="px-6 py-3.5 bg-white text-orange-700 hover:bg-orange-50 font-bold text-sm rounded-xl shadow-md transition-all inline-flex items-center gap-2"
                >
                  Register Now (Mock Payment Included)
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/sanjh-2026"
                  className="px-6 py-3.5 bg-black/20 hover:bg-black/30 text-white font-medium text-sm rounded-xl border border-white/30 backdrop-blur-sm transition-all"
                >
                  View Complete Cultural Program
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
