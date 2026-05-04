"use client";

import React from "react";
import Link from "next/link";
import AvatarDropdown from "./AvatarDropdown";

interface NavbarProps {
  isLoggedIn?: boolean;
  onLogout?: () => void;
  userName?: string;
}

export default function Navbar({
  isLoggedIn = false,
  onLogout,
  userName = "User",
}: NavbarProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06] bg-[#06060e]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 no-underline cursor-pointer">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 via-violet-500 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/15">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent" style={{ fontFamily: "var(--font-heading)" }}>
            Cypherdon
          </span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <>
              <Link
                href="/dashboard"
                className="text-sm text-slate-400 hover:text-white transition-colors no-underline hidden sm:block cursor-pointer"
              >
                Dashboard
              </Link>
              <Link
                href="/profile"
                className="text-sm text-slate-400 hover:text-white transition-colors no-underline hidden sm:block cursor-pointer"
              >
                Profile
              </Link>
              <AvatarDropdown
                userName={userName}
                onLogout={onLogout || (() => {})}
              />
            </>
          ) : (
            <Link href="/login">
              <button className="px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-lg shadow-purple-500/20 hover:shadow-xl hover:shadow-purple-500/30 hover:scale-[1.02] transition-all cursor-pointer border-none">
                Get Started
              </button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
