"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();

  // Hide the global marketing footer on public portfolio pages
  if (pathname?.startsWith("/portfolio")) {
    return null;
  }

  return (
    <footer className="relative z-10 border-t border-slate-200/80 bg-white/85 py-16 text-slate-600 backdrop-blur-md">
      <div className="absolute bottom-0 left-1/2 -z-10 h-72 w-[600px] -translate-x-1/2 rounded-full bg-sky-200/20 blur-[120px]" />

      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4 md:gap-8">
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex w-fit items-center gap-3 no-underline">
              <div className="h-8 w-8 overflow-hidden rounded-xl shadow-md shadow-indigo-500/10">
                <Image
                  src="/logo-icon.png"
                  alt="Cypherdon"
                  width={32}
                  height={32}
                  className="h-full w-full object-cover"
                />
              </div>
              <span
                className="bg-gradient-to-r from-sky-500 via-indigo-500 to-violet-500 bg-clip-text text-lg font-bold tracking-tight text-transparent"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Cypherdon
              </span>
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-slate-500">
              Practical tools for a clearer, more organized job search.
            </p>
          </div>

          <div>
            <h4 className="mb-4 font-heading text-sm font-semibold uppercase tracking-wider text-slate-900">
              Product
            </h4>
            <ul className="m-0 list-none space-y-2.5 p-0">
              <li>
                <Link href="/dashboard" className="text-sm text-slate-600 transition-colors hover:text-indigo-600 no-underline">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-sm text-slate-600 transition-colors hover:text-indigo-600 no-underline">
                  Developer Blog
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-heading text-sm font-semibold uppercase tracking-wider text-slate-900">
              Company
            </h4>
            <ul className="m-0 list-none space-y-2.5 p-0">
              <li>
                <Link href="/about" className="text-sm text-slate-600 transition-colors hover:text-indigo-600 no-underline">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-sm text-slate-600 transition-colors hover:text-indigo-600 no-underline">
                  Careers
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-heading text-sm font-semibold uppercase tracking-wider text-slate-900">
              Legal
            </h4>
            <ul className="m-0 list-none space-y-2.5 p-0">
              <li>
                <Link href="/terms" className="text-sm text-slate-600 transition-colors hover:text-indigo-600 no-underline">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm text-slate-600 transition-colors hover:text-indigo-600 no-underline">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="my-10 h-px w-full bg-slate-200/60" />

        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-xs text-slate-500">
            &copy; {currentYear} Cypherdon. All rights reserved.
          </p>
          
          <div className="flex items-center gap-5">
            <a
              href="https://linkedin.com/in/harshwardhan-bhaskar"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-indigo-500 hover:scale-110 transition-all duration-200 flex items-center justify-center"
              title="LinkedIn"
            >
              <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                <rect x="2" y="9" width="4" height="12"/>
                <circle cx="4" cy="4" r="2"/>
              </svg>
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-indigo-500 hover:scale-110 transition-all duration-200 flex items-center justify-center"
              title="Facebook"
            >
              <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
              </svg>
            </a>
            <a
              href="https://github.com/HarshwardhanBhaskar"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-indigo-500 hover:scale-110 transition-all duration-200 flex items-center justify-center"
              title="GitHub"
            >
              <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
              </svg>
            </a>
            <a
              href="https://www.instagram.com/hb.technologies_official?igsh=d2JzZWtud2IyMzlv"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-indigo-500 hover:scale-110 transition-all duration-200 flex items-center justify-center"
              title="Instagram"
            >
              <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
              </svg>
            </a>
          </div>

          <span className="text-xs font-medium text-slate-400">Cypherdon</span>
        </div>
      </div>
    </footer>
  );
}
