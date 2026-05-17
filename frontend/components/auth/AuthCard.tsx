"use client";

import React from "react";
import Image from "next/image";

interface AuthCardProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export default function AuthCard({ children, title, subtitle }: AuthCardProps) {
  return (
    <div className="w-full max-w-lg animate-fade-in-up">
      <div className="flex items-center gap-3 mb-7">
        <div className="w-11 h-11 rounded-2xl overflow-hidden shadow-lg shadow-indigo-500/20">
          <Image
            src="/logo-icon.png"
            alt="Cypherdon"
            width={44}
            height={44}
            className="w-full h-full object-cover"
            priority
          />
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500 font-semibold">
            Cypherdon
          </div>
          <div className="text-sm text-slate-600">
            AI-powered career workspace
          </div>
        </div>
      </div>

      <div className="rounded-[2rem] border border-white/80 bg-white/88 backdrop-blur-2xl p-8 md:p-10 shadow-[0_24px_90px_rgba(15,23,42,0.14)]">
        <div className="mb-7">
          <h1 className="text-4xl font-semibold text-slate-950 tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-slate-600 mt-2">{subtitle}</p>
          )}
        </div>

        {children}
      </div>
    </div>
  );
}
