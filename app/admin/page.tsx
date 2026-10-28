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
  Award,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalRegistered: 0,
    passHolders: 0,
    registeredOnly: 0,
    totalRevenue: 0,
    performersApplied: 0,
    performersApproved: 0,
    inPersonAttendees: 0,
  });
  const [recentRegistrations, setRecentRegistrations] = useState<AlumniRegistration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getRegistrationStats(), getAllRegistrations()])
      .then(([statsRes, allRegsRes]) => {
        setStats(statsRes as any);
        if (allRegsRes.success && allRegsRes.data) {
          setRecentRegistrations(allRegsRes.data.slice(0, 6));
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
            Live metrics from Firestore: Free Alumni Directory Registrations & ₹1,000 Meet Passes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/admin/performers"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition-colors shadow-2xs"
          >
            <Music className="w-4 h-4" />
            Stage Performers ({stats.performersApplied})
          </Link>
          <Link
            href="/admin/alumni-registrations"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs transition-colors shadow-2xs"
          >
            <Users className="w-4 h-4" />
            Alumni Directory Table
          </Link>
          <Link
            href="/admin/admins"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-zinc-50 text-zinc-700 font-semibold text-xs border border-zinc-200 shadow-2xs transition-colors"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Faculty & Admins
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
            {/* Card 1: Total Alumni Registered */}
            <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-xs text-zinc-500 font-medium">Registered Alumni</span>
                <div className="text-2xl sm:text-3xl font-black text-zinc-900 mt-1">
                  {stats.totalRegistered}
                </div>
                <span className="text-[11px] text-zinc-400">
                  {stats.registeredOnly} Free only • {stats.passHolders} with Meet Pass
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                <GraduationCap className="w-6 h-6" />
              </div>
            </div>

            {/* Card 2: Meet Passes & Revenue */}
            <div className="bg-white rounded-2xl border border-emerald-200 p-5 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-xs text-emerald-800 font-medium">Active Meet Passes (₹1,000)</span>
                <div className="text-2xl sm:text-3xl font-black text-emerald-950 mt-1">
                  ₹{stats.totalRevenue.toLocaleString()}
                </div>
                <span className="text-[11px] text-emerald-700 font-medium">
                  {stats.passHolders} Verified Event Passes
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Ticket className="w-6 h-6" />
              </div>
            </div>

            {/* Card 3: Stage Performers */}
            <Link
              href="/admin/performers"
              className="bg-white rounded-2xl border border-amber-200 p-5 shadow-2xs flex items-center justify-between hover:border-amber-400 transition-all group"
            >
              <div>
                <span className="text-xs text-amber-900 font-medium">Stage Performer Requests</span>
                <div className="text-2xl sm:text-3xl font-black text-amber-950 mt-1">
                  {stats.performersApplied}
                </div>
                <span className="text-[11px] text-amber-700 font-medium group-hover:underline">
                  {stats.performersApproved} Approved • Review Requests →
                </span>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Music className="w-6 h-6" />
              </div>
            </Link>

            {/* Card 4: In-Person Expected */}
            <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-xs text-zinc-500 font-medium">Expected Headcount</span>
                <div className="text-2xl sm:text-3xl font-black text-zinc-900 mt-1">
                  {stats.inPersonAttendees}
                </div>
                <span className="text-[11px] text-zinc-400">Delegates + Guests</span>
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
                  Latest university registrations and event pass acquisitions.
                </p>
              </div>
              <Link
                href="/admin/alumni-registrations"
                className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center gap-1"
              >
                View full directory <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {recentRegistrations.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <p className="text-xs text-zinc-500">No registrations found yet in Firestore.</p>
                <Link
                  href="/sanjh-2026/register"
                  className="inline-flex text-xs text-orange-600 font-semibold hover:underline"
                >
                  Create an alumni registration
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-zinc-100 text-zinc-400 font-semibold">
                      <th className="py-2.5 px-3">Alumni Reg ID</th>
                      <th className="py-2.5 px-3">Full Name</th>
                      <th className="py-2.5 px-3">Email & Phone</th>
                      <th className="py-2.5 px-3">Batch & Era</th>
                      <th className="py-2.5 px-3">Meet Pass (₹1,000)</th>
                      <th className="py-2.5 px-3">Performer Status</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {recentRegistrations.map((reg) => {
                      const hasPass = Boolean(
                        reg.hasPass || reg.passStatus === "active" || reg.paymentStatus === "completed"
                      );
                      return (
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
                            <div>Class of {reg.passingYear} ({reg.era})</div>
                            <div className="text-[11px] text-zinc-400">{reg.branch}</div>
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                                hasPass
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-zinc-100 text-zinc-600"
                              }`}
                            >
                              {hasPass ? "✓ Pass Active (₹1,000)" : "No Pass (Free)"}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            {reg.performerStatus === "approved" ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 font-bold text-[10px]">
                                ★ Approved Performer
                              </span>
                            ) : reg.performerStatus === "pending" ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-bold text-[10px]">
                                ⏳ Review Pending
                              </span>
                            ) : (
                              <span className="text-zinc-400 text-[10px]">Attendee</span>
                            )}
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
                      );
                    })}
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
