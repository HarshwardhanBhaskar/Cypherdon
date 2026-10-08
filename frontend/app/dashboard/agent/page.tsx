"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Bot,
  Sparkles,
  Play,
  CheckCircle2,
  AlertCircle,
  Clock,
  Briefcase,
  Mail,
  Award,
  Terminal,
  RotateCw,
  Copy,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Zap,
  ArrowRight,
  Send,
  Sliders,
  Check
} from "lucide-react";
import Navbar from "@/components/Navbar";

interface AgentEvent {
  event_type: string;
  step?: number;
  thought?: string;
  tool?: string;
  args?: any;
  result?: any;
  reflection?: string;
  quality_score?: number;
  needs_revision?: boolean;
  message?: string;
  timestamp: string;
}

interface ApplicationPackage {
  job_id: any;
  job_title: string;
  company_name: string;
  location: string;
  apply_link: string;
  match_score: number;
  missing_skills: string[];
  cold_email?: {
    subject: string;
    body: string;
  };
}

interface AgentResult {
  task_id: string;
  goal: string;
  status: string;
  summary: string;
  candidate_profile?: {
    target_role?: string;
    skills?: string[];
    experience_level?: string;
    ats_baseline_score?: number;
  };
  applications: ApplicationPackage[];
  total_applications: number;
  execution_metrics?: {
    duration_seconds: number;
    cycles_executed: number;
    plan_steps: number;
    reflections_count: number;
  };
}

const PRESET_GOALS = [
  "Find 3 remote Backend Engineer roles, evaluate ATS score compatibility, and draft tailored application pitches.",
  "Search for high-growth Full Stack roles matching Python & React, and produce verified cold outreach emails.",
  "Analyze active market openings for Software Engineer and generate high-impact applications with quantifiable impact metrics."
];

export default function AgentDashboard() {
  const [goal, setGoal] = useState<string>(PRESET_GOALS[0]);
  const [resumeText, setResumeText] = useState<string>("");
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [plan, setPlan] = useState<string[]>([]);
  const [events, setEvents] = useState<AgentEvent[]>([]);
  const [result, setResult] = useState<AgentResult | null>(null);
  const [statusText, setStatusText] = useState<string>("Ready to Plan & Execute");
  const [activeTab, setActiveTab] = useState<"feed" | "plan" | "results">("feed");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const feedEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const FASTAPI_BASE = "http://localhost:8000";
  const FASTAPI_WS_BASE = "ws://localhost:8000";

  // Auto-scroll the live thought feed as agent thinks
  useEffect(() => {
    feedEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [events]);

  // Cleanup WebSocket on unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // Launch the agent
  const handleLaunchAgent = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!goal.trim() || isRunning) return;

    setIsRunning(true);
    setPlan([]);
    setEvents([]);
    setResult(null);
    setStatusText("Initiating Autonomous ReAct Planner...");

    try {
      const res = await fetch(`${FASTAPI_BASE}/api/agent/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goal: goal.trim(),
          resume_text: resumeText.trim() || undefined,
          user_id: "demo-user"
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || "Failed to initialize agent");
      }

      const data = await res.json();
      const currentTaskId = data.task_id;
      setTaskId(currentTaskId);
      setStatusText("Agent Running: Planning & Executing Tools...");

      // Connect WebSocket for live streaming
      connectWebSocket(currentTaskId);

      // Also set up polling fallback to guarantee completion capture
      pollAgentStatus(currentTaskId);
    } catch (err: any) {
      console.error("Agent launch error:", err);
      setIsRunning(false);
      setStatusText(`Error: ${err.message}`);
    }
  };

  const connectWebSocket = (id: string) => {
    if (wsRef.current) {
      wsRef.current.close();
    }

    try {
      const ws = new WebSocket(`${FASTAPI_WS_BASE}/api/agent/ws/${id}`);
      wsRef.current = ws;

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          handleIncomingAgentEvent(payload);
        } catch (e) {
          console.warn("Could not parse agent WS event", e);
        }
      };

      ws.onerror = () => {
        console.warn("Agent WS disconnected, relying on polling fallback.");
      };
    } catch (e) {
      console.warn("Agent WS error:", e);
    }
  };

  const handleIncomingAgentEvent = (event: AgentEvent) => {
    setEvents((prev) => [...prev, event]);

    if (event.event_type === "PLAN" && event.result?.plan) {
      setPlan(event.result.plan);
    } else if (event.event_type === "PLAN" && (event as any).plan) {
      setPlan((event as any).plan);
    }

    if (event.event_type === "THOUGHT") {
      setStatusText(`Thinking (Step ${event.step || "•"}): ${event.thought?.slice(0, 70)}...`);
    } else if (event.event_type === "TOOL_CALL") {
      setStatusText(`Executing Tool: ${event.tool}`);
    } else if (event.event_type === "REFLECTION") {
      setStatusText(`Self-Critique: Quality Gate ${event.quality_score || 85}/100`);
    } else if (event.event_type === "COMPLETED") {
      setIsRunning(false);
      setStatusText("Mission Accomplished! Deliverables Ready.");
      if (event.result) {
        setResult(event.result);
        setActiveTab("results");
      }
    }
  };

  const pollAgentStatus = (id: string) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${FASTAPI_BASE}/api/agent/status/${id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.status === "COMPLETED" && data.result) {
            setResult(data.result);
            setIsRunning(false);
            setStatusText("Mission Accomplished! Deliverables Ready.");
            clearInterval(interval);
          } else if (data.status === "FAILED") {
            setIsRunning(false);
            setStatusText(`Agent Failed: ${data.error || "Unknown error"}`);
            clearInterval(interval);
          }
        }
      } catch (e) {
        // Suppress poll errors
      }
    }, 1500);
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  return (
    <div className="min-h-screen bg-[#06060e] text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      <Navbar isLoggedIn={true} userName="Harshwardhan" tier="enterprise" />

      <main className="flex-1 max-w-7xl mx-auto px-6 pt-24 pb-16 w-full">
        {/* Header Badge & Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-white/[0.08] pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-3">
              <Bot className="w-3.5 h-3.5" />
              <span>Autonomous ReAct Agent • 6 Multi-Tool Registry</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
              Career Copilot Agent
              <Sparkles className="w-6 h-6 text-indigo-400 animate-pulse" />
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Give the agent a single high-level goal. It autonomously plans steps, queries live job boards,
              computes ATS matches, drafts personalized emails, and self-critiques outputs before final delivery.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.08] p-3 rounded-2xl">
            <div className={`w-3 h-3 rounded-full ${isRunning ? "bg-amber-400 animate-ping" : "bg-emerald-400"}`} />
            <div className="text-xs">
              <div className="font-semibold text-slate-200 uppercase tracking-wider text-[10px]">Agent Status</div>
              <div className="text-indigo-300 font-medium truncate max-w-[200px]">{statusText}</div>
            </div>
          </div>
        </div>

        {/* Goal Input & Controls */}
        <div className="bg-gradient-to-br from-white/[0.05] to-white/[0.02] border border-white/[0.08] rounded-2xl p-6 mb-8 shadow-xl shadow-indigo-950/20">
          <form onSubmit={handleLaunchAgent} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                User Goal / Instruction
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="e.g. Find me 3 high-paying Backend Engineer roles and prepare cold applications..."
                  className="w-full bg-[#0d0d1b] border border-white/[0.12] rounded-xl px-4 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors shadow-inner"
                  disabled={isRunning}
                />
                <button
                  type="submit"
                  disabled={isRunning || !goal.trim()}
                  className="absolute right-2 top-2 bottom-2 px-5 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-medium text-xs rounded-lg flex items-center gap-2 shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                >
                  {isRunning ? (
                    <>
                      <RotateCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Thinking...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Launch Agent</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Quick Goal Prompts */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[11px] font-medium text-slate-400">Quick Goals:</span>
              {PRESET_GOALS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setGoal(preset)}
                  disabled={isRunning}
                  className="text-[11px] bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] hover:border-indigo-500/40 text-slate-300 rounded-lg px-2.5 py-1 transition-colors cursor-pointer text-left truncate max-w-[280px]"
                >
                  {preset}
                </button>
              ))}
            </div>
          </form>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-white/[0.08] mb-6">
          <button
            onClick={() => setActiveTab("feed")}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === "feed"
                ? "border-indigo-500 text-white bg-indigo-500/10"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Live Thought Stream ({events.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("plan")}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === "plan"
                ? "border-indigo-500 text-white bg-indigo-500/10"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Execution Plan ({plan.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("results")}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === "results"
                ? "border-indigo-500 text-white bg-indigo-500/10"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Final Deliverables {result ? `(${result.total_applications})` : ""}</span>
          </button>
        </div>

        {/* Tab 1: Live Thought Stream */}
        {activeTab === "feed" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Terminal Feed (2 Cols) */}
            <div className="lg:col-span-2 bg-[#090915] border border-white/[0.08] rounded-2xl p-5 shadow-2xl flex flex-col h-[520px]">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 mb-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                  <Terminal className="w-4 h-4 text-indigo-400" />
                  <span>Agent ReAct Execution Log</span>
                </div>
                {isRunning && (
                  <span className="flex items-center gap-1.5 text-[11px] text-amber-400">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    Live Streaming
                  </span>
                )}
              </div>

              <div className="flex-1 overflow-y-auto space-y-3.5 pr-2 font-mono text-xs">
                {events.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center p-8 font-sans">
                    <Bot className="w-10 h-10 text-slate-600 mb-3 animate-bounce" />
                    <p className="text-sm font-medium text-slate-300">Agent Standing By</p>
                    <p className="text-xs text-slate-500 max-w-sm mt-1">
                      Click "Launch Agent" above to watch the agent plan, reason, invoke tools, and critique in real-time.
                    </p>
                  </div>
                ) : (
                  events.map((ev, index) => {
                    if (ev.event_type === "THOUGHT") {
                      return (
                        <div key={index} className="bg-indigo-950/25 border-l-2 border-indigo-400 p-3 rounded-r-lg">
                          <span className="text-indigo-400 font-bold block mb-1">
                            💭 THOUGHT [Step {ev.step || index + 1}]:
                          </span>
                          <span className="text-slate-200">{ev.thought || ev.message}</span>
                        </div>
                      );
                    }
                    if (ev.event_type === "TOOL_CALL") {
                      return (
                        <div key={index} className="bg-amber-950/20 border-l-2 border-amber-400 p-3 rounded-r-lg">
                          <span className="text-amber-400 font-bold block mb-1">
                            ⚡ TOOL INVOCATION: <code className="bg-black/30 px-1 py-0.5 rounded">{ev.tool}</code>
                          </span>
                          <span className="text-slate-300 text-[11px]">
                            Arguments: {JSON.stringify(ev.args || {}, null, 1)}
                          </span>
                        </div>
                      );
                    }
                    if (ev.event_type === "OBSERVATION") {
                      return (
                        <div key={index} className="bg-emerald-950/20 border-l-2 border-emerald-400 p-3 rounded-r-lg">
                          <span className="text-emerald-400 font-bold block mb-1">
                            👁️ OBSERVATION [{ev.tool}]:
                          </span>
                          <span className="text-slate-300 text-[11px]">
                            {ev.result?.status === "success"
                              ? `Completed successfully. Extracted ${ev.result?.jobs_found || ev.result?.skills_count || "target"} data points.`
                              : JSON.stringify(ev.result || {})}
                          </span>
                        </div>
                      );
                    }
                    if (ev.event_type === "REFLECTION") {
                      return (
                        <div key={index} className="bg-purple-950/25 border-l-2 border-purple-400 p-3 rounded-r-lg">
                          <span className="text-purple-300 font-bold flex items-center justify-between mb-1">
                            <span>🔍 SELF-CRITIQUE (Quality Gate):</span>
                            <span className="bg-purple-500/20 px-2 py-0.5 rounded text-[10px]">
                              Score: {ev.quality_score}/100
                            </span>
                          </span>
                          <span className="text-slate-200">{ev.reflection}</span>
                        </div>
                      );
                    }
                    if (ev.event_type === "PLAN") {
                      return (
                        <div key={index} className="bg-sky-950/20 border-l-2 border-sky-400 p-3 rounded-r-lg">
                          <span className="text-sky-400 font-bold block mb-1">📋 DECOMPOSED PLAN:</span>
                          <span className="text-slate-200">{ev.message}</span>
                        </div>
                      );
                    }
                    if (ev.event_type === "COMPLETED") {
                      return (
                        <div key={index} className="bg-emerald-900/30 border border-emerald-500/30 p-3.5 rounded-lg text-emerald-200 font-sans">
                          <div className="flex items-center gap-2 font-bold mb-1">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span>Mission Accomplished</span>
                          </div>
                          <p className="text-xs text-emerald-300/90">{ev.message}</p>
                        </div>
                      );
                    }
                    return null;
                  })
                )}
                <div ref={feedEndRef} />
              </div>
            </div>

            {/* Right Side: Tools Registry & Metrics (1 Col) */}
            <div className="space-y-6">
              {/* Tool Registry Card */}
              <div className="bg-[#090915] border border-white/[0.08] rounded-2xl p-5 shadow-xl">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
                  <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Agent Autonomous Toolset</span>
                </h3>
                <div className="space-y-2.5">
                  {[
                    { name: "parse_resume", desc: "Extract candidate skills & projects" },
                    { name: "search_jobs", desc: "Query live multi-board job feeds" },
                    { name: "score_match", desc: "Calculate ATS compatibility & gaps" },
                    { name: "generate_email", desc: "Draft targeted cold outreach" },
                    { name: "critique_output", desc: "Self-reflection quality gate" },
                    { name: "save_result", desc: "Autonomous artifact persistence" }
                  ].map((t, idx) => (
                    <div key={idx} className="bg-white/[0.02] border border-white/[0.04] p-2.5 rounded-xl flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-md bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 text-[10px] font-bold mt-0.5">
                        {idx + 1}
                      </div>
                      <div>
                        <div className="font-mono text-[11px] font-semibold text-slate-200">{t.name}</div>
                        <div className="text-[10px] text-slate-400">{t.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Execution Summary Card */}
              {result && (
                <div className="bg-gradient-to-br from-indigo-950/30 to-violet-950/20 border border-indigo-500/20 rounded-2xl p-5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-300 mb-2 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-indigo-400" />
                    <span>Run Verification</span>
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-center my-3">
                    <div className="bg-black/20 p-2.5 rounded-xl border border-white/[0.04]">
                      <div className="text-lg font-bold text-white">{result.execution_metrics?.duration_seconds}s</div>
                      <div className="text-[10px] text-slate-400">Total Duration</div>
                    </div>
                    <div className="bg-black/20 p-2.5 rounded-xl border border-white/[0.04]">
                      <div className="text-lg font-bold text-emerald-400">{result.total_applications}</div>
                      <div className="text-[10px] text-slate-400">Pitches Created</div>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab("results")}
                    className="w-full py-2 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>View Output Artifacts</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Execution Plan */}
        {activeTab === "plan" && (
          <div className="bg-[#090915] border border-white/[0.08] rounded-2xl p-6 shadow-xl max-w-3xl mx-auto">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 mb-4 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-400" />
              <span>Hierarchical ReAct Execution Plan</span>
            </h3>
            {plan.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                No active plan yet. Launch the agent to view autonomous step decomposition.
              </div>
            ) : (
              <div className="space-y-3">
                {plan.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center gap-3.5 text-xs text-slate-200"
                  >
                    <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-[11px] shrink-0">
                      {idx + 1}
                    </div>
                    <span className="flex-1">{step}</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Final Deliverables */}
        {activeTab === "results" && (
          <div>
            {!result ? (
              <div className="bg-[#090915] border border-white/[0.08] rounded-2xl p-12 text-center text-slate-500 text-xs">
                Deliverables will appear here once the agent finishes its autonomous run.
              </div>
            ) : (
              <div className="space-y-6">
                {/* Summary Banner */}
                <div className="bg-indigo-950/20 border border-indigo-500/30 p-5 rounded-2xl">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-300 mb-1 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <span>Mission Synthesis</span>
                  </h3>
                  <p className="text-sm text-slate-200 mt-1">{result.summary}</p>
                </div>

                {/* Job Cards & Tailored Emails */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {result.applications.map((app, idx) => (
                    <div
                      key={idx}
                      className="bg-[#090915] border border-white/[0.08] rounded-2xl p-5 shadow-xl flex flex-col justify-between"
                    >
                      <div>
                        {/* Job Info */}
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div>
                            <h4 className="text-base font-bold text-white">{app.job_title}</h4>
                            <p className="text-xs text-slate-400 font-medium">
                              {app.company_name} • {app.location}
                            </p>
                          </div>
                          <div className="bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 rounded-xl text-right">
                            <span className="text-xs font-extrabold text-emerald-400">{app.match_score}%</span>
                            <span className="block text-[9px] text-slate-400 uppercase">ATS Fit</span>
                          </div>
                        </div>

                        {/* Cold Email Box */}
                        {app.cold_email && (
                          <div className="mt-4 bg-white/[0.02] border border-white/[0.06] p-4 rounded-xl">
                            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
                              <span className="flex items-center gap-1.5 text-indigo-300">
                                <Mail className="w-3.5 h-3.5" />
                                <span>Tailored Cold Email</span>
                              </span>
                              <button
                                onClick={() => copyToClipboard(app.cold_email!.body, idx)}
                                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition-colors cursor-pointer"
                              >
                                {copiedIndex === idx ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                                    <span className="text-emerald-400 font-semibold">Copied!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5" />
                                    <span>Copy Draft</span>
                                  </>
                                )}
                              </button>
                            </div>
                            <div className="text-[11px] text-slate-300 font-medium mb-1">
                              <strong>Subject:</strong> {app.cold_email.subject}
                            </div>
                            <div className="text-[11px] text-slate-400 whitespace-pre-wrap font-sans mt-2 bg-black/30 p-3 rounded-lg border border-white/[0.03]">
                              {app.cold_email.body}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Footer Apply Link */}
                      <div className="mt-5 pt-3 border-t border-white/[0.06] flex items-center justify-between">
                        <span className="text-[11px] text-slate-400">Quality Gate: Verified</span>
                        {app.apply_link && (
                          <a
                            href={app.apply_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                          >
                            <span>Open Job Link</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
