"use client";

import React, { useState, useRef, useEffect } from "react";

interface AvatarDropdownProps {
  userName?: string;
  avatarUrl?: string;
  onLogout: () => void;
  tier?: string;
}

/**
 * Navbar avatar with dropdown menu: Profile, Settings, Logout.
 */
export default function AvatarDropdown({
  userName = "User",
  avatarUrl,
  onLogout,
  tier = "free",
}: AvatarDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const initials = (userName || "User")
    .split(" ")
    .map((n) => n[0] || "")
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <div ref={ref} className="relative">
      {/* Avatar button */}
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2.5 rounded-full border bg-white/5 pl-1 pr-3 py-1 transition-all duration-200 hover:bg-white/10 cursor-pointer ${
          tier === "premium"
            ? "border-amber-500/40 hover:border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.1)] hover:shadow-[0_0_20px_rgba(245,158,11,0.2)]"
            : "border-white/10 hover:border-purple-500/30"
        }`}
      >
        {avatarUrl ? (
          <div className="relative w-8 h-8 flex items-center justify-center">
            <img
              src={avatarUrl}
              alt={userName}
              className={`w-8 h-8 rounded-full object-cover ${
                tier === "premium" ? "border border-amber-500/50" : ""
              }`}
            />
            {tier === "premium" && (
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-gradient-to-r from-yellow-400 to-amber-500 border border-[#06060e] rounded-full flex items-center justify-center text-[6px] text-[#06060e] font-extrabold shadow-[0_0_4px_rgba(245,158,11,0.5)]">
                ★
              </span>
            )}
          </div>
        ) : (
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white relative ${
            tier === "premium"
              ? "bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 border border-amber-500/40 shadow-[inset_0_1px_2px_rgba(255,255,255,0.2)]"
              : "bg-gradient-to-br from-sky-500 to-indigo-500"
          }`}>
            {initials}
            {tier === "premium" && (
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-gradient-to-r from-yellow-400 to-amber-500 border border-[#06060e] rounded-full flex items-center justify-center text-[6px] text-[#06060e] font-extrabold shadow-[0_0_4px_rgba(245,158,11,0.5)]">
                ★
              </span>
            )}
          </div>
        )}
        <span className={`text-sm font-medium hidden sm:block ${
          tier === "premium" ? "text-amber-400 font-semibold" : "text-slate-300"
        }`}>
          {userName.split(" ")[0]}
          {tier === "premium" && " 👑"}
        </span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`text-slate-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Dropdown menu */}
      {open && (
        <div className="absolute right-0 mt-2 w-52 rounded-xl border border-white/10 bg-[#12121a]/95 backdrop-blur-xl shadow-2xl shadow-black/30 py-2 z-50 animate-fade-in-up">
          {/* User info header */}
          <div className="px-4 py-2.5 border-b border-white/5">
            <p className="text-sm font-semibold text-white">{userName}</p>
            {tier === "premium" ? (
              <p className="text-xs font-bold text-amber-400 mt-1 flex items-center gap-1">
                <span className="inline-block animate-pulse text-[10px]">🌟</span> Premium Plan
              </p>
            ) : (
              <p className="text-xs text-slate-500 mt-0.5">Free Plan</p>
            )}
          </div>

          {/* Links */}
          <div className="py-1">
            <a
              href="/profile"
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors no-underline"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              Profile
            </a>
            <a
              href="/profile"
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors no-underline"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
              Settings
            </a>
          </div>

          {/* Logout */}
          <div className="border-t border-white/5 pt-1">
            <button
              onClick={() => { setOpen(false); onLogout(); }}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors w-full bg-transparent border-none cursor-pointer"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
