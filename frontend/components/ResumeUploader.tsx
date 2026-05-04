"use client";

import React, { useState, useRef } from "react";

interface ResumeUploaderProps {
  onUpload: (file: File) => void;
}

/**
 * Drag-and-drop + click-to-browse resume uploader with animated feedback.
 */
export default function ResumeUploader({ onUpload }: ResumeUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      const file = e.dataTransfer.files[0];
      setFileName(file.name);
      onUpload(file);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setFileName(file.name);
      onUpload(file);
    }
  };

  return (
    <div
      className={`
        glass rounded-2xl p-8 text-center cursor-pointer transition-all duration-300
        ${dragActive ? "border-[var(--color-primary)] bg-[rgba(124,58,237,0.1)] scale-[1.02]" : ""}
      `}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf"
        onChange={handleChange}
        className="hidden"
      />

      {/* Icon */}
      <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--color-surface-2)] border border-[var(--color-border)]">
        {fileName ? (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        ) : (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary-light)" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        )}
      </div>

      {fileName ? (
        <>
          <p className="text-[var(--color-success)] font-semibold">
            {fileName}
          </p>
          <p className="text-xs text-[var(--color-text-dim)] mt-1">
            Click or drop to replace
          </p>
        </>
      ) : (
        <>
          <p className="text-[var(--color-text)] font-semibold">
            Drop your resume here
          </p>
          <p className="text-xs text-[var(--color-text-dim)] mt-1">
            PDF format only • Click to browse
          </p>
        </>
      )}
    </div>
  );
}
