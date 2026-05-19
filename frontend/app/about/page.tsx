"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { readCachedProfile } from "@/lib/profileStorage";
import { siteImages } from "@/lib/siteImages";
import { 
  Sparkles, 
  ArrowRight, 
  ChevronRight, 
  Zap, 
  Brain, 
  Shield, 
  Terminal, 
  Cpu, 
  Database, 
  Layers, 
  CheckCircle2, 
  AlertCircle,
  ArrowUpRight,
  Code2,
  Server,
  Workflow,
  Lock,
  Eye,
  Check,
  X
} from "lucide-react";

type PipelineStep = "parsing" | "database" | "matching" | "dispatch";

interface LogMessage {
  time: string;
  type: "info" | "warn" | "success" | "code";
  text: string;
}

export default function AboutPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("Explorer");
  
  // Interactive Pipeline Terminal State
  const [activeStep, setActiveStep] = useState<PipelineStep>("parsing");
  const [isTerminalTyping, setIsTerminalTyping] = useState(false);

  // Read profile auth state dynamically to fix the "static Explorer" glitch
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) {
      setIsLoggedIn(true);
      const profile = readCachedProfile();
      if (profile && profile.full_name) {
        setUserName(profile.full_name);
      }
    }
  }, []);

  // Simulated live logs data for blueprint showcase
  const stepLogs: Record<PipelineStep, LogMessage[]> = {
    parsing: [
      { time: "02:14:05", type: "info", text: "Starting FastAPI deep-parsing boundary..." },
      { time: "02:14:05", type: "info", text: "Ingesting raw resume stream (825.4 KB PDF binary)" },
      { time: "02:14:06", type: "success", text: "Semantic schema successfully normalized. 4 block ranges isolated." },
      { time: "02:14:06", type: "warn", text: "Parsed date boundary for \"Systems Architect\" normalized to ISO-8601." },
      { time: "02:14:06", type: "code", text: `{\n  "identity": "Alex Mercer",\n  "skills": ["Rust", "TypeScript", "Next.js", "Docker", "PostgreSQL"],\n  "experience_years": 8.5,\n  "role_preference": "Senior Engineer"\n}` }
    ],
    database: [
      { time: "02:14:10", type: "info", text: "Initiating isolated user workspace schema sink..." },
      { time: "02:14:10", type: "info", text: "Validating JWT session header via Supabase authentication layer." },
      { time: "02:14:11", type: "success", text: "Row-Level Security (RLS) policies verified. Zero shared memory leak detected." },
      { time: "02:14:11", type: "code", text: `{\n  "schema": "public.users",\n  "tenant_id": "usr_612a_db",\n  "encryption_keys": "AES-GCM-256-Rotated",\n  "rls_policy": "owner_access_only"\n}` }
    ],
    matching: [
      { time: "02:14:15", type: "info", text: "Initializing text-embedding similarity matrix computation..." },
      { time: "02:14:15", type: "info", text: "Retrieving local job posting index (dimensions: 1536, cosine-kernel)." },
      { time: "02:14:16", type: "success", text: "Match computed for Senior Distributed Engineer [job_824]." },
      { time: "02:14:16", type: "code", text: `{\n  "cosine_similarity": 0.9412,\n  "skills_overlap_ratio": 0.88,\n  "weighted_score": 92.5,\n  "verdict": "STRONG_ATS_SUITABILITY"\n}` }
    ],
    dispatch: [
      { time: "02:14:20", type: "info", text: "Spring Boot Dispatch worker checking pending queue..." },
      { time: "02:14:20", type: "info", text: "Generating custom outreach body based on structural ATS matching gap..." },
      { time: "02:14:21", type: "success", text: "SMTP delivery protocol completed successfully via secure mail pipeline." },
      { time: "02:14:21", type: "code", text: `{\n  "delivery_agent": "Spring_SMTP_Relay",\n  "log_reference": "outbound_msg_9114b",\n  "status": "DELIVERED_TO_INBOX",\n  "encryption": "TLS_1.3"\n}` }
    ]
  };

  return (
    <div className="relative min-h-screen bg-[#f7fbff] text-slate-900 overflow-x-hidden font-sans antialiased">
      {/* Dynamic Header/Navbar */}
      <Navbar isLoggedIn={isLoggedIn} userName={userName} />

      {/* Modern Grid Blueprint Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
      
      {/* Curated Soft Glow Bubbles */}
      <div className="absolute top-0 right-0 w-[800px] h-[600px] bg-gradient-to-b from-sky-200/35 to-indigo-200/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-[40%] left-[-150px] w-[600px] h-[600px] bg-gradient-to-tr from-violet-200/25 to-indigo-200/15 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-150px] w-[700px] h-[700px] bg-gradient-to-tl from-sky-200/25 to-violet-200/15 rounded-full blur-[150px] pointer-events-none" />

      {/* ================= HERO SECTION (EDITORIAL MAGAZINE STYLE) ================= */}
      <section className="relative pt-40 pb-24 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-16 items-center">
            
            {/* Left Content Column */}
            <div className="space-y-8 max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/90 px-4.5 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-sky-600 shadow-sm backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-sky-500 animate-pulse" />
                The Product Vision
              </div>

              <h1 className="text-5xl md:text-7xl font-light tracking-tight text-slate-950 leading-[1.05]">
                Human Agency. <br />
                <span className="font-semibold bg-gradient-to-r from-sky-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                  Supercharged by Code.
                </span>
              </h1>

              <p className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-xl font-light">
                We believe the job application loop shouldn&apos;t feel like a digital lottery. Cypherdon was architected to empower developers with real, transparent, and auditable automation layers.
              </p>

              {/* Dynamic Simulated Live Metric Display */}
              <div className="grid grid-cols-2 gap-4 max-w-md pt-4">
                <div className="rounded-2xl border border-slate-200/60 bg-white/70 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] backdrop-blur-md hover:border-slate-300 transition-all duration-300">
                  <div className="text-4xl font-bold bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent">
                    92%
                  </div>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1.5">ATS Match Accuracy</div>
                  <p className="text-xs text-slate-400 mt-1 font-light">Calculated via direct cosine semantic vector comparison.</p>
                </div>
                <div className="rounded-2xl border border-slate-200/60 bg-white/70 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] backdrop-blur-md hover:border-slate-300 transition-all duration-300">
                  <div className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                    10x
                  </div>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1.5">Pipeline Speedup</div>
                  <p className="text-xs text-slate-400 mt-1 font-light">Replaces hours of repetitive typing and custom adjustments.</p>
                </div>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row pt-4">
                <Link href="/signup" className="no-underline">
                  <button className="flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-8 py-4.5 text-sm font-semibold text-white shadow-[0_18px_50px_rgba(15,23,42,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-900 cursor-pointer border-none w-full sm:w-auto">
                    Create free profile
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
                <Link href="/login" className="no-underline">
                  <button className="w-full sm:w-auto rounded-2xl border border-slate-200/80 bg-white/85 px-8 py-4.5 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur-md transition-all duration-300 hover:border-slate-300 hover:bg-white cursor-pointer">
                    Developer Sign in
                  </button>
                </Link>
              </div>
            </div>

            {/* Right Showcase Column (High Fidelity Product Image Overlay) */}
            <div className="relative">
              {/* Outer soft shadow ring */}
              <div className="absolute inset-0 rounded-[2.5rem] bg-indigo-200/25 blur-3xl -z-10" />
              
              {/* Geometric visual elements representing code mapping */}
              <div className="absolute -top-6 -left-6 w-16 h-16 border-t-2 border-l-2 border-sky-400/40 rounded-tl-3xl pointer-events-none hidden md:block" />
              <div className="absolute -bottom-6 -right-6 w-16 h-16 border-b-2 border-r-2 border-violet-400/40 rounded-br-3xl pointer-events-none hidden md:block" />

              <div className="relative overflow-hidden rounded-[2.5rem] border border-white/90 bg-white/60 p-4.5 shadow-[0_35px_90px_rgba(148,163,184,0.22)] backdrop-blur-xl">
                <Image
                  src={siteImages.landing.brandSection}
                  alt="Cypherdon High Fidelity Interface"
                  width={1600}
                  height={1200}
                  className="h-auto w-full rounded-[2rem] object-cover"
                  priority
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ================= PIPELINE SIMULATOR (UNIQUE & HIGHLY PREMIUM DRAW) ================= */}
      <section className="py-28 px-6 lg:px-8 bg-white/40 border-y border-slate-200/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto">
          
          <div className="max-w-3xl mb-16 space-y-4">
            <div className="text-sm font-bold uppercase tracking-[0.2em] text-indigo-600 flex items-center gap-1.5">
              <span className="flex h-1.5 w-1.5 rounded-full bg-indigo-600" />
              Core Architecture
            </div>
            <h2 className="text-4xl md:text-5xl font-light tracking-tight text-slate-950">
              Interactive <span className="font-semibold">Pipeline Engine</span>
            </h2>
            <p className="text-base md:text-lg text-slate-600 leading-relaxed font-light">
              We leverage an advanced polyglot execution framework. Tap on each stage of the pipeline below to preview the underlying, real-time diagnostic output in our custom sandbox.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-12 items-stretch">
            
            {/* Left: Step Controllers */}
            <div className="flex flex-col justify-between space-y-4">
              <div className="space-y-3.5">
                {[
                  {
                    id: "parsing",
                    num: "01",
                    title: "Semantic Profile Ingestion",
                    short: "FastAPI + Document Parsing Matrix",
                    icon: <Cpu className="w-5 h-5" />,
                    color: "border-sky-500/30 text-sky-600 bg-sky-50/50"
                  },
                  {
                    id: "database",
                    num: "02",
                    title: "Row-Level Database Isolation",
                    short: "Supabase Relational Encryption Sync",
                    icon: <Database className="w-5 h-5" />,
                    color: "border-emerald-500/30 text-emerald-600 bg-emerald-50/50"
                  },
                  {
                    id: "matching",
                    num: "03",
                    title: "Bilateral Semantic Matching",
                    short: "Multi-Vector Cosine Similarity",
                    icon: <Brain className="w-5 h-5" />,
                    color: "border-indigo-500/30 text-indigo-600 bg-indigo-50/50"
                  },
                  {
                    id: "dispatch",
                    num: "04",
                    title: "Agentic Outreach Delivery",
                    short: "Java 21 Thread Queue & SMTP worker",
                    icon: <Workflow className="w-5 h-5" />,
                    color: "border-violet-500/30 text-violet-600 bg-violet-50/50"
                  }
                ].map((step) => {
                  const isSelected = activeStep === step.id;
                  return (
                    <button
                      key={step.id}
                      onClick={() => {
                        setIsTerminalTyping(true);
                        setActiveStep(step.id as PipelineStep);
                        setTimeout(() => setIsTerminalTyping(false), 200);
                      }}
                      className={`w-full text-left flex gap-5 p-5.5 rounded-2xl border transition-all duration-300 cursor-pointer ${
                        isSelected 
                          ? "border-slate-300 bg-white shadow-[0_12px_40px_rgba(0,0,0,0.04)] translate-x-2" 
                          : "border-slate-200/60 bg-white/40 hover:bg-white/80 hover:translate-x-1"
                      }`}
                    >
                      <div className={`flex-shrink-0 w-11 h-11 rounded-xl border flex items-center justify-center transition-transform duration-300 ${
                        isSelected ? "scale-110 shadow-sm" : ""
                      } ${step.color}`}>
                        {step.icon}
                      </div>
                      <div className="flex-grow">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-400 tracking-wider font-mono">{step.num}</span>
                          {isSelected && <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />Active</span>}
                        </div>
                        <h4 className="text-base font-semibold text-slate-950 mt-1">{step.title}</h4>
                        <p className="text-xs text-slate-500 mt-1">{step.short}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right: Simulated Developer Terminal */}
            <div className="rounded-[2rem] border border-slate-800 bg-[#0d0e15] p-6 text-white shadow-2xl flex flex-col justify-between overflow-hidden relative font-mono text-sm leading-relaxed">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none" />
              
              {/* Terminal Title Bar */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  <span className="text-xs text-slate-500 ml-2 font-medium tracking-wide">cypherdon_pipeline_console.log</span>
                </div>
                <Terminal className="w-4 h-4 text-slate-600" />
              </div>

              {/* Terminal Console Stream Area */}
              <div className="flex-grow space-y-3.5 min-h-[300px]">
                {isTerminalTyping ? (
                  <div className="flex items-center gap-2 text-slate-500 animate-pulse pt-4">
                    <span className="w-2 h-4 bg-slate-500 animate-bounce" />
                    <span>Synchronizing execution state...</span>
                  </div>
                ) : (
                  stepLogs[activeStep].map((log, idx) => (
                    <div key={idx} className="transition-all duration-300 animate-fade-in-up">
                      <span className="text-slate-600 text-xs mr-2">{log.time}</span>
                      {log.type === "success" && <span className="text-emerald-400 font-bold mr-2">[OK]</span>}
                      {log.type === "warn" && <span className="text-amber-400 font-bold mr-2">[WARN]</span>}
                      {log.type === "info" && <span className="text-sky-400 font-bold mr-2">[INFO]</span>}
                      
                      {log.type === "code" ? (
                        <pre className="mt-2 p-3 bg-slate-900/60 border border-slate-800/60 rounded-xl text-slate-300 overflow-x-auto text-[11px] md:text-xs">
                          {log.text}
                        </pre>
                      ) : (
                        <span className="text-slate-200">{log.text}</span>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Console Status Footer */}
              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Interactive Agent Sandbox</span>
                </div>
                <div>TLS_1.3 AES_256</div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ================= THE COMPARISON MATRIX (STRUCTURAL REDESIGN) ================= */}
      <section className="py-28 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mx-auto text-center mb-20 space-y-4">
            <div className="text-sm font-bold uppercase tracking-[0.2em] text-indigo-600">
              System Comparison
            </div>
            <h2 className="text-4xl md:text-5xl font-light tracking-tight text-slate-950">
              Inverting the <span className="font-semibold">Job Search Marathon</span>
            </h2>
            <p className="text-base md:text-lg text-slate-600 leading-relaxed font-light">
              Traditional job hunting is a tedious, numbers-based copy marathon. Cypherdon changes the game.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            
            {/* The Manual Method (Traditional Pain) */}
            <div className="group p-8 md:p-12 rounded-[2.5rem] border border-slate-200 bg-white/50 shadow-sm flex flex-col justify-between relative hover:border-slate-300 transition-all duration-300">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50/50 px-3.5 py-1 text-xs font-semibold text-red-600">
                  <X className="w-3.5 h-3.5" />
                  Traditional Manual Approach
                </div>
                <h3 className="text-3xl font-semibold text-slate-950 leading-tight">
                  Wasted time, generic outcomes.
                </h3>
                <p className="text-slate-500 font-light text-base leading-relaxed">
                  Developers waste an average of 15 hours per week manually tailoring PDF resumes and drafting cover letters, only to get lost in un-audited black hole databases.
                </p>

                <div className="my-8 h-px bg-slate-200/80" />

                <div className="space-y-4">
                  {[
                    "Unending copying and pasting of form inputs.",
                    "Zero visibility into why systems filter your resume out.",
                    "Sending generic letters to unresponsive cold mailboxes."
                  ].map((pain, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-red-50 flex items-center justify-center text-red-500 flex-shrink-0 mt-0.5">
                        <AlertCircle className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-sm text-slate-600 font-light">{pain}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-12 text-xs font-bold text-red-500 uppercase tracking-widest">
                Efficiency Rating: ~12%
              </div>
            </div>

            {/* The Cypherdon Approach (Dynamic Automation) */}
            <div className="group p-8 md:p-12 rounded-[2.5rem] border border-indigo-200 bg-indigo-50/20 shadow-md flex flex-col justify-between relative hover:border-indigo-300 hover:shadow-lg transition-all duration-300 overflow-hidden">
              {/* Highlight background blob */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-200/30 rounded-full blur-[80px] pointer-events-none" />

              <div className="space-y-6 relative z-10">
                <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-100/50 px-3.5 py-1 text-xs font-semibold text-indigo-600">
                  <Check className="w-3.5 h-3.5" />
                  Cypherdon Automation Engine
                </div>
                <h3 className="text-3xl font-semibold text-slate-950 leading-tight">
                  Proactive match, absolute agency.
                </h3>
                <p className="text-slate-600 font-light text-base leading-relaxed">
                  We build an active, automated matching stream. Your profile automatically aligns semantic skills, tracks match ratings, and drafts bespoke cold pitches in one click.
                </p>

                <div className="my-8 h-px bg-indigo-200/60" />

                <div className="space-y-4">
                  {[
                    "Isolated developer profiles syncing dynamically.",
                    "Full cosine similarity ATS scoring and keyword breakdown.",
                    "Bespoke generated outbound pitches delivered via secure relay."
                  ].map((advantage, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0 mt-0.5">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-sm text-slate-700 font-medium">{advantage}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-12 text-xs font-bold text-indigo-600 uppercase tracking-widest relative z-10">
                Efficiency Rating: ~96%
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ================= CORE PRINCIPLES SECTION ================= */}
      <section className="py-28 px-6 lg:px-8 bg-gradient-to-b from-indigo-50/20 to-sky-50/20 border-t border-slate-200/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          
          <div className="max-w-3xl mx-auto text-center mb-20 space-y-4">
            <div className="text-sm font-bold uppercase tracking-[0.2em] text-indigo-600">
              Our Core Principles
            </div>
            <h2 className="text-4xl md:text-5xl font-light tracking-tight text-slate-950">
              Designed with <span className="font-semibold">Absolute Integrity</span>
            </h2>
            <p className="text-base md:text-lg text-slate-600 leading-relaxed font-light">
              We operate under a rigid set of guidelines to ensure that your data is safe and your matches are honest.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Shield className="w-5 h-5 text-sky-600" />,
                iconColor: "text-sky-600 bg-sky-50 border-sky-100",
                title: "Guaranteed Sandbox Isolation",
                desc: "Your data is completely segregated and never trained on public models. Relational transactions remain entirely private to your account domain."
              },
              {
                icon: <Brain className="w-5 h-5 text-indigo-600" />,
                iconColor: "text-indigo-600 bg-indigo-50 border-indigo-100",
                title: "Explainable Core Logic",
                desc: "We reject black-box AI scores. We expose exact vector dimensions, matching similarity ratios, and parser logs directly inside your workspace."
              },
              {
                icon: <Zap className="w-5 h-5 text-violet-600" />,
                iconColor: "text-violet-600 bg-violet-50 border-violet-100",
                title: "High-Agency Controls",
                desc: "We never apply to jobs automatically. You review all recommendations, control final edits, and explicitly authorize every SMTP message dispatch."
              }
            ].map((principle, idx) => (
              <div 
                key={idx} 
                className="group p-8 rounded-3xl border border-white/90 bg-white/70 shadow-[0_12px_45px_rgba(0,0,0,0.01)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.03)] hover:border-slate-300 transition-all duration-300"
              >
                <div className={`w-11 h-11 rounded-xl border flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300 ${principle.iconColor}`}>
                  {principle.icon}
                </div>
                <h3 className="text-xl font-semibold text-slate-950 mb-3">{principle.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed font-light">{principle.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ================= HIGH IMPACT CALL TO ACTION (CTA) ================= */}
      <section className="py-28 px-6 lg:px-8 relative">
        <div className="max-w-5xl mx-auto">
          <div className="relative overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white shadow-[0_30px_90px_rgba(148,163,184,0.15)] p-10 md:p-16 text-center">
            
            {/* Subtle inner background blur gradient */}
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(247,251,255,0.85))]" />
            <div className="absolute top-[-50px] right-[-50px] w-80 h-80 bg-indigo-100/30 rounded-full blur-[90px] pointer-events-none" />
            <div className="absolute bottom-[-50px] left-[-50px] w-80 h-80 bg-sky-100/30 rounded-full blur-[90px] pointer-events-none" />

            <div className="relative z-10 max-w-2xl mx-auto space-y-8">
              <h2 className="text-4xl md:text-5xl font-light tracking-tight text-slate-950">
                Ready to accelerate <br className="hidden md:block" />
                your <span className="font-semibold">career momentum?</span>
              </h2>
              
              <p className="text-base md:text-lg text-slate-500 leading-relaxed font-light">
                Join developers and engineers using Cypherdon to automate profile alignment, parse resumes, and capture high-fidelity job matches.
              </p>

              <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2">
                <Link href="/signup" className="no-underline">
                  <button className="flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-8 py-4.5 text-sm font-semibold text-white shadow-[0_18px_50px_rgba(15,23,42,0.18)] transition hover:-translate-y-0.5 hover:bg-slate-900 cursor-pointer border-none w-full sm:w-auto">
                    Start Building Free
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </Link>
                <Link href="/dashboard" className="no-underline">
                  <button className="w-full sm:w-auto rounded-2xl border border-slate-200 bg-white/80 px-8 py-4.5 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur-md transition hover:border-slate-300 hover:bg-white cursor-pointer">
                    Explore Dashboard
                  </button>
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Footer component */}
      <Footer />
    </div>
  );
}
