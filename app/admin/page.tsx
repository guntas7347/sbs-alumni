"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  getAllRegistrations,
  updateRegistrationDetails,
  updatePerformanceStatus,
  updateVCInteractionStatus,
} from "@/lib/actions/alumniActions";
import {
  verifyAlumniPayment,
  sendSinglePaymentProofReminder,
  sendBulkPaymentProofReminders,
} from "@/lib/actions/adminActions";
import type { AlumniRegistration, AllowedGuestRelation } from "@/lib/types";
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ExternalLink,
  Loader2,
  Music,
  RefreshCw,
  GraduationCap,
  Ticket,
  ShieldCheck,
  XCircle,
  Sparkles,
  AlertTriangle,
  AlertCircle,
  FileImage,
  X,
  Check,
  Eye,
  Edit3,
  Save,
  MessageSquare,
  Building,
  MapPin,
  Phone,
  Mail,
  Send,
  User,
  HeartHandshake,
  Mic,
  Camera,
  RotateCcw,
} from "lucide-react";

type FilterTab =
  | "all"
  | "attending"
  | "in-person-pending"
  | "free"
  | "performers"
  | "vc_interactions";

export default function AdminRegistrationsPage() {
  const [registrations, setRegistrations] = useState<AlumniRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [currentTab, setCurrentTab] = useState<FilterTab>("all");

  // Selected registration for Detail Modal
  const [selectedReg, setSelectedReg] = useState<AlumniRegistration | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<AlumniRegistration>>({});
  const [savingEdit, setSavingEdit] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [modalFeedback, setModalFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Full screenshot preview modal
  const [previewScreenshotUrl, setPreviewScreenshotUrl] = useState<string | null>(null);

  // Bulk email reminder state
  const [bulkEmailLoading, setBulkEmailLoading] = useState(false);
  const [bulkEmailConfirmOpen, setBulkEmailConfirmOpen] = useState(false);
  const [bulkEmailResult, setBulkEmailResult] = useState<{
    success: boolean;
    sentCount: number;
    failedCount: number;
    message: string;
  } | null>(null);

  // Fetch all registrations in one go
  const loadData = () => {
    setRefreshing(true);
    getAllRegistrations()
      .then((res) => {
        if (res.success && res.data) {
          setRegistrations(res.data);
          // If modal is currently open, refresh selectedReg
          if (selectedReg) {
            const updated = res.data.find((r) => r.id === selectedReg.id);
            if (updated) setSelectedReg(updated);
          }
        }
      })
      .catch((err) => console.error("Error loading registrations:", err))
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  // 1. "in-person": Chose to attend AND payment proof is uploaded (or verified)
  const isAttendingRecord = (r: AlumniRegistration) =>
    r.attendanceType === "in-person" ||
    Boolean(
      r.attendingMeet &&
      (r.verified || (r.txnId && r.txnId.trim()) || (r.screenshotUrl && r.screenshotUrl.trim()))
    );

  // 2. "in-person-pending": Chose to attend (₹1,000) but payment proof is missing
  const isInPersonPendingRecord = (r: AlumniRegistration) =>
    r.attendanceType === "in-person-pending" ||
    (!isAttendingRecord(r) &&
      (r.amount === "1000" ||
        r.passPrice === 1000 ||
        r.attendingMeet ||
        (r.guestCount && r.guestCount !== "0") ||
        Boolean(r.guest1Name)));

  // 3. "supporting": Directory registration only (Free)
  const isSupportingRecord = (r: AlumniRegistration) =>
    !isAttendingRecord(r) && !isInPersonPendingRecord(r);

  // Bulk reminder email handler
  const handleSendBulkReminder = async () => {
    setBulkEmailLoading(true);
    setBulkEmailResult(null);
    try {
      const pendingIds = registrations
        .filter((r) => isInPersonPendingRecord(r))
        .map((r) => r.id);

      const res = await sendBulkPaymentProofReminders(pendingIds);
      if (res.success) {
        setBulkEmailResult({
          success: true,
          sentCount: res.sentCount,
          failedCount: res.failedCount,
          message: `Successfully sent payment reminder emails to ${res.sentCount} alumni!`,
        });
        loadData();
      } else {
        setBulkEmailResult({
          success: false,
          sentCount: res.sentCount,
          failedCount: res.failedCount,
          message: res.error || "Failed to send bulk reminder emails.",
        });
      }
      setBulkEmailConfirmOpen(false);
    } catch (err: any) {
      setBulkEmailResult({
        success: false,
        sentCount: 0,
        failedCount: 0,
        message: err?.message || "An unexpected error occurred.",
      });
      setBulkEmailConfirmOpen(false);
    } finally {
      setBulkEmailLoading(false);
    }
  };

  // Single reminder email handler
  const handleSendSingleReminder = async (id: string) => {
    setActionLoading(`reminder-${id}`);
    try {
      const res = await sendSinglePaymentProofReminder(id);
      if (res.success) {
        setModalFeedback({
          type: "success",
          text: "Payment proof reminder email dispatched successfully!",
        });
        loadData();
      } else {
        setModalFeedback({
          type: "error",
          text: res.error || "Failed to send reminder email.",
        });
      }
    } catch (err: any) {
      setModalFeedback({
        type: "error",
        text: err?.message || "Failed to send reminder email.",
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Compute category counts
  const counts = useMemo(() => {
    const total = registrations.length;
    const attendingCount = registrations.filter(isAttendingRecord).length;
    const inPersonPendingCount = registrations.filter(isInPersonPendingRecord).length;
    const freeCount = registrations.filter(isSupportingRecord).length;
    const performerCount = registrations.filter(
      (r) =>
        r.wantToPerform ||
        (r.performanceStatus && r.performanceStatus !== "none") ||
        (r.performerStatus && r.performerStatus !== "none")
    ).length;
    const vcCount = registrations.filter(
      (r) =>
        r.wantToInteractWithVC ||
        (r.vcInteractionStatus && r.vcInteractionStatus !== "none") ||
        Boolean(r.vcInteractionReason)
    ).length;

    return {
      total,
      attendingCount,
      inPersonPendingCount,
      freeCount,
      performerCount,
      vcCount,
    };
  }, [registrations]);

  // Client-side filtering & search
  const filteredRegistrations = useMemo(() => {
    let list = [...registrations];

    // Filter by tab
    if (currentTab === "attending") {
      list = list.filter(isAttendingRecord);
    } else if (currentTab === "in-person-pending") {
      list = list.filter(isInPersonPendingRecord);
    } else if (currentTab === "free") {
      list = list.filter(isSupportingRecord);
    } else if (currentTab === "performers") {
      list = list.filter(
        (r) =>
          r.wantToPerform ||
          (r.performanceStatus && r.performanceStatus !== "none") ||
          (r.performerStatus && r.performerStatus !== "none")
      );
    } else if (currentTab === "vc_interactions") {
      list = list.filter(
        (r) =>
          r.wantToInteractWithVC ||
          (r.vcInteractionStatus && r.vcInteractionStatus !== "none") ||
          Boolean(r.vcInteractionReason)
      );
    }

    // Search query
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter((r) => {
        const text = [
          r.fullName,
          r.email,
          r.phone,
          r.regNumber,
          r.rollNumber,
          r.organization,
          r.currentDesignation,
          r.branch,
          r.degree,
          r.passingYear,
          r.txnId,
          r.city,
          r.state,
          r.specialRequest,
          r.performanceType,
          r.vcInteractionReason,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return text.includes(q);
      });
    }

    return list;
  }, [registrations, currentTab, search]);

  // Open Detail Modal
  const handleOpenDetail = (reg: AlumniRegistration) => {
    setSelectedReg(reg);
    setIsEditing(false);
    setEditForm({ ...reg });
    setModalFeedback(null);
  };

  // Close Detail Modal
  const handleCloseDetail = () => {
    setSelectedReg(null);
    setIsEditing(false);
    setModalFeedback(null);
  };

  // Toggle Edit Mode in Modal
  const handleToggleEdit = () => {
    if (!isEditing && selectedReg) {
      setEditForm({ ...selectedReg });
    }
    setIsEditing(!isEditing);
    setModalFeedback(null);
  };

  // Save Edits directly to Firestore
  const handleSaveEdits = async () => {
    if (!selectedReg) return;
    setSavingEdit(true);
    setModalFeedback(null);

    try {
      const res = await updateRegistrationDetails(selectedReg.id, editForm);
      if (res.success) {
        setModalFeedback({
          type: "success",
          text: "Registration details saved successfully to Firestore.",
        });
        setIsEditing(false);
        // Refresh local record and list
        const updatedRecord = { ...selectedReg, ...editForm } as AlumniRegistration;
        setSelectedReg(updatedRecord);
        setRegistrations((prev) =>
          prev.map((r) => (r.id === selectedReg.id ? updatedRecord : r))
        );
      } else {
        setModalFeedback({
          type: "error",
          text: res.error || "Failed to update registration.",
        });
      }
    } catch (err: any) {
      setModalFeedback({
        type: "error",
        text: err?.message || "An unexpected error occurred.",
      });
    } finally {
      setSavingEdit(false);
    }
  };

  // Approve / Reject / Revoke Stage Performance
  const handlePerformanceDecision = async (
    status: "approved" | "rejected" | "none" | "pending",
    remarks: string = ""
  ) => {
    if (!selectedReg) return;
    setActionLoading(`perf-${status}`);
    setModalFeedback(null);

    try {
      const res = await updatePerformanceStatus(selectedReg.id, status, remarks);
      if (res.success) {
        const updated = {
          ...selectedReg,
          performanceStatus: status,
          performanceAdminRemarks: remarks,
        };
        setSelectedReg(updated);
        setRegistrations((prev) =>
          prev.map((r) => (r.id === selectedReg.id ? updated : r))
        );
        setModalFeedback({
          type: "success",
          text: `Stage performance marked as ${status.toUpperCase()}.`,
        });
      } else {
        setModalFeedback({
          type: "error",
          text: res.error || "Failed to update performance status.",
        });
      }
    } catch (err: any) {
      setModalFeedback({
        type: "error",
        text: err?.message || "Error updating performance status.",
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Approve / Reject / Revoke VC Interaction
  const handleVCDecision = async (
    status: "approved" | "rejected" | "none" | "pending",
    remarks: string = ""
  ) => {
    if (!selectedReg) return;
    setActionLoading(`vc-${status}`);
    setModalFeedback(null);

    try {
      const res = await updateVCInteractionStatus(selectedReg.id, status, remarks);
      if (res.success) {
        const updated = {
          ...selectedReg,
          vcInteractionStatus: status,
          vcInteractionAdminRemarks: remarks,
        };
        setSelectedReg(updated);
        setRegistrations((prev) =>
          prev.map((r) => (r.id === selectedReg.id ? updated : r))
        );
        setModalFeedback({
          type: "success",
          text: `Vice Chancellor meeting request marked as ${status.toUpperCase()}.`,
        });
      } else {
        setModalFeedback({
          type: "error",
          text: res.error || "Failed to update VC interaction status.",
        });
      }
    } catch (err: any) {
      setModalFeedback({
        type: "error",
        text: err?.message || "Error updating VC interaction status.",
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Payment Verification Toggle from inside modal
  const handleTogglePaymentVerify = async (newStatus: boolean) => {
    if (!selectedReg) return;
    setActionLoading(`pay-${newStatus}`);
    setModalFeedback(null);

    try {
      const res = await verifyAlumniPayment(selectedReg.id, newStatus, "", "Admin");
      if (res.success) {
        const updated = {
          ...selectedReg,
          verified: newStatus,
          hasPass: newStatus,
          passStatus: newStatus ? "active" : "none",
          amount: newStatus ? "1000" : selectedReg.amount,
        };
        setSelectedReg(updated);
        setRegistrations((prev) =>
          prev.map((r) => (r.id === selectedReg.id ? updated : r))
        );
        setModalFeedback({
          type: "success",
          text: newStatus
            ? "Payment verified! Sanjh 2026 Meet Pass issued & emailed."
            : "Payment unverified. Meet pass has been revoked.",
        });
      } else {
        setModalFeedback({
          type: "error",
          text: res.error || "Failed to update verification status.",
        });
      }
    } catch (err: any) {
      setModalFeedback({
        type: "error",
        text: err?.message || "Error verifying payment.",
      });
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header & Overview */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-orange-700 bg-orange-100/70 px-2.5 py-0.5 rounded-full mb-1">
            <Sparkles className="w-3.5 h-3.5 text-orange-600" />
            Admin Central • Registrations
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
            Alumni Registrations
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500">
            View all alumni registrations, filter by stage performances or VC interactions, review requests, and edit any record.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-zinc-50 text-zinc-700 font-semibold text-xs border border-zinc-200 shadow-2xs transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-orange-600" : ""}`} />
            Refresh
          </button>
          <Link
            href="/admin/transactions"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs shadow-2xs transition-colors"
          >
            <Ticket className="w-3.5 h-3.5" />
            View Transactions
          </Link>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <button
          onClick={() => setCurrentTab("all")}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            currentTab === "all"
              ? "bg-orange-50/80 border-orange-300 ring-2 ring-orange-400"
              : "bg-white border-zinc-200 hover:border-zinc-300"
          }`}
        >
          <span className="text-[11px] font-semibold text-zinc-500 block">Total Registered</span>
          <div className="text-xl sm:text-2xl font-black text-zinc-900 mt-0.5">{counts.total}</div>
          <span className="text-[10px] text-zinc-400">All submissions</span>
        </button>

        <button
          onClick={() => setCurrentTab("attending")}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            currentTab === "attending"
              ? "bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-400"
              : "bg-white border-zinc-200 hover:border-zinc-300"
          }`}
        >
          <span className="text-[11px] font-semibold text-emerald-800 block">Attending Meet</span>
          <div className="text-xl sm:text-2xl font-black text-emerald-950 mt-0.5">
            {counts.attendingCount}
          </div>
          <span className="text-[10px] text-emerald-700">Proof uploaded / pass</span>
        </button>

        <button
          onClick={() => setCurrentTab("in-person-pending")}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            currentTab === "in-person-pending"
              ? "bg-rose-50/80 border-rose-300 ring-2 ring-rose-400"
              : "bg-white border-zinc-200 hover:border-zinc-300"
          }`}
        >
          <span className="text-[11px] font-semibold text-rose-800 block flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" /> In-Person Pending
          </span>
          <div className="text-xl sm:text-2xl font-black text-rose-950 mt-0.5">
            {counts.inPersonPendingCount}
          </div>
          <span className="text-[10px] text-rose-700">Proof missing / closed site</span>
        </button>

        <button
          onClick={() => setCurrentTab("free")}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            currentTab === "free"
              ? "bg-zinc-100 border-zinc-400 ring-2 ring-zinc-400"
              : "bg-white border-zinc-200 hover:border-zinc-300"
          }`}
        >
          <span className="text-[11px] font-semibold text-zinc-600 block">Directory Only</span>
          <div className="text-xl sm:text-2xl font-black text-zinc-900 mt-0.5">{counts.freeCount}</div>
          <span className="text-[10px] text-zinc-400">Free (No attend)</span>
        </button>

        <button
          onClick={() => setCurrentTab("performers")}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            currentTab === "performers"
              ? "bg-amber-50/80 border-amber-300 ring-2 ring-amber-400"
              : "bg-white border-zinc-200 hover:border-zinc-300"
          }`}
        >
          <span className="text-[11px] font-semibold text-amber-900 block flex items-center gap-1">
            <Music className="w-3 h-3 text-amber-600" /> Stage Acts
          </span>
          <div className="text-xl sm:text-2xl font-black text-amber-950 mt-0.5">
            {counts.performerCount}
          </div>
          <span className="text-[10px] text-amber-700">Performance requests</span>
        </button>

        <button
          onClick={() => setCurrentTab("vc_interactions")}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            currentTab === "vc_interactions"
              ? "bg-blue-50/80 border-blue-300 ring-2 ring-blue-400"
              : "bg-white border-zinc-200 hover:border-zinc-300"
          }`}
        >
          <span className="text-[11px] font-semibold text-blue-900 block flex items-center gap-1">
            <HeartHandshake className="w-3 h-3 text-blue-600" /> VC Meetings
          </span>
          <div className="text-xl sm:text-2xl font-black text-blue-950 mt-0.5">{counts.vcCount}</div>
          <span className="text-[10px] text-blue-700">VC interaction requests</span>
        </button>
      </div>

      {/* IN-PERSON PENDING BANNER & BULK EMAIL ACTION */}
      {counts.inPersonPendingCount > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-50 via-rose-50 to-orange-50 border-2 border-amber-300 text-amber-950 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs font-black bg-rose-600 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {counts.inPersonPendingCount} In-Person Pending
                </span>
                <span className="text-xs font-bold text-zinc-800">
                  Selected ₹1,000 meet pass, but closed website without uploading payment proof
                </span>
              </div>
              <p className="text-xs text-zinc-600 leading-relaxed max-w-2xl">
                These alumni opted to attend Sanjh 2026 in-person, but have not uploaded their payment screenshot and UPI Transaction ID. They may have paid at the QR code. You can send them a direct email with their personal link to upload their screenshot or be marked as directory registration only.
              </p>
            </div>
          </div>

          <button
            onClick={() => setBulkEmailConfirmOpen(true)}
            disabled={bulkEmailLoading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-xs transition-all shrink-0 disabled:opacity-50"
          >
            <Mail className="w-4 h-4" />
            {bulkEmailLoading ? "Sending Emails..." : `Email All ${counts.inPersonPendingCount} Pending Alumni`}
          </button>
        </div>
      )}

      {/* Bulk Email Result Alert */}
      {bulkEmailResult && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center justify-between gap-3 shadow-2xs ${
            bulkEmailResult.success
              ? "bg-emerald-50 border border-emerald-300 text-emerald-950"
              : "bg-rose-50 border border-rose-300 text-rose-950"
          }`}
        >
          <div className="flex items-center gap-2">
            {bulkEmailResult.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span className="font-semibold">{bulkEmailResult.message}</span>
          </div>
          <button
            onClick={() => setBulkEmailResult(null)}
            className="text-zinc-400 hover:text-zinc-700"
          >
            <X className="w-4 h-4" />
          </button>
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
              placeholder="Search by name, email, phone, roll, reg #, txn, org..."
              className="w-full pl-9 pr-8 py-2 rounded-xl border border-zinc-200 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500 bg-zinc-50/50"
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

          <div className="text-xs text-zinc-500 font-medium self-end sm:self-center">
            Showing <strong>{filteredRegistrations.length}</strong> of {registrations.length} registrations
          </div>
        </div>

        {/* Tab Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-zinc-100 text-xs">
          <span className="text-zinc-400 text-[11px] mr-1 font-semibold">Filter:</span>
          <button
            onClick={() => setCurrentTab("all")}
            className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
              currentTab === "all"
                ? "bg-zinc-900 text-white"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            }`}
          >
            All ({counts.total})
          </button>
          <button
            onClick={() => setCurrentTab("attending")}
            className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
              currentTab === "attending"
                ? "bg-emerald-700 text-white"
                : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
            }`}
          >
            Attending ({counts.attendingCount})
          </button>
          <button
            onClick={() => setCurrentTab("in-person-pending")}
            className={`px-3 py-1 rounded-lg font-semibold transition-colors flex items-center gap-1 ${
              currentTab === "in-person-pending"
                ? "bg-rose-600 text-white"
                : "bg-rose-50 text-rose-800 hover:bg-rose-100"
            }`}
          >
            <AlertTriangle className="w-3 h-3" />
            In-Person Pending ({counts.inPersonPendingCount})
          </button>
          <button
            onClick={() => setCurrentTab("free")}
            className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
              currentTab === "free"
                ? "bg-zinc-700 text-white"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            }`}
          >
            Non-Attending / Free ({counts.freeCount})
          </button>
          <button
            onClick={() => setCurrentTab("performers")}
            className={`px-3 py-1 rounded-lg font-semibold transition-colors flex items-center gap-1 ${
              currentTab === "performers"
                ? "bg-amber-600 text-white"
                : "bg-amber-50 text-amber-800 hover:bg-amber-100"
            }`}
          >
            <Music className="w-3 h-3" />
            Stage Requests ({counts.performerCount})
          </button>
          <button
            onClick={() => setCurrentTab("vc_interactions")}
            className={`px-3 py-1 rounded-lg font-semibold transition-colors flex items-center gap-1 ${
              currentTab === "vc_interactions"
                ? "bg-blue-600 text-white"
                : "bg-blue-50 text-blue-800 hover:bg-blue-100"
            }`}
          >
            <HeartHandshake className="w-3 h-3" />
            VC Interactions ({counts.vcCount})
          </button>
        </div>
      </div>

      {/* Registrations Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 bg-white rounded-2xl border border-zinc-200">
          <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
          <p className="text-xs text-zinc-500 font-medium">Fetching all registrations from Firestore...</p>
        </div>
      ) : filteredRegistrations.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-zinc-200 p-8 space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-zinc-100 text-zinc-400 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-zinc-900">No registrations found</h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            {search
              ? `No registrations match your search query "${search}". Try clearing search or switching filter tabs.`
              : "No records found in this category yet."}
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
                  <th className="py-3 px-4">Reg # & Date</th>
                  <th className="py-3 px-4">Alumnus</th>
                  <th className="py-3 px-4">Academic / Org</th>
                  <th className="py-3 px-4">Attendance & Pass</th>
                  <th className="py-3 px-4">Special & Stage</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {filteredRegistrations.map((reg) => {
                  const isAttending = isAttendingRecord(reg);
                  const isVerified = reg.verified || reg.hasPass || reg.passStatus === "active";
                  const hasStage =
                    reg.wantToPerform ||
                    (reg.performanceStatus && reg.performanceStatus !== "none") ||
                    (reg.performerStatus && reg.performerStatus !== "none");
                  const hasVC =
                    reg.wantToInteractWithVC ||
                    (reg.vcInteractionStatus && reg.vcInteractionStatus !== "none") ||
                    Boolean(reg.vcInteractionReason);

                  return (
                    <tr
                      key={reg.id}
                      className="hover:bg-orange-50/30 transition-colors"
                    >
                      {/* Column 1: Reg # & Date */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-zinc-900">{reg.regNumber}</div>
                        <div className="text-[10px] text-zinc-400 mt-0.5">
                          {reg.createdAt ? new Date(reg.createdAt).toLocaleDateString() : "—"}
                        </div>
                      </td>

                      {/* Column 2: Alumnus Details */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-zinc-900">{reg.fullName}</div>
                        <div className="text-[11px] text-zinc-500 font-mono">{reg.email}</div>
                        <div className="text-[10px] text-zinc-400">{reg.phone}</div>
                      </td>

                      {/* Column 3: Academic / Organization */}
                      <td className="py-3.5 px-4">
                        <div className="text-zinc-800 font-semibold">
                          {reg.degree} {reg.branch}
                        </div>
                        <div className="text-[11px] text-zinc-500">
                          Class of {reg.passingYear} • {reg.era || "SBSSU"}
                        </div>
                        {reg.organization && (
                          <div className="text-[10px] text-zinc-400 truncate max-w-[180px]">
                            {reg.currentDesignation ? `${reg.currentDesignation} at ` : ""}
                            {reg.organization}
                          </div>
                        )}
                      </td>

                      {/* Column 4: Attendance & Meet Pass */}
                      <td className="py-3.5 px-4 space-y-1">
                        <div>
                          {isAttending ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Attending (₹1,000)
                            </span>
                          ) : isInPersonPendingRecord(reg) ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-300">
                              <AlertTriangle className="w-3 h-3 text-rose-600" /> In-Person Pending
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 text-zinc-600 border border-zinc-200">
                              Directory Only (Free)
                            </span>
                          )}
                        </div>

                        {isAttending && (
                          <div>
                            {isVerified ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-100/60 px-1.5 py-0.5 rounded">
                                ● Verified Pass Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-800 bg-amber-100/70 px-1.5 py-0.5 rounded">
                                <Clock className="w-2.5 h-2.5" /> Pending Verification
                              </span>
                            )}
                          </div>
                        )}

                        {isInPersonPendingRecord(reg) && (
                          <div className="pt-0.5">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSendSingleReminder(reg.id);
                              }}
                              disabled={actionLoading === `reminder-${reg.id}`}
                              className="inline-flex items-center gap-1 text-[10px] font-bold text-orange-800 bg-orange-100/80 hover:bg-orange-200 px-2 py-0.5 rounded-md border border-orange-300 transition-colors disabled:opacity-50"
                              title="Send payment proof upload reminder email"
                            >
                              <Mail className="w-3 h-3 text-orange-600" />
                              {actionLoading === `reminder-${reg.id}` ? "Sending..." : "Send Reminder"}
                            </button>
                          </div>
                        )}

                        {/* Guest Count Badge */}
                        {(isAttending || isInPersonPendingRecord(reg)) && reg.guestCount && reg.guestCount !== "0" && (
                          <div className="text-[10px] text-zinc-500">
                            +{reg.guestCount} Guest{reg.guestCount !== "1" ? "s" : ""}
                          </div>
                        )}
                      </td>

                      {/* Column 5: Special & Stage Requests */}
                      <td className="py-3.5 px-4 space-y-1">
                        {hasStage && (
                          <div className="flex items-center gap-1">
                            <span
                              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                                reg.performanceStatus === "approved"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : reg.performanceStatus === "rejected"
                                  ? "bg-rose-100 text-rose-800"
                                  : "bg-amber-100 text-amber-900"
                              }`}
                            >
                              <Music className="w-2.5 h-2.5" />
                              Stage: {reg.performanceStatus || "Pending"}
                            </span>
                          </div>
                        )}

                        {hasVC && (
                          <div className="flex items-center gap-1">
                            <span
                              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                                reg.vcInteractionStatus === "approved"
                                  ? "bg-blue-100 text-blue-800"
                                  : reg.vcInteractionStatus === "rejected"
                                  ? "bg-rose-100 text-rose-800"
                                  : "bg-blue-50 text-blue-900"
                              }`}
                            >
                              <HeartHandshake className="w-2.5 h-2.5" />
                              VC Meet: {reg.vcInteractionStatus || "Pending"}
                            </span>
                          </div>
                        )}

                        {reg.specialRequest && (
                          <div
                            title={`Special Request: ${reg.specialRequest}`}
                            className="text-[10px] text-zinc-500 truncate max-w-[150px]"
                          >
                            <span className="font-semibold text-zinc-700">Req:</span> {reg.specialRequest}
                          </div>
                        )}

                        {!hasStage && !hasVC && !reg.specialRequest && (
                          <span className="text-[10px] text-zinc-400">—</span>
                        )}
                      </td>

                      {/* Column 6: Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleOpenDetail(reg)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs shadow-2xs transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Detail
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* COMPREHENSIVE DETAIL MODAL */}
      {selectedReg && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-zinc-200 shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-zinc-200 flex items-center justify-between gap-4 bg-zinc-50/70 shrink-0">
              <div className="space-y-0.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold text-orange-700 bg-orange-100 px-2 py-0.5 rounded-md">
                    {selectedReg.regNumber}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isAttendingRecord(selectedReg)
                        ? "bg-emerald-100 text-emerald-800"
                        : isInPersonPendingRecord(selectedReg)
                        ? "bg-rose-100 text-rose-800 border border-rose-300"
                        : "bg-zinc-200 text-zinc-700"
                    }`}
                  >
                    {isAttendingRecord(selectedReg)
                      ? "Attending (₹1,000)"
                      : isInPersonPendingRecord(selectedReg)
                      ? "In-Person Pending (₹1,000)"
                      : "Directory Only (Free)"}
                  </span>
                  {selectedReg.verified && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Pass Active
                    </span>
                  )}
                </div>
                <h2 className="text-lg sm:text-xl font-extrabold text-zinc-900">
                  {selectedReg.fullName}
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleToggleEdit}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold text-xs transition-colors border ${
                    isEditing
                      ? "bg-zinc-900 text-white border-zinc-900"
                      : "bg-white text-zinc-700 hover:bg-zinc-100 border-zinc-300"
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  {isEditing ? "Cancel Edit" : "Edit Details"}
                </button>
                <button
                  onClick={handleCloseDetail}
                  className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-6 flex-1">
              {/* Status Alert / Feedback */}
              {modalFeedback && (
                <div
                  className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
                    modalFeedback.type === "success"
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-rose-50 text-rose-800 border border-rose-200"
                  }`}
                >
                  {modalFeedback.type === "success" ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span>{modalFeedback.text}</span>
                </div>
              )}

              {/* VIEW MODE vs EDIT MODE */}
              {!isEditing ? (
                <>
                  {/* Grid: Personal & Academic */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Alumnus Identity */}
                    <div className="bg-zinc-50 rounded-2xl border border-zinc-200 p-4 space-y-2.5">
                      <span className="text-xs font-bold text-zinc-700 uppercase tracking-wider flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-orange-600" /> Personal Information
                      </span>
                      <div className="text-xs space-y-1.5">
                        <div>
                          <span className="text-zinc-400">Full Name:</span>{" "}
                          <strong className="text-zinc-900">{selectedReg.fullName}</strong>
                        </div>
                        <div>
                          <span className="text-zinc-400">Google Email:</span>{" "}
                          <span className="font-mono text-zinc-800">{selectedReg.email}</span>
                        </div>
                        <div>
                          <span className="text-zinc-400">Phone:</span>{" "}
                          <span className="text-zinc-800">{selectedReg.phone}</span>
                        </div>
                        {selectedReg.whatsapp && (
                          <div>
                            <span className="text-zinc-400">WhatsApp:</span>{" "}
                            <span className="text-zinc-800">{selectedReg.whatsapp}</span>
                          </div>
                        )}
                        <div>
                          <span className="text-zinc-400">Location:</span>{" "}
                          <span className="text-zinc-800">
                            {[selectedReg.city, selectedReg.state, selectedReg.country]
                              .filter(Boolean)
                              .join(", ") || "—"}
                          </span>
                        </div>
                        {selectedReg.linkedin && (
                          <div>
                            <span className="text-zinc-400">LinkedIn:</span>{" "}
                            <a
                              href={selectedReg.linkedin}
                              target="_blank"
                              rel="noreferrer"
                              className="text-orange-700 hover:underline font-mono inline-flex items-center gap-1"
                            >
                              Profile Link <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Academic & Professional */}
                    <div className="bg-zinc-50 rounded-2xl border border-zinc-200 p-4 space-y-2.5">
                      <span className="text-xs font-bold text-zinc-700 uppercase tracking-wider flex items-center gap-1.5">
                        <GraduationCap className="w-3.5 h-3.5 text-orange-600" /> Academic & Career
                      </span>
                      <div className="text-xs space-y-1.5">
                        <div>
                          <span className="text-zinc-400">Degree & Branch:</span>{" "}
                          <strong className="text-zinc-900">
                            {selectedReg.degree} {selectedReg.branch}
                          </strong>
                        </div>
                        <div>
                          <span className="text-zinc-400">Passing Year:</span>{" "}
                          <strong className="text-zinc-900">{selectedReg.passingYear}</strong>
                        </div>
                        <div>
                          <span className="text-zinc-400">University Era:</span>{" "}
                          <span className="text-zinc-800 font-semibold">{selectedReg.era || "SBSSU"}</span>
                        </div>
                        {selectedReg.rollNumber && (
                          <div>
                            <span className="text-zinc-400">Roll Number:</span>{" "}
                            <span className="font-mono text-zinc-800">{selectedReg.rollNumber}</span>
                          </div>
                        )}
                        <div>
                          <span className="text-zinc-400">Designation / Role:</span>{" "}
                          <span className="text-zinc-800">{selectedReg.currentDesignation || "—"}</span>
                        </div>
                        <div>
                          <span className="text-zinc-400">Organization:</span>{" "}
                          <span className="text-zinc-800">{selectedReg.organization || "—"}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Accompanying Guests */}
                  <div className="bg-zinc-50 rounded-2xl border border-zinc-200 p-4 space-y-2">
                    <span className="text-xs font-bold text-zinc-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-orange-600" /> Accompanying Guests (Max 3)
                    </span>
                    {selectedReg.guestCount && selectedReg.guestCount !== "0" ? (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                        {selectedReg.guest1Name && (
                          <div className="p-2.5 rounded-xl bg-white border border-zinc-200 text-xs">
                            <span className="text-zinc-400 text-[10px] block font-semibold">Guest 1</span>
                            <div className="font-bold text-zinc-900">{selectedReg.guest1Name}</div>
                            <div className="text-zinc-500 text-[11px]">Relation: {selectedReg.guest1Relation || "—"}</div>
                          </div>
                        )}
                        {selectedReg.guest2Name && (
                          <div className="p-2.5 rounded-xl bg-white border border-zinc-200 text-xs">
                            <span className="text-zinc-400 text-[10px] block font-semibold">Guest 2</span>
                            <div className="font-bold text-zinc-900">{selectedReg.guest2Name}</div>
                            <div className="text-zinc-500 text-[11px]">Relation: {selectedReg.guest2Relation || "—"}</div>
                          </div>
                        )}
                        {selectedReg.guest3Name && (
                          <div className="p-2.5 rounded-xl bg-white border border-zinc-200 text-xs">
                            <span className="text-zinc-400 text-[10px] block font-semibold">Guest 3</span>
                            <div className="font-bold text-zinc-900">{selectedReg.guest3Name}</div>
                            <div className="text-zinc-500 text-[11px]">Relation: {selectedReg.guest3Relation || "—"}</div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-zinc-500">No accompanying guests registered.</p>
                    )}
                  </div>

                  {/* SPECIAL REQUEST CALLOUT */}
                  <div className="bg-amber-50/50 rounded-2xl border border-amber-200 p-4 space-y-1.5">
                    <span className="text-xs font-bold text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-amber-600" /> Special Request
                    </span>
                    {selectedReg.specialRequest ? (
                      <p className="text-xs text-zinc-800 bg-white p-3 rounded-xl border border-amber-200 leading-relaxed">
                        {selectedReg.specialRequest}
                      </p>
                    ) : (
                      <p className="text-xs text-zinc-400 italic">None entered (Default: "")</p>
                    )}
                  </div>

                  {/* Nostalgic Message */}
                  {selectedReg.memoriesMessage && (
                    <div className="bg-zinc-50 rounded-2xl border border-zinc-200 p-4 space-y-1.5">
                      <span className="text-xs font-bold text-zinc-700 uppercase tracking-wider">
                        Nostalgic Message / Words for the University
                      </span>
                      <p className="text-xs text-zinc-700 bg-white p-3 rounded-xl border border-zinc-200 italic leading-relaxed">
                        "{selectedReg.memoriesMessage}"
                      </p>
                    </div>
                  )}

                  {/* UPI QR Payment Details & Verification */}
                  <div className="bg-zinc-50 rounded-2xl border border-zinc-200 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-700 uppercase tracking-wider flex items-center gap-1.5">
                        <Ticket className="w-3.5 h-3.5 text-orange-600" /> UPI Payment & Verification
                      </span>
                      <div className="flex items-center gap-2">
                        {selectedReg.verified ? (
                          <button
                            onClick={() => handleTogglePaymentVerify(false)}
                            disabled={actionLoading === "pay-false"}
                            className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-2xs transition-colors disabled:opacity-50"
                          >
                            {actionLoading === "pay-false" ? "Revoking..." : "Revoke / Unverify"}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleTogglePaymentVerify(true)}
                            disabled={actionLoading === "pay-true"}
                            className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-2xs transition-colors disabled:opacity-50"
                          >
                            {actionLoading === "pay-true" ? "Verifying..." : "Verify & Issue Pass"}
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                      <div className="p-2.5 rounded-xl bg-white border border-zinc-200">
                        <span className="text-zinc-400 text-[10px] block">Txn ID</span>
                        <span className="font-mono font-bold text-zinc-900 break-all">
                          {selectedReg.txnId || "N/A"}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white border border-zinc-200">
                        <span className="text-zinc-400 text-[10px] block">Payment Mode</span>
                        <span className="font-semibold text-zinc-800">{selectedReg.paymentMode || "UPI_QR"}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white border border-zinc-200">
                        <span className="text-zinc-400 text-[10px] block">Amount</span>
                        <span className="font-bold text-zinc-900">₹{selectedReg.amount || "0"}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white border border-zinc-200">
                        <span className="text-zinc-400 text-[10px] block">Pass Status</span>
                        <span
                          className={`font-bold ${
                            selectedReg.verified
                              ? "text-emerald-700"
                              : isAttendingRecord(selectedReg)
                              ? "text-amber-700"
                              : isInPersonPendingRecord(selectedReg)
                              ? "text-rose-700"
                              : "text-zinc-500"
                          }`}
                        >
                          {selectedReg.verified
                            ? "Active (Verified)"
                            : isAttendingRecord(selectedReg)
                            ? "Pending Verification"
                            : isInPersonPendingRecord(selectedReg)
                            ? "Payment Proof Not Uploaded"
                            : "Not Attending (Free)"}
                        </span>
                      </div>
                    </div>

                    {/* In-Person Pending Alert & Direct Reminder Dispatch */}
                    {isInPersonPendingRecord(selectedReg) && (
                      <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-rose-900">
                            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                            <span>In-Person Pending: Payment Proof Not Uploaded</span>
                          </div>
                          <p className="text-[11px] text-rose-700">
                            Selected ₹1,000 Meet pass, but closed the website before submitting UPI Txn ID or screenshot.
                            {selectedReg.lastPaymentReminderSentAt && (
                              <span className="block text-[10px] text-rose-600 font-medium mt-0.5">
                                Last reminder dispatched: {new Date(selectedReg.lastPaymentReminderSentAt).toLocaleString()}
                              </span>
                            )}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleSendSingleReminder(selectedReg.id)}
                          disabled={actionLoading === `reminder-${selectedReg.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition-colors shrink-0 disabled:opacity-50"
                        >
                          {actionLoading === `reminder-${selectedReg.id}` ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Sending...
                            </>
                          ) : (
                            <>
                              <Mail className="w-3.5 h-3.5" /> Send Reminder Email
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {/* Screenshot Viewer */}
                    {selectedReg.screenshotUrl ? (
                      <div className="pt-2 flex items-center gap-3">
                        <div
                          onClick={() => setPreviewScreenshotUrl(selectedReg.screenshotUrl || null)}
                          className="relative w-20 h-20 rounded-xl overflow-hidden border border-zinc-300 bg-zinc-100 cursor-pointer hover:opacity-90 transition-opacity"
                        >
                          <img
                            src={selectedReg.screenshotUrl}
                            alt="Payment screenshot"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="text-xs space-y-1">
                          <button
                            type="button"
                            onClick={() => setPreviewScreenshotUrl(selectedReg.screenshotUrl || null)}
                            className="inline-flex items-center gap-1.5 font-semibold text-orange-700 hover:underline"
                          >
                            <Camera className="w-3.5 h-3.5" /> View Full Payment Screenshot
                          </button>
                          <p className="text-[11px] text-zinc-400">
                            Click to inspect UPI transaction details and receipt.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-zinc-400 italic">No payment screenshot uploaded.</p>
                    )}
                  </div>

                  {/* STAGE PERFORMANCE APPROVAL SECTION */}
                  <div className="bg-amber-50/70 rounded-2xl border border-amber-200 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                        <Music className="w-3.5 h-3.5 text-amber-600" /> Stage Performance Request
                      </span>
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                          selectedReg.performanceStatus === "approved"
                            ? "bg-emerald-600 text-white"
                            : selectedReg.performanceStatus === "rejected"
                            ? "bg-rose-600 text-white"
                            : "bg-amber-200 text-amber-900"
                        }`}
                      >
                        Status: {selectedReg.performanceStatus || (selectedReg.wantToPerform ? "Pending" : "None")}
                      </span>
                    </div>

                    {selectedReg.wantToPerform || selectedReg.performanceType ? (
                      <div className="space-y-3">
                        <div className="bg-white p-3 rounded-xl border border-amber-200 text-xs space-y-1">
                          <div>
                            <span className="text-zinc-400">Proposed Performance:</span>{" "}
                            <strong className="text-zinc-900">{selectedReg.performanceType || "Not specified"}</strong>
                          </div>
                          {selectedReg.performanceAdminRemarks && (
                            <div>
                              <span className="text-zinc-400">Admin Remarks:</span>{" "}
                              <span className="text-zinc-700">{selectedReg.performanceAdminRemarks}</span>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons for Stage */}
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          <button
                            onClick={() => handlePerformanceDecision("approved", "Approved by Admin")}
                            disabled={actionLoading === "perf-approved"}
                            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-2xs transition-colors disabled:opacity-50"
                          >
                            {actionLoading === "perf-approved" ? "Updating..." : "Approve for Stage"}
                          </button>
                          <button
                            onClick={() => handlePerformanceDecision("rejected", "Slots full / not approved")}
                            disabled={actionLoading === "perf-rejected"}
                            className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-2xs transition-colors disabled:opacity-50"
                          >
                            {actionLoading === "perf-rejected" ? "Updating..." : "Reject Performance"}
                          </button>
                          <button
                            onClick={() => handlePerformanceDecision("pending", "")}
                            disabled={actionLoading === "perf-pending"}
                            className="px-3.5 py-1.5 rounded-xl bg-zinc-200 hover:bg-zinc-300 text-zinc-700 font-semibold text-xs transition-colors disabled:opacity-50"
                          >
                            {actionLoading === "perf-pending" ? "Resetting..." : "Revoke / Reset Status"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-zinc-500">Alumnus did not request to perform on stage.</p>
                    )}
                  </div>

                  {/* VICE CHANCELLOR INTERACTION APPROVAL SECTION */}
                  <div className="bg-blue-50/70 rounded-2xl border border-blue-200 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-950 uppercase tracking-wider flex items-center gap-1.5">
                        <HeartHandshake className="w-3.5 h-3.5 text-blue-600" /> Vice Chancellor Meeting Request
                      </span>
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                          selectedReg.vcInteractionStatus === "approved"
                            ? "bg-emerald-600 text-white"
                            : selectedReg.vcInteractionStatus === "rejected"
                            ? "bg-rose-600 text-white"
                            : "bg-blue-200 text-blue-900"
                        }`}
                      >
                        Status: {selectedReg.vcInteractionStatus || (selectedReg.wantToInteractWithVC ? "Pending" : "None")}
                      </span>
                    </div>

                    {selectedReg.wantToInteractWithVC || selectedReg.vcInteractionReason ? (
                      <div className="space-y-3">
                        <div className="bg-white p-3 rounded-xl border border-blue-200 text-xs space-y-1.5">
                          {selectedReg.vcInteractionPortfolio && (
                            <div>
                              <span className="text-zinc-400">Portfolio / LinkedIn:</span>{" "}
                              <a
                                href={selectedReg.vcInteractionPortfolio}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-700 hover:underline font-mono inline-flex items-center gap-1"
                              >
                                {selectedReg.vcInteractionPortfolio} <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          )}
                          <div>
                            <span className="text-zinc-400">Discussion Topic / Reason:</span>
                            <p className="text-zinc-800 mt-0.5 font-medium leading-relaxed">
                              {selectedReg.vcInteractionReason || "No topic provided"}
                            </p>
                          </div>
                          {selectedReg.vcInteractionAdminRemarks && (
                            <div>
                              <span className="text-zinc-400">Admin Remarks:</span>{" "}
                              <span className="text-zinc-700">{selectedReg.vcInteractionAdminRemarks}</span>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons for VC Interaction */}
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          <button
                            onClick={() => handleVCDecision("approved", "Approved by VC office")}
                            disabled={actionLoading === "vc-approved"}
                            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-2xs transition-colors disabled:opacity-50"
                          >
                            {actionLoading === "vc-approved" ? "Updating..." : "Approve VC Meeting"}
                          </button>
                          <button
                            onClick={() => handleVCDecision("rejected", "Time constraint / not approved")}
                            disabled={actionLoading === "vc-rejected"}
                            className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-2xs transition-colors disabled:opacity-50"
                          >
                            {actionLoading === "vc-rejected" ? "Updating..." : "Reject Meeting"}
                          </button>
                          <button
                            onClick={() => handleVCDecision("pending", "")}
                            disabled={actionLoading === "vc-pending"}
                            className="px-3.5 py-1.5 rounded-xl bg-zinc-200 hover:bg-zinc-300 text-zinc-700 font-semibold text-xs transition-colors disabled:opacity-50"
                          >
                            {actionLoading === "vc-pending" ? "Resetting..." : "Revoke / Reset Status"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-zinc-500">Alumnus did not request interaction with the Vice Chancellor.</p>
                    )}
                  </div>

                  {/* Pass Link Preview */}
                  <div className="pt-2 flex items-center justify-between text-xs border-t border-zinc-200">
                    <span className="text-zinc-500">Official Pass URL:</span>
                    <Link
                      href={`/sanjh-2026/pass/${selectedReg.id}`}
                      target="_blank"
                      className="font-semibold text-orange-700 hover:underline inline-flex items-center gap-1"
                    >
                      Open Live Pass (/sanjh-2026/pass/{selectedReg.id}) <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </>
              ) : (
                /* EDIT MODE: EDIT ANY FIELD DIRECTLY */
                <div className="space-y-4">
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 font-medium">
                    You are in <strong>Admin Edit Mode</strong>. You can modify any registration field below and click <strong>Save Changes</strong> to write directly to Firestore.
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-zinc-600 font-semibold mb-1">Full Name</label>
                      <input
                        type="text"
                        value={editForm.fullName || ""}
                        onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-600 font-semibold mb-1">Email</label>
                      <input
                        type="email"
                        value={editForm.email || ""}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-600 font-semibold mb-1">Phone</label>
                      <input
                        type="text"
                        value={editForm.phone || ""}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-600 font-semibold mb-1">WhatsApp</label>
                      <input
                        type="text"
                        value={editForm.whatsapp || ""}
                        onChange={(e) => setEditForm({ ...editForm, whatsapp: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-600 font-semibold mb-1">Degree</label>
                      <input
                        type="text"
                        value={editForm.degree || ""}
                        onChange={(e) => setEditForm({ ...editForm, degree: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-600 font-semibold mb-1">Branch</label>
                      <input
                        type="text"
                        value={editForm.branch || ""}
                        onChange={(e) => setEditForm({ ...editForm, branch: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-600 font-semibold mb-1">Passing Year</label>
                      <input
                        type="text"
                        value={editForm.passingYear || ""}
                        onChange={(e) => setEditForm({ ...editForm, passingYear: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-600 font-semibold mb-1">Roll Number</label>
                      <input
                        type="text"
                        value={editForm.rollNumber || ""}
                        onChange={(e) => setEditForm({ ...editForm, rollNumber: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-600 font-semibold mb-1">Designation</label>
                      <input
                        type="text"
                        value={editForm.currentDesignation || ""}
                        onChange={(e) => setEditForm({ ...editForm, currentDesignation: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-600 font-semibold mb-1">Organization</label>
                      <input
                        type="text"
                        value={editForm.organization || ""}
                        onChange={(e) => setEditForm({ ...editForm, organization: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-600 font-semibold mb-1">City</label>
                      <input
                        type="text"
                        value={editForm.city || ""}
                        onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-600 font-semibold mb-1">State</label>
                      <input
                        type="text"
                        value={editForm.state || ""}
                        onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>

                  {/* Attendance & Guests Edit */}
                  <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 space-y-3 text-xs">
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(editForm.attendingMeet)}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              attendingMeet: e.target.checked,
                              amount: e.target.checked ? "1000" : "0",
                            })
                          }
                          className="rounded text-orange-600 focus:ring-orange-500"
                        />
                        <span className="font-semibold text-zinc-800">Attending Meet (₹1,000)</span>
                      </label>
                      <span className="text-zinc-400">Amount: ₹{editForm.amount || "0"}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div>
                        <label className="block text-zinc-500 font-medium mb-0.5">Guest 1 Name</label>
                        <input
                          type="text"
                          value={editForm.guest1Name || ""}
                          onChange={(e) => setEditForm({ ...editForm, guest1Name: e.target.value })}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-300"
                        />
                        <label className="block text-zinc-500 font-medium mt-1 mb-0.5">Relation</label>
                        <select
                          value={editForm.guest1Relation || ""}
                          onChange={(e) => setEditForm({ ...editForm, guest1Relation: e.target.value })}
                          className="w-full px-2 py-1 rounded-lg border border-zinc-300"
                        >
                          <option value="">Select Relation</option>
                          <option value="Spouse">Spouse</option>
                          <option value="Child">Child</option>
                          <option value="Mom">Mom</option>
                          <option value="Dad">Dad</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-zinc-500 font-medium mb-0.5">Guest 2 Name</label>
                        <input
                          type="text"
                          value={editForm.guest2Name || ""}
                          onChange={(e) => setEditForm({ ...editForm, guest2Name: e.target.value })}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-300"
                        />
                        <label className="block text-zinc-500 font-medium mt-1 mb-0.5">Relation</label>
                        <select
                          value={editForm.guest2Relation || ""}
                          onChange={(e) => setEditForm({ ...editForm, guest2Relation: e.target.value })}
                          className="w-full px-2 py-1 rounded-lg border border-zinc-300"
                        >
                          <option value="">Select Relation</option>
                          <option value="Spouse">Spouse</option>
                          <option value="Child">Child</option>
                          <option value="Mom">Mom</option>
                          <option value="Dad">Dad</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-zinc-500 font-medium mb-0.5">Guest 3 Name</label>
                        <input
                          type="text"
                          value={editForm.guest3Name || ""}
                          onChange={(e) => setEditForm({ ...editForm, guest3Name: e.target.value })}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-300"
                        />
                        <label className="block text-zinc-500 font-medium mt-1 mb-0.5">Relation</label>
                        <select
                          value={editForm.guest3Relation || ""}
                          onChange={(e) => setEditForm({ ...editForm, guest3Relation: e.target.value })}
                          className="w-full px-2 py-1 rounded-lg border border-zinc-300"
                        >
                          <option value="">Select Relation</option>
                          <option value="Spouse">Spouse</option>
                          <option value="Child">Child</option>
                          <option value="Mom">Mom</option>
                          <option value="Dad">Dad</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Special Request Edit */}
                  <div>
                    <label className="block text-zinc-600 font-semibold mb-1 text-xs">
                      Special Request (Default: "")
                    </label>
                    <input
                      type="text"
                      value={editForm.specialRequest || ""}
                      onChange={(e) => setEditForm({ ...editForm, specialRequest: e.target.value })}
                      placeholder="Special assistance, accommodations, etc."
                      className="w-full px-3 py-2 rounded-xl border border-zinc-300 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  {/* Stage Performance & VC Interaction Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200 space-y-2">
                      <label className="flex items-center gap-2 cursor-pointer font-semibold text-amber-900">
                        <input
                          type="checkbox"
                          checked={Boolean(editForm.wantToPerform)}
                          onChange={(e) => setEditForm({ ...editForm, wantToPerform: e.target.checked })}
                          className="rounded text-amber-600"
                        />
                        Wants Stage Performance
                      </label>
                      <input
                        type="text"
                        value={editForm.performanceType || ""}
                        onChange={(e) => setEditForm({ ...editForm, performanceType: e.target.value })}
                        placeholder="Performance Type (e.g. Singing, Speech, Poetry)"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-300"
                      />
                    </div>

                    <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-200 space-y-2">
                      <label className="flex items-center gap-2 cursor-pointer font-semibold text-blue-900">
                        <input
                          type="checkbox"
                          checked={Boolean(editForm.wantToInteractWithVC)}
                          onChange={(e) =>
                            setEditForm({ ...editForm, wantToInteractWithVC: e.target.checked })
                          }
                          className="rounded text-blue-600"
                        />
                        Wants VC Interaction
                      </label>
                      <input
                        type="text"
                        value={editForm.vcInteractionPortfolio || ""}
                        onChange={(e) =>
                          setEditForm({ ...editForm, vcInteractionPortfolio: e.target.value })
                        }
                        placeholder="Portfolio / LinkedIn Link"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-300"
                      />
                      <input
                        type="text"
                        value={editForm.vcInteractionReason || ""}
                        onChange={(e) =>
                          setEditForm({ ...editForm, vcInteractionReason: e.target.value })
                        }
                        placeholder="Reason / Topic for Discussion"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-300"
                      />
                    </div>
                  </div>

                  {/* UPI QR Txn ID Edit */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-zinc-600 font-semibold mb-1">Transaction ID (Txn ID)</label>
                      <input
                        type="text"
                        value={editForm.txnId || ""}
                        onChange={(e) => setEditForm({ ...editForm, txnId: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-zinc-300 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-600 font-semibold mb-1">Payment Mode</label>
                      <input
                        type="text"
                        value={editForm.paymentMode || ""}
                        onChange={(e) => setEditForm({ ...editForm, paymentMode: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-zinc-300"
                      />
                    </div>
                  </div>

                  {/* Save Edits Action Bar */}
                  <div className="pt-3 flex items-center justify-end gap-3 border-t border-zinc-200">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-semibold text-xs transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveEdits}
                      disabled={savingEdit}
                      className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs transition-colors disabled:opacity-50"
                    >
                      {savingEdit ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving to Firestore...
                        </>
                      ) : (
                        <>
                          <Save className="w-3.5 h-3.5" /> Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-zinc-200 bg-zinc-50 flex items-center justify-between text-xs shrink-0">
              <span className="text-zinc-400">
                Created: {selectedReg.createdAt ? new Date(selectedReg.createdAt).toLocaleString() : "—"}
              </span>
              <button
                onClick={handleCloseDetail}
                className="px-4 py-1.5 rounded-xl bg-zinc-200 hover:bg-zinc-300 text-zinc-800 font-semibold text-xs transition-colors"
              >
                Close
              </button>
            </div>
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
              <h3 className="font-bold text-sm text-zinc-900">Payment Screenshot</h3>
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
                Open Original in New Tab <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* BULK REMINDER CONFIRMATION MODAL */}
      {bulkEmailConfirmOpen && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-zinc-200">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-base text-zinc-900">
                  Send Bulk Payment Reminders
                </h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  You are about to send reminder emails to all{" "}
                  <strong className="text-rose-700">
                    {counts.inPersonPendingCount} alumni
                  </strong>{" "}
                  marked as <span className="font-semibold text-zinc-900">In-Person Pending</span>.
                </p>
              </div>
            </div>

            <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 text-xs text-zinc-600 space-y-1.5">
              <p className="font-semibold text-zinc-800">What this email contains:</p>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-zinc-500">
                <li>Direct link to their unique payment & screenshot upload page</li>
                <li>Instructions on how to submit UPI ID & proof if already paid</li>
                <li>Clarification that without proof, they will be treated as registered for the directory only</li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setBulkEmailConfirmOpen(false)}
                disabled={bulkEmailLoading}
                className="px-4 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-semibold text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendBulkReminder}
                disabled={bulkEmailLoading}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-2xs transition-colors disabled:opacity-50"
              >
                {bulkEmailLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Dispatching Emails...
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" /> Confirm & Send All
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
