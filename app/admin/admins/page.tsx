"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useForm } from "@/lib/useForm";
import {
  getAuthorizedAdmins,
  addAuthorizedAdmin,
  removeAuthorizedAdmin,
} from "@/lib/actions/adminActions";
import type { AuthorizedAdmin } from "@/lib/types";
import {
  ShieldCheck,
  UserPlus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Mail,
  FileText,
  Clock,
} from "lucide-react";

export default function ManageAdminsPage() {
  const { user } = useAuth();
  const [admins, setAdmins] = useState<AuthorizedAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Autocomplete tracking:
  // "autotype gmail.com once @ is detected (only do this once, if user types backspace, dont autocomplete next time)"
  const [hasAutocompleted, setHasAutocompleted] = useState(false);
  const [backspacedAfterAutocomplete, setBackspacedAfterAutocomplete] = useState(false);

  // Form using only the requested fields: Gmail ID & Remark (Optional)
  const { form, handleChange, setFields, resetFormFields } = useForm({
    email: "",
    remark: "",
  });

  const loadAdmins = () => {
    getAuthorizedAdmins()
      .then((res) => {
        if (res.success && res.data) {
          setAdmins(res.data);
        }
      })
      .catch((err) => console.error("Error loading admins:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  const handleEmailKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && hasAutocompleted) {
      // User pressed backspace after autocomplete triggered; disable future autocompletes
      setBackspacedAfterAutocomplete(true);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;

    // Autotype gmail.com once @ is detected (only do this once, if user types backspace, dont autocomplete next time)
    if (!hasAutocompleted && !backspacedAfterAutocomplete) {
      if (val.endsWith("@") && (val.match(/@/g) || []).length === 1) {
        const autocompleted = val + "gmail.com";
        setHasAutocompleted(true);
        setFields({ email: autocompleted });
        return;
      }
    }

    handleChange(e);
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.email.trim()) return;

    setSubmitting(true);
    setMessage(null);

    try {
      const res = await addAuthorizedAdmin(
        form.email.trim(),
        "faculty",
        user?.email || "admin",
        form.remark?.trim()
      );

      if (res.success) {
        setMessage({
          type: "success",
          text: `Authorized ${form.email} as faculty/admin.`,
        });
        resetFormFields();
        setHasAutocompleted(false);
        setBackspacedAfterAutocomplete(false);
        loadAdmins();
      } else {
        setMessage({
          type: "error",
          text: res.error || "Failed to add authorized account.",
        });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err?.message || "Failed to add admin" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (email: string) => {
    if (email === user?.email) {
      alert("You cannot remove your own active administrator account.");
      return;
    }

    if (!confirm(`Revoke permissions for ${email}?`)) {
      return;
    }

    try {
      const res = await removeAuthorizedAdmin(email);
      if (res.success) {
        setMessage({ type: "success", text: `Revoked access for ${email}.` });
        loadAdmins();
      } else {
        setMessage({ type: "error", text: res.error || "Failed to revoke account" });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err?.message || "Failed to revoke account" });
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/70 px-2.5 py-0.5 rounded-full mb-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
          Access Control
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
          Authorized Faculty & Admin Accounts
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500">
          Stored in Firestore (`authorized_admins` collection). Only authorized Gmails can access the admin portal and verify gate passes at Sanjh 2026.
        </p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-center gap-2 ${
            message.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
              : "bg-rose-50 border-rose-200 text-rose-900"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Add Faculty/Admin Form - 5 cols */}
        <div className="md:col-span-5">
          <form
            onSubmit={handleAddAdmin}
            className="bg-white rounded-3xl border border-zinc-200 p-6 shadow-2xs space-y-4"
          >
            <h2 className="font-bold text-zinc-900 text-base flex items-center gap-2 border-b border-zinc-100 pb-2">
              <UserPlus className="w-4 h-4 text-orange-600" />
              Authorize New Gmail
            </h2>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Gmail ID <span className="text-orange-600">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-zinc-400" />
                <input
                  type="text"
                  name="email"
                  required
                  value={form.email}
                  onChange={handleEmailChange}
                  onKeyDown={handleEmailKeyDown}
                  placeholder="faculty@gmail.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-zinc-300 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono"
                />
              </div>
              <p className="text-[11px] text-zinc-400 mt-1">
                Type @ to auto-fill gmail.com once.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1">
                Remark <span className="text-zinc-400 font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <FileText className="w-4 h-4 absolute left-3 top-3 text-zinc-400" />
                <input
                  type="text"
                  name="remark"
                  value={form.remark}
                  onChange={handleChange}
                  placeholder="e.g. Dr. Harpreet Kaur / Gate Verification"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-zinc-300 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <p className="text-[11px] text-zinc-400 mt-1">
                Optional note, faculty name, or department.
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs transition-colors shadow-2xs disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Authorizing in Firestore...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Authorize Gmail
                </>
              )}
            </button>
          </form>
        </div>

        {/* Current Accounts List - 7 cols */}
        <div className="md:col-span-7 space-y-4">
          <div className="bg-white rounded-3xl border border-zinc-200 p-6 shadow-2xs space-y-4">
            <h2 className="font-bold text-zinc-900 text-base border-b border-zinc-100 pb-2">
              Authorized Accounts ({admins.length})
            </h2>

            {loading ? (
              <div className="py-12 flex justify-center">
                <Loader2 className="w-6 h-6 text-orange-600 animate-spin" />
              </div>
            ) : admins.length === 0 ? (
              <p className="text-xs text-zinc-400 py-6 text-center">
                No accounts authorized yet.
              </p>
            ) : (
              <div className="divide-y divide-zinc-100">
                {admins.map((adm) => (
                  <div
                    key={adm.email}
                    className="py-3 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="font-bold text-zinc-900 flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono text-zinc-800">{adm.email}</span>
                        {adm.email === user?.email && (
                          <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                            YOU
                          </span>
                        )}
                        <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-zinc-100 text-zinc-600 uppercase">
                          {adm.role}
                        </span>
                      </div>
                      {adm.remark && (
                        <div className="text-zinc-600 text-[11px]">
                          Remark: <span className="font-medium">{adm.remark}</span>
                        </div>
                      )}
                      {adm.addedAt && (
                        <div className="text-[10px] text-zinc-400">
                          Added: {new Date(adm.addedAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>

                    {adm.email !== user?.email && (
                      <button
                        onClick={() => handleRemove(adm.email)}
                        title="Revoke access"
                        className="p-1.5 text-zinc-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
