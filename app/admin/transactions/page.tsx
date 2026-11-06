"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { getAllRegistrations } from "@/lib/actions/alumniActions";
import { verifyAlumniPayment } from "@/lib/actions/adminActions";
import type { AlumniRegistration } from "@/lib/types";
import {
  Ticket,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ExternalLink,
  Loader2,
  RefreshCw,
  AlertTriangle,
  X,
  Camera,
  Users,
  Eye,
  ArrowRight,
  ShieldAlert,
  Sparkles,
} from "lucide-react";

type TxnFilter = "all" | "pending" | "verified" | "duplicates";

export default function AdminTransactionsPage() {
  const [registrations, setRegistrations] = useState<AlumniRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<TxnFilter>("all");
  const [actingOnId, setActingOnId] = useState<string | null>(null);

  // Full screenshot preview modal
  const [previewScreenshotUrl, setPreviewScreenshotUrl] = useState<
    string | null
  >(null);

  const loadData = () => {
    setRefreshing(true);
    getAllRegistrations()
      .then((res) => {
        if (res.success && res.data) {
          setRegistrations(res.data);
        }
      })
      .catch((err) => console.error("Error loading transactions:", err))
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  // 1. Client-Side Duplicate TxnId Detection
  const { duplicateTxnMap, duplicateRecordsCount } = useMemo(() => {
    const txnMap: Record<string, string[]> = {}; // normalizedTxn -> list of regNumbers
    registrations.forEach((reg) => {
      const tid = reg.txnId?.trim().toLowerCase();
      if (
        tid &&
        tid !== "none" &&
        tid !== "n/a" &&
        tid !== "free" &&
        tid !== "0"
      ) {
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

  // Filter transactions: only registrations where payment proof was uploaded or verified
  const transactionsList = useMemo(() => {
    return registrations.filter((r) =>
      Boolean(
        r.verified ||
        (r.txnId && r.txnId.trim()) ||
        (r.screenshotUrl && r.screenshotUrl.trim()),
      ),
    );
  }, [registrations]);

  // Counts for tabs
  const counts = useMemo(() => {
    const total = transactionsList.length;
    const verifiedCount = transactionsList.filter(
      (r) => r.verified || r.hasPass || r.passStatus === "active",
    ).length;
    const pendingCount = total - verifiedCount;
    const duplicateCount = transactionsList.filter((r) => {
      const tid = r.txnId?.trim().toLowerCase();
      return tid && (duplicateTxnMap[tid] || 0) > 1;
    }).length;

    return {
      total,
      verifiedCount,
      pendingCount,
      duplicateCount,
    };
  }, [transactionsList, duplicateTxnMap]);

  // Filtered & Searched list
  const filteredList = useMemo(() => {
    let list = [...transactionsList];

    if (filter === "verified") {
      list = list.filter(
        (r) => r.verified || r.hasPass || r.passStatus === "active",
      );
    } else if (filter === "pending") {
      list = list.filter(
        (r) => !r.verified && !r.hasPass && r.passStatus !== "active",
      );
    } else if (filter === "duplicates") {
      list = list.filter((r) => {
        const tid = r.txnId?.trim().toLowerCase();
        return tid && (duplicateTxnMap[tid] || 0) > 1;
      });
    }

    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter((r) => {
        const text = [
          r.fullName,
          r.email,
          r.phone,
          r.regNumber,
          r.txnId,
          r.paymentMode,
          r.amount,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return text.includes(q);
      });
    }

    return list;
  }, [transactionsList, filter, search, duplicateTxnMap]);

  // Verify or Unverify Handler
  const handleToggleVerification = async (
    reg: AlumniRegistration,
    newStatus: boolean,
  ) => {
    setActingOnId(reg.id);
    try {
      const res = await verifyAlumniPayment(reg.id, newStatus, "", "Admin");
      if (res.success) {
        setRegistrations((prev) =>
          prev.map((r) =>
            r.id === reg.id
              ? {
                  ...r,
                  verified: newStatus,
                  hasPass: newStatus,
                  passStatus: newStatus ? "active" : "none",
                  amount: newStatus ? "500" : r.amount,
                }
              : r,
          ),
        );
      } else {
        alert(res.error || "Failed to update payment status.");
      }
    } catch (err: any) {
      alert(err?.message || "An unexpected error occurred.");
    } finally {
      setActingOnId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-orange-700 bg-orange-100/70 px-2.5 py-0.5 rounded-full mb-1">
            <Sparkles className="w-3.5 h-3.5 text-orange-600" />
            Admin Central • Transactions
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
            UPI Payments & Transactions
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500">
            Verify UPI QR payments, detect duplicate transaction IDs in
            real-time, inspect payment receipts, and issue or revoke Sanjh 2026
            Meet Passes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-zinc-50 text-zinc-700 font-semibold text-xs border border-zinc-200 shadow-2xs transition-all disabled:opacity-50"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-orange-600" : ""}`}
            />
            Refresh
          </button>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-black text-white font-semibold text-xs shadow-2xs transition-colors"
          >
            <Users className="w-3.5 h-3.5" />
            All Registrations
          </Link>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => setFilter("all")}
          className={`p-4 rounded-2xl border text-left transition-all ${
            filter === "all"
              ? "bg-orange-50/80 border-orange-300 ring-2 ring-orange-400"
              : "bg-white border-zinc-200 hover:border-zinc-300"
          }`}
        >
          <span className="text-[11px] font-semibold text-zinc-500 block">
            Total Transactions
          </span>
          <div className="text-xl sm:text-2xl font-black text-zinc-900 mt-0.5">
            {counts.total}
          </div>
          <span className="text-[10px] text-zinc-400">
            ₹1,000 meet pass submissions
          </span>
        </button>

        <button
          onClick={() => setFilter("verified")}
          className={`p-4 rounded-2xl border text-left transition-all ${
            filter === "verified"
              ? "bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-400"
              : "bg-white border-zinc-200 hover:border-zinc-300"
          }`}
        >
          <span className="text-[11px] font-semibold text-emerald-800 block">
            Verified & Issued
          </span>
          <div className="text-xl sm:text-2xl font-black text-emerald-950 mt-0.5">
            {counts.verifiedCount}
          </div>
          <span className="text-[10px] text-emerald-700">
            ₹{(counts.verifiedCount * 500).toLocaleString()} collected
          </span>
        </button>

        <button
          onClick={() => setFilter("pending")}
          className={`p-4 rounded-2xl border text-left transition-all ${
            filter === "pending"
              ? "bg-amber-50/80 border-amber-300 ring-2 ring-amber-400"
              : "bg-white border-zinc-200 hover:border-zinc-300"
          }`}
        >
          <span className="text-[11px] font-semibold text-amber-900 block">
            Pending Verification
          </span>
          <div className="text-xl sm:text-2xl font-black text-amber-950 mt-0.5">
            {counts.pendingCount}
          </div>
          <span className="text-[10px] text-amber-700">Needs admin check</span>
        </button>

        <button
          onClick={() => setFilter("duplicates")}
          className={`p-4 rounded-2xl border text-left transition-all ${
            filter === "duplicates"
              ? "bg-rose-50/80 border-rose-300 ring-2 ring-rose-400"
              : "bg-white border-zinc-200 hover:border-zinc-300"
          }`}
        >
          <span className="text-[11px] font-semibold text-rose-800 block flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" /> Duplicate
            Txn IDs
          </span>
          <div className="text-xl sm:text-2xl font-black text-rose-950 mt-0.5">
            {counts.duplicateCount}
          </div>
          <span className="text-[10px] text-rose-700">
            Suspicious duplicates
          </span>
        </button>
      </div>

      {/* Duplicate Warning Callout if any */}
      {counts.duplicateCount > 0 && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold block">
              Attention: {counts.duplicateCount} record
              {counts.duplicateCount > 1 ? "s" : ""} share identical Transaction
              IDs!
            </span>
            <p className="text-rose-800 leading-relaxed">
              Different users submitted the same UPI Transaction ID. Review
              payment screenshots carefully before approving passes to prevent
              fraud.
            </p>
          </div>
        </div>
      )}

      {/* Search and Filters Bar */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-4 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Txn ID, Alumnus Name, Email, Phone, Reg #..."
              className="w-full pl-9 pr-8 py-2 rounded-xl border border-zinc-200 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500 bg-zinc-50/50 font-mono"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="text-xs text-zinc-500 font-medium">
            Showing <strong>{filteredList.length}</strong> of{" "}
            {transactionsList.length} transactions
          </div>
        </div>

        {/* Tab Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-zinc-100 text-xs">
          <span className="text-zinc-400 text-[11px] mr-1 font-semibold">
            Filter:
          </span>
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
              filter === "all"
                ? "bg-zinc-900 text-white"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            }`}
          >
            All ({counts.total})
          </button>
          <button
            onClick={() => setFilter("verified")}
            className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
              filter === "verified"
                ? "bg-emerald-700 text-white"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            }`}
          >
            Verified ({counts.verifiedCount})
          </button>
          <button
            onClick={() => setFilter("pending")}
            className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
              filter === "pending"
                ? "bg-amber-600 text-white"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            }`}
          >
            Pending Verification ({counts.pendingCount})
          </button>
          <button
            onClick={() => setFilter("duplicates")}
            className={`px-3 py-1 rounded-lg font-semibold transition-colors flex items-center gap-1 ${
              filter === "duplicates"
                ? "bg-rose-600 text-white"
                : "bg-rose-50 text-rose-800 hover:bg-rose-100"
            }`}
          >
            <AlertTriangle className="w-3 h-3" />
            Duplicates Only ({counts.duplicateCount})
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 bg-white rounded-2xl border border-zinc-200">
          <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
          <p className="text-xs text-zinc-500 font-medium">
            Loading UPI transactions from Firestore...
          </p>
        </div>
      ) : filteredList.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-zinc-200 p-8 space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-zinc-100 text-zinc-400 flex items-center justify-center">
            <Ticket className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-zinc-900">
            No transactions found
          </h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            {search
              ? `No transactions match your search query "${search}".`
              : "No transactions match this filter."}
          </p>
          {search && (
            <button
              onClick={() => setSearch("")}
              className="text-xs font-semibold text-orange-700 hover:underline"
            >
              Clear Search
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 text-zinc-600 font-bold uppercase tracking-wider text-[10px] border-b border-zinc-200">
                <tr>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Transaction ID (Txn ID)</th>
                  <th className="py-3 px-4">Alumnus Details</th>
                  <th className="py-3 px-4">Screenshot</th>
                  <th className="py-3 px-4">Amount & Mode</th>
                  <th className="py-3 px-4">Verification</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {filteredList.map((reg) => {
                  const tid = reg.txnId?.trim().toLowerCase();
                  const isDuplicate = Boolean(
                    tid && (duplicateTxnMap[tid] || 0) > 1,
                  );
                  const isVerified =
                    reg.verified || reg.hasPass || reg.passStatus === "active";
                  const isActing = actingOnId === reg.id;

                  return (
                    <tr
                      key={reg.id}
                      className={`hover:bg-orange-50/30 transition-colors ${
                        isDuplicate ? "bg-rose-50/40" : ""
                      }`}
                    >
                      {/* Date & Time */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-zinc-900">
                          {reg.createdAt
                            ? new Date(reg.createdAt).toLocaleDateString()
                            : "—"}
                        </div>
                        <div className="text-[10px] text-zinc-400">
                          {reg.createdAt
                            ? new Date(reg.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : ""}
                        </div>
                      </td>

                      {/* Transaction ID with Duplicate Highlight */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-zinc-900 break-all">
                          {reg.txnId || (
                            <span className="text-zinc-400 italic">
                              Not entered
                            </span>
                          )}
                        </div>
                        {isDuplicate && (
                          <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white shadow-xs">
                            <AlertTriangle className="w-3 h-3" /> Duplicate (
                            {duplicateTxnMap[tid!]} entries)
                          </div>
                        )}
                        <div className="text-[10px] text-zinc-400 mt-0.5 font-mono">
                          {reg.regNumber}
                        </div>
                      </td>

                      {/* Alumnus */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-zinc-900">
                          {reg.fullName}
                        </div>
                        <div className="text-[11px] text-zinc-500 font-mono">
                          {reg.email}
                        </div>
                        <div className="text-[10px] text-zinc-400">
                          {reg.phone}
                        </div>
                      </td>

                      {/* Screenshot Preview */}
                      <td className="py-3.5 px-4">
                        {reg.screenshotUrl ? (
                          <div
                            onClick={() =>
                              setPreviewScreenshotUrl(reg.screenshotUrl || null)
                            }
                            className="relative w-12 h-12 rounded-lg overflow-hidden border border-zinc-200 bg-zinc-100 cursor-pointer hover:opacity-80 transition-opacity"
                            title="Click to view full screenshot"
                          >
                            <img
                              src={reg.screenshotUrl}
                              alt="Receipt"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <span className="text-[10px] text-zinc-400 italic">
                            No receipt
                          </span>
                        )}
                      </td>

                      {/* Amount & Mode */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-zinc-900">
                          ₹{reg.amount || "500"}
                        </div>
                        <div className="text-[10px] text-zinc-500 font-semibold">
                          {reg.paymentMode || "UPI_QR"}
                        </div>
                      </td>

                      {/* Verification Status */}
                      <td className="py-3.5 px-4">
                        {isVerified ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />{" "}
                            Verified (Pass Active)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            <Clock className="w-3 h-3 text-amber-600" /> Pending
                            Verification
                          </span>
                        )}
                      </td>

                      {/* Actions: Toggle Verification */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isVerified ? (
                            <button
                              onClick={() =>
                                handleToggleVerification(reg, false)
                              }
                              disabled={isActing}
                              className="px-3 py-1.5 rounded-lg bg-white hover:bg-rose-50 text-rose-700 hover:text-rose-800 font-semibold text-xs border border-rose-300 transition-colors disabled:opacity-50"
                            >
                              {isActing ? "Updating..." : "Unverify"}
                            </button>
                          ) : (
                            <button
                              onClick={() =>
                                handleToggleVerification(reg, true)
                              }
                              disabled={isActing}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-2xs transition-colors disabled:opacity-50"
                            >
                              {isActing ? "Verifying..." : "Verify & Pass"}
                            </button>
                          )}
                          <Link
                            href={`/sanjh-2026/pass/${reg.id}`}
                            target="_blank"
                            title="View official pass"
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* FULL SCREENSHOT LIGHTBOX MODAL */}
      {previewScreenshotUrl && (
        <div
          onClick={() => setPreviewScreenshotUrl(null)}
          className="fixed inset-0 z-60 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-2xl w-full p-4 space-y-3 overflow-hidden shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-zinc-900">
                UPI Payment Screenshot
              </h3>
              <button
                onClick={() => setPreviewScreenshotUrl(null)}
                className="p-1 rounded-lg hover:bg-zinc-100 text-zinc-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="max-h-[75vh] overflow-auto rounded-xl bg-zinc-900 flex items-center justify-center p-2">
              <img
                src={previewScreenshotUrl}
                alt="Payment Receipt"
                className="max-h-[70vh] w-auto object-contain rounded-lg"
              />
            </div>
            <div className="flex justify-end">
              <a
                href={previewScreenshotUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold text-orange-700 hover:underline inline-flex items-center gap-1"
              >
                Open Original in New Tab{" "}
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
