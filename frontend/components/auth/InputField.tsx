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
        className="block text-xs font-semibold uppercase tracking-widest text-slate-500"
      >
        {label}
      </label>
      <div className="relative">
        {icon && (
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
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
            w-full rounded-xl border border-slate-200 bg-white/80
            px-4 py-3 text-sm text-slate-900 placeholder-slate-400
            outline-none transition-all duration-300
            focus:border-sky-500/60 focus:bg-white
            focus:shadow-[0_0_20px_rgba(59,130,246,0.12)]
            focus:ring-1 focus:ring-sky-500/20
            ${icon ? "pl-11" : ""}
          `}
        />
      </div>
    </div>
  );
}
