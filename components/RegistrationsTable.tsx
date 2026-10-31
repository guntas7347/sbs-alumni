"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { getAllRegistrations } from "@/lib/actions/alumniActions";
import { verifyAlumniPayment } from "@/lib/actions/adminActions";
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
  AlertTriangle,
  FileImage,
  X,
  Check,
  Eye,
  Camera,
} from "lucide-react";

export default function RegistrationsTable({
  title = "SBSSU Alumni Registrations & Event Passes",
  initialFilter = "all",
}: {
  title?: string;
  initialFilter?: "all" | "pass" | "free" | "performers" | "pending_upi" | "duplicates";
}) {
  const [registrations, setRegistrations] = useState<AlumniRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actingOnId, setActingOnId] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [tabFilter, setTabFilter] = useState<
    "all" | "pass" | "free" | "performers" | "pending_upi" | "duplicates"
  >(initialFilter);
  const [checkInFilter, setCheckInFilter] = useState<"all" | "checkedIn" | "notCheckedIn">("all");

  // Screenshot viewer modal
  const [viewScreenshot, setViewScreenshot] = useState<{
    url: string;
    reg: AlumniRegistration;
  } | null>(null);

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

  // 1. Client-Side Duplicate txnId Detection
  const { duplicateTxnMap, duplicateRecordsCount } = useMemo(() => {
    const txnMap: Record<string, string[]> = {}; // normalizedTxn -> list of regNumbers
    registrations.forEach((reg) => {
      const tid = reg.txnId?.trim().toLowerCase();
      if (tid && tid !== "none" && tid !== "n/a" && tid !== "free") {
        if (!txnMap[tid]) txnMap[tid] = [];
        txnMap[tid].push(reg.regNumber);
      }
    });

    const dupes: Record<string, number> = {};
    let totalDupeRecords = 0;
    Object.entries(txnMap).forEach(([tid, list]) => {
      if (list.length > 1) {
        dupes[tid] = list.length;
        totalDupeRecords += list.length;
      }
    });

    return { duplicateTxnMap: dupes, duplicateRecordsCount: totalDupeRecords };
  }, [registrations]);

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
    const pendingUpiCount = registrations.filter(
      (r) => r.txnId && !r.verified && r.paymentStatus !== "completed"
    ).length;

    return {
      total,
      passCount,
      freeCount,
      performerCount,
      pendingUpiCount,
      duplicateCount: duplicateRecordsCount,
    };
  }, [registrations, duplicateRecordsCount]);

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
        reg.currentDesignation?.toLowerCase().includes(q) ||
        reg.txnId?.toLowerCase().includes(q);

      // Pass / Tab filter
      const hasPass = Boolean(
        reg.hasPass || reg.passStatus === "active" || reg.paymentStatus === "completed"
      );
      const isPendingUpi = Boolean(reg.txnId && !reg.verified && reg.paymentStatus !== "completed");
      const normalizedTxn = reg.txnId?.trim().toLowerCase() || "";
      const isDuplicate = Boolean(normalizedTxn && duplicateTxnMap[normalizedTxn] > 1);

      let matchesTab = true;
      if (tabFilter === "pass") matchesTab = hasPass;
      else if (tabFilter === "free") matchesTab = !hasPass;
      else if (tabFilter === "performers")
        matchesTab = Boolean(reg.performerStatus && reg.performerStatus !== "none");
      else if (tabFilter === "pending_upi") matchesTab = isPendingUpi;
      else if (tabFilter === "duplicates") matchesTab = isDuplicate;

      // Gate Check-in
      const matchesCheckIn =
        checkInFilter === "all"
          ? true
          : checkInFilter === "checkedIn"
          ? reg.checkedIn
          : !reg.checkedIn;

      return matchesSearch && matchesTab && matchesCheckIn;
    });
  }, [registrations, search, tabFilter, checkInFilter, duplicateTxnMap]);

  // Handle Verify / Unverify toggle
  const handleToggleVerifyPayment = async (
    reg: AlumniRegistration,
    targetVerified: boolean
  ) => {
    if (actingOnId) return;

    const actionText = targetVerified
      ? `Verify UPI payment of ₹1,000 for ${reg.fullName} (Txn: ${reg.txnId || "N/A"}) and email their official Sanjh 2026 Pass?`
      : `Unverify payment for ${reg.fullName}? This will revoke their active pass.`;

    if (!confirm(actionText)) return;

    setActingOnId(reg.id);
    try {
      const res = await verifyAlumniPayment(reg.id, targetVerified, "", "Admin");
      if (res.success) {
        // Update local state
        setRegistrations((prev) =>
          prev.map((r) =>
            r.id === reg.id
              ? {
                  ...r,
                  verified: targetVerified,
                  hasPass: targetVerified,
                  passStatus: targetVerified ? "active" : "none",
                  paymentStatus: targetVerified ? "completed" : "pending",
                  amount: targetVerified ? 1000 : r.amount,
                }
              : r
          )
        );

        if (viewScreenshot && viewScreenshot.reg.id === reg.id) {
          setViewScreenshot({
            ...viewScreenshot,
            reg: {
              ...viewScreenshot.reg,
              verified: targetVerified,
              hasPass: targetVerified,
              paymentStatus: targetVerified ? "completed" : "pending",
            },
          });
        }
      } else {
        alert(res.error || "Failed to update payment verification.");
      }
    } catch (err: any) {
      alert(err?.message || "An error occurred during verification.");
    } finally {
      setActingOnId(null);
    }
  };

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
      "Attending Meet",
      "Guest Count",
      "Accompanying Family Guests (Mom/Dad/Spouse/Child)",
      "Has Event Pass (₹1000)",
      "Pass Status",
      "Payment Verified",
      "UPI Txn ID",
      "Payment Mode",
      "Is Duplicate Txn",
      "Stage Performer Status",
      "Act Title",
      "Gate Checked-In",
      "Created At",
    ];

    const rows = filteredRegistrations.map((r) => {
      const hasPass = Boolean(
        r.hasPass || r.passStatus === "active" || r.paymentStatus === "completed"
      );
      const normalizedTxn = r.txnId?.trim().toLowerCase() || "";
      const isDupe = Boolean(normalizedTxn && duplicateTxnMap[normalizedTxn] > 1);

      const guestsFormatted =
        r.guests && r.guests.length > 0
          ? r.guests.map((g) => `${g.name} (${g.relation})`).join("; ")
          : "None";

      return [
        `"${r.regNumber}"`,
        `"${r.fullName}"`,
        `"${r.email}"`,
        `"${r.phone}"`,
        `"${r.degree}"`,
        `"${r.branch}"`,
        `"${r.passingYear || ""}"`,
        `"${r.era || ""}"`,
        `"${r.currentDesignation || ""}"`,
        `"${r.organization || ""}"`,
        r.attendingMeet !== false ? "Yes (Attending)" : "No (Register Only)",
        `"${r.guests?.length ?? r.guestCount ?? 0}"`,
        `"${guestsFormatted}"`,
        hasPass ? "Yes (₹1,000 Paid)" : "No (Free Registered)",
        `"${r.passStatus || (hasPass ? "active" : "none")}"`,
        r.verified ? "Yes" : "No",
        `"${r.txnId || ""}"`,
        `"${r.paymentMode || ""}"`,
        isDupe ? "DUPLICATE" : "Unique",
        `"${r.performerStatus || "none"}"`,
        `"${r.performanceApplication?.title || ""}"`,
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
      `sbssu_alumni_registrations_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-900 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-orange-600" />
            SBSSU Alumni Directory & Sanjh 2026 Admin
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
            {title}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Manual verification console for UPI QR payments, duplicate Txn ID detection, and digital pass management.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            disabled={refreshing}
            className="p-2.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 transition-colors shadow-2xs"
            title="Refresh from Firestore"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-orange-600" : ""}`} />
          </button>

          <button
            onClick={handleExportCSV}
            disabled={filteredRegistrations.length === 0}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-2xs disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV ({filteredRegistrations.length})
          </button>
        </div>
      </div>

      {/* CLIENT-SIDE DUPLICATE TXN ID CRITICAL ALERT BANNER */}
      {duplicateRecordsCount > 0 && (
        <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-4 sm:p-5 text-rose-950 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-200 text-rose-800 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-rose-700 animate-pulse" />
            </div>
            <div className="space-y-0.5">
              <h3 className="font-extrabold text-sm text-rose-900 flex items-center gap-2">
                <span>⚠️ Duplicate Transaction ID Alert Detected!</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-200 text-rose-900">
                  {duplicateRecordsCount} Record(s) Affected
                </span>
              </h3>
              <p className="text-xs text-rose-800">
                Multiple registrations share identical UPI Transaction IDs. Check screenshots carefully to avoid approving fraudulent submissions. Duplicate rows are highlighted in red below.
              </p>
            </div>
          </div>

          <button
            onClick={() => setTabFilter("duplicates")}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition-colors shrink-0 shadow-2xs"
          >
            View Duplicates Only ({duplicateRecordsCount})
          </button>
        </div>
      )}

      {/* FILTER TABS */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-zinc-200/60 rounded-2xl w-full">
        <button
          onClick={() => setTabFilter("all")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            tabFilter === "all"
              ? "bg-white text-zinc-900 shadow-xs"
              : "text-zinc-600 hover:text-zinc-900"
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>All Registrations</span>
          <span className="text-[10px] bg-zinc-100 text-zinc-600 px-1.5 py-0.2 rounded-full font-mono">
            {counts.total}
          </span>
        </button>

        <button
          onClick={() => setTabFilter("pending_upi")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            tabFilter === "pending_upi"
              ? "bg-amber-600 text-white shadow-xs"
              : "text-amber-900 hover:bg-amber-100/50"
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Pending Verification</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              tabFilter === "pending_upi"
                ? "bg-white/20 text-white"
                : "bg-amber-100 text-amber-900"
            }`}
          >
            {counts.pendingUpiCount}
          </span>
        </button>

        {counts.duplicateCount > 0 && (
          <button
            onClick={() => setTabFilter("duplicates")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              tabFilter === "duplicates"
                ? "bg-rose-600 text-white shadow-xs"
                : "text-rose-800 hover:bg-rose-100/50"
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Duplicate Txn IDs</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                tabFilter === "duplicates"
                  ? "bg-white/20 text-white"
                  : "bg-rose-200 text-rose-950 font-bold"
              }`}
            >
              {counts.duplicateCount}
            </span>
          </button>
        )}

        <button
          onClick={() => setTabFilter("pass")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            tabFilter === "pass"
              ? "bg-emerald-700 text-white shadow-xs"
              : "text-emerald-900 hover:bg-emerald-100/50"
          }`}
        >
          <Ticket className="w-3.5 h-3.5" />
          <span>Pass Active (₹1,000)</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              tabFilter === "pass"
                ? "bg-white/20 text-white"
                : "bg-emerald-100 text-emerald-900"
            }`}
          >
            {counts.passCount}
          </span>
        </button>

        <button
          onClick={() => setTabFilter("free")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            tabFilter === "free"
              ? "bg-zinc-800 text-white shadow-xs"
              : "text-zinc-600 hover:text-zinc-900"
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5" />
          <span>Free Registered</span>
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
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            tabFilter === "performers"
              ? "bg-orange-600 text-white shadow-xs"
              : "text-orange-900 hover:bg-orange-100/50"
          }`}
        >
          <Music className="w-3.5 h-3.5" />
          <span>Performers</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
              tabFilter === "performers"
                ? "bg-white/20 text-white"
                : "bg-orange-100 text-orange-900"
            }`}
          >
            {counts.performerCount}
          </span>
        </button>
      </div>

      {/* Sub-Filters Search Bar */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-4 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, roll number, Txn ID, organization..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-zinc-200 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

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

      {/* Main Registrations Table */}
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
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Batch & Degree</th>
                  <th className="py-3 px-4">UPI Payment & Txn ID</th>
                  <th className="py-3 px-4">Pass Status</th>
                  <th className="py-3 px-4">Verification</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredRegistrations.map((reg) => {
                  const hasPass = Boolean(
                    reg.hasPass || reg.passStatus === "active" || reg.paymentStatus === "completed"
                  );
                  const isVerified = Boolean(reg.verified === true);
                  const normalizedTxn = reg.txnId?.trim().toLowerCase() || "";
                  const isDuplicate = Boolean(normalizedTxn && duplicateTxnMap[normalizedTxn] > 1);
                  const dupeCount = isDuplicate ? duplicateTxnMap[normalizedTxn] : 0;
                  const isProcessing = actingOnId === reg.id;

                  return (
                    <tr
                      key={reg.id}
                      className={`transition-colors group ${
                        isDuplicate
                          ? "bg-rose-50/70 border-l-4 border-l-rose-500 hover:bg-rose-100/60"
                          : "hover:bg-orange-50/30"
                      }`}
                    >
                      {/* Column 1: Reg ID */}
                      <td className="py-3.5 px-4 font-mono font-bold text-zinc-900">
                        <Link
                          href={`/admin/alumni-registrations/${reg.id}`}
                          className="hover:text-orange-600 underline decoration-zinc-300"
                        >
                          {reg.regNumber}
                        </Link>
                        {isDuplicate && (
                          <div className="mt-1">
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-black bg-rose-600 text-white animate-pulse">
                              <AlertTriangle className="w-2.5 h-2.5" />
                              DUPLICATE TXN ({dupeCount})
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Column 2: Name */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-zinc-900">{reg.fullName}</div>
                        {reg.rollNumber && (
                          <div className="text-[10px] font-mono text-zinc-400">
                            Roll: {reg.rollNumber}
                          </div>
                        )}
                        {reg.attendingMeet === false && (
                          <div className="mt-1">
                            <span className="inline-block text-[9px] font-bold text-zinc-500 bg-zinc-100 border border-zinc-200 px-1.5 py-0.5 rounded">
                              Directory Info Only
                            </span>
                          </div>
                        )}
                        {reg.guests && reg.guests.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            <span
                              title={reg.guests.map((g) => `${g.name} (${g.relation})`).join(", ")}
                              className="inline-flex items-center gap-1 text-[9px] bg-orange-50 text-orange-800 font-medium px-1.5 py-0.5 rounded border border-orange-200 cursor-help"
                            >
                              +{reg.guests.length} Guest{reg.guests.length > 1 ? "s" : ""}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Column 3: Contact */}
                      <td className="py-3.5 px-4">
                        <div className="text-zinc-700">{reg.email}</div>
                        <div className="text-[11px] text-zinc-400">{reg.phone}</div>
                      </td>

                      {/* Column 4: Academic */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-zinc-800">
                          {reg.degree} – {reg.branch}
                        </div>
                        <span className="inline-block text-[10px] text-zinc-500">
                          Batch of {reg.passingYear} ({reg.era})
                        </span>
                      </td>

                      {/* Column 5: UPI Payment & Txn ID */}
                      <td className="py-3.5 px-4">
                        {reg.txnId ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-bold text-zinc-900 text-[11px] bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">
                                {reg.txnId}
                              </span>
                              {isDuplicate && (
                                <span
                                  title={`Duplicate: ${dupeCount} applications share this exact Transaction ID`}
                                  className="text-rose-600"
                                >
                                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-zinc-500">
                                Mode: <strong>{reg.paymentMode || "UPI_QR"}</strong>
                              </span>

                              {/* Screenshot viewer button */}
                              {reg.screenshotUrl && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setViewScreenshot({
                                      url: reg.screenshotUrl!,
                                      reg,
                                    })
                                  }
                                  className="inline-flex items-center gap-1 text-[10px] text-orange-600 hover:text-orange-700 font-bold bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200"
                                >
                                  <FileImage className="w-3 h-3" />
                                  <span>SS</span>
                                </button>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-zinc-400 text-[11px] italic">
                            No UPI payment submitted
                          </span>
                        )}
                      </td>

                      {/* Column 6: Pass Status */}
                      <td className="py-3.5 px-4">
                        {hasPass ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <Ticket className="w-3 h-3 text-emerald-700" />
                            Pass Active (₹1,000)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-100 text-zinc-600 border border-zinc-200">
                            No Pass (Free)
                          </span>
                        )}
                      </td>

                      {/* Column 7: Manual Verification Actions (Verify <-> Unverify) */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          {isVerified ? (
                            <div className="flex items-center gap-1">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                Verified
                              </span>
                              <button
                                type="button"
                                disabled={isProcessing}
                                onClick={() => handleToggleVerifyPayment(reg, false)}
                                className="px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-100 hover:bg-rose-100 text-zinc-600 hover:text-rose-800 border border-zinc-200 transition-colors"
                                title="Click to unverify and revoke pass"
                              >
                                {isProcessing ? "..." : "Unverify"}
                              </button>
                            </div>
                          ) : reg.txnId ? (
                            <button
                              type="button"
                              disabled={isProcessing}
                              onClick={() => handleToggleVerifyPayment(reg, true)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-extrabold bg-amber-500 hover:bg-emerald-600 text-white transition-colors shadow-2xs"
                            >
                              {isProcessing ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <ShieldCheck className="w-3 h-3" />
                              )}
                              <span>Verify & Issue</span>
                            </button>
                          ) : (
                            <span className="text-zinc-400 text-[10px]">Unpaid</span>
                          )}
                        </div>
                      </td>

                      {/* Column 8: Actions */}
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

      {/* MODAL: PAYMENT SCREENSHOT VIEWER & QUICK VERIFICATION */}
      {viewScreenshot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl border border-zinc-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-orange-700">
                  Payment Screenshot Verification
                </span>
                <h3 className="text-base font-extrabold text-zinc-900">
                  {viewScreenshot.reg.fullName} ({viewScreenshot.reg.regNumber})
                </h3>
              </div>
              <button
                onClick={() => setViewScreenshot(null)}
                className="p-1.5 rounded-full hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Duplicate Alert in Modal if applicable */}
            {viewScreenshot.reg.txnId &&
              duplicateTxnMap[viewScreenshot.reg.txnId.trim().toLowerCase()] > 1 && (
                <div className="p-3.5 rounded-xl bg-rose-50 border-2 border-rose-300 text-rose-950 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                  <div>
                    <strong>CRITICAL WARNING: DUPLICATE TRANSACTION ID!</strong>
                    <p className="text-[11px] text-rose-800">
                      The Transaction ID <code>{viewScreenshot.reg.txnId}</code> is submitted by{" "}
                      {duplicateTxnMap[viewScreenshot.reg.txnId.trim().toLowerCase()]} different applicants. Verify if this receipt was previously claimed!
                    </p>
                  </div>
                </div>
              )}

            {/* Metadata Summary */}
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs">
              <div>
                <span className="text-zinc-400 block text-[10px]">Entered Txn ID:</span>
                <span className="font-mono font-bold text-zinc-900">
                  {viewScreenshot.reg.txnId || "None"}
                </span>
              </div>
              <div>
                <span className="text-zinc-400 block text-[10px]">Payment Mode:</span>
                <span className="font-semibold text-zinc-800">
                  {viewScreenshot.reg.paymentMode || "UPI_QR"} (₹1,000)
                </span>
              </div>
              <div>
                <span className="text-zinc-400 block text-[10px]">Current Verification:</span>
                <span
                  className={`font-bold ${
                    viewScreenshot.reg.verified ? "text-emerald-700" : "text-amber-700"
                  }`}
                >
                  {viewScreenshot.reg.verified ? "✓ Verified" : "⏳ Pending Verification"}
                </span>
              </div>
              <div>
                <span className="text-zinc-400 block text-[10px]">Attendee Email:</span>
                <span className="font-mono text-[11px] text-zinc-800 truncate block">
                  {viewScreenshot.reg.email}
                </span>
              </div>
            </div>

            {/* Screenshot Full Image */}
            <div className="relative w-full h-80 sm:h-96 rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-300 shadow-inner">
              <Image
                src={viewScreenshot.url}
                alt="Payment Screenshot"
                fill
                className="object-contain"
              />
            </div>

            <div className="flex items-center justify-between text-xs text-zinc-500 pt-1">
              <a
                href={viewScreenshot.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-bold text-orange-600 hover:text-orange-700 underline"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Open original in full window
              </a>

              {/* Action buttons inside modal */}
              <div className="flex items-center gap-2">
                {viewScreenshot.reg.verified ? (
                  <button
                    type="button"
                    disabled={actingOnId === viewScreenshot.reg.id}
                    onClick={() => handleToggleVerifyPayment(viewScreenshot.reg, false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 transition-colors"
                  >
                    Unverify Payment
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={actingOnId === viewScreenshot.reg.id}
                    onClick={() => handleToggleVerifyPayment(viewScreenshot.reg, true)}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <Check className="w-4 h-4" />
                    Verify & Send Pass HTML Email
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setViewScreenshot(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
