"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  getRegistrationStats,
  getAllRegistrations,
} from "@/lib/actions/alumniActions";
import type { AlumniRegistration } from "@/lib/types";
import {
  Users,
  CheckCircle2,
  Clock,
  IndianRupee,
  Music,
  GraduationCap,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Sparkles,
  Loader2,
  Ticket,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    total: 0,
    paid: 0,
    pending: 0,
    totalRevenue: 0,
    culturalParticipants: 0,
    inPersonAttendees: 0,
  });
  const [recentRegistrations, setRecentRegistrations] = useState<AlumniRegistration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getRegistrationStats(), getAllRegistrations()])
      .then(([statsRes, allRegsRes]) => {
        setStats(statsRes);
        if (allRegsRes.success && allRegsRes.data) {
          setRecentRegistrations(allRegsRes.data.slice(0, 5));
        }
      })
      .catch((err) => console.error("Error loading dashboard data:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-orange-700 bg-orange-100/70 px-2.5 py-0.5 rounded-full mb-1">
              <Sparkles className="w-3.5 h-3.5 text-orange-600" />
              Sanjh 2026 Admin Central
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
              Alumni & Event Overview
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500">
              Live statistics from Firestore for Sanjh 2026 and Alumni Registrations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/alumni-registrations"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs transition-colors shadow-2xs"
            >
              <Users className="w-4 h-4" />
              View All Registrations Table
            </Link>
            <Link
              href="/admin/admins"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-zinc-50 text-zinc-700 font-semibold text-xs border border-zinc-200 shadow-2xs transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Manage Authorized Admins
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
            <span className="text-xs text-zinc-500">Loading live dashboard metrics...</span>
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Total Registrations */}
              <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-2xs flex items-center justify-between">
                <div>
                  <span className="text-xs text-zinc-500 font-medium">Total Registrations</span>
                  <div className="text-2xl sm:text-3xl font-black text-zinc-900 mt-1">
                    {stats.total}
                  </div>
                  <span className="text-[11px] text-zinc-400">All eras combined</span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
              </div>

              {/* Card 2: Revenue Collected */}
              <div className="bg-white rounded-2xl border border-emerald-200 p-5 shadow-2xs flex items-center justify-between">
                <div>
                  <span className="text-xs text-emerald-800 font-medium">Paid Registrations</span>
                  <div className="text-2xl sm:text-3xl font-black text-emerald-950 mt-1">
                    ₹{stats.totalRevenue.toLocaleString()}
                  </div>
                  <span className="text-[11px] text-emerald-700 font-medium">
                    {stats.paid} Confirmed ({stats.pending} Pending)
                  </span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <IndianRupee className="w-6 h-6" />
                </div>
              </div>

              {/* Card 3: Cultural Performers */}
              <div className="bg-white rounded-2xl border border-amber-200 p-5 shadow-2xs flex items-center justify-between">
                <div>
                  <span className="text-xs text-amber-900 font-medium">SECA Cultural Acts</span>
                  <div className="text-2xl sm:text-3xl font-black text-amber-950 mt-1">
                    {stats.culturalParticipants}
                  </div>
                  <span className="text-[11px] text-amber-700 font-medium">
                    Certificate Eligible
                  </span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                  <Music className="w-6 h-6" />
                </div>
              </div>

              {/* Card 4: In-Person Expected */}
              <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-2xs flex items-center justify-between">
                <div>
                  <span className="text-xs text-zinc-500 font-medium">Expected Headcount</span>
                  <div className="text-2xl sm:text-3xl font-black text-zinc-900 mt-1">
                    {stats.inPersonAttendees}
                  </div>
                  <span className="text-[11px] text-zinc-400">Attendees + Guests</span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-zinc-100 text-zinc-700 flex items-center justify-center">
                  <Calendar className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Quick Table of Recent Registrations */}
            <div className="bg-white rounded-3xl border border-zinc-200 p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                <div>
                  <h2 className="text-base font-bold text-zinc-900">
                    Recent Alumni Registrations
                  </h2>
                  <p className="text-xs text-zinc-500">
                    Latest submissions received on the portal.
                  </p>
                </div>
                <Link
                  href="/admin/alumni-registrations"
                  className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1"
                >
                  View full table <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {recentRegistrations.length === 0 ? (
                <div className="py-12 text-center space-y-2">
                  <p className="text-xs text-zinc-500">No registrations found yet in Firestore.</p>
                  <Link
                    href="/register"
                    className="inline-flex text-xs text-orange-600 font-semibold hover:underline"
                  >
                    Create the first alumni registration
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-zinc-100 text-zinc-400 font-semibold">
                        <th className="py-2.5 px-3">Reg ID</th>
                        <th className="py-2.5 px-3">Full Name</th>
                        <th className="py-2.5 px-3">Email & Phone</th>
                        <th className="py-2.5 px-3">Batch & Era</th>
                        <th className="py-2.5 px-3">Cultural Act</th>
                        <th className="py-2.5 px-3">Payment</th>
                        <th className="py-2.5 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {recentRegistrations.map((reg) => (
                        <tr key={reg.id} className="hover:bg-zinc-50/60 transition-colors">
                          <td className="py-3 px-3 font-mono font-bold text-zinc-800">
                            {reg.regNumber}
                          </td>
                          <td className="py-3 px-3 font-semibold text-zinc-900">
                            {reg.fullName}
                          </td>
                          <td className="py-3 px-3 text-zinc-500">
                            <div>{reg.email}</div>
                            <div className="text-[11px] text-zinc-400">{reg.phone}</div>
                          </td>
                          <td className="py-3 px-3 text-zinc-700">
                            <div>{reg.passingYear} ({reg.era})</div>
                            <div className="text-[11px] text-zinc-400">{reg.branch}</div>
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`px-2 py-0.5 rounded-md font-medium text-[11px] ${
                                reg.culturalInterest !== "none"
                                  ? "bg-amber-100 text-amber-800 font-semibold"
                                  : "text-zinc-500"
                              }`}
                            >
                              {reg.culturalInterest}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold text-[10px] ${
                                reg.paymentStatus === "completed"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {reg.paymentStatus === "completed" ? "✓ Paid" : "⏳ Pending"}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <Link
                              href={`/admin/alumni-registrations/${reg.id}`}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-orange-100 text-zinc-700 hover:text-orange-900 font-medium text-[11px] transition-colors"
                            >
                              Details
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
  );
}
