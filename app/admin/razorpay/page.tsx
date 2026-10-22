"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { getRazorpayPaymentsAction } from "@/lib/actions/razorpay";
import type { RazorpayPaymentItem } from "@/lib/actions/razorpay";
import {
  CreditCard,
  QrCode,
  Building,
  CheckCircle2,
  Clock,
  ArrowRight,
  Loader2,
  AlertCircle,
  Search,
  Filter,
  RefreshCw,
  IndianRupee,
  Receipt,
  Download,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  Wallet,
} from "lucide-react";

export default function AdminRazorpayPage() {
  const [payments, setPayments] = useState<RazorpayPaymentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [methodFilter, setMethodFilter] = useState<string>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchPayments = async () => {
    setRefreshing(true);
    setError(null);
    try {
      const res = await getRazorpayPaymentsAction({ count: 100 });
      if (res.success && res.data) {
        setPayments(res.data);
      } else {
        setError(res.error || "Failed to load Razorpay payment data.");
      }
    } catch (err: any) {
      setError(err?.message || "An error occurred fetching payments.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const copyToClipboard = (text: string, id: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  // Filtered payments
  const filteredPayments = useMemo(() => {
    return payments.filter((item) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        item.id.toLowerCase().includes(q) ||
        item.orderId.toLowerCase().includes(q) ||
        item.email.toLowerCase().includes(q) ||
        item.contact.toLowerCase().includes(q) ||
        item.fullName?.toLowerCase().includes(q) ||
        item.regNumber?.toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === "all" ||
        item.status.toLowerCase() === statusFilter.toLowerCase();

      const matchesMethod =
        methodFilter === "all" ||
        item.method.toLowerCase().includes(methodFilter.toLowerCase());

      return matchesSearch && matchesStatus && matchesMethod;
    });
  }, [payments, search, statusFilter, methodFilter]);

  // Aggregate stats
  const stats = useMemo(() => {
    const totalPaymentsCount = payments.length;
    const capturedPayments = payments.filter(
      (p) => p.status === "captured" || p.status === "authorized"
    );
    const totalRevenue = capturedPayments.reduce((acc, p) => acc + (p.amount || 0), 0);
    const failedCount = payments.filter((p) => p.status === "failed").length;

    return {
      totalRevenue,
      capturedCount: capturedPayments.length,
      failedCount,
      totalCount: totalPaymentsCount,
    };
  }, [payments]);

  const exportCSV = () => {
    if (filteredPayments.length === 0) return;

    const headers = [
      "Date",
      "Transaction ID",
      "Order ID",
      "Registrant Name",
      "Email",
      "Contact",
      "Pass ID",
      "Amount (INR)",
      "Method",
      "Status",
    ];

    const rows = filteredPayments.map((p) => [
      `"${p.date}"`,
      `"${p.id}"`,
      `"${p.orderId}"`,
      `"${p.fullName || ""}"`,
      `"${p.email || ""}"`,
      `"${p.contact || ""}"`,
      `"${p.regNumber || ""}"`,
      p.amount,
      `"${p.method}"`,
      `"${p.status}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sbssu_razorpay_payments_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-800 bg-blue-100/70 px-2.5 py-0.5 rounded-full mb-1 border border-blue-200">
            <Receipt className="w-3.5 h-3.5 text-blue-600" />
            Razorpay Payment Gateway
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
            Razorpay Transactions & Receipts
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500">
            Live payment records for Sanjh 2026 alumni pass registrations (₹1,000 per pass).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchPayments}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white hover:bg-zinc-50 text-zinc-700 font-semibold text-xs border border-zinc-200 shadow-2xs transition-all disabled:opacity-50"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-zinc-500 ${refreshing ? "animate-spin" : ""}`}
            />
            <span>Refresh Live Data</span>
          </button>

          <button
            onClick={exportCSV}
            disabled={filteredPayments.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-black text-white font-semibold text-xs transition-colors shadow-2xs disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Collected */}
        <div className="bg-white rounded-2xl border border-emerald-200 p-5 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs text-emerald-800 font-medium">
              Total Captured Revenue
            </span>
            <div className="text-2xl sm:text-3xl font-black text-emerald-950 mt-1">
              ₹{stats.totalRevenue.toLocaleString("en-IN")}
            </div>
            <span className="text-[11px] text-emerald-700 font-medium">
              {stats.capturedCount} confirmed payments
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <IndianRupee className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Successful Transactions */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs text-zinc-500 font-medium">
              Successful Transactions
            </span>
            <div className="text-2xl sm:text-3xl font-black text-zinc-900 mt-1">
              {stats.capturedCount}
            </div>
            <span className="text-[11px] text-zinc-400">
              Out of {stats.totalCount} total attempts
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Ticket Value */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs text-zinc-500 font-medium">Alumni Pass Rate</span>
            <div className="text-2xl sm:text-3xl font-black text-zinc-900 mt-1">
              ₹1,000
            </div>
            <span className="text-[11px] text-zinc-400">Standard delegate pass</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Gateway Status */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs text-zinc-500 font-medium">Gateway Integration</span>
            <div className="text-sm font-extrabold text-emerald-700 mt-1 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Razorpay Active
            </div>
            <span className="text-[11px] text-zinc-400">API keys configured</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-zinc-100 text-zinc-700 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl border border-zinc-200 p-4 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-zinc-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Transaction ID (pay_...), Order ID, Email, Name, or Pass ID..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-300 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-zinc-300 text-xs bg-white text-zinc-700 focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
            >
              <option value="all">All Statuses</option>
              <option value="captured">Captured (Success)</option>
              <option value="authorized">Authorized</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>

            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-zinc-300 text-xs bg-white text-zinc-700 focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
            >
              <option value="all">All Methods</option>
              <option value="upi">UPI / QR</option>
              <option value="card">Card</option>
              <option value="netbanking">Net Banking</option>
              <option value="wallet">Wallet</option>
            </select>

            {(search || statusFilter !== "all" || methodFilter !== "all") && (
              <button
                onClick={() => {
                  setSearch("");
                  setStatusFilter("all");
                  setMethodFilter("all");
                }}
                className="px-3 py-2.5 text-xs text-orange-600 hover:text-orange-700 font-bold hover:underline"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-zinc-400 border-t border-zinc-100 pt-2">
          <span>
            Showing <strong>{filteredPayments.length}</strong> of {payments.length} transactions
          </span>
          <span className="font-mono text-[10px]">Currency: INR (₹)</span>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-3xl border border-zinc-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
            <p className="text-xs text-zinc-500 font-medium">
              Querying Razorpay API & Firestore database...
            </p>
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <Receipt className="w-12 h-12 text-zinc-300 mx-auto" />
            <h3 className="font-bold text-zinc-800 text-base">No transactions found</h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              {payments.length === 0
                ? "No Razorpay payments recorded yet. As alumni complete their passes, their receipts will appear here."
                : "No payments match your current search or filter criteria."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Transaction ID</th>
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Registrant / Email</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Pass Ref</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredPayments.map((payment) => {
                  const isCaptured =
                    payment.status === "captured" || payment.status === "authorized";
                  const isFailed = payment.status === "failed";

                  return (
                    <tr
                      key={payment.id}
                      className="hover:bg-zinc-50/80 transition-colors"
                    >
                      {/* Date & Time */}
                      <td className="py-3.5 px-4 text-zinc-700 whitespace-nowrap font-medium">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                          <span>{payment.date}</span>
                        </div>
                      </td>

                      {/* Transaction ID */}
                      <td className="py-3.5 px-4 font-mono font-bold text-zinc-800 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span>{payment.id}</span>
                          <button
                            onClick={() => copyToClipboard(payment.id, payment.id)}
                            title="Copy Transaction ID"
                            className="p-1 rounded hover:bg-zinc-200 text-zinc-400 hover:text-zinc-700 transition-colors"
                          >
                            {copiedId === payment.id ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Order ID */}
                      <td className="py-3.5 px-4 font-mono text-zinc-500 text-[11px] whitespace-nowrap">
                        <span>{payment.orderId || "—"}</span>
                      </td>

                      {/* Registrant / Contact */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-zinc-900">
                          {payment.fullName || payment.notes?.fullName || payment.email.split("@")[0]}
                        </div>
                        <div className="text-[11px] text-zinc-400 font-mono">
                          {payment.email}
                          {payment.contact && payment.contact !== "—" && (
                            <span className="text-zinc-400"> • {payment.contact}</span>
                          )}
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-black text-sm text-zinc-900">
                          ₹{payment.amount.toLocaleString("en-IN")}
                        </span>
                        <span className="text-[10px] text-zinc-400 block uppercase">
                          {payment.currency}
                        </span>
                      </td>

                      {/* Method */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-semibold text-[11px] bg-zinc-100 text-zinc-700 uppercase">
                          {payment.method.toLowerCase() === "upi" ? (
                            <QrCode className="w-3 h-3 text-orange-600" />
                          ) : payment.method.toLowerCase() === "card" ? (
                            <CreditCard className="w-3 h-3 text-blue-600" />
                          ) : payment.method.toLowerCase().includes("bank") ? (
                            <Building className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Wallet className="w-3 h-3 text-zinc-500" />
                          )}
                          <span>{payment.method}</span>
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider ${
                            isCaptured
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              : isFailed
                              ? "bg-rose-100 text-rose-800 border border-rose-200"
                              : "bg-amber-100 text-amber-800 border border-amber-200"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isCaptured
                                ? "bg-emerald-600"
                                : isFailed
                                ? "bg-rose-600"
                                : "bg-amber-600"
                            }`}
                          ></span>
                          <span>{payment.status}</span>
                        </span>
                      </td>

                      {/* Pass Ref */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        {payment.regNumber ? (
                          <span className="font-mono text-zinc-700 font-semibold px-2 py-0.5 rounded bg-zinc-100 border border-zinc-200 text-[11px]">
                            {payment.regNumber}
                          </span>
                        ) : payment.notes?.registrationId ? (
                          <Link
                            href={`/ticket/${payment.notes.registrationId}`}
                            target="_blank"
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-orange-600 hover:text-orange-700 hover:underline"
                          >
                            Pass <ExternalLink className="w-3 h-3" />
                          </Link>
                        ) : (
                          <span className="text-zinc-400 font-mono text-[11px]">—</span>
                        )}
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
