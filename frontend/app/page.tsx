"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { siteImages } from "@/lib/siteImages";

const features = [
  {
    title: "Resume Analysis",
    description:
      "Turn every resume into a sharper version of itself with ATS scoring, skill coverage, and targeted improvement suggestions.",
    image: siteImages.landing.resumeFeature,
  },
  {
    title: "AI Job Matching",
    description:
      "See which opportunities fit your profile before you apply, with cleaner comparisons between your strengths and job needs.",
    image: siteImages.landing.matchingFeature,
  },
  {
    title: "Application Automation",
    description:
      "Move faster with guided workflows that help you organize, track, and automate repetitive application work.",
    image: siteImages.landing.automationFeature,
  },
];

const trustPoints = [
  "Profile-driven career workspace",
  "Clear ATS and resume feedback",
  "Smarter matching before you apply",
];

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#f7fbff] text-slate-900">
        <section className="relative overflow-hidden pt-24">
          <div className="absolute inset-0">
            <Image
              src={siteImages.landing.heroBackground}
              alt=""
              fill
              priority
              quality={95}
              className="object-cover"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(247,251,255,0.45)_0%,rgba(247,251,255,0.72)_48%,rgba(247,251,255,0.96)_100%)]" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-6 py-16 md:py-24">
            <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600 shadow-sm backdrop-blur-md">
                  AI-powered career platform
                </div>
                <h1 className="mt-7 text-5xl font-semibold leading-[1.02] text-slate-950 md:text-7xl">
                  Career momentum,
                  <span className="block bg-gradient-to-r from-sky-500 via-indigo-500 to-violet-500 bg-clip-text text-transparent">
                    designed like a real product.
                  </span>
                </h1>
                <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600 md:text-xl">
                  Cypherdon helps you refine your profile, improve your resume,
                  match to better roles, and manage applications in one clean
                  AI workspace.
                </p>
                <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                  <Link href="/signup" className="no-underline">
                    <button className="rounded-2xl bg-slate-950 px-8 py-4 text-sm font-semibold text-white shadow-[0_18px_50px_rgba(15,23,42,0.18)] transition hover:-translate-y-0.5 hover:bg-slate-900 cursor-pointer border-none">
                      Start building your profile
                    </button>
                  </Link>
                  <Link href="/login" className="no-underline">
                    <button className="rounded-2xl border border-slate-200 bg-white/85 px-8 py-4 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur-md transition hover:border-slate-300 hover:bg-white cursor-pointer">
                      Sign in
                    </button>
                  </Link>
                </div>
                <div className="mt-10 grid gap-4 sm:grid-cols-3">
                  {[
                    { value: "92", label: "Resume score insights" },
                    { value: "3x", label: "Cleaner application workflow" },
                    { value: "1", label: "Unified career workspace" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-2xl border border-white/70 bg-white/72 px-5 py-4 shadow-sm backdrop-blur-md"
                    >
                      <div className="text-2xl font-semibold text-slate-950">
                        {item.value}
                      </div>
                      <div className="mt-1 text-sm text-slate-600">{item.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 rounded-[2.5rem] bg-white/30 blur-3xl" />
                <div className="relative overflow-hidden rounded-[2.5rem] border border-white/70 bg-white/55 p-4 shadow-[0_30px_90px_rgba(148,163,184,0.26)] backdrop-blur-2xl">
                  <Image
                    src={siteImages.landing.heroVisual}
                    alt="Cypherdon product visual"
                    width={1600}
                    height={1200}
                    className="h-auto w-full rounded-[2rem]"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 py-24">
          <div className="max-w-2xl">
            <div className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">
              Core workflow
            </div>
            <h2 className="mt-3 text-4xl font-semibold text-slate-950 md:text-5xl">
              Three polished systems working together.
            </h2>
            <p className="mt-4 text-lg text-slate-600 leading-8">
              Each step is visual, understandable, and designed to feel more
              like a finished product than a rough AI demo.
            </p>
          </div>

          <div className="mt-14 grid gap-8">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="grid items-center gap-8 rounded-[2rem] border border-slate-200/80 bg-white/80 p-6 shadow-[0_18px_60px_rgba(148,163,184,0.16)] backdrop-blur-xl lg:grid-cols-2 lg:p-8"
              >
                <div className={index % 2 === 1 ? "lg:order-2" : ""}>
                  <div className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                    0{index + 1}
                  </div>
                  <h3 className="mt-3 text-3xl font-semibold text-slate-950">
                    {feature.title}
                  </h3>
                  <p className="mt-4 text-base leading-8 text-slate-600">
                    {feature.description}
                  </p>
                </div>
                <div className={index % 2 === 1 ? "lg:order-1" : ""}>
                  <div className="overflow-hidden rounded-[1.75rem] border border-slate-100 bg-[#f8fbff] p-3 shadow-inner shadow-sky-100/40">
                    <Image
                      src={feature.image}
                      alt={feature.title}
                      width={1600}
                      height={1200}
                      className="h-auto w-full rounded-[1.4rem]"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-[2.2rem] border border-slate-200/80 bg-white/80 p-8 shadow-[0_18px_60px_rgba(148,163,184,0.16)] backdrop-blur-xl">
              <div className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">
                Trust the workflow
              </div>
              <h3 className="mt-3 text-3xl font-semibold text-slate-950">
                A calmer product story from first visit to first application.
              </h3>
              <p className="mt-4 text-base leading-8 text-slate-600">
                Your new visuals already create the right feeling: cleaner,
                lighter, and more like a real brand. This section helps support
                that with trust-focused product framing.
              </p>
              <div className="mt-8 space-y-4">
                {trustPoints.map((point) => (
                  <div
                    key={point}
                    className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-100 text-sky-600">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-slate-700">{point}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-8">
              <div className="overflow-hidden rounded-[2.2rem] border border-slate-200/80 bg-white/80 p-4 shadow-[0_18px_60px_rgba(148,163,184,0.16)] backdrop-blur-xl">
                <Image
                  src={siteImages.marketing.trust}
                  alt="Trust visual"
                  width={1600}
                  height={1200}
                  className="h-auto w-full rounded-[1.7rem]"
                />
              </div>
              <div className="overflow-hidden rounded-[2.2rem] border border-slate-200/80 bg-white/80 p-4 shadow-[0_18px_60px_rgba(148,163,184,0.16)] backdrop-blur-xl">
                <Image
                  src={siteImages.marketing.pricing}
                  alt="Pricing and contact visual"
                  width={1600}
                  height={1200}
                  className="h-auto w-full rounded-[1.7rem]"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 py-24">
          <div className="relative overflow-hidden rounded-[2.5rem] border border-slate-200/80 bg-white shadow-[0_24px_90px_rgba(148,163,184,0.2)]">
            <div className="absolute inset-0">
              <Image
                src={siteImages.marketing.cta}
                alt=""
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(247,251,255,0.78))]" />
            </div>

            <div className="relative z-10 grid items-center gap-8 px-8 py-12 md:px-12 lg:grid-cols-[0.95fr_1.05fr] lg:py-16">
              <div>
                <div className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Final step
                </div>
                <h3 className="mt-3 text-4xl font-semibold text-slate-950">
                  Ready to turn the visuals into a complete product experience?
                </h3>
                <p className="mt-4 max-w-xl text-base leading-8 text-slate-600">
                  Your image system is now strong enough to carry the brand. The
                  next move is polishing the main app pages around the same
                  visual language.
                </p>
              </div>
              <div className="flex flex-col gap-4 sm:flex-row sm:justify-end">
                <Link href="/signup" className="no-underline">
                  <button className="w-full rounded-2xl bg-slate-950 px-8 py-4 text-sm font-semibold text-white shadow-[0_18px_50px_rgba(15,23,42,0.18)] transition hover:-translate-y-0.5 hover:bg-slate-900 cursor-pointer border-none sm:w-auto">
                    Create account
                  </button>
                </Link>
                <Link href="/login" className="no-underline">
                  <button className="w-full rounded-2xl border border-slate-200 bg-white/85 px-8 py-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-white cursor-pointer sm:w-auto">
                    Open workspace
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <footer className="border-t border-slate-200/80 bg-white/70 py-8 text-center backdrop-blur-md">
          <p className="text-sm text-slate-500">
            Copyright 2026 Cypherdon. Career tooling with a clearer visual
            identity.
          </p>
        </footer>
      </main>
    </>
  );
}
