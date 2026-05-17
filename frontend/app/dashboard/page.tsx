"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import JobCard from "@/components/JobCard";
import JobDetailModal from "@/components/JobDetailModal";
import ScoreCircle from "@/components/ScoreCircle";
import { siteImages } from "@/lib/siteImages";

interface Job {
  id: number;
  job_title: string;
  description: string;
  location: string;
  apply_link: string;
  company_name?: string;
  match_score?: number;
}

const DEMO_JOBS: Job[] = [
  {
    id: 1,
    job_title: "Senior Frontend Engineer",
    description:
      "We are looking for a Senior Frontend Engineer with strong experience in React, TypeScript, and Next.js. You will lead UI architecture decisions and mentor junior developers.",
    location: "Bangalore, India",
    apply_link: "#",
    company_name: "Google",
    match_score: 87,
  },
  {
    id: 2,
    job_title: "Full Stack Developer",
    description:
      "Join our platform team building scalable microservices with Python (FastAPI) and React frontends. Knowledge of PostgreSQL, Docker, and CI/CD pipelines required.",
    location: "Remote",
    apply_link: "#",
    company_name: "Microsoft",
    match_score: 72,
  },
  {
    id: 3,
    job_title: "Machine Learning Engineer",
    description:
      "Design and deploy ML models for recommendation systems. Strong Python skills, experience with TensorFlow/PyTorch, and NLP pipelines required.",
    location: "Hyderabad, India",
    apply_link: "#",
    company_name: "Amazon",
    match_score: 54,
  },
  {
    id: 4,
    job_title: "DevOps Engineer",
    description:
      "Manage cloud infrastructure on AWS/GCP, build CI/CD pipelines. Experience with Kubernetes, Terraform, and Grafana/Prometheus is essential.",
    location: "Mumbai, India",
    apply_link: "#",
    company_name: "Flipkart",
    match_score: 41,
  },
  {
    id: 5,
    job_title: "Backend Engineer - Python",
    description:
      "Build high-performance REST APIs with FastAPI and Python. Work with PostgreSQL, Redis, and message queues.",
    location: "Pune, India",
    apply_link: "#",
    company_name: "Swiggy",
    match_score: 93,
  },
  {
    id: 6,
    job_title: "UI/UX Designer",
    description:
      "Create beautiful, intuitive interfaces. Proficiency with Figma, design systems, prototyping, and user research. Strong portfolio required.",
    location: "Delhi, India",
    apply_link: "#",
    company_name: "Razorpay",
    match_score: 35,
  },
];

const statsMeta = [
  { label: "Total Jobs", color: "text-violet-300" },
  { label: "High Match", color: "text-emerald-300" },
  { label: "Locations", color: "text-sky-300" },
  { label: "Avg Match", color: "text-amber-300" },
];

function SkeletonCard() {
  return (
    <div className="rounded-[1.75rem] border border-white/[0.06] bg-white/[0.03] p-6 animate-pulse">
      <div className="flex justify-between items-start mb-4">
        <div className="space-y-2.5 flex-1">
          <div className="h-4 w-3/4 bg-white/[0.07] rounded-lg" />
          <div className="h-3 w-1/2 bg-white/[0.05] rounded-lg" />
        </div>
        <div className="w-12 h-12 bg-white/[0.04] rounded-full" />
      </div>
      <div className="space-y-2 mb-5">
        <div className="h-3 w-full bg-white/[0.05] rounded" />
        <div className="h-3 w-5/6 bg-white/[0.04] rounded" />
      </div>
      <div className="h-10 w-full bg-white/[0.05] rounded-xl" />
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [minMatch, setMinMatch] = useState(0);
  const [loading, setLoading] = useState(true);
  const [atsScore, setAtsScore] = useState<number | null>(null);

  const locations = Array.from(new Set(jobs.map((j) => j.location).filter(Boolean)));

  const filteredJobs = useMemo(() => {
    let result = [...jobs];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (j) =>
          j.job_title.toLowerCase().includes(q) ||
          j.company_name?.toLowerCase().includes(q) ||
          j.description.toLowerCase().includes(q)
      );
    }
    if (locationFilter) {
      result = result.filter((j) => j.location === locationFilter);
    }
    if (minMatch > 0) {
      result = result.filter((j) => (j.match_score ?? 0) >= minMatch);
    }
    result.sort((a, b) => (b.match_score ?? 0) - (a.match_score ?? 0));
    return result;
  }, [jobs, searchQuery, locationFilter, minMatch]);

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const res = await fetch(`${API_BASE}/api/jobs/`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            setJobs(data);
            setLoading(false);
            return;
          }
        }
      } catch {}
      await new Promise((r) => setTimeout(r, 500));
      setJobs(DEMO_JOBS);
      setAtsScore(76);
      setLoading(false);
    };
    fetchJobs();
  }, []);

  const handleApply = (job: Job) => {
    console.log("Applied to:", job.job_title);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_id");
    router.push("/login");
  };

  const avgMatch = jobs.length
    ? Math.round(jobs.reduce((a, b) => a + (b.match_score ?? 0), 0) / jobs.length)
    : 0;
  const highMatchCount = jobs.filter((j) => (j.match_score ?? 0) >= 75).length;
  const topJob = filteredJobs[0];
  const skills = ["React", "Python", "FastAPI", "TypeScript"];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";
  const statValues = [jobs.length, highMatchCount, locations.length, `${avgMatch}%`];

  return (
    <>
      <Navbar isLoggedIn onLogout={handleLogout} userName="John Doe" />

      <div className="fixed inset-0 z-0 pointer-events-none">
        <Image src={siteImages.app.dashboard} alt="" fill className="object-cover opacity-[0.18]" quality={80} priority />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,7,18,0.8)_0%,rgba(6,6,14,0.92)_55%,rgba(6,6,14,0.98)_100%)]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[960px] h-[420px] bg-gradient-to-b from-sky-500/[0.08] via-indigo-500/[0.05] to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[540px] h-[320px] bg-gradient-to-tl from-blue-500/[0.06] to-transparent rounded-full blur-3xl" />
      </div>

      <main className="relative z-10 min-h-screen pt-24 pb-20 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10 animate-fade-in-up">
          <div className="lg:col-span-3 rounded-[2rem] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] backdrop-blur-xl p-6 flex flex-col items-center text-center relative overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-36 h-36 bg-sky-500/10 rounded-full blur-3xl" />
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-sky-500 via-indigo-500 to-blue-600 flex items-center justify-center text-xl font-bold text-white shadow-lg shadow-sky-500/20 mb-3 relative">
              JD
            </div>
            <h3 className="text-base font-bold text-white">John Doe</h3>
            <p className="text-xs text-slate-500 mt-0.5 mb-3">Mid Level Developer</p>

            {atsScore !== null && (
              <div className="mb-3">
                <ScoreCircle score={atsScore} size={66} strokeWidth={4} label="" />
                <p className="text-[10px] text-slate-500 mt-1">Resume Score</p>
              </div>
            )}

            <div className="flex flex-wrap justify-center gap-1.5 mb-4">
              {skills.map((s) => (
                <span key={s} className="px-2 py-0.5 rounded-md bg-sky-500/10 border border-sky-500/15 text-[10px] font-medium text-sky-300">
                  {s}
                </span>
              ))}
            </div>

            <Link href="/profile" className="w-full no-underline">
              <button className="w-full py-2.5 text-xs font-semibold text-sky-300 border border-sky-500/25 hover:border-sky-500/50 hover:bg-sky-500/8 rounded-xl bg-transparent transition-all cursor-pointer flex items-center justify-center gap-1.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                </svg>
                Edit Profile
              </button>
            </Link>
          </div>

          <div className="lg:col-span-6 space-y-6">
            <div className="rounded-[2rem] border border-white/[0.08] bg-[linear-gradient(135deg,rgba(15,23,42,0.66),rgba(9,14,30,0.76))] p-7 md:p-8 backdrop-blur-xl shadow-[0_24px_80px_rgba(0,0,0,0.24)]">
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-300">
                Dashboard Overview
              </div>
              <h1 className="mt-5 text-3xl md:text-4xl font-bold text-white tracking-tight">
                Good {greeting}, John
              </h1>
              <p className="text-slate-400 mt-2 text-sm md:text-base max-w-2xl leading-7">
                {loading
                  ? "Loading your personalized job feed..."
                  : `${filteredJobs.length} roles matched, sorted by profile strength, relevance, and readiness to apply.`}
              </p>
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { label: "Top role fit", value: topJob?.job_title ?? "Loading..." },
                  { label: "Best company", value: topJob?.company_name ?? "Loading..." },
                  { label: "Automation status", value: "Guided apply ready" },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-white/[0.07] bg-white/[0.03] px-4 py-3">
                    <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">{item.label}</div>
                    <div className="mt-2 text-sm font-semibold text-white">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {loading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 animate-pulse">
                      <div className="h-3 w-1/2 mx-auto bg-white/[0.06] rounded mb-3" />
                      <div className="h-7 w-1/3 mx-auto bg-white/[0.04] rounded" />
                    </div>
                  ))
                : statsMeta.map((stat, i) => (
                    <div
                      key={stat.label}
                      className="rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm p-5 text-center hover:border-sky-500/20 hover:bg-white/[0.045] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-sky-500/5 transition-all duration-300"
                    >
                      <div className={`text-[11px] uppercase tracking-[0.18em] ${stat.color}`}>{stat.label}</div>
                      <div className="mt-3 text-2xl font-bold text-white" style={{ fontFamily: "var(--font-mono)" }}>
                        {statValues[i]}
                      </div>
                    </div>
                  ))}
            </div>
          </div>

          <div className="lg:col-span-3 rounded-[2rem] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] backdrop-blur-xl p-4 shadow-[0_24px_80px_rgba(0,0,0,0.24)] overflow-hidden">
            <div className="flex items-center justify-between px-2 pt-1 pb-3">
              <div>
                <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Apply Flow</div>
                <div className="mt-1 text-sm font-semibold text-white">Automation preview</div>
              </div>
              <div className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-300">
                Active
              </div>
            </div>
            <div className="overflow-hidden rounded-[1.5rem] border border-white/[0.06]">
              <Image
                src={siteImages.app.automation}
                alt="Automation workflow visual"
                width={1600}
                height={1200}
                className="h-auto w-full"
              />
            </div>
          </div>
        </div>

        <div
          className="rounded-[2rem] border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl p-6 mb-10 animate-fade-in-up shadow-[0_16px_50px_rgba(0,0,0,0.2)]"
          style={{ animationDelay: "0.1s", animationFillMode: "both" }}
        >
          <div className="flex items-center gap-2 mb-4">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Filters</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1.5 block">Search</label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search jobs, companies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] pl-10 pr-4 py-2.5 text-sm text-white outline-none transition-all duration-300 focus:border-sky-500/50 focus:bg-white/[0.06] focus:shadow-[0_0_24px_rgba(56,189,248,0.08)] placeholder-slate-600"
                />
              </div>
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1.5 block">Location</label>
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none appearance-none cursor-pointer transition-all duration-300 focus:border-sky-500/50"
              >
                <option value="" className="bg-[#0d0d16]">
                  All Locations
                </option>
                {locations.map((loc) => (
                  <option key={loc} value={loc} className="bg-[#0d0d16]">
                    {loc}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1.5 block">
                Min Match: <span className="text-sky-400">{minMatch}%</span>
              </label>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={minMatch}
                onChange={(e) => setMinMatch(Number(e.target.value))}
                className="w-full accent-sky-500 mt-2"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6 animate-fade-in-up" style={{ animationDelay: "0.15s", animationFillMode: "both" }}>
          <div className="flex items-center gap-2.5">
            <div className="w-1 h-5 rounded-full bg-gradient-to-b from-sky-400 to-blue-500" />
            <h2 className="text-lg font-bold text-white">Matched Roles</h2>
          </div>
          <span className="text-xs text-slate-500 font-medium" style={{ fontFamily: "var(--font-mono)" }}>
            {loading ? "..." : `${filteredJobs.length} results`}
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filteredJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map((job, i) => (
              <JobCard
                key={job.id}
                job={job}
                index={i}
                onApply={handleApply}
                onViewDetails={setSelectedJob}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <div className="text-slate-600 mb-4">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No jobs found</h3>
            <p className="text-slate-400 text-sm">Try adjusting your filters or broadening your search.</p>
          </div>
        )}

        {selectedJob && (
          <JobDetailModal
            job={selectedJob}
            onClose={() => setSelectedJob(null)}
            onApply={handleApply}
          />
        )}
      </main>
    </>
  );
}
