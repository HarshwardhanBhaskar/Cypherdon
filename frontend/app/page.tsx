"use client";

import React from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

/**
 * Landing page — Premium hero with animated gradient orbs and feature cards.
 */
export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          {/* Animated gradient orbs */}
          <div
            className="absolute top-[-200px] left-[-100px] w-[500px] h-[500px] rounded-full opacity-20 animate-float"
            style={{
              background: "radial-gradient(circle, var(--color-primary) 0%, transparent 70%)",
              filter: "blur(80px)",
            }}
          />
          <div
            className="absolute bottom-[-150px] right-[-50px] w-[400px] h-[400px] rounded-full opacity-15"
            style={{
              background: "radial-gradient(circle, var(--color-accent) 0%, transparent 70%)",
              filter: "blur(80px)",
              animationDelay: "1.5s",
            }}
          />

          <div className="max-w-5xl mx-auto px-6 py-32 text-center relative z-10">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-surface-2)] border border-[var(--color-border)] mb-8 animate-fade-in-up">
              <span className="w-2 h-2 rounded-full bg-[var(--color-success)] animate-pulse" />
              <span className="text-xs font-medium text-[var(--color-text-muted)]">
                AI-Powered Job Applications
              </span>
            </div>

            {/* Title */}
            <h1
              className="text-5xl md:text-7xl font-black leading-tight mb-6 animate-fade-in-up"
              style={{ animationDelay: "0.15s", animationFillMode: "both" }}
            >
              Your AI{" "}
              <span className="gradient-text">Job Application</span>
              <br />
              Assistant
            </h1>

            {/* Subtitle */}
            <p
              className="text-lg md:text-xl text-[var(--color-text-muted)] max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up"
              style={{ animationDelay: "0.3s", animationFillMode: "both" }}
            >
              Cypherdon scrapes official career pages, matches jobs to your
              skills, and auto-fills applications — with human-in-the-loop
              CAPTCHA handling.
            </p>

            {/* CTA */}
            <div
              className="flex items-center justify-center gap-4 animate-fade-in-up"
              style={{ animationDelay: "0.45s", animationFillMode: "both" }}
            >
              <Link href="/login">
                <button className="btn-primary text-base px-8 py-3.5 animate-pulse-glow">
                  Get Started Free →
                </button>
              </Link>
              <Link href="/dashboard">
                <button className="btn-secondary text-base px-8 py-3.5">
                  View Demo
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="max-w-6xl mx-auto px-6 pb-32">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: "🔍",
                title: "Smart Scraping",
                desc: "Fetches jobs from official company career pages — no LinkedIn or Naukri scraping.",
              },
              {
                icon: "🎯",
                title: "AI Matching",
                desc: "Compares your skills with job descriptions and shows a real-time match percentage.",
              },
              {
                icon: "🤖",
                title: "Apply Assist",
                desc: "Auto-fills your info on application forms. Pauses for CAPTCHAs so you stay in control.",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="glass glass-hover rounded-2xl p-8 animate-fade-in-up"
                style={{ animationDelay: `${0.6 + i * 0.15}s`, animationFillMode: "both" }}
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-[var(--color-border)] py-8 text-center">
          <p className="text-sm text-[var(--color-text-dim)]">
            © 2026 Cypherdon. Built with ❤️ and AI.
          </p>
        </footer>
      </main>
    </>
  );
}
