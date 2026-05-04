"use client";

import React from "react";
import Image from "next/image";

interface AuthLayoutProps {
  children: React.ReactNode;
  backgroundImage?: string;
}

/**
 * Split-screen auth layout:
 *   LEFT  → Background image with overlay + blur
 *   RIGHT → Auth card centered vertically
 * On mobile, the background becomes full-screen behind the card.
 */
export default function AuthLayout({
  children,
  backgroundImage = "/auth-bg-1.png",
}: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen w-full bg-[#06060e]">
      {/* ───── Left Panel: Background Image ───── */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden">
        {/* Image */}
        <Image
          src={backgroundImage}
          alt="Cypherdon AI Background"
          fill
          className="object-cover"
          priority
          quality={90}
        />
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#06060e]/40 via-transparent to-[#06060e]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#06060e]/60 via-transparent to-[#06060e]/30" />

        {/* Branding on top */}
        <div className="absolute bottom-12 left-12 z-10 max-w-sm">
          <h2 className="text-3xl font-bold text-white mb-3 leading-tight">
            Your AI-Powered <br />
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Career Assistant
            </span>
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Smart job scraping, intelligent matching, and automated applications
            — all with human-in-the-loop CAPTCHA handling.
          </p>
        </div>
      </div>

      {/* ───── Right Panel: Auth Card ───── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative">
        {/* Mobile background (hidden on desktop) */}
        <div className="lg:hidden absolute inset-0 overflow-hidden">
          <Image
            src={backgroundImage}
            alt="Background"
            fill
            className="object-cover opacity-20 blur-sm"
            priority
          />
          <div className="absolute inset-0 bg-[#06060e]/80" />
        </div>

        {/* Card container */}
        <div className="relative z-10 w-full flex items-center justify-center">
          {children}
        </div>
      </div>
    </div>
  );
}
