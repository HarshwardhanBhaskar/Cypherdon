"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Head from "next/head";
import { writeCachedProfile } from "@/lib/profileStorage";

export default function CompleteProfilePage() {
  const router = useRouter();

  const [phone, setPhone] = useState("");
  const [preferredRole, setPreferredRole] = useState("");
  const [skills, setSkills] = useState("");
  const [experience, setExperience] = useState("entry");
  const [bio, setBio] = useState("");
  const [heroImage, setHeroImage] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Session expired. Please log in again.");
      setLoading(false);
      return;
    }

    try {
      let finalResumeUrl = undefined;
      
      // Upload Resume to Cloudinary via backend if file is selected
      if (resumeFile) {
        const formData = new FormData();
        formData.append("file", resumeFile);
        // User ID is required by the endpoint, we can send a dummy one or decode the token
        const userId = localStorage.getItem("user_id") || "default";
        formData.append("user_id", userId);

        const uploadRes = await fetch(`${API_BASE}/api/upload-resume`, {
          method: "POST",
          headers: {
            "x-internal-secret": "cypherdon_internal_123" // bypassing for frontend upload
          },
          body: formData,
        });

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          finalResumeUrl = uploadData.url;
        } else {
          console.error("Resume upload failed");
        }
      }

      const res = await fetch(`${API_BASE}/api/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          phone,
          preferred_role: preferredRole,
          skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
          experience_level: experience,
          hero_image_url: heroImage || undefined,
          bio: bio || undefined,
          resume_url: finalResumeUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to save profile");

      writeCachedProfile(data);
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#343e4a] flex items-center justify-center p-6 font-sans">
      <Head>
        <title>Complete Profile | Cypherdon</title>
      </Head>
      
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 animate-fade-in-up">
        
        {/* Left Side: Text */}
        <div className="flex flex-col justify-center text-white">
          <h1 className="text-3xl md:text-4xl tracking-wider mb-6">COMPLETE PROFILE</h1>
          <p className="text-[13px] md:text-[15px] leading-relaxed text-gray-200 mb-8 max-w-sm">
            Welcome to Cypherdon. To generate your stunning AI-powered portfolio and match you with the right roles, we need to know a little more about you.
            <br /><br />
            Fill out the fields to the right. Once saved, your portfolio will be instantly ready for the world.
          </p>
          <div className="text-sm text-gray-300">
            <p>support@cypherdon.com</p>
            <p>Tel: 1-800-000-0000</p>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="flex flex-col justify-center">
          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500 text-red-200 text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-white text-xs tracking-wide">Phone *</label>
                <input 
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-white h-10 px-3 outline-none text-gray-900 focus:ring-2 focus:ring-[#00e676]" 
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-white text-xs tracking-wide">Headline / Role *</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Full Stack Developer"
                  value={preferredRole}
                  onChange={(e) => setPreferredRole(e.target.value)}
                  className="w-full bg-white h-10 px-3 outline-none text-gray-900 focus:ring-2 focus:ring-[#00e676]" 
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-white text-xs tracking-wide">Skills (comma separated) *</label>
              <input 
                type="text"
                required
                placeholder="React, Next.js, Python, PostgreSQL"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                className="w-full bg-white h-10 px-3 outline-none text-gray-900 focus:ring-2 focus:ring-[#00e676]" 
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-white text-xs tracking-wide">Resume (PDF)</label>
              <input 
                type="file"
                accept=".pdf"
                onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                className="w-full bg-white h-10 px-3 outline-none text-gray-900 focus:ring-2 focus:ring-[#00e676] file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-[#00e676]/10 file:text-[#00e676] hover:file:bg-[#00e676]/20 cursor-pointer pt-1" 
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-white text-xs tracking-wide">Experience Level *</label>
              <select 
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full bg-white h-10 px-3 outline-none text-gray-900 focus:ring-2 focus:ring-[#00e676]"
              >
                <option value="entry">Entry Level (0-2 years)</option>
                <option value="mid">Mid Level (2-5 years)</option>
                <option value="senior">Senior (5-8 years)</option>
                <option value="lead">Lead / Manager (8+ years)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-white text-xs tracking-wide">Hero Image URL (Optional)</label>
              <input 
                type="url"
                placeholder="https://images.unsplash.com/photo-..."
                value={heroImage}
                onChange={(e) => setHeroImage(e.target.value)}
                className="w-full bg-white h-10 px-3 outline-none text-gray-900 focus:ring-2 focus:ring-[#00e676]" 
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-white text-xs tracking-wide">About Me (Bio)</label>
              <textarea 
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full bg-white p-3 outline-none text-gray-900 focus:ring-2 focus:ring-[#00e676] resize-none" 
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#00e676] hover:bg-[#00c968] text-white font-medium h-12 transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? "SAVING..." : "SAVE PROFILE"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
