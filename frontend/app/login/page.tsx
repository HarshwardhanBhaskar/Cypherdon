"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthLayout from "@/components/auth/AuthLayout";
import AuthCard from "@/components/auth/AuthCard";
import InputField from "@/components/auth/InputField";
import GradientButton from "@/components/auth/GradientButton";
import { siteImages } from "@/lib/siteImages";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Invalid credentials");

      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user_id", data.user_id);

      // Check if profile is already complete
      try {
        const profileRes = await fetch(`${API_BASE}/api/profile`, {
          headers: {
            Authorization: `Bearer ${data.access_token}`,
          },
        });
        if (profileRes.status === 404) {
          router.push("/complete-profile");
          return;
        }
        const profile = await profileRes.json();
        // If skills are empty, profile hasn't been completed yet
        if (!profile.skills || profile.skills.length === 0) {
          router.push("/complete-profile");
          return;
        }
      } catch {
        // If profile check fails, still go to complete-profile
        router.push("/complete-profile");
        return;
      }

      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout backgroundImage={siteImages.auth.login}>
      <AuthCard
        title="Welcome back"
        subtitle="Sign in to continue to Cypherdon"
      >
        {/* Error message */}
        {error && (
          <div className="mb-5 rounded-xl border border-red-500/20 bg-red-50 px-4 py-3 text-sm text-red-600 animate-fade-in-up">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <InputField
            id="login-email"
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
            id="login-password"
            label="Password"
            type="password"
            placeholder="••••••••"
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

          {/* Forgot password */}
          <div className="flex justify-end">
            <button
              type="button"
              className="text-xs text-sky-600 hover:text-sky-700 transition-colors bg-transparent border-none cursor-pointer"
            >
              Forgot password?
            </button>
          </div>

          <GradientButton type="submit" loading={loading}>
            Sign In →
          </GradientButton>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-xs text-slate-500">or</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        {/* Signup link */}
        <p className="text-center text-sm text-slate-600">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="text-sky-600 font-semibold hover:text-sky-700 transition-colors no-underline"
          >
            Create one
          </Link>
        </p>
      </AuthCard>
    </AuthLayout>
  );
}
