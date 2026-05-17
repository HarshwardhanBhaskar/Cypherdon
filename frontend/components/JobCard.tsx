"use client";

import React from "react";
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

interface JobCardProps {
  job: Job;
  onApply: (job: Job) => void;
  onViewDetails: (job: Job) => void;
  index?: number;
}

/**
 * Premium glass-morphism job card with hover lift, glow, and animated entrance.
 */
export default function JobCard({ job, onApply, onViewDetails, index = 0 }: JobCardProps) {
  const [isVisible, setIsVisible] = React.useState(false);
  const cardRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  const truncatedDesc =
    job.description.length > 140
      ? job.description.substring(0, 140) + "..."
      : job.description;

  return (
    <div
      ref={cardRef}
      className={`
        relative rounded-[1.75rem] border border-white/[0.07] bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.025))] backdrop-blur-md
        p-6 cursor-pointer group overflow-hidden
        transition-all duration-400 ease-out
        hover:-translate-y-1.5 hover:border-sky-500/25
        hover:shadow-[0_12px_40px_rgba(56,189,248,0.10),0_4px_16px_rgba(0,0,0,0.25)]
        hover:bg-white/[0.045]
        ${isVisible ? 'animate-fade-in-up opacity-100' : 'opacity-0 translate-y-8'}
      `}
      style={{ animationDelay: `${(index % 3) * 0.07}s`, animationFillMode: "both" }}
      onClick={() => onViewDetails(job)}
    >
      {/* Hover glow accent */}
      <div className="absolute -top-16 -right-16 w-40 h-40 bg-sky-500/8 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

      {/* Header */}
      <div className="flex items-start justify-between mb-3.5 relative">
        <div className="flex-1 min-w-0 mr-4">
          <h3 className="text-[15px] font-bold text-white group-hover:text-sky-300 transition-colors duration-300 truncate leading-tight">
            {job.job_title}
          </h3>
          <p className="text-sm text-sky-300/85 font-medium mt-1">
            {job.company_name || "Unknown Company"}
          </p>
        </div>
        {job.match_score !== undefined && job.match_score !== null && (
          <MatchBadge score={job.match_score} />
        )}
      </div>

      {/* Description */}
      <p className="text-[13px] text-slate-400 leading-relaxed mb-4">
        {truncatedDesc}
      </p>

      {/* Location tag */}
      <div className="flex items-center gap-2 mb-5">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-white/[0.04] text-slate-400 border border-white/[0.06]">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          {job.location || "Remote"}
        </span>
      </div>

      {/* Actions */}
      <div className="flex gap-3 relative">
        <button
          className="
            flex-1 py-2.5 px-4 text-xs font-semibold text-white rounded-xl
            bg-gradient-to-r from-sky-500/90 via-indigo-500/90 to-blue-600/90
            shadow-md shadow-sky-500/10
            transition-all duration-300
            hover:shadow-lg hover:shadow-sky-500/20 hover:brightness-110
            active:scale-[0.97]
            border-none cursor-pointer
          "
          onClick={(e) => { e.stopPropagation(); onApply(job); }}
        >
          Apply Now
        </button>
        <button
          className="
            py-2.5 px-4 text-xs font-semibold text-slate-300 rounded-xl
            border border-white/10 bg-white/[0.03]
            transition-all duration-300
            hover:bg-white/[0.06] hover:border-sky-500/20 hover:text-white
            active:scale-[0.97]
            cursor-pointer
          "
          onClick={(e) => { e.stopPropagation(); onViewDetails(job); }}
        >
          Details
        </button>
      </div>
    </div>
  );
}
