"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import AvatarDropdown from "./AvatarDropdown";
import { readCachedProfile, CachedProfile } from "@/lib/profileStorage";

interface NavbarProps {
  isLoggedIn?: boolean;
  onLogout?: () => void;
  userName?: string;
  avatarUrl?: string;
  tier?: string;
}

export default function Navbar({
  isLoggedIn = false,
  onLogout,
  userName = "User",
  avatarUrl,
  tier,
}: NavbarProps) {
  // Use state to safely read from localStorage after hydration/mount
  const [profile, setProfile] = React.useState<CachedProfile | null>(null);

  React.useEffect(() => {
    if (isLoggedIn) {
      setProfile(readCachedProfile());
    }
  }, [isLoggedIn]);

  // Determine final values
  const finalUserName = userName !== "User" ? userName : (profile?.full_name || "User");
  const finalAvatarUrl = avatarUrl || profile?.hero_image_url || undefined;
  const finalTier = tier || profile?.tier || "free";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06] bg-[#06060e]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 no-underline cursor-pointer group">
          <div className="w-9 h-9 rounded-xl overflow-hidden shadow-lg shadow-indigo-500/15 group-hover:shadow-indigo-400/25 transition-shadow duration-300">
            <Image
              src="/logo-icon.png"
              alt="Cypherdon"
              width={36}
              height={36}
              className="w-full h-full object-cover"
              priority
            />
          </div>
          <span
            className="text-xl font-bold bg-gradient-to-r from-sky-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent tracking-tight"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Cypherdon
          </span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <>
              <Link
                href="/dashboard"
                className="text-sm text-slate-400 hover:text-indigo-300 transition-colors no-underline hidden sm:block cursor-pointer"
              >
                Dashboard
              </Link>
              <Link
                href="/profile"
                className="text-sm text-slate-400 hover:text-indigo-300 transition-colors no-underline hidden sm:block cursor-pointer"
              >
                Profile
              </Link>
              <AvatarDropdown
                userName={finalUserName}
                avatarUrl={finalAvatarUrl}
                tier={finalTier}
                onLogout={onLogout || (() => {})}
              />
            </>
          ) : (
            <Link href="/login">
              <button className="px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-sky-500 via-indigo-500 to-violet-500 rounded-xl shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:shadow-indigo-500/30 hover:scale-[1.02] transition-all cursor-pointer border-none">
                Get Started
              </button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
