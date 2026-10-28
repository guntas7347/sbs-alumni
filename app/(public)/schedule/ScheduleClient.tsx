"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  Award,
  Music,
  Heart,
  Users,
  Search,
  Printer,
  GraduationCap,
  Mic,
  Flame,
  ArrowRight,
  CheckCircle2,
  Table as TableIcon,
  ListOrdered,
  Share2,
  Utensils,
  PartyPopper,
} from "lucide-react";

interface ScheduleItem {
  srNo: number;
  time: string;
  activity: string;
  dignitaries?: string;
  category: "ceremony" | "speech" | "dance" | "music" | "alumni" | "memories" | "comedy" | "dinner";
  highlight?: boolean;
}

const PROGRAMME_ITEMS: ScheduleItem[] = [
  {
    srNo: 1,
    time: "05:00 PM",
    activity: "Inauguration – Lamp Lighting",
    category: "ceremony",
    highlight: true,
  },
  {
    srNo: 2,
    time: "05:10 PM",
    activity: "Welcome Speech",
    dignitaries: "Dr. Gazalpreet Arneja, ME",
    category: "speech",
    highlight: true,
  },
  {
    srNo: 3,
    time: "05:15 PM",
    activity: "Inaugural Speech – Chief Guest",
    dignitaries: "Hon’ble Vice Chancellor, Dr. Suresh Kumar Sharma",
    category: "speech",
    highlight: true,
  },
  {
    srNo: 4,
    time: "05:20 PM",
    activity: "Cultural Function: Rajasthani Dance",
    category: "dance",
  },
  {
    srNo: 5,
    time: "05:25 PM",
    activity: "Alumni Slot Performance",
    category: "alumni",
  },
  {
    srNo: 6,
    time: "05:30 PM",
    activity: "Alumni Slot",
    category: "alumni",
  },
  {
    srNo: 7,
    time: "05:35 PM",
    activity: "Group Dance",
    category: "dance",
  },
  {
    srNo: 8,
    time: "05:40 PM",
    activity: "Alumni Slot",
    category: "alumni",
  },
  {
    srNo: 9,
    time: "05:50 PM",
    activity: "Alumni Slot",
    category: "alumni",
  },
  {
    srNo: 10,
    time: "06:00 PM",
    activity: "Singing",
    category: "music",
  },
  {
    srNo: 11,
    time: "06:05 PM",
    activity: "Sharing Memories/Views of SBSEC/SBSSTC/SBSSU",
    category: "memories",
    highlight: true,
  },
  {
    srNo: 12,
    time: "06:10 PM",
    activity: "Singing with Band",
    category: "music",
  },
  {
    srNo: 13,
    time: "06:15 PM",
    activity: "Sharing Memories/Views of SBSEC/SBSSTC/SBSSU",
    category: "memories",
    highlight: true,
  },
  {
    srNo: 14,
    time: "06:25 PM",
    activity: "Singing",
    category: "music",
  },
  {
    srNo: 15,
    time: "06:30 PM",
    activity: "Stand-up Comedy",
    category: "comedy",
  },
  {
    srNo: 16,
    time: "06:35 PM",
    activity: "Alumni Slot",
    category: "alumni",
  },
  {
    srNo: 17,
    time: "06:45 PM",
    activity: "Duet Singing",
    category: "music",
  },
  {
    srNo: 18,
    time: "06:55 PM",
    activity: "Alumni Slot",
    category: "alumni",
  },
  {
    srNo: 19,
    time: "07:00 PM",
    activity: "Duet Dance",
    category: "dance",
  },
  {
    srNo: 20,
    time: "07:05 PM",
    activity: "Bhangra Boys and Girls",
    category: "dance",
    highlight: true,
  },
  {
    srNo: 21,
    time: "07:15 PM",
    activity: "Reserved for Alumni",
    category: "alumni",
    highlight: true,
  },
  {
    srNo: 22,
    time: "08:15 PM",
    activity: "Alumni Interaction with Hon’ble Vice-Chancellor",
    dignitaries: "Hon’ble Vice Chancellor, Dr. Suresh Kumar Sharma",
    category: "alumni",
    highlight: true,
  },
  {
    srNo: 23,
    time: "08:30 PM",
    activity: "Closing Remarks and Vote of Thanks",
    category: "ceremony",
  },
  {
    srNo: 24,
    time: "08:45 PM",
    activity: "Gala Dinner & Alumni Meet",
    category: "dinner",
    highlight: true,
  },
];

const CATEGORIES = [
  { id: "all", label: "All Events", icon: Sparkles },
  { id: "ceremony", label: "Ceremonial & Speeches", icon: Mic },
  { id: "dance", label: "Dance & Bhangra", icon: PartyPopper },
  { id: "music", label: "Music & Band", icon: Music },
  { id: "alumni", label: "Alumni Slots & Interaction", icon: GraduationCap },
  { id: "memories", label: "Memories & Nostalgia", icon: Heart },
  { id: "dinner", label: "Gala Dinner", icon: Utensils },
];

export default function ScheduleClient() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [viewMode, setViewMode] = useState<"timeline" | "table">("timeline");
  const [copiedLink, setCopiedLink] = useState(false);

  const filteredItems = useMemo(() => {
    return PROGRAMME_ITEMS.filter((item) => {
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.activity.toLowerCase().includes(q) ||
        item.time.toLowerCase().includes(q) ||
        (item.dignitaries && item.dignitaries.toLowerCase().includes(q));

      const matchesCat =
        activeCategory === "all" ||
        (activeCategory === "ceremony" && (item.category === "ceremony" || item.category === "speech")) ||
        item.category === activeCategory;

      return matchesSearch && matchesCat;
    });
  }, [search, activeCategory]);

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const handleShare = async () => {
    if (typeof window !== "undefined") {
      if (navigator.share) {
        try {
          await navigator.share({
            title: "1st Alumni Meet 2026 Schedule • SBSSU Ferozepur",
            text: "Check out the Minute-to-Minute Programme for the 1st Alumni Meet 2026 & Sanjh 2026 at Shaheed Bhagat Singh State University, Ferozepur.",
            url: window.location.href,
          });
        } catch {
          // User cancelled or share failed
        }
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      }
    }
  };

  const getBadgeStyle = (category: ScheduleItem["category"]) => {
    switch (category) {
      case "ceremony":
      case "speech":
        return "bg-amber-100 text-amber-900 border-amber-200";
      case "dance":
        return "bg-rose-100 text-rose-900 border-rose-200";
      case "music":
        return "bg-purple-100 text-purple-900 border-purple-200";
      case "alumni":
        return "bg-orange-100 text-orange-950 border-orange-200";
      case "memories":
        return "bg-blue-100 text-blue-900 border-blue-200";
      case "comedy":
        return "bg-yellow-100 text-yellow-900 border-yellow-200";
      case "dinner":
        return "bg-emerald-100 text-emerald-900 border-emerald-200";
      default:
        return "bg-zinc-100 text-zinc-800 border-zinc-200";
    }
  };

  const getCategoryLabel = (category: ScheduleItem["category"]) => {
    switch (category) {
      case "ceremony":
        return "Inaugural";
      case "speech":
        return "Key Address";
      case "dance":
        return "Dance Performance";
      case "music":
        return "Musical Act";
      case "alumni":
        return "Alumni Slot";
      case "memories":
        return "Memories & Nostalgia";
      case "comedy":
        return "Stand-Up Comedy";
      case "dinner":
        return "Gala Feast";
      default:
        return "Event";
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FDFBF7]">
      {/* Hero Header Banner */}
      <section className="relative overflow-hidden bg-gradient-to-r from-orange-600 via-amber-600 to-emerald-700 text-white py-12 sm:py-16">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider text-orange-100 border border-white/20 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Official Event Programme
          </div>

          <div className="space-y-1">
            <p className="text-xs sm:text-sm font-semibold tracking-wider uppercase text-orange-100">
              Shaheed Bhagat Singh State University, Ferozepur
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white drop-shadow-xs">
              1st Alumni Meet 2026
            </h1>
            <p className="text-sm sm:text-lg text-orange-50 font-medium">
              Tentative Minute-to-Minute Programme • Sanjh 2026 Cultural Extravaganza
            </p>
          </div>

          {/* Event Quick Meta Pills */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs font-semibold">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/25 backdrop-blur-md text-orange-100 border border-white/10">
              <Calendar className="w-3.5 h-3.5 text-orange-300" />
              November 14, 2026
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/25 backdrop-blur-md text-orange-100 border border-white/10">
              <Clock className="w-3.5 h-3.5 text-amber-300" />
              05:00 PM – 09:30 PM IST
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/25 backdrop-blur-md text-orange-100 border border-white/10">
              <MapPin className="w-3.5 h-3.5 text-emerald-300" />
              University Auditorium & Campus Lawns, SBSSU Ferozepur
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            <Link
              href="/sanjh-2026/register"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-orange-800 hover:bg-orange-50 font-bold text-xs sm:text-sm shadow-md transition-all hover:scale-102"
            >
              <GraduationCap className="w-4 h-4 text-orange-600" />
              <span>Register for Alumni Meet</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-semibold text-xs sm:text-sm border border-white/30 backdrop-blur-md transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Print Programme</span>
            </button>

            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-semibold text-xs sm:text-sm border border-white/30 backdrop-blur-md transition-all"
            >
              <Share2 className="w-4 h-4" />
              <span>{copiedLink ? "Link Copied!" : "Share"}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 flex-1">
        {/* Dignitary Highlights Banner */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-3xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/80 shadow-2xs space-y-2 relative overflow-hidden">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-800">
              <Award className="w-4 h-4 text-amber-600" />
              Chief Guest Inaugural Address & Interaction
            </div>
            <h3 className="text-lg font-black text-zinc-900">
              Hon’ble Vice Chancellor, Dr. Suresh Kumar Sharma
            </h3>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Delivering the Inaugural Keynote at <strong>05:15 PM</strong>, followed by a dedicated interactive dialogue with alumni across all batches (SBSCET, SBSSTC, SBSSU) at <strong>08:15 PM</strong>.
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-gradient-to-br from-orange-50 to-emerald-50 border border-orange-200/80 shadow-2xs space-y-2 relative overflow-hidden">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-800">
              <Mic className="w-4 h-4 text-orange-600" />
              Official Welcome Address
            </div>
            <h3 className="text-lg font-black text-zinc-900">
              Dr. Gazalpreet Arneja, ME
            </h3>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Welcoming back alumni delegates, distinguished faculty members, and student performers at <strong>05:10 PM</strong> to open the 1st Alumni Meet celebrations.
            </p>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white rounded-3xl border border-zinc-200 p-4 sm:p-6 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-zinc-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by activity, time, or dignitary name..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
              />
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 p-1 bg-zinc-100 rounded-xl self-start sm:self-auto shrink-0">
              <button
                onClick={() => setViewMode("timeline")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === "timeline"
                    ? "bg-white text-zinc-900 shadow-2xs"
                    : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                <ListOrdered className="w-3.5 h-3.5 text-orange-600" />
                <span>Timeline View</span>
              </button>

              <button
                onClick={() => setViewMode("table")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === "table"
                    ? "bg-white text-zinc-900 shadow-2xs"
                    : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                <TableIcon className="w-3.5 h-3.5 text-emerald-600" />
                <span>Programme Table</span>
              </button>
            </div>
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? "bg-orange-600 text-white shadow-2xs"
                      : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-[11px] text-zinc-500 border-t border-zinc-100 pt-3">
            <span>
              Showing <strong>{filteredItems.length}</strong> of {PROGRAMME_ITEMS.length} programme events
            </span>
            {(search || activeCategory !== "all") && (
              <button
                onClick={() => {
                  setSearch("");
                  setActiveCategory("all");
                }}
                className="text-orange-600 hover:underline font-semibold"
              >
                Reset filters
              </button>
            )}
          </div>
        </div>

        {/* VIEW 1: TIMELINE VIEW */}
        {viewMode === "timeline" && (
          <div className="space-y-4">
            {filteredItems.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-zinc-200 space-y-2">
                <Search className="w-8 h-8 text-zinc-300 mx-auto" />
                <h3 className="font-bold text-zinc-700 text-sm">No schedule events found</h3>
                <p className="text-xs text-zinc-400">
                  Try adjusting your search keyword or clearing the category filter.
                </p>
              </div>
            ) : (
              <div className="relative border-l-2 border-orange-200 ml-4 sm:ml-8 pl-6 sm:pl-8 space-y-4 py-2">
                {filteredItems.map((item) => {
                  const isHighlighted = item.highlight;
                  return (
                    <div
                      key={item.srNo}
                      className="relative group animate-in fade-in duration-200"
                    >
                      {/* Timeline Node Icon */}
                      <div
                        className={`absolute -left-[35px] sm:-left-[43px] top-4 w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center font-bold text-[10px] sm:text-xs transition-transform group-hover:scale-110 shadow-2xs ${
                          isHighlighted
                            ? "bg-orange-600 border-white text-white ring-4 ring-orange-100"
                            : "bg-white border-orange-300 text-orange-700 ring-2 ring-orange-50"
                        }`}
                      >
                        {item.srNo}
                      </div>

                      {/* Content Card */}
                      <div
                        className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                          isHighlighted
                            ? "bg-white border-orange-300 shadow-sm hover:border-orange-400"
                            : "bg-white/80 border-zinc-200 hover:bg-white hover:border-zinc-300"
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 font-mono font-bold text-xs sm:text-sm text-orange-700 bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-200/80">
                              <Clock className="w-3.5 h-3.5 text-orange-600" />
                              {item.time}
                            </span>

                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${getBadgeStyle(
                                item.category
                              )}`}
                            >
                              {getCategoryLabel(item.category)}
                            </span>
                          </div>

                          <span className="text-[11px] font-mono text-zinc-400">
                            Slot #{item.srNo}
                          </span>
                        </div>

                        <div className="mt-2.5">
                          <h3 className="text-base sm:text-lg font-bold text-zinc-900 group-hover:text-orange-700 transition-colors">
                            {item.activity}
                          </h3>

                          {item.dignitaries && (
                            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 border border-amber-200/80 text-xs text-amber-950 font-semibold">
                              <Award className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                              <span>Dignitary: {item.dignitaries}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: OFFICIAL PROGRAMME TABLE VIEW */}
        {viewMode === "table" && (
          <div className="bg-white rounded-3xl border border-zinc-200 shadow-2xs overflow-hidden print:border-none print:shadow-none">
            <div className="p-4 sm:p-6 bg-zinc-50 border-b border-zinc-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-bold text-zinc-900">
                  Official Minute-to-Minute Programme Table
                </h2>
                <p className="text-xs text-zinc-500">
                  Shaheed Bhagat Singh State University, Ferozepur • 1st Alumni Meet 2026
                </p>
              </div>

              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-orange-100 text-orange-800">
                Tentative Schedule
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="bg-zinc-100 border-b border-zinc-200 text-zinc-600 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4 w-16 text-center">Sr. No.</th>
                    <th className="py-3 px-4 w-32">Time</th>
                    <th className="py-3 px-6">Activity</th>
                    <th className="py-3 px-6">Dignitaries</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {filteredItems.map((item) => (
                    <tr
                      key={item.srNo}
                      className={`hover:bg-orange-50/40 transition-colors ${
                        item.highlight ? "bg-orange-50/20 font-medium" : ""
                      }`}
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-center text-zinc-700">
                        {item.srNo}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-orange-700 whitespace-nowrap">
                        {item.time}
                      </td>
                      <td className="py-3.5 px-6 font-semibold text-zinc-900">
                        {item.activity}
                      </td>
                      <td className="py-3.5 px-6 text-zinc-700">
                        {item.dignitaries ? (
                          <span className="inline-flex items-center gap-1 font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            {item.dignitaries}
                          </span>
                        ) : (
                          <span className="text-zinc-300">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Note & Guidelines Callout */}
        <div className="p-6 rounded-3xl bg-white border border-zinc-200 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 font-bold text-sm text-zinc-900">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Programme Information & Important Guidelines for Alumni
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-zinc-600 leading-relaxed">
            <ul className="space-y-1.5 list-disc list-inside">
              <li>Please arrive by <strong>04:30 PM</strong> for registration confirmation and souvenir kit collection.</li>
              <li>Alumni performing in designated slots are requested to report to the stage coordinator by <strong>04:45 PM</strong>.</li>
              <li>Participation certificates will be awarded to all alumni and student cultural function performers.</li>
            </ul>
            <ul className="space-y-1.5 list-disc list-inside">
              <li>Hon’ble Vice-Chancellor will host an open-floor alumni interaction session at <strong>08:15 PM</strong>.</li>
              <li>Gala Dinner will be served in the campus lawns at <strong>08:45 PM</strong>.</li>
              <li>Schedule is tentative and subject to minor adjustments on stage.</li>
            </ul>
          </div>
        </div>

        {/* Bottom CTA Card */}
        <div className="rounded-3xl bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 text-white p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
          <div className="space-y-1 text-center md:text-left">
            <h2 className="text-xl sm:text-2xl font-black">
              Ready to Join Sanjh 2026?
            </h2>
            <p className="text-xs sm:text-sm text-orange-100 max-w-xl">
              Confirm your registration for the 1st Alumni Meet. Passes include admission, auditorium seating, gala dinner, and official souvenir kit.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/sanjh-2026/register"
              className="px-6 py-3 rounded-xl bg-white hover:bg-orange-50 text-orange-800 font-extrabold text-xs sm:text-sm shadow-sm transition-all"
            >
              Register as Alumni & Get Meet Pass
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
