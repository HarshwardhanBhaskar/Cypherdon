"use client";

import React from "react";
import Image from "next/image";

interface AuthLayoutProps {
  children: React.ReactNode;
  backgroundImage?: string;
}

export default function AuthLayout({
  children,
  backgroundImage = "/auth-bg-1.png",
}: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen w-full bg-[#eef4ff]">
      <div className="hidden lg:flex lg:w-[56%] relative overflow-hidden">
        <Image
          src={backgroundImage}
          alt="Cypherdon background"
          fill
          className="object-cover"
          priority
          quality={90}
        />
        <div className="absolute inset-0 bg-white/12" />
        <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-[#f7fbff]/72" />

        <div className="absolute bottom-12 left-12 z-10 max-w-sm">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-200/80 bg-white/70 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600 backdrop-blur-md">
            Smart Career Engine
          </div>
          <h2 className="mt-5 text-4xl font-bold text-slate-900 mb-3 leading-tight">
            Bring clarity to every
            <br />
            application.
          </h2>
          <p className="text-sm text-slate-700/85 leading-relaxed">
            Profiles, resume insights, job matches, and guided automation in one
            polished workspace built for modern job seekers.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12 relative bg-[radial-gradient(circle_at_top,_rgba(147,197,253,0.28),_transparent_42%),linear-gradient(180deg,#f8fbff_0%,#eef4ff_55%,#edf2fb_100%)]">
        <div className="lg:hidden absolute inset-0 overflow-hidden">
          <Image
            src={backgroundImage}
            alt="Background"
            fill
            className="object-cover opacity-35"
            priority
          />
          <div className="absolute inset-0 bg-[#f5f9ff]/78 backdrop-blur-[3px]" />
        </div>

        <div className="relative z-10 w-full flex items-center justify-center">
          {children}
        </div>
      </div>
    </div>
  );
}
