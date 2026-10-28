"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { getAllRegistrations } from "@/lib/actions/alumniActions";
import type { AlumniRegistration } from "@/lib/types";
import {
  Users,
  Search,
  Filter,
  Download,
  CheckCircle2,
  Clock,
  ArrowRight,
  ExternalLink,
  Loader2,
  Music,
  Award,
  RefreshCw,
  GraduationCap,
  Ticket,
  ShieldCheck,
  XCircle,
  Sparkles,
} from "lucide-react";

export default function RegistrationsTable({
  title = "SBSSU Alumni Registrations & Event Passes",
  initialFilter = "all",
}: {
  title?: string;
  initialFilter?: "all" | "pass" | "free" | "performers";
}) {
  const [registrations, setRegistrations] = useState<AlumniRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [tabFilter, setTabFilter] = useState<"all" | "pass" | "free" | "performers">(initialFilter);
  const [checkInFilter, setCheckInFilter] = useState<"all" | "checkedIn" | "notCheckedIn">("all");

  const loadData = () => {
    setRefreshing(true);
    getAllRegistrations()
      .then((res) => {
        if (res.success && res.data) {
          setRegistrations(res.data);
        }
      })
      .catch((err) => console.error("Error fetching registrations:", err))
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute category counts
  const counts = useMemo(() => {
    const total = registrations.length;
    const passCount = registrations.filter(
      (r) => r.hasPass || r.passStatus === "active" || r.paymentStatus === "completed"
    ).length;
    const freeCount = total - passCount;
    const performerCount = registrations.filter(
      (r) => r.performerStatus && r.performerStatus !== "none"
    ).length;
    return { total, passCount, freeCount, performerCount };
  }, [registrations]);

  const filteredRegistrations = useMemo(() => {
    return registrations.filter((reg) => {
      // Search
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        reg.fullName?.toLowerCase().includes(q) ||
        reg.email?.toLowerCase().includes(q) ||
        reg.phone?.toLowerCase().includes(q) ||
        reg.regNumber?.toLowerCase().includes(q) ||
        reg.rollNumber?.toLowerCase().includes(q) ||
        reg.organization?.toLowerCase().includes(q) ||
        reg.currentDesignation?.toLowerCase().includes(q);

      // Pass / Tab filter
      const hasPass = Boolean(
        reg.hasPass || reg.passStatus === "active" || reg.paymentStatus === "completed"
      );
      const matchesTab =
        tabFilter === "all"
          ? true
          : tabFilter === "pass"
          ? hasPass
          : tabFilter === "free"
          ? !hasPass
          : reg.performerStatus && reg.performerStatus !== "none";

      // Gate Check-in
      const matchesCheckIn =
        checkInFilter === "all"
          ? true
          : checkInFilter === "checkedIn"
          ? reg.checkedIn
          : !reg.checkedIn;

      return matchesSearch && matchesTab && matchesCheckIn;
    });
  }, [registrations, search, tabFilter, checkInFilter]);

  const handleExportCSV = () => {
    if (filteredRegistrations.length === 0) return;

    const headers = [
      "Registration Number",
      "Full Name",
      "Email",
      "Phone",
      "Degree",
      "Branch",
      "Passing Year",
      "Era",
      "Current Designation",
      "Company/Org",
      "Has Event Pass (₹1000)",
      "Pass Status",
      "Stage Performer Status",
      "Act Title",
      "Gate Checked-In",
      "Created At",
    ];

    const rows = filteredRegistrations.map((r) => {
      const hasPass = Boolean(
        r.hasPass || r.passStatus === "active" || r.paymentStatus === "completed"
      );
      return [
        `"${r.regNumber}"`,
        `"${r.fullName}"`,
        `"${r.email}"`,
        `"${r.phone}"`,
        `"${r.degree}"`,
        `"${r.branch}"`,
        `"${r.passingYear || ''}"`,
        `"${r.era || ''}"`,
        `"${r.currentDesignation || ''}"`,
        `"${r.organization || ''}"`,
        hasPass ? "Yes (₹1,000 Paid)" : "No (Free Registered)",
        `"${r.passStatus || (hasPass ? 'active' : 'none')}"`,
        `"${r.performerStatus || 'none'}"`,
        `"${r.performanceApplication?.title || ''}"`,
        r.checkedIn ? "Yes" : "No",
        `"${r.createdAt}"`,
      ];
    });

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `SBSSU_Alumni_Directory_${tabFilter}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Title and Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
            {title}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500">
            University alumni database records (Free) and Sanjh 2026 Event Passes (₹1,000).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={loadData}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-zinc-50 text-zinc-700 font-semibold text-xs border border-zinc-200 shadow-2xs transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>

          <button
            onClick={handleExportCSV}
            disabled={filteredRegistrations.length === 0}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-2xs disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV ({filteredRegistrations.length})
          </button>
        </div>
      </div>

      {/* FILTER TABS: All, Pass Holders, Free Registered, Performers */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-zinc-200/60 rounded-2xl w-full sm:w-fit">
        <button
          onClick={() => setTabFilter("all")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            tabFilter === "all"
              ? "bg-white text-zinc-900 shadow-xs"
              : "text-zinc-600 hover:text-zinc-900"
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>All Registered Alumni</span>
          <span className="text-[10px] bg-zinc-100 text-zinc-600 px-1.5 py-0.2 rounded-full font-mono">
            {counts.total}
          </span>
        </button>

        <button
          onClick={() => setTabFilter("pass")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            tabFilter === "pass"
              ? "bg-orange-600 text-white shadow-xs"
              : "text-orange-800 hover:text-orange-950 hover:bg-orange-100/50"
          }`}
        >
          <Ticket className="w-3.5 h-3.5" />
          <span>Pass Active (₹1,000)</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              tabFilter === "pass"
                ? "bg-white/20 text-white"
                : "bg-orange-100 text-orange-900"
            }`}
          >
            {counts.passCount}
          </span>
        </button>

        <button
          onClick={() => setTabFilter("free")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            tabFilter === "free"
              ? "bg-zinc-800 text-white shadow-xs"
              : "text-zinc-600 hover:text-zinc-900"
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5" />
          <span>Registered Only (No Pass)</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              tabFilter === "free"
                ? "bg-white/20 text-white"
                : "bg-zinc-200 text-zinc-700"
            }`}
          >
            {counts.freeCount}
          </span>
        </button>

        <button
          onClick={() => setTabFilter("performers")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            tabFilter === "performers"
              ? "bg-amber-600 text-white shadow-xs"
              : "text-amber-800 hover:text-amber-950 hover:bg-amber-100/50"
          }`}
        >
          <Music className="w-3.5 h-3.5" />
          <span>Stage Performers</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              tabFilter === "performers"
                ? "bg-white/20 text-white"
                : "bg-amber-100 text-amber-900"
            }`}
          >
            {counts.performerCount}
          </span>
        </button>
      </div>

      {/* Sub-Filters Card */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-4 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, roll number, organization, designation..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-zinc-200 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Gate Check-in Filter */}
          <div>
            <select
              value={checkInFilter}
              onChange={(e) => setCheckInFilter(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">All Gate Check-In Statuses</option>
              <option value="checkedIn">Checked-In at Gate</option>
              <option value="notCheckedIn">Not Yet Checked-In</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-1">
          <span>
            Displaying <strong>{filteredRegistrations.length}</strong> records
          </span>
          {(search || tabFilter !== "all" || checkInFilter !== "all") && (
            <button
              onClick={() => {
                setSearch("");
                setTabFilter("all");
                setCheckInFilter("all");
              }}
              className="text-orange-600 hover:underline font-semibold"
            >
              Reset all filters
            </button>
          )}
        </div>
      </div>

      {/* Registrations Table */}
      <div className="bg-white rounded-3xl border border-zinc-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
            <p className="text-xs text-zinc-500">Loading registrations from Firestore...</p>
          </div>
        ) : filteredRegistrations.length === 0 ? (
          <div className="py-20 text-center space-y-2">
            <Users className="w-10 h-10 text-zinc-300 mx-auto" />
            <h3 className="font-bold text-zinc-700 text-sm">No records match filter criteria</h3>
            <p className="text-xs text-zinc-400">
              Try resetting the tab filter or search query.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Alumni Reg ID</th>
                  <th className="py-3 px-4">Alumnus Name</th>
                  <th className="py-3 px-4">Contact Details</th>
                  <th className="py-3 px-4">Academic & Batch</th>
                  <th className="py-3 px-4">Professional Profile</th>
                  <th className="py-3 px-4">Event Pass (₹1,000)</th>
                  <th className="py-3 px-4">Stage Performer</th>
                  <th className="py-3 px-4">Venue Check-In</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredRegistrations.map((reg) => {
                  const hasPass = Boolean(
                    reg.hasPass || reg.passStatus === "active" || reg.paymentStatus === "completed"
                  );
                  const isPerformer = reg.performerStatus && reg.performerStatus !== "none";
                  const perfStatus = reg.performerStatus || "none";

                  return (
                    <tr
                      key={reg.id}
                      className="hover:bg-orange-50/20 transition-colors group"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-zinc-900">
                        <Link
                          href={`/admin/alumni-registrations/${reg.id}`}
                          className="hover:text-orange-600 underline decoration-zinc-300"
                        >
                          {reg.regNumber}
                        </Link>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-zinc-900">{reg.fullName}</div>
                        {reg.rollNumber && (
                          <div className="text-[10px] font-mono text-zinc-400">
                            Roll: {reg.rollNumber}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="text-zinc-700">{reg.email}</div>
                        <div className="text-[11px] text-zinc-400">{reg.phone}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-zinc-800">
                          {reg.degree} – {reg.branch}
                        </div>
                        <span className="inline-block text-[10px] text-zinc-500">
                          Batch of {reg.passingYear} ({reg.era})
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-zinc-600 max-w-[150px] truncate">
                        <div className="truncate font-medium">{reg.currentDesignation || "—"}</div>
                        <div className="text-[10px] text-zinc-400 truncate">{reg.organization || "—"}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        {hasPass ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <Ticket className="w-3 h-3 text-emerald-700" />
                            Pass Active (₹1,000)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-100 text-zinc-600 border border-zinc-200">
                            No Pass (Registered Only)
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        {perfStatus === "approved" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 font-bold text-[10px] border border-emerald-300">
                            <Sparkles className="w-3 h-3 text-emerald-700" />
                            ★ Approved Performer
                          </span>
                        ) : perfStatus === "pending" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-bold text-[10px] border border-amber-300">
                            <Clock className="w-3 h-3 text-amber-700" />
                            Pending Review
                          </span>
                        ) : perfStatus === "rejected" ? (
                          <span className="text-zinc-400 text-[10px]">
                            Rejected (Attendee)
                          </span>
                        ) : (
                          <span className="text-zinc-400 text-[10px]">
                            Attendee
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        {reg.checkedIn ? (
                          <div className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>Checked-In</span>
                          </div>
                        ) : (
                          <span className="text-zinc-400 text-[10px]">
                            Not at venue
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/admin/alumni-registrations/${reg.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-zinc-100 hover:bg-orange-600 text-zinc-700 hover:text-white font-semibold text-[11px] transition-colors"
                        >
                          Details
                          <ArrowRight className="w-3 h-3" />
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
    </div>
  );
}
