"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import JobCard from "@/components/JobCard";
import JobDetailModal from "@/components/JobDetailModal";
import ScoreCircle from "@/components/ScoreCircle";

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
    id: 1, job_title: "Senior Frontend Engineer",
    description: "We are looking for a Senior Frontend Engineer with strong experience in React, TypeScript, and Next.js. You will lead UI architecture decisions and mentor junior developers.",
    location: "Bangalore, India", apply_link: "#", company_name: "Google", match_score: 87,
  },
  {
    id: 2, job_title: "Full Stack Developer",
    description: "Join our platform team building scalable microservices with Python (FastAPI) and React frontends. Knowledge of PostgreSQL, Docker, and CI/CD pipelines required.",
    location: "Remote", apply_link: "#", company_name: "Microsoft", match_score: 72,
  },
  {
    id: 3, job_title: "Machine Learning Engineer",
    description: "Design and deploy ML models for recommendation systems. Strong Python skills, experience with TensorFlow/PyTorch, and NLP pipelines required.",
    location: "Hyderabad, India", apply_link: "#", company_name: "Amazon", match_score: 54,
  },
  {
    id: 4, job_title: "DevOps Engineer",
    description: "Manage cloud infrastructure on AWS/GCP, build CI/CD pipelines. Experience with Kubernetes, Terraform, and Grafana/Prometheus is essential.",
    location: "Mumbai, India", apply_link: "#", company_name: "Flipkart", match_score: 41,
  },
  {
    id: 5, job_title: "Backend Engineer — Python",
    description: "Build high-performance REST APIs with FastAPI and Python. Work with PostgreSQL, Redis, and message queues.",
    location: "Pune, India", apply_link: "#", company_name: "Swiggy", match_score: 93,
  },
  {
    id: 6, job_title: "UI/UX Designer",
    description: "Create beautiful, intuitive interfaces. Proficiency with Figma, design systems, prototyping, and user research. Strong portfolio required.",
    location: "Delhi, India", apply_link: "#", company_name: "Razorpay", match_score: 35,
  },
];

/* ──── SVG Icon Components (replacing emojis) ──── */
const IconClipboard = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
  </svg>
);
const IconTarget = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
  </svg>
);
const IconMapPin = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
  </svg>
);
const IconBarChart = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 20V10M12 20V4M6 20v-6" />
  </svg>
);
const IconSearch = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const IconPencil = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
  </svg>
);

/* ──── Loading Skeleton ──── */
function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-6 animate-pulse">
      <div className="flex justify-between items-start mb-4">
        <div className="space-y-2.5 flex-1">
          <div className="h-4 w-3/4 bg-white/[0.06] rounded-lg" />
          <div className="h-3 w-1/2 bg-white/[0.04] rounded-lg" />
        </div>
        <div className="w-12 h-12 bg-white/[0.04] rounded-full" />
      </div>
      <div className="space-y-2 mb-5">
        <div className="h-3 w-full bg-white/[0.04] rounded" />
        <div className="h-3 w-5/6 bg-white/[0.03] rounded" />
      </div>
      <div className="h-10 w-full bg-white/[0.04] rounded-xl" />
    </div>
  );
}

function SkeletonStat() {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 animate-pulse">
      <div className="h-3 w-1/2 mx-auto bg-white/[0.06] rounded mb-3" />
      <div className="h-7 w-1/3 mx-auto bg-white/[0.04] rounded" />
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [minMatch, setMinMatch] = useState(0);
  const [loading, setLoading] = useState(true);
  const [atsScore, setAtsScore] = useState<number | null>(null);

  const locations = Array.from(new Set(jobs.map((j) => j.location).filter(Boolean)));

  const applyFilters = useCallback(() => {
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
    if (locationFilter) result = result.filter((j) => j.location === locationFilter);
    if (minMatch > 0) result = result.filter((j) => (j.match_score ?? 0) >= minMatch);
    result.sort((a, b) => (b.match_score ?? 0) - (a.match_score ?? 0));
    setFilteredJobs(result);
  }, [jobs, searchQuery, locationFilter, minMatch]);

  useEffect(() => { applyFilters(); }, [applyFilters]);

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const res = await fetch(`${API_BASE}/api/jobs/`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) { setJobs(data); setLoading(false); return; }
        }
      } catch { /* backend not running */ }
      await new Promise((r) => setTimeout(r, 800));
      setJobs(DEMO_JOBS);
      setAtsScore(76);
      setLoading(false);
    };
    fetchJobs();
  }, []);

  const handleApply = (job: Job) => { console.log("Applied to:", job.job_title); };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_id");
    router.push("/login");
  };

  const avgMatch = jobs.length
    ? Math.round(jobs.reduce((a, b) => a + (b.match_score ?? 0), 0) / jobs.length)
    : 0;

  const highMatchCount = jobs.filter((j) => (j.match_score ?? 0) >= 75).length;
  const skills = ["React", "Python", "FastAPI", "TypeScript"];

  const STAT_ICONS = [
    { label: "Total Jobs", icon: <IconClipboard />, color: "text-purple-400", bg: "from-purple-500/20 to-purple-500/5" },
    { label: "High Match", icon: <IconTarget />, color: "text-emerald-400", bg: "from-emerald-500/20 to-emerald-500/5" },
    { label: "Locations", icon: <IconMapPin />, color: "text-blue-400", bg: "from-blue-500/20 to-blue-500/5" },
    { label: "Avg Match", icon: <IconBarChart />, color: "text-amber-400", bg: "from-amber-500/20 to-amber-500/5" },
  ];
  const STAT_VALUES = [jobs.length, highMatchCount, locations.length, avgMatch + "%"];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";

  return (
    <>
      <Navbar isLoggedIn onLogout={handleLogout} userName="John Doe" />

      {/* ═══════ BACKGROUND ═══════ */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Image src="/auth-bg-4.png" alt="" fill className="object-cover opacity-[0.07]" quality={60} priority />
        <div className="absolute inset-0 bg-[#06060e]/90" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-gradient-to-b from-purple-600/[0.06] via-transparent to-transparent rounded-full blur-3xl" />
      </div>

      <main className="relative z-10 min-h-screen pt-24 pb-20 px-6 max-w-7xl mx-auto">

        {/* ═══════ HERO ═══════ */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-10 animate-fade-in-up">
          {/* ──── Profile Summary Card ──── */}
          <div className="lg:col-span-1 rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-md p-6 flex flex-col items-center text-center relative overflow-hidden group hover:border-purple-500/20 transition-all duration-500">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 via-violet-500 to-blue-500 flex items-center justify-center text-xl font-bold text-white shadow-lg shadow-purple-500/20 mb-3 relative">
              JD
            </div>
            <h3 className="text-base font-bold text-white">John Doe</h3>
            <p className="text-xs text-slate-500 mt-0.5 mb-3">Mid Level Developer</p>

            {atsScore !== null && (
              <div className="mb-3">
                <ScoreCircle score={atsScore} size={64} strokeWidth={4} label="" />
                <p className="text-[10px] text-slate-500 mt-1">Resume Score</p>
              </div>
            )}

            <div className="flex flex-wrap justify-center gap-1.5 mb-4">
              {skills.map((s, i) => (
                <span key={i} className="px-2 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/15 text-[10px] font-medium text-purple-300">
                  {s}
                </span>
              ))}
            </div>

            <Link href="/profile" className="w-full no-underline">
              <button className="w-full py-2 text-xs font-semibold text-purple-400 border border-purple-500/25 hover:border-purple-500/50 hover:bg-purple-500/5 rounded-xl bg-transparent transition-all cursor-pointer flex items-center justify-center gap-1.5">
                <IconPencil />
                Edit Profile
              </button>
            </Link>
          </div>

          {/* ──── Greeting + Stats ──── */}
          <div className="lg:col-span-3 space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">
                Good {greeting}, John
              </h1>
              <p className="text-slate-400 mt-1.5 text-sm">
                {loading
                  ? "Loading your personalized job feed..."
                  : `${filteredJobs.length} job${filteredJobs.length !== 1 ? "s" : ""} matched · Sorted by relevance`}
              </p>
            </div>

            {/* Stats Row — SVG icons instead of emojis */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {loading ? (
                Array(4).fill(0).map((_, i) => <SkeletonStat key={i} />)
              ) : (
                STAT_ICONS.map((stat, i) => (
                  <div
                    key={i}
                    className="rounded-2xl border border-white/[0.06] bg-white/[0.025] backdrop-blur-sm p-5 text-center hover:border-purple-500/20 hover:bg-white/[0.04] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-purple-500/5 transition-all duration-300 cursor-default"
                  >
                    <div className={`inline-flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-b ${stat.bg} mb-2 ${stat.color}`}>
                      {stat.icon}
                    </div>
                    <div className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-mono)" }}>
                      {STAT_VALUES[i]}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5 font-medium">{stat.label}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ═══════ FILTERS ═══════ */}
        <div
          className="rounded-2xl border border-white/[0.06] bg-white/[0.025] backdrop-blur-xl p-6 mb-10 animate-fade-in-up"
          style={{ animationDelay: "0.1s", animationFillMode: "both" }}
        >
          <div className="flex items-center gap-2 mb-4">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Filters</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1.5 block">Search</label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                  <IconSearch />
                </div>
                <input
                  type="text"
                  placeholder="Search jobs, companies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] pl-10 pr-4 py-2.5 text-sm text-white outline-none transition-all duration-300 focus:border-purple-500/50 focus:bg-white/[0.06] focus:shadow-[0_0_24px_rgba(124,58,237,0.08)] placeholder-slate-600"
                />
              </div>
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1.5 block">Location</label>
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none appearance-none cursor-pointer transition-all duration-300 focus:border-purple-500/50"
              >
                <option value="" className="bg-[#0d0d16]">All Locations</option>
                {locations.map((loc) => (
                  <option key={loc} value={loc} className="bg-[#0d0d16]">{loc}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1.5 block">
                Min Match: <span className="text-purple-400">{minMatch}%</span>
              </label>
              <input
                type="range" min={0} max={100} step={5}
                value={minMatch}
                onChange={(e) => setMinMatch(Number(e.target.value))}
                className="w-full accent-purple-500 mt-2"
              />
            </div>
          </div>
        </div>

        {/* ═══════ SECTION HEADER ═══════ */}
        <div className="flex items-center justify-between mb-6 animate-fade-in-up" style={{ animationDelay: "0.15s", animationFillMode: "both" }}>
          <div className="flex items-center gap-2.5">
            <div className="w-1 h-5 rounded-full bg-gradient-to-b from-purple-500 to-blue-500" />
            <h2 className="text-lg font-bold text-white">Matched Jobs</h2>
          </div>
          <span className="text-xs text-slate-500 font-medium" style={{ fontFamily: "var(--font-mono)" }}>
            {loading ? "..." : `${filteredJobs.length} results`}
          </span>
        </div>

        {/* ═══════ JOB GRID ═══════ */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)}
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
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
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
