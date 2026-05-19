"use client";

import React from "react";
import Navbar from "@/components/Navbar";

export default function TermsPage() {
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
            Terms of Service
          </h1>
          <p className="text-sm text-slate-500">
            Last Updated: {currentDate}
          </p>
        </div>

        {/* Content body */}
        <div className="prose prose-invert max-w-none text-slate-400 space-y-8 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white font-heading">
              1. Acceptance of Terms
            </h2>
            <p className="text-sm">
              Welcome to Cypherdon. By accessing or using our website, services, AI engines, automation tools, or Telegram bots (collectively, the "Services"), you agree to be bound by these Terms of Service. If you do not agree to all of these terms, do not use our Services.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white font-heading">
              2. Description of Services
            </h2>
            <p className="text-sm">
              Cypherdon provides an AI-powered job application helper, scraper integrations, ATS matchmaking scoring, automated resume parsing, and related messaging bots designed to assist job seekers in finding and applying for job openings.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white font-heading">
              3. User Credentials & Accounts
            </h2>
            <p className="text-sm">
              To use most of our Services, you must maintain an active Supabase login account and may optionally connect your Telegram client to our automated assistant bot. You are solely responsible for protecting your credentials and keeping all stored details (resume documents, email drafts, credentials) confidential.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white font-heading">
              4. Service Execution & Human-in-the-Loop Verification
            </h2>
            <p className="text-sm">
              While Cypherdon automates parts of the job application pipeline, certain tasks (such as security checks, CAPTCHAs, and final employer form submission validation) must be reviewed and performed directly by you. Cypherdon is not responsible for applications failing to submit due to missing CAPTCHA compliance or server blockades.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white font-heading">
              5. Acceptable Use Policy
            </h2>
            <p className="text-sm">
              You agree not to use Cypherdon to submit fraudulent or deceptive applications, harvest mass job listings, spam applicant systems, or circumvent employer platform security boundaries. Any unauthorized script exploitation will result in immediate service termination.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white font-heading">
              6. Limitation of Liability
            </h2>
            <p className="text-sm">
              Cypherdon and its software engine are provided "as is" without warranty of any kind. We do not guarantee job placements, application success rates, interview responses, or uninterrupted backend uptime. Under no circumstances shall Cypherdon be liable for direct, indirect, or incidental damages.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white font-heading">
              7. Amendments to Terms
            </h2>
            <p className="text-sm">
              We reserve the right to modify these Terms of Service at any time. Your continued use of Cypherdon after updates are published constitutes full acceptance of the revised conditions.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
