"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  getPerformanceApplications,
  reviewPerformanceApplication,
} from "@/lib/actions/adminActions";
import {
  Music,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  Search,
  Filter,
  RefreshCw,
  Loader2,
  AlertCircle,
  GraduationCap,
  Sparkles,
  Award,
  Video,
  FileText,
  User,
  ArrowRight,
  ShieldCheck,
  Check,
  X,
} from "lucide-react";

export default function AdminPerformersPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("all");
  const [search, setSearch] = useState("");

  // Reviewing modal / state
  const [actionTarget, setActionTarget] = useState<any | null>(null);
  const [reviewDecision, setReviewDecision] = useState<"approved" | "rejected">(
    "approved"
  );
  const [adminRemarks, setAdminRemarks] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const loadData = () => {
    setRefreshing(true);
    getPerformanceApplications("all")
      .then((res) => {
        if (res.success && res.data) {
          setApplications(res.data);
        }
      })
      .catch((err) => console.error("Error loading performance requests:", err))
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const counts = useMemo(() => {
    const total = applications.length;
    const pending = applications.filter(
      (a) => a.performerStatus === "pending" || a.performance?.status === "pending"
    ).length;
    const approved = applications.filter(
      (a) => a.performerStatus === "approved" || a.performance?.status === "approved"
    ).length;
    const rejected = applications.filter(
      (a) => a.performerStatus === "rejected" || a.performance?.status === "rejected"
    ).length;
    return { total, pending, approved, rejected };
  }, [applications]);

  const filteredApps = useMemo(() => {
    return applications.filter((app) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        app.fullName?.toLowerCase().includes(q) ||
        app.email?.toLowerCase().includes(q) ||
        app.regNumber?.toLowerCase().includes(q) ||
        app.performance?.title?.toLowerCase().includes(q) ||
        app.performance?.category?.toLowerCase().includes(q);

      const appStatus = app.performerStatus || app.performance?.status || "pending";
      const matchesStatus =
        statusFilter === "all" || appStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [applications, search, statusFilter]);

  const openReviewModal = (app: any, decision: "approved" | "rejected") => {
    setActionTarget(app);
    setReviewDecision(decision);
    setAdminRemarks(app.performance?.adminRemarks || "");
  };

  const handleConfirmReview = async () => {
    if (!actionTarget) return;

    setSubmittingReview(true);
    try {
      const res = await reviewPerformanceApplication(
        actionTarget.id,
        reviewDecision,
        adminRemarks
      );

      if (res.success) {
        setFeedbackMsg({
          type: "success",
          text: `Application by ${actionTarget.fullName} was marked as ${reviewDecision.toUpperCase()}.`,
        });
        setActionTarget(null);
        loadData();
        setTimeout(() => setFeedbackMsg(null), 4000);
      } else {
        setFeedbackMsg({
          type: "error",
          text: res.error || "Failed to update review status.",
        });
      }
    } catch (err: any) {
      setFeedbackMsg({
        type: "error",
        text: err?.message || "An unexpected error occurred.",
      });
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold mb-2">
            <Music className="w-3.5 h-3.5 text-amber-600" />
            Sanjh 2026 Cultural Stage
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
            Stage Performance Applications
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500">
            Review and approve talent requests submitted by registered alumni holding official event passes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-zinc-50 text-zinc-700 font-semibold text-xs border border-zinc-200 shadow-2xs transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {feedbackMsg && (
        <div
          className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-medium ${
            feedbackMsg.type === "success"
              ? "bg-emerald-50 border border-emerald-200 text-emerald-900"
              : "bg-rose-50 border border-rose-200 text-rose-900"
          }`}
        >
          {feedbackMsg.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-zinc-200 shadow-2xs">
          <span className="text-xs text-zinc-500 block">Total Requests</span>
          <span className="text-2xl font-black text-zinc-900 mt-1 block">
            {counts.total}
          </span>
          <span className="text-[10px] text-zinc-400">All applications</span>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 shadow-2xs">
          <span className="text-xs text-amber-800 font-semibold block">Pending Review</span>
          <span className="text-2xl font-black text-amber-700 mt-1 block">
            {counts.pending}
          </span>
          <span className="text-[10px] text-amber-700">Needs administrative decision</span>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 shadow-2xs">
          <span className="text-xs text-emerald-800 font-semibold block">Approved Performers</span>
          <span className="text-2xl font-black text-emerald-700 mt-1 block">
            {counts.approved}
          </span>
          <span className="text-[10px] text-emerald-700">Allotted stage slots</span>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 shadow-2xs">
          <span className="text-xs text-zinc-500 block">Rejected / Attendees</span>
          <span className="text-2xl font-black text-zinc-600 mt-1 block">
            {counts.rejected}
          </span>
          <span className="text-[10px] text-zinc-400">Standard audience access</span>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-4 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-zinc-100 rounded-xl overflow-x-auto">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                statusFilter === "all"
                  ? "bg-white text-zinc-900 shadow-2xs"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              All ({counts.total})
            </button>
            <button
              onClick={() => setStatusFilter("pending")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                statusFilter === "pending"
                  ? "bg-amber-600 text-white shadow-2xs"
                  : "text-amber-800 hover:text-amber-950"
              }`}
            >
              Pending ({counts.pending})
            </button>
            <button
              onClick={() => setStatusFilter("approved")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                statusFilter === "approved"
                  ? "bg-emerald-600 text-white shadow-2xs"
                  : "text-emerald-800 hover:text-emerald-950"
              }`}
            >
              Approved ({counts.approved})
            </button>
            <button
              onClick={() => setStatusFilter("rejected")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                statusFilter === "rejected"
                  ? "bg-zinc-800 text-white shadow-2xs"
                  : "text-zinc-600 hover:text-zinc-900"
              }`}
            >
              Rejected ({counts.rejected})
            </button>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by performer, act title, category..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-zinc-200 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>
      </div>

      {/* Applications List */}
      {loading ? (
        <div className="py-24 bg-white rounded-3xl border border-zinc-200 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
          <p className="text-xs text-zinc-500 font-medium">
            Loading performance requests from Firestore...
          </p>
        </div>
      ) : filteredApps.length === 0 ? (
        <div className="py-20 bg-white rounded-3xl border border-zinc-200 text-center space-y-3 p-6">
          <Music className="w-12 h-12 text-zinc-300 mx-auto" />
          <h3 className="font-bold text-zinc-800 text-sm">
            No performance applications match criteria
          </h3>
          <p className="text-xs text-zinc-500 max-w-md mx-auto">
            {statusFilter !== "all"
              ? `There are currently no performance requests with status "${statusFilter}".`
              : "No alumni pass holders have applied to perform on stage yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredApps.map((app) => {
            const perf = app.performance || {};
            const status = app.performerStatus || perf.status || "pending";
            const isApproved = status === "approved";
            const isRejected = status === "rejected";
            const isPending = status === "pending";

            return (
              <div
                key={app.id}
                className={`bg-white rounded-3xl border p-6 shadow-2xs transition-all space-y-5 ${
                  isApproved
                    ? "border-emerald-300 hover:border-emerald-400"
                    : isRejected
                    ? "border-zinc-200 opacity-80"
                    : "border-amber-300 hover:border-amber-400"
                }`}
              >
                {/* Top Bar: Act Title, Category, Status Badge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                        isApproved
                          ? "bg-emerald-100 text-emerald-700"
                          : isRejected
                          ? "bg-zinc-100 text-zinc-500"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      <Music className="w-6 h-6" />
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-black text-zinc-900">
                          {perf.title || "Untitled Performance"}
                        </h2>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-900 border border-orange-200 uppercase tracking-wide">
                          {perf.category || "Cultural Act"}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        Duration: {perf.durationMinutes || "5-7 mins"} • Stage Needs: {perf.specialRequirements || "Standard sound"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isApproved && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                        Approved Performer
                      </span>
                    )}
                    {isPending && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                        <Clock className="w-4 h-4 text-amber-700" />
                        Pending Admin Review
                      </span>
                    )}
                    {isRejected && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-zinc-100 text-zinc-700 border border-zinc-300">
                        <XCircle className="w-4 h-4 text-zinc-500" />
                        Rejected (Regular Attendee)
                      </span>
                    )}
                  </div>
                </div>

                {/* Description & Performance Details */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                    Act Description & Details
                  </span>
                  <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed bg-zinc-50 p-3.5 rounded-2xl border border-zinc-100 italic">
                    &ldquo;{perf.description || "No description provided."}&rdquo;
                  </p>
                </div>

                {/* Applicant Profile & Resume/Portfolio URL */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-2">
                  {/* Left: Performer Credentials (8 cols) */}
                  <div className="lg:col-span-8 p-4 rounded-2xl bg-zinc-50/70 border border-zinc-200 text-xs space-y-2">
                    <span className="font-bold text-zinc-900 flex items-center gap-1.5 border-b border-zinc-200/60 pb-1.5">
                      <GraduationCap className="w-4 h-4 text-orange-600" />
                      Alumnus / Performer Information
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-zinc-600">
                      <div>
                        <span className="text-zinc-400 block text-[10px]">Full Name & Reg ID</span>
                        <strong className="text-zinc-900 text-sm">{app.fullName}</strong>
                        <span className="block font-mono text-[10px] text-zinc-500">{app.regNumber}</span>
                      </div>
                      <div>
                        <span className="text-zinc-400 block text-[10px]">Academic Era & Batch</span>
                        <span className="font-semibold text-zinc-800">
                          {app.degree} – {app.branch}
                        </span>
                        <span className="block text-[11px] text-zinc-500">
                          Class of {app.passingYear} ({app.era} Era)
                        </span>
                      </div>
                      <div>
                        <span className="text-zinc-400 block text-[10px]">Contact Info</span>
                        <span className="text-zinc-800 block">{app.email}</span>
                        <span className="text-zinc-800 block">{app.phone}</span>
                      </div>
                      <div>
                        <span className="text-zinc-400 block text-[10px]">Professional Designation</span>
                        <span className="text-zinc-800">
                          {app.currentDesignation ? `${app.currentDesignation} at ${app.organization || "—"}` : "—"}
                        </span>
                        <div className="mt-1">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                            <ShieldCheck className="w-3 h-3 text-emerald-700" />
                            Verified Pass Holder (₹1,000 Paid)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Resume / Video Link & Actions (4 cols) */}
                  <div className="lg:col-span-4 flex flex-col justify-between p-4 rounded-2xl bg-orange-50/40 border border-orange-200 text-xs space-y-3">
                    <div className="space-y-2">
                      <span className="font-bold text-orange-950 flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-orange-600" />
                        Audition & Portfolio URL
                      </span>

                      {perf.resumeUrl ? (
                        <a
                          href={perf.resumeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs transition-colors shadow-2xs"
                        >
                          <Video className="w-4 h-4" />
                          Open Resume / Video Link
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      ) : (
                        <span className="text-zinc-400 italic block">No URL provided</span>
                      )}

                      <span className="text-[10px] text-zinc-500 block truncate">
                        Link: {perf.resumeUrl}
                      </span>
                    </div>

                    {/* Admin Action Buttons */}
                    <div className="pt-2 border-t border-orange-200/60 flex items-center gap-2">
                      <button
                        onClick={() => openReviewModal(app, "approved")}
                        className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Approve
                      </button>

                      <button
                        onClick={() => openReviewModal(app, "rejected")}
                        className="flex-1 py-2 px-3 rounded-xl bg-zinc-200 hover:bg-rose-100 text-zinc-700 hover:text-rose-700 font-bold text-xs transition-colors flex items-center justify-center gap-1"
                      >
                        <X className="w-3.5 h-3.5" />
                        Reject
                      </button>

                      <Link
                        href={`/admin/alumni-registrations/${app.id}`}
                        className="p-2 rounded-xl bg-white hover:bg-zinc-100 text-zinc-600 border border-zinc-200 transition-colors"
                        title="View Full Record"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Show review history if already reviewed */}
                {perf.reviewedAt && (
                  <div className="text-[11px] text-zinc-500 bg-zinc-50 p-2.5 rounded-xl border border-zinc-100 flex flex-wrap items-center justify-between gap-2">
                    <span>
                      Reviewed by: <strong>{perf.reviewedBy || "Admin"}</strong> on{" "}
                      {new Date(perf.reviewedAt).toLocaleString()}
                    </span>
                    {perf.adminRemarks && (
                      <span className="italic text-zinc-700">
                        Remarks: &ldquo;{perf.adminRemarks}&rdquo;
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Decision Modal */}
      {actionTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-zinc-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-2">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    reviewDecision === "approved"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-rose-100 text-rose-700"
                  }`}
                >
                  {reviewDecision === "approved" ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <XCircle className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-zinc-900">
                    {reviewDecision === "approved"
                      ? "Approve Stage Performance"
                      : "Reject Performance Request"}
                  </h3>
                  <span className="text-xs text-zinc-400">
                    Candidate: {actionTarget.fullName} ({actionTarget.regNumber})
                  </span>
                </div>
              </div>

              <button
                onClick={() => setActionTarget(null)}
                className="text-zinc-400 hover:text-zinc-600 p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-zinc-600">
              <p>
                {reviewDecision === "approved" ? (
                  <span>
                    By approving, this alumnus will be awarded an official stage slot at Sanjh 2026. Their digital pass will display the <strong>★ Approved Stage Performer</strong> badge, and their details will be passed to the SECA stage coordination committee.
                  </span>
                ) : (
                  <span>
                    By rejecting, the applicant will still hold their active <strong>Alumni Meet Event Pass (₹1,000)</strong> as an honored attendee, but will not be scheduled for stage performance.
                  </span>
                )}
              </p>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1">
                  Admin Remarks / Stage Notes (Optional)
                </label>
                <textarea
                  rows={3}
                  value={adminRemarks}
                  onChange={(e) => setAdminRemarks(e.target.value)}
                  placeholder={
                    reviewDecision === "approved"
                      ? "e.g. Approved for 6:15 PM slot; bring guitar cables; acoustic setup only..."
                      : "e.g. Schedule already full for classical music; invited as attendee..."
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-100">
              <button
                type="button"
                onClick={() => setActionTarget(null)}
                className="px-4 py-2 rounded-xl text-zinc-600 hover:bg-zinc-100 font-semibold text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReview}
                disabled={submittingReview}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs text-white shadow-xs transition-colors flex items-center gap-1.5 ${
                  reviewDecision === "approved"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-rose-600 hover:bg-rose-700"
                }`}
              >
                {submittingReview ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving Decision...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm {reviewDecision.toUpperCase()}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
