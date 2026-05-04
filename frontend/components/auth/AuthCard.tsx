"use client";

import React from "react";

interface AuthCardProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

/**
 * Glassmorphism card container for auth forms.
 */
export default function AuthCard({ children, title, subtitle }: AuthCardProps) {
  return (
    <div className="w-full max-w-md animate-fade-in-up">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.5"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>
        <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
          Cypherdon
        </span>
      </div>

      {/* Glass Card */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-8 shadow-2xl shadow-black/20">
        {/* Header */}
        <div className="mb-7">
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-slate-400 mt-1.5">{subtitle}</p>
          )}
        </div>

        {/* Form Content */}
        {children}
      </div>
    </div>
  );
}
