"use client";

import React, { useState } from "react";
import Link from "next/link";
import AuthLayout from "@/components/auth/AuthLayout";
import AuthCard from "@/components/auth/AuthCard";
import InputField from "@/components/auth/InputField";
import GradientButton from "@/components/auth/GradientButton";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          full_name: fullName,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Registration failed");

      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // ───── Email Verification Success Screen ─────
  if (success) {
    return (
      <AuthLayout backgroundImage="/auth-bg-4.png">
        <AuthCard
          title="Check your email"
          subtitle="We sent a verification link to your inbox"
        >
          <div className="text-center py-6 space-y-5">
            {/* Animated mail icon */}
            <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30 flex items-center justify-center animate-float">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.5">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            </div>

            <div>
              <p className="text-slate-300 text-sm leading-relaxed">
                We&apos;ve sent a verification email to
              </p>
              <p className="text-purple-400 font-semibold mt-1">{email}</p>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Click the link in the email to verify your account.
              <br />
              After verifying, you can sign in.
            </p>

            <Link href="/login">
              <GradientButton>Go to Sign In</GradientButton>
            </Link>
          </div>
        </AuthCard>
      </AuthLayout>
    );
  }

  // ───── Signup Form ─────
  return (
    <AuthLayout backgroundImage="/auth-bg-4.png">
      <AuthCard
        title="Create your account"
        subtitle="Get started with Cypherdon in seconds"
      >
        {error && (
          <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400 animate-fade-in-up">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <InputField
            id="signup-name"
            label="Full Name"
            placeholder="John Doe"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            }
          />

          <InputField
            id="signup-email"
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            }
          />

          <InputField
            id="signup-password"
            label="Password"
            type="password"
            placeholder="Min 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            }
          />

          <GradientButton type="submit" loading={loading}>
            Create Account →
          </GradientButton>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-xs text-slate-500">or</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <p className="text-center text-sm text-slate-400">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-purple-400 font-semibold hover:text-purple-300 transition-colors no-underline"
          >
            Sign in
          </Link>
        </p>
      </AuthCard>
    </AuthLayout>
  );
}
