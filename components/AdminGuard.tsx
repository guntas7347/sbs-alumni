"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "./AuthProvider";
import { verifyAdminEmail } from "@/lib/actions/adminActions";
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Loader2,
  ArrowRight,
  LogOut,
  Users,
  CheckCircle2,
} from "lucide-react";

export default function AdminGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, signIn, signOut } = useAuth();
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [bootstrapNotice, setBootstrapNotice] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (user?.email) {
        setChecking(true);
        verifyAdminEmail(user.email)
          .then((res) => {
            setAuthorized(res.authorized);
            setRole(res.role || null);
            if (res.isInitialBootstrap) {
              setBootstrapNotice(true);
            }
          })
          .catch(() => setAuthorized(false))
          .finally(() => setChecking(false));
      } else {
        setAuthorized(false);
      }
    }
  }, [user, loading]);

  if (loading || checking) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
        <p className="text-sm text-zinc-500 font-medium">
          Verifying administrator permissions in Firestore...
        </p>
      </div>
    );
  }

  // Not signed in with Google
  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-6">
        <div className="bg-white rounded-3xl border border-zinc-200 p-8 shadow-sm space-y-5">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center">
            <Lock className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-widest text-orange-700">
              Admin Portal
            </span>
            <h1 className="text-2xl font-extrabold text-zinc-900">
              Administrator Sign In
            </h1>
            <p className="text-xs text-zinc-500">
              Sign in with your authorized SBSSU administrator Google account.
            </p>
          </div>

          <button
            onClick={() => signIn()}
            className="w-full inline-flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-white hover:bg-zinc-50 text-zinc-800 font-bold text-xs border border-zinc-300 shadow-2xs transition-all"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  // Signed in but not authorized in Firestore
  if (!authorized) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center space-y-6">
        <div className="bg-white rounded-3xl border border-rose-200 p-8 shadow-sm space-y-5">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
            <ShieldAlert className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-widest text-rose-700">
              Access Restricted
            </span>
            <h1 className="text-2xl font-extrabold text-zinc-900">
              Unauthorized Google Account
            </h1>
            <p className="text-xs text-zinc-600">
              The Google account <strong className="text-zinc-900">{user.email}</strong> is not listed in the authorized administrators collection in Firestore.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-500 text-left">
            To gain administrator access to view and manage alumni registrations, your email must be authorized by an existing administrator.
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => signOut()}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign in with different account
            </button>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-orange-700 hover:text-orange-800"
            >
              Back to Home <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Authorized Admin
  return (
    <div className="flex flex-col min-h-screen bg-zinc-50/70 text-zinc-900 font-sans">
      {bootstrapNotice && (
        <div className="bg-emerald-600 text-white px-4 py-2 text-xs text-center font-medium flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          First-time setup: Your account ({user.email}) has been provisioned as the initial Super Administrator in Firestore!
        </div>
      )}

      {/* Dedicated Executive Admin Navbar */}
      <header className="sticky top-0 z-50 bg-white border-b border-zinc-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo & Admin Branding */}
            <div className="flex items-center gap-3">
              <Link href="/admin" className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200 p-1 flex items-center justify-center shrink-0">
                  <Image
                    src="/sbssu-logo.png"
                    alt="SBSSU Logo"
                    width={36}
                    height={36}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-sm sm:text-base tracking-tight text-zinc-900">
                      SBSSU Admin
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-orange-100 text-orange-800 border border-orange-200">
                      PORTAL
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-400 hidden sm:block">
                    Shaheed Bhagat Singh State University
                  </span>
                </div>
              </Link>
            </div>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 text-xs font-semibold">
              <Link
                href="/admin"
                className="px-3 py-2 rounded-xl text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/admin/sanjh-2026/registeristration"
                className="px-3 py-2 rounded-xl text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
              >
                Sanjh Registrations
              </Link>
              <Link
                href="/admin/alumni-registrations"
                className="px-3 py-2 rounded-xl text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
              >
                Alumni Directory
              </Link>
              <Link
                href="/admin/admins"
                className="px-3 py-2 rounded-xl text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
              >
                Manage Admins & Faculty
              </Link>
              <Link
                href="/admin/razorpay"
                className="px-3 py-2 rounded-xl text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 transition-colors flex items-center gap-1.5"
              >
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <span>Razorpay</span>
              </Link>
            </nav>

            {/* User Profile & Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-bold text-zinc-800 font-mono truncate max-w-[180px]">
                  {user.email}
                </span>
                <span className="text-[10px] text-emerald-700 font-semibold uppercase tracking-wider">
                  ● {role || "Administrator"}
                </span>
              </div>

              <Link
                href="/"
                title="Exit to University Public Website"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-semibold transition-colors border border-zinc-200"
              >
                <span>Main Site</span>
                <ArrowRight className="w-3 h-3 text-zinc-500" />
              </Link>

              <button
                onClick={() => signOut()}
                title="Sign out of Admin session"
                className="inline-flex items-center gap-1 p-2 rounded-xl text-zinc-500 hover:text-rose-600 hover:bg-rose-50 border border-zinc-200 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mobile Navigation bar */}
          <div className="flex md:hidden overflow-x-auto py-2 border-t border-zinc-100 gap-1 text-[11px] font-semibold">
            <Link
              href="/admin"
              className="px-2.5 py-1 rounded-lg text-zinc-700 hover:bg-zinc-100 shrink-0"
            >
              Dashboard
            </Link>
            <Link
              href="/admin/sanjh-2026/registeristration"
              className="px-2.5 py-1 rounded-lg text-zinc-700 hover:bg-zinc-100 shrink-0"
            >
              Registrations
            </Link>
            <Link
              href="/admin/admins"
              className="px-2.5 py-1 rounded-lg text-zinc-700 hover:bg-zinc-100 shrink-0"
            >
              Admins / Faculty
            </Link>
            <Link
              href="/admin/razorpay"
              className="px-2.5 py-1 rounded-lg text-zinc-700 hover:bg-zinc-100 shrink-0 flex items-center gap-1"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
              Razorpay
            </Link>
          </div>
        </div>
      </header>

      {/* Main Admin Content Shell */}
      <main className="flex-1">
        {children}
      </main>

      {/* Dedicated Admin Footer */}
      <footer className="bg-white border-t border-zinc-200 py-6 px-4 sm:px-6 lg:px-8 text-center text-xs text-zinc-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Shaheed Bhagat Singh State University • Alumni Association Administration
          </span>
          <span className="text-[11px]">
            Restricted Access • Logged session for {user.email}
          </span>
        </div>
      </footer>
    </div>
  );
}
