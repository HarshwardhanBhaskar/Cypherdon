"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/auth/AuthLayout";
import AuthCard from "@/components/auth/AuthCard";
import InputField from "@/components/auth/InputField";
import GradientButton from "@/components/auth/GradientButton";

export default function CompleteProfilePage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [phone, setPhone] = useState("");
  const [skills, setSkills] = useState("");
  const [experience, setExperience] = useState("entry");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setResumeFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const userId = localStorage.getItem("user_id");

    if (!userId) {
      setError("Session expired. Please log in again.");
      setLoading(false);
      return;
    }

    try {
      // TODO: In production, upload resumeFile to Cloudinary first and get URL
      const resumeUrl = resumeFile ? `https://res.cloudinary.com/demo/raw/upload/${resumeFile.name}` : null;

      const res = await fetch(`${API_BASE}/api/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          user_id: userId,
          phone,
          skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
          experience_level: experience,
          resume_url: resumeUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to save profile");

      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout backgroundImage="/auth-bg-2.png">
      <AuthCard
        title="Complete your profile"
        subtitle="Help us match you with the right jobs"
      >
        {error && (
          <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400 animate-fade-in-up">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Phone */}
          <InputField
            id="profile-phone"
            label="Phone Number"
            type="tel"
            placeholder="+91 98765 43210"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            }
          />

          {/* Skills */}
          <InputField
            id="profile-skills"
            label="Skills (comma separated)"
            placeholder="React, Python, Machine Learning, FastAPI"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            }
          />

          {/* Experience Level */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-widest text-slate-400">
              Experience Level
            </label>
            <select
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition-all duration-300 focus:border-purple-500/60 focus:bg-white/[0.07] focus:shadow-[0_0_20px_rgba(124,58,237,0.15)] focus:ring-1 focus:ring-purple-500/30 appearance-none cursor-pointer"
            >
              <option value="entry" className="bg-[#12121a]">Entry Level (0-2 years)</option>
              <option value="mid" className="bg-[#12121a]">Mid Level (2-5 years)</option>
              <option value="senior" className="bg-[#12121a]">Senior (5-8 years)</option>
              <option value="lead" className="bg-[#12121a]">Lead / Manager (8+ years)</option>
            </select>
          </div>

          {/* Resume Upload */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-widest text-slate-400">
              Resume (PDF)
            </label>
            <div
              onClick={() => fileRef.current?.click()}
              className={`
                w-full rounded-xl border border-dashed px-4 py-5
                text-center cursor-pointer transition-all duration-300
                ${
                  resumeFile
                    ? "border-green-500/40 bg-green-500/5"
                    : "border-white/10 bg-white/[0.03] hover:border-purple-500/40 hover:bg-white/[0.05]"
                }
              `}
            >
              <input
                ref={fileRef}
                type="file"
                accept=".pdf"
                onChange={handleResumeChange}
                className="hidden"
              />
              {resumeFile ? (
                <div className="flex items-center justify-center gap-2">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  <span className="text-sm text-green-400 font-medium">
                    {resumeFile.name}
                  </span>
                </div>
              ) : (
                <div className="space-y-1">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1.5" className="mx-auto">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  <p className="text-sm text-slate-500">
                    Click to upload your resume
                  </p>
                  <p className="text-xs text-slate-600">PDF only</p>
                </div>
              )}
            </div>
          </div>

          <GradientButton type="submit" loading={loading}>
            Complete Setup →
          </GradientButton>
        </form>

        {/* Skip */}
        <button
          onClick={() => router.push("/dashboard")}
          className="w-full mt-3 py-2 text-sm text-slate-500 hover:text-slate-300 transition-colors bg-transparent border-none cursor-pointer"
        >
          Skip for now
        </button>
      </AuthCard>
    </AuthLayout>
  );
}
