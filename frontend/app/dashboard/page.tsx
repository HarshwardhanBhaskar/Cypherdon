"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import ParticleSphere from "@/components/ParticleSphere";
import {
  CachedProfile,
  clearCachedProfile,
  readCachedProfile,
  writeCachedProfile,
} from "@/lib/profileStorage";

interface Job {
  id: number;
  job_title: string;
  description: string;
  location: string;
  apply_link: string;
  company_name: string;
  match_score?: number;
  published_at?: string;
  job_type: string;
  source?: string;
}

interface LiveJobsResponse {
  jobs: Job[];
  source: string;
  sources?: Record<string, number>;
  updated_at: string;
  refresh_after_seconds: number;
}

export default function JobDashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<CachedProfile | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [atsScore, setAtsScore] = useState(0);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showAllMatches, setShowAllMatches] = useState(false);
  const [selectedType, setSelectedType] = useState("All");
  const [jobSource, setJobSource] = useState("");
  const [jobsUpdatedAt, setJobsUpdatedAt] = useState("");
  const [applyingJobId, setApplyingJobId] = useState<number | null>(null);

  // Fallback demo jobs if none match yet
  const demoJobs = useMemo<Job[]>(() => [
    { id: 101, job_title: "Senior Frontend Engineer", company_name: "TechNova", location: "Remote", description: "Build next-gen AI interfaces using React and Next.js.", apply_link: "#", match_score: 92, job_type: "Full-time", source: "Demo fallback" },
    { id: 102, job_title: "Full Stack Developer", company_name: "FinFlow", location: "New York", description: "Scale our financial backend using FastAPI and PostgreSQL.", apply_link: "#", match_score: 85, job_type: "Contract", source: "Demo fallback" },
    { id: 103, job_title: "UI/UX Developer", company_name: "Creative Labs", location: "London / Remote", description: "Bridge the gap between design and engineering.", apply_link: "#", match_score: 78, job_type: "Remote", source: "Demo fallback" },
  ], []);

  useEffect(() => {
    let cancelled = false;

    const loadLiveJobs = async (profileData: CachedProfile | null, forceRefresh = false) => {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const params = new URLSearchParams({
        limit: "30",
        preferred_role: profileData?.preferred_role || "",
        skills: profileData?.skills?.join(",") || "",
      });
      if (forceRefresh) params.set("force_refresh", "true");

      const jobsRes = await fetch(`${API_BASE}/api/jobs/live?${params.toString()}`);
      if (!jobsRes.ok) throw new Error(`Live jobs failed with status ${jobsRes.status}`);

      const jobsData = (await jobsRes.json()) as LiveJobsResponse;
      if (cancelled) return;

      if (jobsData.jobs?.length) {
        setJobs(jobsData.jobs);
        setJobSource(jobsData.source);
        setJobsUpdatedAt(jobsData.updated_at);
      } else {
        setJobs(demoJobs);
        setJobSource("Demo fallback");
        setJobsUpdatedAt(new Date().toISOString());
      }
    };

    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }
      const cachedProfile = readCachedProfile();
      if (cachedProfile) setProfile(cachedProfile);

      try {
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        
        // Fetch Profile
        const res = await fetch(`${API_BASE}/api/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        let profileData: CachedProfile | null = cachedProfile;
        if (res.ok) {
          const loadedProfile = (await res.json()) as CachedProfile;
          profileData = loadedProfile;
          setProfile(loadedProfile);
          writeCachedProfile(loadedProfile);
          // Simulate an ATS Score based on profile completeness
          const skillCount = loadedProfile.skills?.length ?? 0;
          const score = 40 + (skillCount > 3 ? 20 : 0) + (loadedProfile.resume_url ? 25 : 0) + (loadedProfile.experience_level === "senior" ? 10 : 0);
          setAtsScore(score > 98 ? 98 : score);
        } else if (res.status === 401 || res.status === 403) {
          localStorage.removeItem("token");
          localStorage.removeItem("user_id");
          clearCachedProfile();
          router.push("/login");
          return;
        } else if (res.status === 404) {
          router.push("/complete-profile");
          return;
        } else if (!cachedProfile) {
          throw new Error(`Profile request failed with status ${res.status}`);
        }

        try {
          await loadLiveJobs(profileData);
        } catch {
          setJobs(demoJobs);
          setJobSource("Demo fallback");
          setJobsUpdatedAt(new Date().toISOString());
        }
      } catch (err) {
        console.error("Failed to load dashboard data", err);
        if (!readCachedProfile()) {
          setError("Failed to load your profile. Please sign in again or check that the FastAPI server is running on port 8000.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    const refreshTimer = window.setInterval(() => {
      loadLiveJobs(readCachedProfile(), true).catch(() => undefined);
    }, 10 * 60 * 1000);

    return () => {
      cancelled = true;
      window.clearInterval(refreshTimer);
    };
  }, [demoJobs, router]);

  const jobTypes = useMemo(() => {
    const counts = new Map<string, number>();
    jobs.forEach((job) => counts.set(job.job_type, (counts.get(job.job_type) ?? 0) + 1));

    return [
      { label: "All", count: jobs.length },
      ...Array.from(counts.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([label, count]) => ({ label, count })),
    ];
  }, [jobs]);

  const filteredJobs = useMemo(
    () => selectedType === "All" ? jobs : jobs.filter((job) => job.job_type === selectedType),
    [jobs, selectedType]
  );

  const visibleJobs = showAllMatches ? filteredJobs : filteredJobs.slice(0, 3);
  const hiddenMatchCount = Math.max(filteredJobs.length - visibleJobs.length, 0);
  const updatedLabel = jobsUpdatedAt ? new Date(jobsUpdatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";

  const handleViewAllMatches = () => {
    setSelectedType("All");
    setShowAllMatches(true);
    setTimeout(() => {
      document.getElementById("matches")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  };

  const handleApplyThroughCypherdon = async (job: Job) => {
    setApplyingJobId(job.id);
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const userId = localStorage.getItem("user_id");
      const appliedJobs = JSON.parse(localStorage.getItem("cypherdon_applied_jobs") || "[]") as number[];
      localStorage.setItem("cypherdon_applied_jobs", JSON.stringify(Array.from(new Set([...appliedJobs, job.id]))));

      if (userId) {
        await fetch(`${API_BASE}/api/applications/apply`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: userId,
            job_id: job.id,
            match_score: job.match_score ?? 0,
          }),
        }).catch(() => undefined);
      }

      window.open(job.apply_link, "_blank", "noopener,noreferrer");
    } finally {
      setApplyingJobId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#111111] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#ff6b6b]/20 border-t-[#ff6b6b] rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#111111] flex flex-col items-center justify-center text-center px-6">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ff6b6b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-6"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
        <h2 className="text-2xl font-bold text-white mb-2">Connection Error</h2>
        <p className="text-gray-400 max-w-md mb-8">{error}</p>
        <button onClick={() => window.location.reload()} className="px-6 py-3 bg-[#ff6b6b] text-[#111] font-bold tracking-widest uppercase text-xs hover:bg-[#ff8585] transition-colors">
          Retry Connection
        </button>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#111111] flex flex-col items-center justify-center text-center px-6">
        <h2 className="text-2xl font-bold text-white mb-2">Profile not loaded</h2>
        <p className="text-gray-400 max-w-md mb-8">Please complete your profile once, then return to the dashboard.</p>
        <button onClick={() => router.push("/complete-profile")} className="px-6 py-3 bg-[#ff6b6b] text-[#111] font-bold tracking-widest uppercase text-xs hover:bg-[#ff8585] transition-colors">
          Complete Profile
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111111] font-sans text-white overflow-x-hidden selection:bg-[#ff6b6b] selection:text-white">
      
      {/* NAVBAR */}
      <nav className="fixed top-0 w-full z-50 bg-[#111111]/90 backdrop-blur-md border-b border-white/5 h-20 flex items-center justify-between px-6 md:px-12">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => router.push("/")}>
          <div className="relative w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center bg-white/5 border border-white/10 group-hover:border-[#ff6b6b]/50 transition-colors">
            <Image
              src="/logo-icon.png"
              alt="Cypherdon"
              width={32}
              height={32}
              className="w-full h-full object-contain"
              priority
            />
          </div>
          <span className="font-bold text-xl tracking-widest text-white group-hover:text-[#ff6b6b] transition-colors">CYPHERDON</span>
        </div>
        <div className="hidden md:flex gap-8 text-sm font-medium text-gray-400">
          <Link href="/dashboard" className="text-white transition-colors">Jobs</Link>
          <Link href="/portfolio" className="hover:text-white transition-colors">My Portfolio</Link>
          <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
          <Link href="/profile" className="hover:text-white transition-colors">Settings</Link>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push("/portfolio")}
            className="text-xs font-bold uppercase tracking-widest text-white border border-white/20 hover:border-[#ff6b6b] hover:text-[#ff6b6b] px-5 py-2.5 transition-all hidden md:block"
          >
            VIEW PORTFOLIO
          </button>
          <button 
            onClick={() => { localStorage.clear(); router.push("/login"); }}
            className="text-xs font-bold uppercase tracking-widest bg-[#ff6b6b] text-[#111] hover:bg-[#ff8585] px-5 py-2.5 transition-colors"
          >
            LOG OUT
          </button>
        </div>
      </nav>

      {/* HERO COMMAND CENTER */}
      <section className="pt-40 pb-20 px-6 md:px-16 mx-auto relative min-h-[600px] flex flex-col justify-center border-b border-white/5">
        {/* 3D Particle Sphere Background */}
        <ParticleSphere />
        
        <div className="absolute top-20 right-0 w-96 h-96 bg-[#ff6b6b]/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto w-full relative z-10 pointer-events-none">
          <h3 className="text-[#ff6b6b] tracking-[0.2em] text-sm font-bold uppercase mb-4 pointer-events-auto">
            WELCOME BACK, {profile.full_name?.split(' ')[0] || "USER"}
          </h3>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-6 pointer-events-auto">
            Let Your Profile Take <br />
            <span className="text-gray-500">Your Career to Higher Grounds.</span>
          </h1>
          <p className="text-gray-400 max-w-xl text-lg leading-relaxed mb-10 pointer-events-auto">
            Your Cypherdon AI command center. We continuously analyze your resume against live job postings to find you the highest probability matches.
          </p>
          
          <div className="flex gap-4 pointer-events-auto">
            <button className="bg-[#ff6b6b] text-[#111] font-bold uppercase tracking-widest text-sm px-8 py-4 hover:bg-[#ff8585] transition-colors">
              Analyze Resume
          </button>
          <button onClick={() => router.push("/profile")} className="border border-white/20 text-white font-bold uppercase tracking-widest text-sm px-8 py-4 hover:border-white transition-colors">
            Edit Profile
          </button>
          </div>
        </div>
      </section>

      {/* WE TAKE PRIDE IN OUR NUMBERS (STATS) */}
      <section className="border-y border-white/5 bg-[#161616] py-20 px-6 md:px-16">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-center text-2xl md:text-3xl font-medium tracking-wide mb-16">
            Your Career Intelligence Stats
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            {/* Stat 1 */}
            <div className="flex flex-col items-center">
              <div className="text-5xl md:text-6xl font-light text-[#ff6b6b] mb-4">{atsScore}%</div>
              <div className="h-[2px] w-12 bg-white/20 mb-4" />
              <div className="text-xs tracking-widest text-gray-400 uppercase">ATS Resume Score</div>
            </div>
            {/* Stat 2 */}
            <div className="flex flex-col items-center">
              <div className="text-5xl md:text-6xl font-light text-[#ff6b6b] mb-4">12</div>
              <div className="h-[2px] w-12 bg-white/20 mb-4" />
              <div className="text-xs tracking-widest text-gray-400 uppercase">Jobs Applied</div>
            </div>
            {/* Stat 3 */}
            <div className="flex flex-col items-center">
              <div className="text-5xl md:text-6xl font-light text-[#ff6b6b] mb-4">45</div>
              <div className="h-[2px] w-12 bg-white/20 mb-4" />
              <div className="text-xs tracking-widest text-gray-400 uppercase">Portfolio Views</div>
            </div>
            {/* Stat 4 */}
            <div className="flex flex-col items-center">
              <div className="text-5xl md:text-6xl font-light text-[#ff6b6b] mb-4">{jobs.length}</div>
              <div className="h-[2px] w-12 bg-white/20 mb-4" />
              <div className="text-xs tracking-widest text-gray-400 uppercase">New High Matches</div>
            </div>
          </div>
        </div>
      </section>

      {/* RECOMMENDED JOBS GRID */}
      <section id="matches" className="py-24 px-6 md:px-16 max-w-7xl mx-auto scroll-mt-24">
        <div className="flex flex-col gap-8 mb-12 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight mb-2">High-Probability Matches</h2>
            <p className="text-gray-400">
              {showAllMatches
                ? `${filteredJobs.length} ${selectedType === "All" ? "available matches" : `${selectedType.toLowerCase()} matches`} loaded for your profile.`
                : `Showing the top ${visibleJobs.length} matches. ${hiddenMatchCount > 0 ? `${hiddenMatchCount} more available.` : ""}`}
            </p>
            <div className="mt-3 flex flex-wrap gap-3 text-[11px] font-bold uppercase tracking-widest text-gray-500">
              <span>Sources: {jobSource || "Loading"}</span>
              {updatedLabel && <span>Updated: {updatedLabel}</span>}
              <span>Auto-refresh: 10 min</span>
            </div>
          </div>
          <button type="button" onClick={handleViewAllMatches} disabled={showAllMatches || filteredJobs.length <= 3} className="self-start text-[#ff6b6b] hover:text-[#ff8585] disabled:text-gray-600 disabled:cursor-not-allowed text-sm font-bold tracking-widest uppercase bg-transparent border-0 cursor-pointer">
            View All Matches →
          </button>
        </div>

        <div className="mb-8 flex flex-wrap gap-3">
          {jobTypes.map((type) => (
            <button
              key={type.label}
              type="button"
              onClick={() => {
                setSelectedType(type.label);
                setShowAllMatches(type.label !== "All");
              }}
              className={`rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer ${
                selectedType === type.label
                  ? "border-[#ff6b6b] bg-[#ff6b6b] text-[#111]"
                  : "border-white/10 bg-white/[0.03] text-gray-400 hover:border-[#ff6b6b]/60 hover:text-white"
              }`}
            >
              {type.label} <span className="ml-1 opacity-70">{type.count}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {visibleJobs.map((job) => (
            <div key={job.id} onClick={() => setSelectedJob(job)} className="bg-[#1a1a1a] border border-white/5 hover:border-[#ff6b6b]/50 p-8 transition-all group flex flex-col h-full cursor-pointer hover:-translate-y-1 duration-300">
              {/* Card Header */}
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-[#ff6b6b]/10 rounded-lg">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ff6b6b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                  </svg>
                </div>
                <div className="flex items-center gap-1.5 bg-[#ff6b6b]/10 text-[#ff6b6b] px-2.5 py-1 rounded text-xs font-bold">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/>
                  </svg>
                  {job.match_score}% MATCH
                </div>
              </div>

              {/* Job Info */}
              <div className="mb-4 inline-flex w-fit rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                {job.job_type}
              </div>
              <h3 className="text-xl font-bold mb-2 group-hover:text-[#ff6b6b] transition-colors line-clamp-2">
                {job.job_title}
              </h3>
              <p className="text-[#ff6b6b] text-sm font-medium mb-4">
                {job.company_name} <span className="text-gray-600 mx-2">•</span> <span className="text-gray-400">{job.location}</span>
              </p>
              
              <p className="mb-4 text-[11px] font-bold uppercase tracking-widest text-gray-600">
                From {job.source || "Live board"}
              </p>

              <div 
                className="text-gray-400 text-sm leading-relaxed mb-8 flex-grow line-clamp-3"
                dangerouslySetInnerHTML={{ __html: job.description }} 
              />

              {/* Action */}
              <div className="mt-auto border-t border-white/5 pt-6 flex justify-between items-center">
                <span className="text-xs tracking-widest text-gray-500 uppercase font-medium group-hover:text-white transition-colors">Read More</span>
                <button className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#ff6b6b] transition-colors">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                    <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        {visibleJobs.length === 0 && (
          <div className="border border-white/5 bg-[#1a1a1a] p-10 text-center text-gray-400">
            No matches found for this job type yet.
          </div>
        )}
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 bg-[#111111] py-12 px-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-6">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ff6b6b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
          </svg>
          <span className="font-bold text-lg tracking-widest text-white">CYPHERDON</span>
        </div>
        <p className="text-gray-500 text-xs tracking-widest uppercase">
          © 2026 Cypherdon AI. All rights reserved.
        </p>
      </footer>

      {/* Job Details Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedJob(null)} />
          <div className="relative w-full max-w-4xl bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-fade-in-up">
            {/* Modal Header */}
            <div className="flex justify-between items-start p-6 md:p-8 border-b border-white/5">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl md:text-3xl font-bold text-white">{selectedJob.job_title}</h2>
                  <div className="bg-[#ff6b6b]/10 text-[#ff6b6b] px-3 py-1 rounded text-xs font-bold whitespace-nowrap">
                    {selectedJob.match_score}% MATCH
                  </div>
                </div>
                <p className="text-[#ff6b6b] font-medium">
                  {selectedJob.company_name} <span className="text-gray-600 mx-2">•</span> <span className="text-gray-400">{selectedJob.location}</span>
                </p>
              </div>
              <button onClick={() => setSelectedJob(null)} className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 md:p-8 overflow-y-auto flex-grow custom-scrollbar">
              <div className="prose prose-invert prose-p:text-gray-400 prose-headings:text-white prose-a:text-[#ff6b6b] max-w-none" dangerouslySetInnerHTML={{ __html: selectedJob.description }} />
            </div>
            
            {/* Modal Footer */}
            <div className="p-6 md:p-8 border-t border-white/5 flex justify-end gap-4 bg-[#111111] rounded-b-2xl">
              <button onClick={() => setSelectedJob(null)} className="px-6 py-3 border border-white/20 text-white font-bold tracking-widest uppercase text-xs hover:bg-white/5 transition-colors">
                Close
              </button>
              <button
                type="button"
                onClick={() => handleApplyThroughCypherdon(selectedJob)}
                disabled={applyingJobId === selectedJob.id}
                className="px-8 py-3 bg-[#ff6b6b] text-[#111] font-bold tracking-widest uppercase text-xs hover:bg-[#ff8585] transition-colors disabled:opacity-60 disabled:cursor-wait"
              >
                {applyingJobId === selectedJob.id ? "Starting..." : "Apply Through Cypherdon"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
