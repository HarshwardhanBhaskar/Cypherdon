"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { 
  Mail, 
  MapPin, 
  ChevronRight, 
  Briefcase, 
  Globe, 
  Compass, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  TrendingUp
} from "lucide-react";

const openings = [
  {
    title: "Senior Full-Stack Engineer",
    team: "Engineering",
    location: "Remote / Ranchi",
    type: "Full-time",
    summary: "Architect and implement key interfaces across the candidate workspace, matching pipelines, and automation flows with a modern Next.js + Spring Boot layout.",
  },
  {
    title: "AI / ML Engineer",
    team: "AI Engine",
    location: "Remote / Ranchi",
    type: "Full-time",
    summary: "Develop highly predictive resume analyzers, structured keyword classifiers, and customized outreach algorithms using LLM prompt-engineering.",
  },
  {
    title: "Frontend Developer",
    team: "Product & UI",
    location: "Remote / Ranchi",
    type: "Full-time",
    summary: "Craft lightning-fast and responsive Next.js views with premium glassmorphism styles and highly interactive frontend state mechanics.",
  },
  {
    title: "Growth & Community Manager",
    team: "Growth",
    location: "Remote / Ranchi",
    type: "Full-time",
    summary: "Own global developer acquisition campaigns, handle product launch strategies, and foster community alignment for Cypherdon.",
  },
];

const principles = [
  {
    icon: <TrendingUp className="w-6 h-6 text-sky-500" />,
    title: "Move with Momentum",
    description: "We work with short feedback loops and high alignment. We iterate rapidly, test proactively, and build things that last.",
  },
  {
    icon: <Globe className="w-6 h-6 text-indigo-500" />,
    title: "High Autonomy",
    description: "Whether you work from Ranchi or anywhere globally, we trust you to manage your time, own your outcomes, and design your lifestyle.",
  },
  {
    icon: <Compass className="w-6 h-6 text-violet-500" />,
    title: "Impact First",
    description: "Every engineer and designer has absolute ownership of their domain. We build features that actively improve developers' lives.",
  },
];

export default function CareersPage() {
  return (
    <div className="relative min-h-screen bg-[#f7fbff] text-slate-900 overflow-x-hidden font-sans">
      <Navbar isLoggedIn={true} userName="Explorer" />

      {/* Decorative Background Glows */}
      <div className="absolute top-0 right-0 w-[600px] h-[500px] bg-gradient-to-b from-sky-200/20 to-indigo-200/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-[35%] left-[-100px] w-[500px] h-[500px] bg-gradient-to-tr from-violet-200/15 to-indigo-200/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-[-100px] w-[600px] h-[600px] bg-gradient-to-tl from-sky-200/15 to-violet-200/10 rounded-full blur-[150px] pointer-events-none" />

      {/* ================= HERO SECTION ================= */}
      <section className="relative pt-36 pb-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-16 items-center">
            {/* Left Content */}
            <div className="space-y-8 max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-sky-600 shadow-sm backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-sky-500" />
                Work with Us
              </div>

              <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-950 leading-[1.05]">
                Build the future
                <span className="block mt-1 bg-gradient-to-r from-sky-500 via-indigo-500 to-violet-500 bg-clip-text text-transparent">
                  of automation together.
                </span>
              </h1>

              <p className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-xl">
                We are searching for outstanding designers, engineers, and visionaries eager to solve complex data processing challenges and elevate developer outcomes.
              </p>

              {/* Quick Details Group */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md pt-4">
                <div className="rounded-2xl border border-white/80 bg-white/60 p-4 shadow-sm backdrop-blur-md flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-sky-600" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Join Team</div>
                    <a href="mailto:hwbhskar60147@gmail.com" className="text-xs font-semibold text-slate-900 hover:text-sky-600 transition-colors">
                      hwbhskar60147@gmail.com
                    </a>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/80 bg-white/60 p-4 shadow-sm backdrop-blur-md flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Location</div>
                    <span className="text-xs font-semibold text-slate-900">Ranchi, India (Remote)</span>
                  </div>
                </div>
              </div>

              {/* Tag System */}
              <div className="flex flex-wrap gap-2.5 pt-4">
                {["Remote First", "Relocation Support", "Full Equity Options", "Learning Stipend"].map((tag) => (
                  <span 
                    key={tag} 
                    className="px-4 py-2 text-xs font-semibold text-slate-600 border border-slate-200/80 bg-white/70 rounded-xl shadow-inner shadow-slate-100/50"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Right Image Showcase */}
            <div className="relative">
              <div className="absolute inset-0 rounded-[2.5rem] bg-sky-200/30 blur-3xl -z-10" />
              <div className="relative overflow-hidden rounded-[2.5rem] border border-white/80 bg-white/60 p-4 shadow-[0_30px_90px_rgba(148,163,184,0.25)] backdrop-blur-xl">
                <Image
                  src="/images/careers.png"
                  alt="Cypherdon Careers"
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

      {/* ================= RECRUITMENT PRINCIPLES ================= */}
      <section className="py-24 px-6 lg:px-8 bg-white/40 border-y border-slate-200/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mx-auto text-center mb-16 space-y-4">
            <div className="text-sm font-bold uppercase tracking-[0.2em] text-indigo-600">
              Why Cypherdon
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-950">
              A high-agency growth environment.
            </h2>
            <p className="text-base md:text-lg text-slate-600 leading-relaxed">
              We design our internal engineering workflows with the same premium, high-impact polish we apply to our outward products.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {principles.map((item, idx) => (
              <div 
                key={idx} 
                className="group p-8 md:p-10 rounded-[2rem] border border-slate-200/80 bg-white/80 shadow-[0_18px_60px_rgba(148,163,184,0.12)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-slate-300"
              >
                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300">
                  {item.icon}
                </div>
                <h3 className="text-2xl font-semibold text-slate-950 mb-3">{item.title}</h3>
                <p className="text-sm md:text-base text-slate-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= WHAT WE OFFER ================= */}
      <section className="py-24 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mx-auto text-center mb-16 space-y-4">
            <div className="text-sm font-bold uppercase tracking-[0.2em] text-indigo-600">
              Benefits & Perks
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-950">
              Engineered to support your best work.
            </h2>
            <p className="text-base md:text-lg text-slate-600 leading-relaxed">
              We invest heavily in the happiness, equipment, and personal health of every team member.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "Premium Comp Packages", desc: "Top-market base salary plus generous early equity distributions." },
              { title: "Universal Health Care", desc: "Comprehensive insurance coverage for you and your dependents." },
              { title: "Dynamic Schedules", desc: "Set your own active hours. We align around outcomes, not clocked minutes." },
              { title: "Equipment Allocations", desc: "Receive generous allowances to build your dream desk and workspace." },
              { title: "Continuing Education", desc: "Annual stipend for developer bootcamps, textbooks, or custom courses." },
              { title: "Annual Ranchi Retreats", desc: "Collaborate, ideate, and celebrate team progress live together." },
            ].map((benefit, idx) => (
              <div 
                key={idx} 
                className="p-6 md:p-8 rounded-2xl border border-slate-100 bg-white/70 hover:bg-white hover:border-slate-300 hover:shadow-[0_12px_36px_rgba(148,163,184,0.08)] transition-all duration-300 flex items-start gap-4"
              >
                <div className="w-6 h-6 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0 mt-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" />
                </div>
                <div>
                  <h4 className="text-base font-semibold text-slate-950 mb-1">{benefit.title}</h4>
                  <p className="text-xs md:text-sm text-slate-500 leading-relaxed">{benefit.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= OPEN RECRUITMENT POSITIONS ================= */}
      <section className="py-24 px-6 lg:px-8 bg-gradient-to-b from-indigo-50/30 to-sky-50/30 border-t border-slate-200/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mb-16 space-y-4">
            <div className="text-sm font-bold uppercase tracking-[0.2em] text-indigo-600">
              Active Listings
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-950">
              Help us craft the future of career automation.
            </h2>
            <p className="text-base md:text-lg text-slate-600 leading-relaxed">
              Explore our primary roles and join a team that values speed, precision, and state-of-the-art visuals.
            </p>
          </div>

          {/* Active Job Cards */}
          <div className="space-y-6">
            {openings.map((role, idx) => (
              <div 
                key={idx} 
                className="group p-8 rounded-[2rem] border border-slate-200/80 bg-white/80 shadow-[0_18px_60px_rgba(148,163,184,0.08)] backdrop-blur-xl hover:border-slate-300 hover:shadow-[0_24px_70px_rgba(148,163,184,0.14)] transition-all duration-300"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                  <div className="space-y-4 flex-1">
                    <h3 className="text-2xl font-bold text-slate-950 group-hover:text-indigo-600 transition-colors">
                      {role.title}
                    </h3>
                    <p className="text-sm md:text-base text-slate-600 leading-relaxed max-w-3xl">
                      {role.summary}
                    </p>
                    <div className="flex flex-wrap gap-2.5 pt-2">
                      <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-sky-600 bg-sky-50 border border-sky-100">
                        <Briefcase className="w-3.5 h-3.5" />
                        {role.team}
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100">
                        <MapPin className="w-3.5 h-3.5" />
                        {role.location}
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-violet-600 bg-violet-50 border border-violet-100">
                        <Compass className="w-3.5 h-3.5" />
                        {role.type}
                      </span>
                    </div>
                  </div>

                  <a 
                    href="mailto:hwbhskar60147@gmail.com?subject=Application for Senior Full-Stack Engineer"
                    className="no-underline shrink-0"
                  >
                    <button className="flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-7 py-3.5 text-sm font-semibold text-white shadow-[0_12px_36px_rgba(15,23,42,0.12)] transition hover:-translate-y-0.5 hover:bg-slate-900 cursor-pointer border-none w-full lg:w-auto">
                      Apply now
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Unsolicited Applications Block */}
          <div className="mt-16 text-center max-w-xl mx-auto space-y-6">
            <p className="text-slate-600 text-sm md:text-base">
              Don't see your specific expertise listed above? We always make room for remarkable talent.
            </p>
            <a 
              href="mailto:hwbhskar60147@gmail.com?subject=Spontaneous Application — Cypherdon Team"
              className="inline-flex items-center gap-2 px-8 py-4 border border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-2xl shadow-sm transition-all duration-300 hover:-translate-y-0.5 cursor-pointer no-underline"
            >
              <Mail className="w-4 h-4 text-indigo-500" />
              Submit general application
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
