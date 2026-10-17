import Link from "next/link";
import Image from "next/image";
import {
  Building2,
  GraduationCap,
  Award,
  Calendar,
  Sparkles,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export const metadata = {
  title: "About SBSSU & Legacy | SBSCET • SBSSTC • SBSSU",
  description:
    "Learn about the rich history of Shaheed Bhagat Singh State University, established in 1995 as SBSCET, upgraded to SBSSTC in 2011, and elevated to State University in 2021-22.",
};

export default function AboutPage() {
  const milestones = [
    {
      year: "1995",
      title: "Establishment of SBSCET",
      tag: "Foundation Stone",
      color: "border-orange-300 bg-orange-50/50",
      description:
        "Established by the Government of Punjab as Shaheed Bhagat Singh College of Engineering & Technology (SBSCET) to promote premier technical education in the border region of Punjab. Initial departments included Computer Science & Engineering, Mechanical Engineering, and Electronics & Communication Engineering.",
    },
    {
      year: "2011",
      title: "Upgradation to State Technical Campus (SBSSTC)",
      tag: "Autonomy & Expansion",
      color: "border-amber-300 bg-amber-50/50",
      description:
        "Recognizing its stellar academic credentials and research output, the Government of Punjab upgraded the college into a prestigious State Technical Campus (SBSSTC). New postgraduate M.Tech programs, advanced computational clusters, and high-tech workshops were introduced.",
    },
    {
      year: "2021-22",
      title: "Elevation to Full State University (SBSSU)",
      tag: "University Status",
      color: "border-emerald-300 bg-emerald-50/50",
      description:
        "Enacted under Punjab State Legislature Act No. 10 of 2021, the institution attained full State University status as Shaheed Bhagat Singh State University (SBSSU), empowering the university to formulate autonomous curricula, grant degrees, and expand into interdisciplinary sciences and humanities.",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#FDFBF7]">
      {/* Hero Header */}
      <section className="bg-white border-b border-orange-100 py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-900 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-orange-600" />
              University Heritage & Evolution
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight">
              A Legacy of Academic Excellence
            </h1>
            <p className="text-base text-zinc-600 leading-relaxed">
              Shaheed Bhagat Singh State University carries a rich, proud legacy of academic excellence. Initially established by the Government of Punjab in 1995 as Shaheed Bhagat Singh College of Engineering & Technology (SBSCET), our institution was upgraded to a state technical campus in 2011 (SBSSTC), and subsequently elevated to full State University status (SBSSU) in the academic year 2021-22.
            </p>
          </div>
        </div>
      </section>

      {/* Evolution Milestones */}
      <section className="py-14 max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12 space-y-2">
          <h2 className="text-xs font-bold text-orange-700 uppercase tracking-widest">
            Chronology of Growth
          </h2>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-zinc-900">
            Three Eras, One Unstoppable Spirit
          </h3>
        </div>

        <div className="space-y-6">
          {milestones.map((milestone) => (
            <div
              key={milestone.year}
              className={`rounded-2xl border-2 p-6 sm:p-8 bg-white ${milestone.color} shadow-xs space-y-3 transition-all hover:shadow-md`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-2xl font-black text-zinc-900">
                  {milestone.year}
                </span>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-white border border-zinc-200 text-zinc-700">
                  {milestone.tag}
                </span>
              </div>
              <h4 className="text-xl font-bold text-zinc-900">
                {milestone.title}
              </h4>
              <p className="text-sm text-zinc-600 leading-relaxed">
                {milestone.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Campus Highlights */}
      <section className="py-14 bg-white border-y border-orange-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <h2 className="text-xs font-bold text-emerald-700 uppercase tracking-widest">
              Campus Facilities
            </h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-zinc-900">
              A 98-Acre Green Sanctuary in Ferozepur
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-orange-50/50 border border-orange-200 space-y-3">
              <Building2 className="w-8 h-8 text-orange-600" />
              <h4 className="font-bold text-zinc-900 text-base">Academic Infrastructure</h4>
              <p className="text-xs text-zinc-600 leading-relaxed">
                State-of-the-art laboratories, high-speed computational facilities, smart seminar halls, and extensive workshop bays catering to B.Tech, M.Tech, BCA, MCA, and PhD scholars.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-3">
              <Award className="w-8 h-8 text-emerald-600" />
              <h4 className="font-bold text-zinc-900 text-base">SECA & Student Societies</h4>
              <p className="text-xs text-zinc-600 leading-relaxed">
                The Society for Extracurricular Activities (SECA) has been the heartbeat of student life for 3 decades, fostering talent in cultural arts, theater, music, and social leadership.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-amber-50/50 border border-amber-200 space-y-3">
              <GraduationCap className="w-8 h-8 text-amber-600" />
              <h4 className="font-bold text-zinc-900 text-base">Global Alumni Footprint</h4>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Over 15,000+ engineers and technologists have graduated through our gates, serving leadership roles across Google, Microsoft, ISRO, Indian Railways, and international universities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Callout to register */}
      <section className="py-14 text-center">
        <div className="max-w-xl mx-auto px-4 space-y-4">
          <h3 className="text-2xl font-bold text-zinc-900">
            Revisit Your Alma Mater at Sanjh 2026
          </h3>
          <p className="text-sm text-zinc-600">
            Join hundreds of fellow alumni on November 14, 2026. Relive your hostel memories and celebrate with us.
          </p>
          <Link
            href="/sanjh-2026/register"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-sm transition-all shadow-sm"
          >
            Register for Sanjh 2026
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
