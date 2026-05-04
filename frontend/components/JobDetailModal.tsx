"use client";

import React, { useState } from "react";
import MatchBadge from "./MatchBadge";

interface Job {
  id: number;
  job_title: string;
  description: string;
  location: string;
  apply_link: string;
  company_name?: string;
  match_score?: number;
}

interface JobDetailModalProps {
  job: Job;
  onClose: () => void;
  onApply: (job: Job) => void;
}

/**
 * Full-screen modal overlay showing detailed job information
 * with CAPTCHA-aware apply flow.
 */
export default function JobDetailModal({ job, onClose, onApply }: JobDetailModalProps) {
  const [applyState, setApplyState] = useState<"idle" | "applying" | "captcha" | "done">("idle");

  const handleApply = () => {
    setApplyState("applying");
    // Simulate the apply assist flow
    setTimeout(() => {
      setApplyState("captcha");
    }, 2000);
  };

  const handleCaptchaSolved = () => {
    setApplyState("done");
    onApply(job);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
    >
      <div
        className="glass rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-8 animate-fade-in-up"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-[var(--color-surface-2)] text-[var(--color-text-muted)] hover:text-white transition-colors"
          style={{ position: "relative", float: "right" }}
        >
          ✕
        </button>

        {/* Header */}
        <div className="flex items-start gap-4 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center shrink-0">
            <span className="text-white text-xl font-bold">
              {(job.company_name || "C")[0].toUpperCase()}
            </span>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white">{job.job_title}</h2>
            <p className="text-[var(--color-accent)] font-medium mt-1">
              {job.company_name || "Unknown Company"}
            </p>
          </div>
          {job.match_score !== undefined && (
            <MatchBadge score={job.match_score} size={72} />
          )}
        </div>

        {/* Location */}
        <div className="flex items-center gap-2 mb-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-[var(--color-surface-2)] text-[var(--color-text-muted)] border border-[var(--color-border)]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {job.location || "Remote"}
          </span>
        </div>

        {/* Description */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">
            Job Description
          </h3>
          <p className="text-[var(--color-text)] leading-relaxed whitespace-pre-line">
            {job.description}
          </p>
        </div>

        {/* Apply Section */}
        <div className="border-t border-[var(--color-border)] pt-6">
          {applyState === "idle" && (
            <div className="flex gap-3">
              <button className="btn-primary flex-1 text-base flex justify-center items-center gap-2" onClick={handleApply}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>
                Apply with Cypherdon
              </button>
              <a
                href={job.apply_link}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary text-base px-6 flex items-center no-underline"
              >
                Open Original
              </a>
            </div>
          )}

          {applyState === "applying" && (
            <div className="text-center py-4 animate-pulse">
              <div className="inline-flex items-center gap-3 text-[var(--color-primary-light)]">
                <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
                <span className="font-semibold">Auto-filling your application...</span>
              </div>
            </div>
          )}

          {applyState === "captcha" && (
            <div className="glass rounded-2xl p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <h4 className="text-lg font-bold text-[var(--color-warning)] mb-2">
                CAPTCHA Detected
              </h4>
              <p className="text-sm text-[var(--color-text-muted)] mb-4">
                We paused the automation. Please solve the CAPTCHA on the external
                page, then click below to confirm.
              </p>
              <button
                className="btn-primary"
                onClick={handleCaptchaSolved}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><polyline points="20 6 9 17 4 12"/></svg>
                I&apos;ve solved the CAPTCHA — Resume
              </button>
            </div>
          )}

          {applyState === "done" && (
            <div className="text-center py-4">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              </div>
              <p className="text-[var(--color-success)] font-bold text-lg">
                Application Submitted Successfully!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
