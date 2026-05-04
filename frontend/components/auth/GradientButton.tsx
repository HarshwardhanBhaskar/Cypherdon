"use client";

import React from "react";

interface GradientButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

/**
 * Premium gradient button with hover animation, loading spinner, and glow.
 */
export default function GradientButton({
  children,
  onClick,
  type = "button",
  loading = false,
  disabled = false,
  className = "",
}: GradientButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        relative w-full rounded-xl py-3.5 px-6 text-sm font-semibold text-white
        bg-gradient-to-r from-purple-600 via-violet-600 to-blue-600
        shadow-lg shadow-purple-500/20
        transition-all duration-300 ease-out
        hover:shadow-xl hover:shadow-purple-500/30
        hover:scale-[1.02] hover:brightness-110
        active:scale-[0.98]
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
        ${className}
      `}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <svg
            className="animate-spin h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Processing...
        </span>
      ) : (
        children
      )}
    </button>
  );
}
