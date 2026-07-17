"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Upload, Briefcase, Wallet, CheckCircle, AlertCircle, Loader2, Sparkles, 
  Clock, ArrowRight, UserCheck, RefreshCw, FileText
} from "lucide-react";
import Navbar from "@/components/Navbar";

interface VettingTask {
  id: string;
  fileName: string;
  status: "QUEUED" | "PROCESSING" | "COMPLETED" | "FAILED";
  resultPayload?: string;
  createdAt: string;
  updatedAt: string;
}

export default function RecruiterDashboard() {
  const [tasks, setTasks] = useState<VettingTask[]>([]);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [targetRole, setTargetRole] = useState("Software Engineer");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  const TENANT_ID = "d3b07384-d113-4956-a5db-257b4457e5e3"; // Default Tenant
  const SPRING_API_BASE = "http://localhost:8080";

  // 1. Fetch tasks and wallet balance on load
  const fetchDashboardData = async () => {
    try {
      // Fetch balance
      const balanceRes = await fetch(`${SPRING_API_BASE}/api/wallet/balance`, {
        headers: { "X-Tenant-ID": TENANT_ID }
      });
      if (balanceRes.ok) {
        const balanceData = await balanceRes.json();
        setWalletBalance(balanceData.balance);
      }

      // Fetch tasks
      const tasksRes = await fetch(`${SPRING_API_BASE}/api/vetting/tasks`, {
        headers: { "X-Tenant-ID": TENANT_ID }
      });
      if (tasksRes.ok) {
        const tasksData = await tasksRes.json();
        setTasks(tasksData.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      }
    } catch (err) {
      console.error("Error loading recruiter dashboard data:", err);
      setError("Could not connect to Spring Boot core backend.");
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // 2. Setup WebSocket connection for real-time task updates
    const ws = new WebSocket(`ws://localhost:8080/ws?tenantId=${TENANT_ID}`);

    ws.onopen = () => {
      console.log("Connected to Real-time Vetting Events WebSocket Channel");
    };

    ws.onmessage = (event) => {
      try {
        const update = JSON.parse(event.data);
        console.log("Real-time WebSocket Task Update:", update);

        setTasks((prevTasks) => {
          const index = prevTasks.findIndex((t) => t.id === update.taskId);
          if (index !== -1) {
            const updatedTasks = [...prevTasks];
            updatedTasks[index] = {
              ...updatedTasks[index],
              status: update.status,
              resultPayload: update.result ? JSON.stringify(update.result) : undefined,
              updatedAt: new Date().toISOString()
            };
            return updatedTasks;
          } else {
            // If it's a completely new task we didn't track yet
            return [
              {
                id: update.taskId,
                fileName: "Analyzing upload...",
                status: update.status,
                resultPayload: update.result ? JSON.stringify(update.result) : undefined,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              },
              ...prevTasks
            ];
          }
        });

        // Trigger balance refresh if task completed
        if (update.status === "COMPLETED" || update.status === "FAILED") {
          fetchDashboardData();
        }
      } catch (err) {
        console.error("Error parsing WebSocket event data:", err);
      }
    };

    ws.onerror = (err) => {
      console.error("WebSocket connection error:", err);
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed");
    };

    return () => {
      ws.close();
    };
  }, []);

  // 3. Handle File Upload
  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError("Please select a PDF resume to upload.");
      return;
    }
    setError(null);
    setSuccessMsg(null);
    setUploading(true);

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("target_role", targetRole);

    try {
      const response = await fetch(`${SPRING_API_BASE}/api/vetting/upload`, {
        method: "POST",
        headers: {
          "X-Tenant-ID": TENANT_ID
        },
        body: formData
      });

      if (response.ok) {
        const newTask = await response.json();
        setTasks((prev) => [newTask, ...prev]);
        setSuccessMsg("Resume submitted to async vetting pipeline successfully!");
        setSelectedFile(null);
        // Refresh balance since credit was deducted
        fetchDashboardData();
      } else if (response.status === 402 || response.status === 405 || response.status === 403) {
        setError("Insufficient Credits. Please top up your wallet.");
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.error || "File upload failed.");
      }
    } catch (err) {
      setError("Failed to reach core backend service.");
    } finally {
      setUploading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED": return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
      case "PROCESSING": return "text-blue-400 bg-blue-500/10 border-blue-500/30";
      case "QUEUED": return "text-amber-400 bg-amber-500/10 border-amber-500/30";
      case "FAILED": return "text-rose-400 bg-rose-500/10 border-rose-500/30";
      default: return "text-slate-400 bg-slate-500/10 border-slate-500/30";
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-purple-500 selection:text-white">
      {/* Background gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[40%] -left-[20%] w-[80%] h-[80%] rounded-full bg-purple-900/10 blur-[120px]" />
        <div className="absolute top-[20%] -right-[20%] w-[80%] h-[80%] rounded-full bg-blue-900/10 blur-[120px]" />
      </div>

      <Navbar />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        
        {/* Dashboard Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12 gap-6 bg-slate-900/40 backdrop-blur-md border border-slate-800 p-8 rounded-3xl">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" /> B2B Partner Portal
            </div>
            <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
              Recruiter Vetting Dashboard
            </h1>
            <p className="text-slate-400 mt-2 text-sm max-w-xl">
              Conduct high-throughput candidate screening with real-time AI evaluation, dynamic progress tracking, and transaction safety.
            </p>
          </div>

          {/* Balance card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-purple-500/20 p-6 rounded-2xl flex items-center justify-between min-w-[280px]">
            <div>
              <span className="text-xs text-slate-400 uppercase tracking-wider block">Wallet Balance</span>
              <span className="text-3xl font-extrabold text-white mt-1 block flex items-baseline gap-1">
                {walletBalance.toFixed(2)} <span className="text-xs font-medium text-slate-400">credits</span>
              </span>
            </div>
            <Link href="/dashboard/recruiter/wallet">
              <button className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-lg shadow-purple-500/20 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0">
                <Wallet className="w-4 h-4" /> Top Up
              </button>
            </Link>
          </div>
        </div>

        {/* Dashboard content split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Vetting Portal form */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <div className="bg-slate-900/30 backdrop-blur-lg border border-slate-800 p-6 rounded-2xl">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Upload className="w-5 h-5 text-purple-400" /> Start AI Candidate Vetting
              </h2>
              
              <form onSubmit={handleFileUpload} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Target Job Role</label>
                  <input
                    type="text"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 transition-colors text-slate-200"
                    placeholder="e.g. Senior Frontend Engineer"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Upload Resume PDF</label>
                  <div className="border-2 border-dashed border-slate-800 hover:border-purple-500/50 transition-colors rounded-xl p-6 text-center cursor-pointer relative bg-slate-950/50">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <div className="flex flex-col items-center justify-center gap-2">
                      <FileText className="w-8 h-8 text-slate-500" />
                      <span className="text-xs font-medium text-slate-300">
                        {selectedFile ? selectedFile.name : "Select candidate resume (PDF)"}
                      </span>
                      <span className="text-[10px] text-slate-500">Max size 5MB</span>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-rose-400 bg-rose-500/10 border border-rose-500/20 px-4 py-3 rounded-xl text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {successMsg && (
                  <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 rounded-xl text-xs">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    <span>{successMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={uploading}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold py-3 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/15"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
                    </>
                  ) : (
                    <>
                      Submit for Vetting <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-4 pt-4 border-t border-slate-800 text-[11px] text-slate-500 flex justify-between">
                <span>Evaluation Cost</span>
                <span className="font-semibold text-purple-400">1.00 credit / resume</span>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="bg-slate-900/20 border border-slate-800/60 p-6 rounded-2xl text-xs text-slate-400 space-y-3">
              <span className="font-bold text-slate-200 block uppercase tracking-wider">How Async Vetting Works:</span>
              <p>1. Submit a resume with a target role. 1 credit is securely deducted.</p>
              <p>2. The Spring worker registers a task and launches background AI parsing on FastAPI.</p>
              <p>3. Dynamic status updates ("PROCESSING" to "COMPLETED") are pushed live via WebSocket.</p>
            </div>
          </div>

          {/* Right Column - Active Vetting Tasks (2/3 width) */}
          <div className="lg:col-span-2">
            <div className="bg-slate-900/30 backdrop-blur-lg border border-slate-800 p-8 rounded-3xl h-full flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-indigo-400" /> Live Vetting Pipeline
                </h2>
                <button 
                  onClick={fetchDashboardData}
                  className="p-2 hover:bg-slate-800/50 rounded-xl transition-colors text-slate-400 hover:text-white"
                  title="Force Reload"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              {/* Tasks List */}
              <div className="flex-grow space-y-4 max-h-[580px] overflow-y-auto pr-2 custom-scrollbar">
                {tasks.length === 0 ? (
                  <div className="h-48 border border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center text-slate-500 text-sm gap-2">
                    <Clock className="w-8 h-8 opacity-50" />
                    <span>No vetting tasks submitted yet.</span>
                  </div>
                ) : (
                  tasks.map((task) => {
                    let score = null;
                    let missing = [];
                    if (task.resultPayload) {
                      try {
                        const payload = JSON.parse(task.resultPayload);
                        score = payload.score;
                        missing = payload.missing_skills || [];
                      } catch (e) {}
                    }

                    return (
                      <div 
                        key={task.id} 
                        className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-5 hover:border-slate-700/80 transition-all duration-300 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                      >
                        <div className="flex flex-col gap-1.5 max-w-sm sm:max-w-md">
                          <div className="flex items-center gap-2.5">
                            <span className="font-semibold text-slate-200 truncate">{task.fileName}</span>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getStatusColor(task.status)}`}>
                              {task.status}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500">
                            Task ID: {task.id}
                          </span>
                          <span className="text-xs text-slate-400">
                            Submitted: {new Date(task.createdAt).toLocaleString()}
                          </span>

                          {/* Skill list if completed */}
                          {score !== null && missing.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mr-1">Missing Skills:</span>
                              {missing.slice(0, 4).map((skill: string, i: number) => (
                                <span key={i} className="text-[9px] bg-purple-950/20 border border-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded-md font-medium">
                                  {skill}
                                </span>
                              ))}
                              {missing.length > 4 && (
                                <span className="text-[9px] text-slate-500 font-medium">+{missing.length - 4} more</span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Right stats / progress */}
                        <div className="flex items-center gap-4 shrink-0 sm:self-center">
                          {task.status === "PROCESSING" && (
                            <div className="flex items-center gap-2 text-blue-400 text-xs">
                              <Loader2 className="w-4 h-4 animate-spin" /> Processing AI analysis...
                            </div>
                          )}

                          {task.status === "QUEUED" && (
                            <div className="flex items-center gap-2 text-amber-400 text-xs">
                              <Clock className="w-4 h-4 animate-pulse" /> In Queue...
                            </div>
                          )}

                          {score !== null && (
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">ATS Score</span>
                                <span className="text-2xl font-extrabold text-white">{score}<span className="text-xs font-normal text-slate-500">/100</span></span>
                              </div>
                              <div className="w-12 h-12 rounded-full border-2 border-indigo-500/30 flex items-center justify-center bg-indigo-500/5 font-extrabold text-indigo-400 text-sm">
                                {score}%
                              </div>
                            </div>
                          )}

                          {task.status === "FAILED" && (
                            <div className="flex items-center gap-2 text-rose-400 text-xs">
                              <AlertCircle className="w-4 h-4" /> Vetting failed
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}
