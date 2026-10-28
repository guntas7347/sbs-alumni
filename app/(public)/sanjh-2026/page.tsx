import Link from "next/link";
import {
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  Award,
  Music,
  Heart,
  Users,
  CheckCircle2,
  ArrowRight,
  HelpCircle,
} from "lucide-react";

export const metadata = {
  title: "Sanjh 2026 – SECA Annual Cultural Function | SBSSU Alumni Meet",
  description:
    "Join Sanjh 2026 organized by SECA at Shaheed Bhagat Singh State University on November 14, 2026, at 5:00 PM. Participation Certificates for all participants!",
};

export default function Sanjh2026Page() {
  const culturalTracks = [
    {
      title: "Dance (Bhangra & Giddha)",
      description:
        "High-energy traditional Punjabi folk dance, group dances, classical, and contemporary choreography.",
      icon: "💃",
    },
    {
      title: "Music & Band Performances",
      description:
        "Solo and duet singing, instrumental fusion (flute, guitar, dhol, harmonium), and live rock band sets.",
      icon: "🎸",
    },
    {
      title: "Drama, Skits & Nukkad Natak",
      description:
        "Humorous campus-life skits, nostalgic hostel parodies, street plays on social themes, and mimicry.",
      icon: "🎭",
    },
    {
      title: "Anchoring & Stage Coordination",
      description:
        "Engaging hosts, bilingual emcees (Punjabi & English), humorous storytelling, and crowd engagement.",
      icon: "🎙️",
    },
    {
      title: "Fine Arts, Rangoli & Photography",
      description:
        "Live sketching, exhibition of campus photographs from 1995-2026, rangoli contests, and digital art.",
      icon: "🎨",
    },
    {
      title: "Poetry, Shayari & Stand-Up",
      description:
        "Shayari, witty campus memories, stand-up comedy, and nostalgic tributes to professors and hostel life.",
      icon: "📜",
    },
  ];

  const scheduleEvents = [
    {
      time: "04:30 PM",
      title: "Alumni Welcome & Red Carpet Reception",
      desc: "Arrival of alumni and guests, badge collection, complimentary tea, and souvenir kit distribution.",
    },
    {
      time: "05:00 PM",
      title: "Inaugural Ceremony & Lamp Lighting",
      desc: "Traditional lighting of the lamp by Honorable Vice Chancellor Dr. Suresh Kumar Sharma and SECA faculty conveners.",
    },
    {
      time: "05:30 PM",
      title: "Alumni Felicitations & Nostalgia Slide Show",
      desc: "Special honors for pioneer batches (1995-1999) and key milestone batches celebrating Silver & Decade reunions.",
    },
    {
      time: "06:15 PM",
      title: "SECA Cultural Stage Extravaganza",
      desc: "Showcase of dance, live music, comedy skits, and special alumni guest performances.",
    },
    {
      time: "08:15 PM",
      title: "Grand Folk Bhangra & Campus Lawns Celebration",
      desc: "Open-floor Punjabi Bhangra and Giddha uniting alumni, students, and faculty.",
    },
    {
      time: "09:00 PM",
      title: "Gala Dinner, Certificate Distribution & Bonfire",
      desc: "Buffet gala dinner, informal fireside networking, and award of Participation Certificates.",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#FDFBF7]">
      {/* Header Banner */}
      <section className="bg-gradient-to-r from-orange-600 via-amber-600 to-emerald-700 text-white py-14 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider text-orange-100">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            SECA (Society for Extracurricular Activities) Annual Event
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight max-w-4xl mx-auto">
            Sanjh 2026 – SECA Annual Cultural Function
          </h1>

          <p className="text-base sm:text-lg text-orange-100 max-w-3xl mx-auto font-medium">
            (Alumni Meet 2026 – A Celebration of Togetherness & Nostalgia with Our Alumni)
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 bg-black/25 px-3 py-2 rounded-lg border border-white/20">
              <Calendar className="w-4 h-4 text-amber-300" />
              November 14, 2026
            </span>
            <span className="flex items-center gap-1.5 bg-black/25 px-3 py-2 rounded-lg border border-white/20">
              <Clock className="w-4 h-4 text-amber-300" />
              5:00 PM Onwards
            </span>
            <span className="flex items-center gap-1.5 bg-black/25 px-3 py-2 rounded-lg border border-white/20">
              <MapPin className="w-4 h-4 text-amber-300" />
              Main University Auditorium & Campus Lawns, SBSSU Ferozepur
            </span>
          </div>

          <div className="pt-4">
            <Link
              href="/sanjh-2026/register"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white text-orange-700 hover:bg-orange-50 font-bold text-sm shadow-lg hover:shadow-xl transition-all"
            >
              Register Now to Participate & Attend
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Official Announcement Card */}
      <section className="py-12 max-w-5xl mx-auto px-4 sm:px-6 w-full">
        <div className="bg-white rounded-3xl border border-orange-200 p-6 sm:p-10 shadow-sm space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-700 flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-orange-700">
                Official SECA Announcement
              </span>
              <h2 className="text-2xl font-bold text-zinc-900">
                A Celebration of Togetherness, Memories, and Bonding
              </h2>
            </div>
          </div>

          <div className="space-y-4 text-sm text-zinc-700 leading-relaxed">
            <p>
              We are thrilled to announce that <strong>SECA (Society for Extracurricular Activities)</strong> is organizing its Annual Cultural Function 2026, <strong>&ldquo;Sanjh 2026&rdquo;</strong>, as a flagship feature of the upcoming Alumni Meet (A Grand Celebration of Togetherness, Memories, and Bonding with Our Alumni)!
            </p>
            <p>
              Every year, SECA provides this special platform for you to showcase your talent, creativity, and enthusiasm. Whether you graduated in 1999 from SBSCET, in 2015 from SBSSTC, or are currently enrolled at SBSSU, this stage welcomes your artistic spirit.
            </p>

            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 font-medium space-y-1">
              <div className="flex items-center gap-2 text-sm font-bold text-emerald-900">
                <Award className="w-5 h-5 text-emerald-700" />
                📜 Official Certificate Guarantee:
              </div>
              <p className="text-xs text-emerald-800">
                Participation Certificates will be awarded to all participants! We encourage maximum participation from all students and alumni. Step forward, highlight your skills, and make this event truly memorable.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Cultural Categories Grid */}
      <section className="py-12 bg-white border-y border-orange-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <h2 className="text-xs font-bold text-orange-700 uppercase tracking-widest">
              Performance Domains
            </h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-zinc-900">
              Showcase Your Energy & Passion
            </h3>
            <p className="text-xs sm:text-sm text-zinc-500">
              Students and alumni can register individually or in teams for any of the categories below.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {culturalTracks.map((track) => (
              <div
                key={track.title}
                className="bg-orange-50/30 rounded-2xl border border-orange-100 p-6 hover:border-orange-300 hover:bg-orange-50/60 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="text-3xl">{track.icon}</div>
                  <h4 className="font-bold text-zinc-900 text-base">{track.title}</h4>
                  <p className="text-xs text-zinc-600 leading-relaxed">
                    {track.description}
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-orange-100 flex items-center justify-between text-xs text-orange-700 font-semibold">
                  <span>Certificate Eligible</span>
                  <span>Open for Registration</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Schedule Timeline */}
      <section className="py-16 max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12 space-y-2">
          <h2 className="text-xs font-bold text-emerald-700 uppercase tracking-widest">
            Detailed Itinerary
          </h2>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-zinc-900">
            Sanjh 2026 Schedule • November 14, 2026
          </h3>
        </div>

        <div className="space-y-4">
          {scheduleEvents.map((evt, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-zinc-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs hover:border-orange-300 transition-all"
            >
              <div className="flex items-center gap-3">
                <span className="shrink-0 px-3 py-1.5 rounded-lg bg-orange-100 text-orange-900 font-bold text-xs">
                  {evt.time}
                </span>
                <div>
                  <h4 className="font-bold text-zinc-900 text-sm sm:text-base">
                    {evt.title}
                  </h4>
                  <p className="text-xs text-zinc-500 mt-0.5">{evt.desc}</p>
                </div>
              </div>
              <div className="shrink-0">
                <span className="text-[11px] font-medium text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  Confirmed
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 text-center">
          <Link
            href="/schedule"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-zinc-50 text-orange-900 border border-orange-200 font-bold text-sm shadow-xs transition-all"
          >
            <Clock className="w-4 h-4 text-orange-600" />
            View Full Minute-to-Minute Programme (24 Slots)
          </Link>

          <Link
            href="/sanjh-2026/register"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-md transition-all"
          >
            Register for Sanjh 2026
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
