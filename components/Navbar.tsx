"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "./AuthProvider";
import {
  Menu,
  X,
  Sparkles,
  User as UserIcon,
  LogOut,
  ShieldCheck,
  Calendar,
  Ticket,
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const { user, loading, isAdmin, signIn, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Sanjh 2026", href: "/sanjh-2026", badge: "Nov 14" },
    { name: "Schedule", href: "/schedule" },
    { name: "Legacy & About", href: "/about" },
    { name: "Register", href: "/sanjh-2026/register", highlight: true },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-orange-100 shadow-xs">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-orange-50 via-white to-emerald-50 border-b border-orange-100/60 px-4 py-1.5 text-xs text-zinc-700 font-medium">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 truncate">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-orange-100 text-orange-800 border border-orange-200">
              ALUMNI PORTAL
            </span>
            <span className="truncate">
              Shaheed Bhagat Singh State University, Ferozepur • Est. 1995
              (SBSCET ➔ SBSSTC ➔ SBSSU)
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-3 shrink-0 text-emerald-800">
            <Link
              href="/schedule"
              className="inline-flex items-center gap-1 font-semibold text-[11px] bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-200 transition-colors"
            >
              <Calendar className="w-3 h-3 text-emerald-600" /> Sanjh 2026: Nov
              14, 5:00 PM • View Programme
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo & University Title */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-12 h-12 shrink-0 bg-white rounded-full p-0.5 border border-orange-200 shadow-xs group-hover:border-orange-400 transition-all">
              <Image
                src="/sbssu-logo.png"
                alt="SBSSU Logo"
                width={48}
                height={48}
                priority
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base sm:text-lg tracking-tight text-zinc-900 group-hover:text-orange-600 transition-colors">
                  SBSSU Alumni
                </span>
                <span className="hidden md:inline-block text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded">
                  alumni.sbssu.ac.in
                </span>
              </div>
              <span className="text-[11px] text-zinc-500 hidden sm:inline-block leading-tight">
                Shaheed Bhagat Singh State University, Punjab
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`relative px-3.5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                    isActive
                      ? "text-orange-700 bg-orange-50 font-semibold"
                      : link.highlight
                        ? "text-white bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 shadow-xs"
                        : "text-zinc-700 hover:text-orange-600 hover:bg-orange-50/50"
                  }`}
                >
                  {link.highlight && <Sparkles className="w-3.5 h-3.5" />}
                  {link.name}
                  {link.badge && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}

            {isAdmin && (
              <Link
                href="/admin"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                  pathname.startsWith("/admin")
                    ? "text-emerald-800 bg-emerald-50 font-semibold border border-emerald-200"
                    : "text-zinc-600 hover:text-emerald-700 hover:bg-emerald-50/50"
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Admin
              </Link>
            )}
          </nav>

          {/* Auth Button / User Profile */}
          <div className="hidden md:flex items-center gap-2">
            {loading ? (
              <div className="w-24 h-9 bg-zinc-100 animate-pulse rounded-lg" />
            ) : user ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-50 border border-zinc-200">
                  {user.photoURL ? (
                    <Image
                      src={user.photoURL}
                      alt={user.displayName || "User"}
                      width={24}
                      height={24}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  ) : (
                    <UserIcon className="w-4 h-4 text-zinc-600" />
                  )}
                  <span className="text-xs font-medium text-zinc-800 max-w-[120px] truncate">
                    {user.displayName || user.email?.split("@")[0]}
                  </span>
                </div>

                <button
                  onClick={() => signOut()}
                  title="Sign out"
                  className="p-2 text-zinc-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => signIn()}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-zinc-800 bg-white hover:bg-orange-50 border border-zinc-300 hover:border-orange-300 rounded-lg shadow-2xs transition-all"
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
                Google Sign In
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-zinc-600 hover:text-zinc-900 rounded-lg hover:bg-zinc-100"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-orange-100 bg-white px-4 pt-3 pb-5 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2.5 rounded-lg text-sm font-medium ${
                pathname === link.href
                  ? "bg-orange-50 text-orange-700 font-semibold"
                  : link.highlight
                    ? "bg-gradient-to-r from-orange-600 to-amber-600 text-white font-semibold"
                    : "text-zinc-700 hover:bg-zinc-50"
              }`}
            >
              <div className="flex items-center justify-between">
                <span>{link.name}</span>
                {link.badge && (
                  <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                    {link.badge}
                  </span>
                )}
              </div>
            </Link>
          ))}

          <div className="pt-2 border-t border-zinc-100">
            {user ? (
              <div className="flex items-center justify-between py-2">
                <span className="text-sm font-medium text-zinc-700 truncate">
                  {user.email}
                </span>
                <button
                  onClick={() => signOut()}
                  className="text-xs text-rose-600 font-semibold px-2 py-1 bg-rose-50 rounded"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  signIn();
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-zinc-800 bg-zinc-50 border border-zinc-200 rounded-lg"
              >
                Sign in with Google
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
