"use client";

import React from "react";

interface InputFieldProps {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  icon?: React.ReactNode;
}

/**
 * Reusable input field with floating label feel, focus glow, and optional icon.
 */
export default function InputField({
  id,
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  required = false,
  icon,
}: InputFieldProps) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="block text-xs font-semibold uppercase tracking-widest text-slate-400"
      >
        {label}
      </label>
      <div className="relative">
        {icon && (
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
            {icon}
          </span>
        )}
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          className={`
            w-full rounded-xl border border-white/10 bg-white/5
            px-4 py-3 text-sm text-white placeholder-slate-500
            outline-none transition-all duration-300
            focus:border-purple-500/60 focus:bg-white/[0.07]
            focus:shadow-[0_0_20px_rgba(124,58,237,0.15)]
            focus:ring-1 focus:ring-purple-500/30
            ${icon ? "pl-11" : ""}
          `}
        />
      </div>
    </div>
  );
}
