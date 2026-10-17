"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { getAllRegistrations } from "@/lib/actions/alumniActions";
import type { AlumniRegistration, RegistrantType } from "@/lib/types";
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
  BookOpen,
} from "lucide-react";

export default function RegistrationsTable({
  title = "Sanjh 2026 & Alumni Registrations",
  initialTypeFilter = "all",
}: {
  title?: string;
  initialTypeFilter?: "all" | "alumni" | "student";
}) {
  const [registrations, setRegistrations] = useState<AlumniRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "alumni" | "student">(initialTypeFilter);
  const [paymentFilter, setPaymentFilter] = useState<"all" | "completed" | "pending">("all");
  const [culturalFilter, setCulturalFilter] = useState<string>("all");

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
  const alumniCount = useMemo(
    () => registrations.filter((r) => r.registrantType === "alumni").length,
    [registrations]
  );
  const studentCount = useMemo(
    () => registrations.filter((r) => r.registrantType === "student").length,
    [registrations]
  );

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
        reg.organization?.toLowerCase().includes(q);

      // Type Filter (Alumni vs Student)
      const matchesType =
        typeFilter === "all" || reg.registrantType === typeFilter;

      // Payment
      const matchesPayment =
        paymentFilter === "all" ||
        (paymentFilter === "completed"
          ? reg.paymentStatus === "completed" || reg.paymentStatus === "free"
          : reg.paymentStatus === "pending");

      // Cultural
      const matchesCultural =
        culturalFilter === "all"
          ? true
          : culturalFilter === "performer"
          ? reg.culturalInterest && reg.culturalInterest !== "none"
          : reg.culturalInterest === "none";

      return matchesSearch && matchesType && matchesPayment && matchesCultural;
    });
  }, [registrations, search, typeFilter, paymentFilter, culturalFilter]);

  const handleExportCSV = () => {
    if (filteredRegistrations.length === 0) return;

    const headers = [
      "Registration Number",
      "Type",
      "Full Name",
      "Email",
      "Phone",
      "Degree",
      "Branch",
      "Batch/Semester",
      "Roll Number",
      "Era/Residence",
      "Designation/Org",
      "Cultural Interest",
      "Cultural Details",
      "Amount Paid",
      "Payment Status",
      "Checked In",
      "Created At",
    ];

    const rows = filteredRegistrations.map((r) => [
      `"${r.regNumber}"`,
      `"${r.registrantType.toUpperCase()}"`,
      `"${r.fullName}"`,
      `"${r.email}"`,
      `"${r.phone}"`,
      `"${r.degree}"`,
      `"${r.branch}"`,
      `"${r.registrantType === 'student' ? (r.currentSemester || '') : (r.passingYear || '')}"`,
      `"${r.rollNumber || ''}"`,
      `"${r.registrantType === 'student' ? (r.hostelOrDayScholar || '') : (r.era || '')}"`,
      `"${r.currentDesignation ? `${r.currentDesignation} at ${r.organization || ''}` : ''}"`,
      `"${r.culturalInterest}"`,
      `"${r.culturalDetails || ''}"`,
      r.amount,
      `"${r.paymentStatus}"`,
      r.checkedIn ? "Yes" : "No",
      `"${r.createdAt}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `SBSSU_Registrations_${typeFilter}_${new Date().toISOString().slice(0, 10)}.csv`
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
            Manage registrations for Alumni (₹1,000) and Students (Free) for Sanjh 2026.
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

      {/* FILTER TABS: All, Alumni, Students */}
      <div className="flex items-center gap-2 p-1.5 bg-zinc-200/60 rounded-2xl w-full sm:w-fit">
        <button
          onClick={() => setTypeFilter("all")}
          className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            typeFilter === "all"
              ? "bg-white text-zinc-900 shadow-xs"
              : "text-zinc-600 hover:text-zinc-900"
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>All Registrations</span>
          <span className="text-[10px] bg-zinc-100 text-zinc-600 px-1.5 py-0.2 rounded-full font-mono">
            {registrations.length}
          </span>
        </button>

        <button
          onClick={() => setTypeFilter("alumni")}
          className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            typeFilter === "alumni"
              ? "bg-orange-600 text-white shadow-xs"
              : "text-orange-800 hover:text-orange-950 hover:bg-orange-100/50"
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5" />
          <span>Alumni (₹1,000)</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              typeFilter === "alumni"
                ? "bg-white/20 text-white"
                : "bg-orange-100 text-orange-900"
            }`}
          >
            {alumniCount}
          </span>
        </button>

        <button
          onClick={() => setTypeFilter("student")}
          className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            typeFilter === "student"
              ? "bg-emerald-600 text-white shadow-xs"
              : "text-emerald-800 hover:text-emerald-950 hover:bg-emerald-100/50"
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Students (Free)</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              typeFilter === "student"
                ? "bg-white/20 text-white"
                : "bg-emerald-100 text-emerald-900"
            }`}
          >
            {studentCount}
          </span>
        </button>
      </div>

      {/* Sub-Filters Card */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-4 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, roll number, organization..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-zinc-200 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Payment Filter */}
          <div>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">All Payment Statuses</option>
              <option value="completed">Confirmed / Paid (or Student Free)</option>
              <option value="pending">Pending Payment</option>
            </select>
          </div>

          {/* Cultural Filter */}
          <div>
            <select
              value={culturalFilter}
              onChange={(e) => setCulturalFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">All Participation Types</option>
              <option value="performer">Performers Only (Cert. Eligible)</option>
              <option value="audience">Audience / Non-Performer</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-1">
          <span>
            Displaying <strong>{filteredRegistrations.length}</strong> {typeFilter} records
          </span>
          {(search || paymentFilter !== "all" || culturalFilter !== "all" || typeFilter !== "all") && (
            <button
              onClick={() => {
                setSearch("");
                setTypeFilter("all");
                setPaymentFilter("all");
                setCulturalFilter("all");
              }}
              className="text-orange-600 hover:underline font-semibold"
            >
              Reset all filters
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-zinc-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
            <p className="text-xs text-zinc-500">Loading registrations from Firestore...</p>
          </div>
        ) : filteredRegistrations.length === 0 ? (
          <div className="py-20 text-center space-y-2">
            <Users className="w-10 h-10 text-zinc-300 mx-auto" />
            <h3 className="font-bold text-zinc-700 text-sm">No registrations match criteria</h3>
            <p className="text-xs text-zinc-400">
              Try changing the filter from &ldquo;{typeFilter}&rdquo; or clear the search input.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Pass ID</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Applicant Name</th>
                  <th className="py-3 px-4">Contact Details</th>
                  <th className="py-3 px-4">Academic & Branch</th>
                  <th className="py-3 px-4">Work / Hostel</th>
                  <th className="py-3 px-4">SECA Cultural Act</th>
                  <th className="py-3 px-4">Fee</th>
                  <th className="py-3 px-4">Pass Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredRegistrations.map((reg) => {
                  const isStu = reg.registrantType === "student";
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
                        {isStu ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <BookOpen className="w-3 h-3 text-emerald-700" />
                            Student
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-800 border border-orange-200">
                            <GraduationCap className="w-3 h-3 text-orange-700" />
                            Alumni
                          </span>
                        )}
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
                          {isStu
                            ? reg.currentSemester || "Current Student"
                            : `Batch of ${reg.passingYear} (${reg.era})`}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-zinc-600 max-w-[140px] truncate">
                        {isStu ? (
                          <span className="text-xs text-zinc-600">{reg.hostelOrDayScholar || "Day Scholar"}</span>
                        ) : (
                          <>
                            <div className="truncate font-medium">{reg.currentDesignation || "—"}</div>
                            <div className="text-[10px] text-zinc-400 truncate">{reg.organization || "—"}</div>
                          </>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        {reg.culturalInterest && reg.culturalInterest !== "none" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-bold text-[10px]">
                            <Music className="w-3 h-3 text-amber-700" />
                            {reg.culturalInterest}
                          </span>
                        ) : (
                          <span className="text-zinc-400 text-[11px]">Audience</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-bold">
                        {isStu ? (
                          <span className="text-emerald-700">₹0 (Free)</span>
                        ) : (
                          <span className="text-orange-700">₹{reg.amount}</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                            reg.paymentStatus === "completed" || reg.paymentStatus === "free"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {reg.paymentStatus === "completed" || reg.paymentStatus === "free"
                            ? "✓ Active Pass"
                            : "⏳ Pending"}
                        </span>
                        {reg.checkedIn && (
                          <div className="text-[10px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span>Checked-In {reg.verifiedBy ? `(${reg.verifiedBy.split("@")[0]})` : ""}</span>
                          </div>
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
