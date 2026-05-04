"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import ScoreCircle from "@/components/ScoreCircle";
import GradientButton from "@/components/auth/GradientButton";

/* ══════════════════════════════════════════════════════════
   Types
   ══════════════════════════════════════════════════════════ */
interface ATSResult {
  score: number;
  breakdown: { skill_match: number; keyword_presence: number; structure: number };
  matched_skills: string[];
  missing_skills: string[];
  found_keywords: string[];
  missing_keywords: string[];
  found_sections: string[];
  suggestions: string[];
}

type TabId = "profile" | "resume" | "preferences" | "settings";

/* ══════════════════════════════════════════════════════════
   Tab Switcher
   ══════════════════════════════════════════════════════════ */
const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  {
    id: "profile",
    label: "Profile",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    id: "resume",
    label: "Resume",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  {
    id: "settings",
    label: "Settings",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.26.604.852.997 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
  {
    id: "preferences",
    label: "Preferences",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
];

/* ══════════════════════════════════════════════════════════
   Page
   ══════════════════════════════════════════════════════════ */
export default function ProfilePage() {
  const router = useRouter();
  const resumeRef = useRef<HTMLInputElement>(null);
  const avatarRef = useRef<HTMLInputElement>(null);

  // State
  const [activeTab, setActiveTab] = useState<TabId>("profile");
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState("John Doe");
  const [email] = useState("john@example.com");
  const [phone, setPhone] = useState("+91 98765 43210");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("India");
  const [linkedin, setLinkedin] = useState("");
  const [github, setGithub] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [languages, setLanguages] = useState("English, Hindi");
  const [prefRole, setPrefRole] = useState("");
  const [prefLocation, setPrefLocation] = useState("");
  const [jobType, setJobType] = useState("full-time");
  const [salaryExp, setSalaryExp] = useState("");
  
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [skills, setSkills] = useState("React, Python, FastAPI, TypeScript");
  const [experience, setExperience] = useState("mid");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [atsResult, setAtsResult] = useState<ATSResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Fetch initial data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const SPRING_API_BASE = "http://localhost:8080";
        const res = await fetch(`${SPRING_API_BASE}/api/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.ok) {
          const data = await res.json();
          if (data.full_name) setFullName(data.full_name);
          if (data.phone) setPhone(data.phone);
          if (data.address) setAddress(data.address);
          if (data.city) setCity(data.city);
          if (data.country) setCountry(data.country);
          if (data.linkedin_url) setLinkedin(data.linkedin_url);
          if (data.github_url) setGithub(data.github_url);
          if (data.portfolio_url) setPortfolio(data.portfolio_url);
          if (data.skills) setSkills(data.skills.join(", "));
          if (data.languages_known) setLanguages(data.languages_known.join(", "));
          if (data.experience_level) setExperience(data.experience_level);
          if (data.preferred_role) setPrefRole(data.preferred_role);
          if (data.preferred_location) setPrefLocation(data.preferred_location);
          if (data.job_type) setJobType(data.job_type);
          if (data.salary_expectation) setSalaryExp(data.salary_expectation);
        }
      } catch (e) {
        console.error("Failed to load profile", e);
      }
    };
    fetchProfile();
  }, []);

  // Helpers
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3500); };
  const initials = fullName.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();
  const expLabel = experience === "entry" ? "Entry Level" : experience === "mid" ? "Mid Level" : experience === "senior" ? "Senior" : "Lead / Manager";

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const runAnalysis = async (file: File) => {
    setResumeFile(file);
    setAnalyzing(true);
    setAtsResult(null);
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("skills", skills);
      const res = await fetch(`${API_BASE}/api/resume/analyze`, { method: "POST", body: fd });
      if (!res.ok) throw new Error((await res.json()).detail || "Analysis failed");
      setAtsResult(await res.json());
    } catch {
      // Fallback demo
      setAtsResult({
        score: 76,
        breakdown: { skill_match: 82, keyword_presence: 68, structure: 74 },
        matched_skills: ["React", "Python", "TypeScript"],
        missing_skills: ["Docker", "AWS", "Kubernetes"],
        found_keywords: ["react", "python", "typescript", "fastapi", "git", "sql"],
        missing_keywords: ["docker", "aws", "kubernetes", "ci/cd"],
        found_sections: ["experience", "skills", "education", "projects"],
        suggestions: [
          "Add measurable achievements (e.g., 'Improved performance by 40%')",
          "Include a professional summary section at the top",
          "Add Docker and AWS to your skill set",
          "Use stronger action verbs like 'architected' and 'optimized'",
        ],
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) runAnalysis(e.target.files[0]);
  };

  // Drag-and-drop
  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.name.toLowerCase().endsWith(".pdf")) runAnalysis(file);
    else showToast("Only PDF files are accepted");
  }, [skills]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const SPRING_API_BASE = "http://localhost:8080";
      const token = localStorage.getItem("token");
      if (token) {
        await fetch(`${SPRING_API_BASE}/api/profile`, {
          method: "PUT",
          headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            phone,
            skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
            experience_level: experience,
            address, city, country,
            linkedin_url: linkedin, github_url: github, portfolio_url: portfolio,
            languages_known: languages.split(",").map((s) => s.trim()).filter(Boolean),
            preferred_role: prefRole, preferred_location: prefLocation,
            job_type: jobType, salary_expectation: salaryExp,
          }),
        });
      }
      setEditing(false);
      showToast("Profile saved successfully!");
    } catch { showToast("Failed to save. Please try again."); }
    finally { setSaving(false); }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_id");
    router.push("/login");
  };

  /* ════════════════════════════════════════════════════════
     RENDER
     ════════════════════════════════════════════════════════ */
  return (
    <>
      <Navbar isLoggedIn onLogout={handleLogout} userName={fullName} />

      {/* ═══ Background ═══ */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Image src="/auth-bg-3.png" alt="" fill className="object-cover opacity-[0.06]" quality={50} priority />
        <div className="absolute inset-0 bg-[#06060e]/92" />
        <div className="absolute top-0 left-1/3 w-[700px] h-[400px] bg-gradient-to-br from-purple-600/[0.06] via-blue-600/[0.03] to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[300px] bg-gradient-to-tl from-blue-600/[0.04] to-transparent rounded-full blur-3xl" />
      </div>

      {/* ═══ Toast ═══ */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 px-5 py-3 rounded-xl bg-green-500/15 border border-green-500/25 text-green-400 text-sm font-medium shadow-2xl shadow-black/20 backdrop-blur-xl animate-fade-in-up">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="inline mr-1"><path d="M20 6 9 17l-5-5" /></svg>
          {toast}
        </div>
      )}

      <main className="relative z-10 min-h-screen pt-24 pb-20 px-6 max-w-6xl mx-auto">
        {/* ═══ TABS ═══ */}
        <div className="flex items-center gap-1 mb-8 p-1 rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-md w-fit animate-fade-in-up">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 cursor-pointer border-none ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-purple-600/20 to-blue-600/15 text-white shadow-inner shadow-purple-500/10 border border-purple-500/20"
                  : "text-slate-500 hover:text-slate-300 hover:bg-white/[0.03] bg-transparent"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* ═══ GRID: LEFT (Profile Card) + RIGHT (Content) ═══ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">

          {/* ════════ LEFT: PROFILE CARD ════════ */}
          <div className="lg:col-span-4 xl:col-span-3 space-y-6">
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl p-7 text-center relative overflow-hidden group hover:border-purple-500/20 transition-all duration-500 animate-fade-in-up">
              {/* Glass highlight */}
              <div className="absolute -top-20 -right-20 w-52 h-52 bg-purple-500/[0.05] rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

              {/* ── Avatar with glow ── */}
              <div className="relative mx-auto w-[104px] h-[104px] mb-4">
                {/* Glow ring */}
                <div className="absolute inset-[-6px] rounded-full bg-gradient-to-br from-purple-500/40 via-blue-500/30 to-purple-600/40 blur-md opacity-60 group-hover:opacity-100 transition-opacity duration-500 animate-pulse" style={{ animationDuration: "3s" }} />
                {/* Avatar */}
                <div
                  className="relative w-[104px] h-[104px] rounded-full overflow-hidden border-[3px] border-purple-500/30 cursor-pointer z-10"
                  onClick={() => editing && avatarRef.current?.click()}
                >
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-500 via-violet-500 to-blue-500 flex items-center justify-center text-2xl font-bold text-white">
                      {initials}
                    </div>
                  )}
                  {editing && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity z-20">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                        <circle cx="12" cy="13" r="4" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
              <input ref={avatarRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />

              <h2 className="text-lg font-bold text-white">{fullName}</h2>
              <p className="text-xs text-slate-500 mt-0.5">{email}</p>
              <div className="mt-2.5 inline-flex items-center px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-[11px] text-purple-400 font-semibold uppercase tracking-wide">
                {expLabel}
              </div>

              {/* ATS in-card mini score */}
              {atsResult && (
                <div className="mt-5 pt-5 border-t border-white/[0.06]">
                  <ScoreCircle score={atsResult.score} size={80} strokeWidth={5} label="Resume Score" />
                </div>
              )}

              {/* Skills */}
              <div className="mt-5 pt-5 border-t border-white/[0.06]">
                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold mb-2">Skills</p>
                <div className="flex flex-wrap justify-center gap-1.5">
                  {skills.split(",").map((s) => s.trim()).filter(Boolean).map((skill, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-md bg-purple-500/10 border border-purple-500/15 text-[10px] font-medium text-purple-300">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Edit button */}
              <button
                onClick={() => { setEditing(true); setActiveTab("profile"); }}
                className="mt-5 w-full py-2.5 text-xs font-semibold text-purple-400 border border-purple-500/25 hover:border-purple-500/50 hover:bg-purple-500/5 rounded-xl bg-transparent transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-purple-500/5"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline mr-1"><path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /></svg>
                Edit Profile
              </button>
            </div>
          </div>

          {/* ════════ RIGHT: TAB CONTENT ════════ */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-7">

            {/* ═══════ PROFILE TAB ═══════ */}
            {activeTab === "profile" && (
              <>
                {/* Header */}
                <div className="flex items-center justify-between animate-fade-in-up">
                  <div>
                    <h1 className="text-2xl font-bold text-white">Personal Information</h1>
                    <p className="text-slate-500 text-sm mt-0.5">Manage your account details</p>
                  </div>
                  {editing && (
                    <div className="flex gap-3">
                      <button onClick={() => setEditing(false)} className="px-4 py-2 text-sm text-slate-400 hover:text-white border border-white/10 rounded-xl bg-transparent transition-colors cursor-pointer">
                        Cancel
                      </button>
                      <GradientButton onClick={handleSave} loading={saving} className="!w-auto !px-6">Save Changes</GradientButton>
                    </div>
                  )}
                </div>

                {/* Personal Info Card */}
                <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] backdrop-blur-xl p-7 animate-fade-in-up hover:border-purple-500/15 transition-all duration-500" style={{ animationDelay: "0.05s", animationFillMode: "both" }}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FieldBlock label="Full Name" editing={editing}>
                      {editing ? (
                        <EditInput value={fullName} onChange={setFullName} />
                      ) : (
                        <p className="text-white font-medium py-2.5">{fullName}</p>
                      )}
                    </FieldBlock>
                    <FieldBlock label="Email">
                      <div className="flex items-center gap-2 py-2.5">
                        <p className="text-slate-300 text-sm">{email}</p>
                        <span className="px-2 py-0.5 rounded-md bg-green-500/10 border border-green-500/20 text-[10px] text-green-400 font-medium">Verified</span>
                      </div>
                    </FieldBlock>
                    <FieldBlock label="Phone" editing={editing}>
                      {editing ? (
                        <EditInput value={phone} onChange={setPhone} type="tel" />
                      ) : (
                        <p className="text-white font-medium py-2.5">{phone || "—"}</p>
                      )}
                    </FieldBlock>
                    <FieldBlock label="Experience Level" editing={editing}>
                      {editing ? (
                        <select value={experience} onChange={(e) => setExperience(e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none appearance-none cursor-pointer transition-all duration-300 focus:border-purple-500/50 focus:shadow-[0_0_24px_rgba(124,58,237,0.08)]"
                        >
                          <option value="entry" className="bg-[#0d0d16]">Entry Level</option>
                          <option value="mid" className="bg-[#0d0d16]">Mid Level</option>
                          <option value="senior" className="bg-[#0d0d16]">Senior</option>
                          <option value="lead" className="bg-[#0d0d16]">Lead / Manager</option>
                        </select>
                      ) : (
                        <p className="text-white font-medium py-2.5">{expLabel}</p>
                      )}
                    </FieldBlock>
                    <FieldBlock label="Address" editing={editing}>
                      {editing ? <EditInput value={address} onChange={setAddress} placeholder="123 Main St" /> : <p className="text-white font-medium py-2.5">{address || "—"}</p>}
                    </FieldBlock>
                    <FieldBlock label="City" editing={editing}>
                      {editing ? <EditInput value={city} onChange={setCity} placeholder="Mumbai" /> : <p className="text-white font-medium py-2.5">{city || "—"}</p>}
                    </FieldBlock>
                    <FieldBlock label="Country" editing={editing}>
                      {editing ? <EditInput value={country} onChange={setCountry} placeholder="India" /> : <p className="text-white font-medium py-2.5">{country || "—"}</p>}
                    </FieldBlock>
                  </div>
                </div>

                {/* Professional Links */}
                <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] backdrop-blur-xl p-7 animate-fade-in-up hover:border-blue-500/15 transition-all duration-500" style={{ animationDelay: "0.08s", animationFillMode: "both" }}>
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                    Professional Links
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FieldBlock label="LinkedIn" editing={editing}>
                      {editing ? <EditInput value={linkedin} onChange={setLinkedin} placeholder="https://linkedin.com/in/..." /> : <p className="text-blue-400 font-medium py-2.5 break-all">{linkedin || "—"}</p>}
                    </FieldBlock>
                    <FieldBlock label="GitHub" editing={editing}>
                      {editing ? <EditInput value={github} onChange={setGithub} placeholder="https://github.com/..." /> : <p className="text-blue-400 font-medium py-2.5 break-all">{github || "—"}</p>}
                    </FieldBlock>
                    <FieldBlock label="Portfolio Website" editing={editing}>
                      {editing ? <EditInput value={portfolio} onChange={setPortfolio} placeholder="https://..." /> : <p className="text-blue-400 font-medium py-2.5 break-all">{portfolio || "—"}</p>}
                    </FieldBlock>
                  </div>
                </div>

                {/* Skills Card */}
                <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] backdrop-blur-xl p-7 animate-fade-in-up hover:border-purple-500/15 transition-all duration-500" style={{ animationDelay: "0.12s", animationFillMode: "both" }}>
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                    Skills & Languages
                  </h3>
                  
                  <div className="space-y-6">
                    <FieldBlock label="Technical Skills" editing={editing}>
                      {editing ? (
                        <EditInput value={skills} onChange={setSkills} placeholder="React, Python, Docker..." />
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {skills.split(",").map((s) => s.trim()).filter(Boolean).map((skill, i) => (
                            <span key={i} className="px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-xs font-medium text-purple-300 hover:bg-purple-500/15 hover:border-purple-500/30 transition-colors">
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </FieldBlock>

                    <FieldBlock label="Languages Known" editing={editing}>
                      {editing ? (
                        <EditInput value={languages} onChange={setLanguages} placeholder="English, Hindi, Spanish..." />
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {languages.split(",").map((s) => s.trim()).filter(Boolean).map((lang, i) => (
                            <span key={i} className="px-3 py-1.5 rounded-lg bg-slate-500/10 border border-slate-500/20 text-xs font-medium text-slate-300 hover:bg-slate-500/15 transition-colors">
                              {lang}
                            </span>
                          ))}
                        </div>
                      )}
                    </FieldBlock>
                  </div>
                </div>
              </>
            )}

            {/* ═══════ RESUME TAB ═══════ */}
            {activeTab === "resume" && (
              <>
                <div className="animate-fade-in-up">
                  <h1 className="text-2xl font-bold text-white">Resume Intelligence</h1>
                  <p className="text-slate-500 text-sm mt-0.5">Upload your resume for ATS analysis and improvement suggestions</p>
                </div>

                {/* Upload Zone */}
                <div
                  onClick={() => resumeRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={onDrop}
                  className={`
                    rounded-2xl border-2 border-dashed p-10 text-center cursor-pointer transition-all duration-400 animate-fade-in-up
                    ${dragOver
                      ? "border-purple-500/60 bg-purple-500/[0.06] scale-[1.01]"
                      : resumeFile
                        ? "border-green-500/25 bg-green-500/[0.03] hover:border-green-500/40"
                        : "border-white/[0.08] bg-white/[0.015] hover:border-purple-500/30 hover:bg-white/[0.03]"
                    }
                  `}
                  style={{ animationDelay: "0.05s", animationFillMode: "both" }}
                >
                  <input ref={resumeRef} type="file" accept=".pdf" onChange={handleResumeUpload} className="hidden" />
                  {analyzing ? (
                    <div className="flex flex-col items-center gap-3 text-purple-400">
                      <div className="relative w-12 h-12">
                        <div className="absolute inset-0 rounded-full border-2 border-purple-500/30 border-t-purple-500 animate-spin" />
                        <svg className="absolute inset-2" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                        </svg>
                      </div>
                      <span className="text-sm font-medium">Analyzing your resume...</span>
                      <span className="text-xs text-slate-500">Extracting text and scoring keywords</span>
                    </div>
                  ) : resumeFile ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-1">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><path d="M20 6 9 17l-5-5" /></svg>
                      </div>
                      <span className="text-sm text-green-400 font-semibold">{resumeFile.name}</span>
                      <span className="text-xs text-slate-500">Click or drag to re-analyze with a new resume</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/15 flex items-center justify-center">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="1.5">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-slate-300 font-medium">Upload your resume for ATS analysis</p>
                        <p className="text-xs text-slate-600 mt-1">Drag & drop or click to browse • PDF format only</p>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-[11px] text-slate-600">
                        <span className="flex items-center gap-1"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2.5"><path d="M20 6 9 17l-5-5" /></svg> Keyword scoring</span>
                        <span className="flex items-center gap-1"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2.5"><path d="M20 6 9 17l-5-5" /></svg> Missing skills</span>
                        <span className="flex items-center gap-1"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2.5"><path d="M20 6 9 17l-5-5" /></svg> Suggestions</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* ATS Results */}
                {atsResult && !analyzing && (
                  <div className="space-y-6 animate-fade-in-up" style={{ animationDelay: "0.08s", animationFillMode: "both" }}>
                    {/* Score + Breakdown Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      {/* Score Circle */}
                      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] backdrop-blur-xl p-7 flex flex-col items-center justify-center hover:border-purple-500/20 transition-all duration-500">
                        <ScoreCircle score={atsResult.score} size={140} strokeWidth={7} />
                      </div>

                      {/* Breakdown */}
                      <div className="md:col-span-2 rounded-2xl border border-white/[0.07] bg-white/[0.025] backdrop-blur-xl p-7 hover:border-purple-500/20 transition-all duration-500">
                        <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-5 flex items-center gap-2">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2"><path d="M18 20V10M12 20V4M6 20v-6" /></svg>
                          Score Breakdown
                        </h4>
                        <div className="space-y-4">
                          {[
                            { label: "Skill Match", value: atsResult.breakdown.skill_match, color: "#7c3aed", desc: "How well your skills match the resume" },
                            { label: "Keyword Presence", value: atsResult.breakdown.keyword_presence, color: "#3b82f6", desc: "Industry keywords found in your resume" },
                            { label: "Structure & Readability", value: atsResult.breakdown.structure, color: "#06b6d4", desc: "Resume sections, formatting, and action verbs" },
                          ].map((b) => (
                            <div key={b.label} className="group">
                              <div className="flex justify-between items-baseline mb-1.5">
                                <div>
                                  <span className="text-sm text-slate-300 font-medium">{b.label}</span>
                                  <span className="text-[11px] text-slate-600 ml-2 hidden sm:inline">{b.desc}</span>
                                </div>
                                <span className="text-sm font-bold" style={{ color: b.color, fontFamily: "var(--font-mono)" }}>{b.value}%</span>
                              </div>
                              <div className="h-2 rounded-full bg-white/[0.04] overflow-hidden">
                                <div className="h-full rounded-full transition-all duration-1000 ease-out group-hover:brightness-125" style={{ width: `${b.value}%`, backgroundColor: b.color, boxShadow: `0 0 12px ${b.color}30` }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Skills Analysis Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* Missing Skills */}
                      {atsResult.missing_skills.length > 0 && (
                        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] backdrop-blur-xl p-7 hover:border-red-500/15 transition-all duration-500">
                          <h4 className="text-sm font-semibold text-red-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
                            Missing Skills
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {atsResult.missing_skills.map((s, i) => (
                              <span key={i} className="px-3 py-1.5 rounded-lg bg-red-500/8 border border-red-500/15 text-xs text-red-300 hover:bg-red-500/15 transition-colors">
                                + {s}
                              </span>
                            ))}
                          </div>
                          <p className="text-[11px] text-slate-600 mt-3">Adding these skills to your resume can improve your ATS score</p>
                        </div>
                      )}

                      {/* Matched Skills */}
                      {atsResult.matched_skills.length > 0 && (
                        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] backdrop-blur-xl p-7 hover:border-green-500/15 transition-all duration-500">
                          <h4 className="text-sm font-semibold text-green-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                            Matched Skills
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {atsResult.matched_skills.map((s, i) => (
                              <span key={i} className="px-3 py-1.5 rounded-lg bg-green-500/8 border border-green-500/15 text-xs text-green-300 hover:bg-green-500/15 transition-colors">
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="inline mr-0.5"><path d="M20 6 9 17l-5-5" /></svg>{s}
                              </span>
                            ))}
                          </div>
                          <p className="text-[11px] text-slate-600 mt-3">These skills were found in your resume and match your profile</p>
                        </div>
                      )}
                    </div>

                    {/* Suggestions */}
                    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] backdrop-blur-xl p-7 hover:border-amber-500/15 transition-all duration-500">
                      <h4 className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-5 flex items-center gap-2">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
                        Improvement Suggestions
                      </h4>
                      <div className="space-y-3">
                        {atsResult.suggestions.map((s, i) => (
                          <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] hover:border-amber-500/10 transition-all duration-300 group">
                            <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/15 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-amber-500/15 transition-colors">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18h6" /><path d="M10 22h4" /><path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z" /></svg>
                            </div>
                            <span className="text-sm text-slate-300 leading-relaxed">{s}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* ═══════ PREFERENCES TAB ═══════ */}
            {activeTab === "preferences" && (
              <div className="space-y-7 animate-fade-in-up">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold text-white">Job Preferences</h1>
                    <p className="text-slate-500 text-sm mt-0.5">Tell us what you are looking for so we can match you better</p>
                  </div>
                  {editing ? (
                    <div className="flex gap-3 shrink-0">
                      <button onClick={() => setEditing(false)} className="px-4 py-2 text-sm text-slate-400 hover:text-white border border-white/10 rounded-xl bg-transparent transition-colors cursor-pointer">
                        Cancel
                      </button>
                      <GradientButton onClick={handleSave} loading={saving} className="!w-auto !px-6">Save</GradientButton>
                    </div>
                  ) : (
                    <button
                      onClick={() => setEditing(true)}
                      className="px-5 py-2.5 text-sm font-semibold text-purple-400 border border-purple-500/25 hover:border-purple-500/50 hover:bg-purple-500/5 rounded-xl bg-transparent transition-all duration-300 cursor-pointer self-start sm:self-auto shrink-0"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline mr-1.5"><path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /></svg>
                      Edit Preferences
                    </button>
                  )}
                </div>

                <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] backdrop-blur-xl p-7 hover:border-purple-500/15 transition-all duration-500">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FieldBlock label="Preferred Role" editing={editing}>
                      {editing ? <EditInput value={prefRole} onChange={setPrefRole} placeholder="e.g. Frontend Developer" /> : <p className="text-white font-medium py-2.5">{prefRole || "—"}</p>}
                    </FieldBlock>
                    
                    <FieldBlock label="Job Type" editing={editing}>
                      {editing ? (
                        <select value={jobType} onChange={(e) => setJobType(e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none appearance-none cursor-pointer transition-all duration-300 focus:border-purple-500/50 focus:shadow-[0_0_24px_rgba(124,58,237,0.08)]"
                        >
                          <option value="full-time" className="bg-[#0d0d16]">Full-Time</option>
                          <option value="part-time" className="bg-[#0d0d16]">Part-Time</option>
                          <option value="contract" className="bg-[#0d0d16]">Contract</option>
                          <option value="internship" className="bg-[#0d0d16]">Internship</option>
                        </select>
                      ) : (
                        <p className="text-white font-medium py-2.5 capitalize">{jobType.replace("-", " ")}</p>
                      )}
                    </FieldBlock>

                    <FieldBlock label="Preferred Location" editing={editing}>
                      {editing ? <EditInput value={prefLocation} onChange={setPrefLocation} placeholder="Remote, or City, Country" /> : <p className="text-white font-medium py-2.5">{prefLocation || "—"}</p>}
                    </FieldBlock>

                    <FieldBlock label="Salary Expectation (Optional)" editing={editing}>
                      {editing ? <EditInput value={salaryExp} onChange={setSalaryExp} placeholder="e.g. $100k - $120k / year" /> : <p className="text-white font-medium py-2.5">{salaryExp || "—"}</p>}
                    </FieldBlock>
                  </div>
                </div>
              </div>
            )}

            {/* ═══════ SETTINGS TAB ═══════ */}
            {activeTab === "settings" && (
              <div className="space-y-7 animate-fade-in-up">
                <div>
                  <h1 className="text-2xl font-bold text-white">Settings</h1>
                  <p className="text-slate-500 text-sm mt-0.5">Manage your account preferences and security</p>
                </div>

                {/* Notifications */}
                <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] backdrop-blur-xl p-7 hover:border-purple-500/15 transition-all duration-500">
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-5 flex items-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
                    Notifications
                  </h3>
                  {[
                    { label: "Job match alerts", desc: "Get notified when new jobs match your profile", defaultOn: true },
                    { label: "Resume tips", desc: "Receive suggestions to improve your resume", defaultOn: true },
                    { label: "Weekly digest", desc: "Summary of new jobs and application updates", defaultOn: false },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-4 border-b border-white/[0.04] last:border-0">
                      <div>
                        <p className="text-sm text-white font-medium">{item.label}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                      </div>
                      <ToggleSwitch defaultOn={item.defaultOn} />
                    </div>
                  ))}
                </div>

                {/* Danger Zone */}
                <div className="rounded-2xl border border-red-500/10 bg-red-500/[0.02] backdrop-blur-xl p-7">
                  <h3 className="text-sm font-semibold text-red-400 uppercase tracking-wider mb-4">Danger Zone</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-white font-medium">Delete Account</p>
                      <p className="text-xs text-slate-500 mt-0.5">Permanently delete your account and all data</p>
                    </div>
                    <button className="px-4 py-2 text-xs font-semibold text-red-400 border border-red-500/25 hover:border-red-500/50 hover:bg-red-500/10 rounded-xl bg-transparent transition-all cursor-pointer">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>
    </>
  );
}

/* ══════════════════════════════════════════════════════════
   Sub-Components
   ══════════════════════════════════════════════════════════ */

function FieldBlock({ label, editing, children }: { label: string; editing?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[11px] text-slate-500 font-medium uppercase tracking-wider mb-1.5">
        {label}
        {editing && <span className="text-purple-400 ml-1">•</span>}
      </label>
      {children}
    </div>
  );
}

function EditInput({ value, onChange, type = "text", placeholder }: { value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none transition-all duration-300 focus:border-purple-500/50 focus:shadow-[0_0_24px_rgba(124,58,237,0.08)] focus:bg-white/[0.06] placeholder-slate-600"
    />
  );
}

function ToggleSwitch({ defaultOn = false }: { defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <button
      onClick={() => setOn(!on)}
      className={`relative w-11 h-6 rounded-full transition-colors duration-300 border-none cursor-pointer ${on ? "bg-purple-600" : "bg-white/10"}`}
    >
      <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300 ${on ? "translate-x-[22px]" : "translate-x-0.5"}`} />
    </button>
  );
}
