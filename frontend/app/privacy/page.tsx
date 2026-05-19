"use client";

import React from "react";
import Navbar from "@/components/Navbar";

export default function PrivacyPage() {
  const currentDate = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="relative min-h-screen bg-[#07070d] text-white pt-24 pb-16 overflow-hidden">
      {/* Background glow highlights */}
      <div className="absolute top-0 left-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-indigo-600/5 blur-[120px]" />

      <Navbar isLoggedIn={true} userName="Explorer" />

      <div className="max-w-4xl mx-auto px-6">
        {/* Header section */}
        <div className="border-b border-white/[0.06] pb-10 mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight text-white mb-4 font-heading">
            Privacy Policy
          </h1>
          <p className="text-sm text-slate-500">
            Last Updated: {currentDate}
          </p>
        </div>

        {/* Content body */}
        <div className="prose prose-invert max-w-none text-slate-400 space-y-8 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white font-heading">
              1. Information We Collect
            </h2>
            <p className="text-sm">
              We collect information to provide better AI matching and automation services. This includes raw PDF resume uploads, profile information (skills, languages, preferred roles), application histories, and communication data when accessing our automation bots.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white font-heading">
              2. How We Use Your Information
            </h2>
            <p className="text-sm">
              Your profile data is strictly utilized to process ATS score matchmaking and automate applications through our API integrations. We do not sell your resumes or contact details to third-party databases.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white font-heading">
              3. Data Security & Storage
            </h2>
            <p className="text-sm">
              We leverage Supabase and Cloudinary databases to guarantee industry-standard encryption protocols. Your raw resume documents are safely hosted on encrypted instances, accessible only through authenticated, scoped user sessions.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white font-heading">
              4. Service Providers & Third-Parties
            </h2>
            <p className="text-sm">
              To process machine learning tasks (such as parsing and chat-bot assistance), your text prompts are fed to Google Gemini APIs securely. Google handles this data in strict compliance with developer terms.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white font-heading">
              5. Cookies & Site Analytics
            </h2>
            <p className="text-sm">
              We utilize browser cookies to securely save session persistence states. You can control cookie preferences directly through your browser, though disabling them may limit active dashboard features.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white font-heading">
              6. Your Rights
            </h2>
            <p className="text-sm">
              You maintain the absolute right to view, modify, or permanently delete your account data at any time directly through the dashboard interface or by contacting our admin panel.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
