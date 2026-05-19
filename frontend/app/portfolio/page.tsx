"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

/* ══════════════════════════════════════════════════════════
   Interactive 3D Particles Background Component
   ══════════════════════════════════════════════════════════ */
function Interactive3DBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const particles: { x: number; y: number; z: number }[] = [];
    const particleCount = 100;
    const focalLength = 300;

    // Distribute particles inside a 3D spherical boundary
    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = 160 + Math.random() * 280;
      
      particles.push({
        x: r * Math.sin(phi) * Math.cos(theta),
        y: r * Math.sin(phi) * Math.sin(theta),
        z: r * Math.cos(phi),
      });
    }

    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      targetX = (e.clientX - window.innerWidth / 2) * 0.04;
      targetY = (e.clientY - window.innerHeight / 2) * 0.04;
    };

    window.addEventListener("mousemove", handleMouseMove);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(canvas);

    let angleX = 0.0006;
    let angleY = 0.0008;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Lazy sway tracking
      mouseX += (targetX - mouseX) * 0.06;
      mouseY += (targetY - mouseY) * 0.06;

      const cosX = Math.cos(angleX + mouseY * 0.004);
      const sinX = Math.sin(angleX + mouseY * 0.004);
      const cosY = Math.cos(angleY + mouseX * 0.004);
      const sinY = Math.sin(angleY + mouseX * 0.004);

      const projected: { x: number; y: number; z: number; px: number; py: number; alpha: number }[] = [];

      for (let i = 0; i < particleCount; i++) {
        const p = particles[i];

        // Orbit Y
        const x1 = p.x * cosY - p.z * sinY;
        const z1 = p.z * cosY + p.x * sinY;

        // Orbit X
        const y2 = p.y * cosX - z1 * sinX;
        const z2 = z1 * cosX + p.y * sinX;

        const zDepth = z2 + 550;

        if (zDepth > 0) {
          const px = (x1 * focalLength) / zDepth + width / 2;
          const py = (y2 * focalLength) / zDepth + height / 2;
          const alpha = (350 - z2) / 700;

          projected.push({
            x: x1,
            y: y2,
            z: z2,
            px,
            py,
            alpha: Math.max(0.08, Math.min(0.7, alpha)),
          });
        }
      }

      // Draw web lines
      ctx.lineWidth = 0.6;
      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const p1 = projected[i];
          const p2 = projected[j];
          const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y, p1.z - p2.z);

          if (dist < 120) {
            const lineAlpha = (1 - dist / 120) * p1.alpha * p2.alpha * 0.18;
            ctx.strokeStyle = `rgba(168, 85, 247, ${lineAlpha})`; // Sleek purple neon lines
            ctx.beginPath();
            ctx.moveTo(p1.px, p1.py);
            ctx.lineTo(p2.px, p2.py);
            ctx.stroke();
          }
        }
      }

      // Draw glowing nodes
      for (let i = 0; i < projected.length; i++) {
        const p = projected[i];
        const radius = (p.z + 300) / 140 + 1.2;

        const grad = ctx.createRadialGradient(p.px, p.py, 0, p.px, p.py, radius * 3);
        grad.addColorStop(0, `rgba(196, 181, 253, ${p.alpha})`); // soft purple center
        grad.addColorStop(0.3, `rgba(59, 130, 246, ${p.alpha * 0.45})`); // neon blue aura
        grad.addColorStop(1, `rgba(0, 0, 0, 0)`);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.px, p.py, radius * 3, 0, Math.PI * 2);
        ctx.fill();
      }

      angleX += 0.0003;
      angleY += 0.0004;

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      resizeObserver.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block pointer-events-none opacity-60 z-0" />;
}

/* ══════════════════════════════════════════════════════════
   Main Page
   ══════════════════════════════════════════════════════════ */
export default function PortfolioPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paywallLocked, setPaywallLocked] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fallback demo projects
  const demoProjects = [
    { title: "PROJECT 01", subtitle: "deep", image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
    { title: "PROJECT 02", subtitle: "web app", image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
    { title: "PROJECT 03", subtitle: "mobile ui", image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
  ];

  useEffect(() => {
    const fetchProfile = async () => {
      let searchId = null;
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        searchId = params.get("id");
      }

      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

      if (searchId) {
        // Recruiter / public viewer mode
        try {
          const res = await fetch(`${API_BASE}/api/profile/public/${searchId}`);
          if (res.status === 403) {
            setPaywallLocked(true);
          } else if (res.ok) {
            const data = await res.json();
            setProfile(data);
          } else {
            setErrorMsg("Developer profile not found or currently set to private.");
          }
        } catch (err) {
          console.error("Failed to fetch public profile", err);
          setErrorMsg("Could not connect to service.");
        } finally {
          setLoading(false);
        }
      } else {
        // Authenticated user preview mode
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }
        try {
          const res = await fetch(`${API_BASE}/api/profile`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            setProfile(data);
          } else {
            if (res.status === 404) {
              router.push("/complete-profile");
            } else {
              setErrorMsg("Failed to retrieve profile credentials.");
            }
          }
        } catch (err) {
          console.error("Failed to fetch authenticated profile", err);
          setErrorMsg("Could not connect to service.");
        } finally {
          setLoading(false);
        }
      }
    };
    fetchProfile();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#617180] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  // Paywall Restricted Overlay
  if (paywallLocked) {
    return (
      <div className="relative min-h-screen bg-[#08080c] font-sans flex items-center justify-center px-4 overflow-hidden select-none">
        {/* Dynamic 3D background continues rendering behind the overlay */}
        <Interactive3DBackground />

        {/* Ambient background glows */}
        <div className="absolute top-[-10%] left-[-10%] w-[55%] h-[55%] bg-violet-600/[0.04] rounded-full blur-[160px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[55%] h-[55%] bg-blue-500/[0.03] rounded-full blur-[160px] pointer-events-none" />

        {/* Centered Glassmorphic Paygate Card */}
        <div className="relative w-full max-w-lg rounded-3xl border border-white/10 bg-[#0d0d12]/80 p-10 shadow-[0_25px_70px_rgba(124,58,237,0.15)] text-center backdrop-blur-2xl animate-fade-in-up z-10">
          {/* Internal ambient glow */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

          {/* Premium Glowing Locked Badge */}
          <div className="relative mx-auto w-24 h-24 mb-8 group">
            <div className="absolute inset-[-4px] rounded-full bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-600 opacity-60 blur-md animate-pulse" style={{ animationDuration: "3s" }} />
            <div className="relative w-24 h-24 rounded-full bg-[#08080c]/50 border border-white/10 flex items-center justify-center z-10 overflow-hidden backdrop-blur-md">
              <img 
                src="/images/premium_badge.png" 
                alt="Premium Locked Badge" 
                className="w-20 h-20 object-contain filter drop-shadow-[0_4px_15px_rgba(168,85,247,0.4)]"
              />
              <div className="absolute inset-0 bg-black/45 flex items-center justify-center opacity-100 transition-opacity">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f472b6" strokeWidth="3" className="filter drop-shadow-[0_0_8px_rgba(244,114,182,0.6)]">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-black text-white tracking-wider mb-4 uppercase">
            Public Portfolio Restricted
          </h2>
          
          <p className="text-slate-400 text-xs leading-relaxed max-w-md mx-auto mb-8 font-semibold uppercase tracking-wider">
            This developer portfolio is currently set to private. Cypherdon Premium is required to share public-facing profiles.
          </p>

          {/* Premium Tier Features Grid */}
          <div className="grid grid-cols-2 gap-4 mb-10 text-left">
            {[
              { title: "Public Portfolios", icon: "🌐" },
              { title: "ATS Optimizer Bot", icon: "🤖" },
              { title: "Cold Email Dispatch", icon: "✉️" },
              { title: "Premium Badges", icon: "⭐" }
            ].map((feat, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl border border-white/[0.04] bg-white/[0.015] flex items-center gap-3">
                <span className="text-lg">{feat.icon}</span>
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">{feat.title}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => router.push("/profile")}
              className="w-full py-4 text-xs font-bold text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 border-none rounded-2xl cursor-pointer shadow-[0_0_20px_rgba(124,58,237,0.3)] transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-1.5"
            >
              <span>⚡</span> UPGRADE TO UNLOCK PORTFOLIO
            </button>
            <button
              onClick={() => router.push("/")}
              className="w-full py-4 text-xs font-bold text-slate-400 hover:text-white border border-white/5 hover:bg-white/[0.02] bg-transparent rounded-2xl transition-all cursor-pointer"
            >
              Return Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // General Error Screen
  if (errorMsg || !profile) {
    return (
      <div className="min-h-screen bg-[#08080c] flex flex-col items-center justify-center text-center px-4">
        <div className="rounded-3xl border border-white/10 bg-[#0d0d12]/80 p-8 max-w-sm backdrop-blur-xl">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center mx-auto mb-4 text-rose-400 text-lg">
            ⚠️
          </div>
          <h3 className="text-white text-lg font-bold mb-2">Profile Unavailable</h3>
          <p className="text-slate-400 text-xs mb-6">{errorMsg || "An error occurred while fetching developer credentials."}</p>
          <button onClick={() => router.push("/")} className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all border-none cursor-pointer">
            Return Home
          </button>
        </div>
      </div>
    );
  }

  // Active premium profile data binding
  const fullName = profile.full_name || "DEVELOPER IDENTITY";
  const preferredRole = profile.preferred_role || "SOFTWARE ENGINEER";
  const skills = profile.skills && profile.skills.length > 0 ? profile.skills : ["REACT", "PYTHON", "UI/UX DESIGN", "NODE.JS"];
  
  // Use portfolio custom email if specified
  const displayEmail = profile.portfolio_email || profile.email || "info@mysite.com";
  // Use portfolio custom resume if specified
  const displayResumeUrl = profile.portfolio_resume_url || profile.resume_url;

  return (
    <div className="min-h-screen bg-[#5a6b7d] font-sans overflow-x-hidden selection:bg-[#00e676] selection:text-white">
      
      {/* MINIMAL NAVBAR */}
      <nav className="fixed top-0 w-full z-50 bg-white shadow-sm h-16 flex items-center justify-between px-6 md:px-12">
        <div className="font-bold text-xl tracking-widest text-black">CYPHERDON</div>
        <div className="flex gap-6 text-sm font-medium text-gray-500">
          <Link href="/dashboard" className="hover:text-black transition-colors">DASHBOARD</Link>
          <Link href="/profile" className="hover:text-black transition-colors">EDIT PROFILE</Link>
          <button 
            onClick={() => { localStorage.clear(); router.push("/login"); }}
            className="text-white bg-black px-4 py-1.5 hover:bg-gray-800 transition-colors"
          >
            LOG OUT
          </button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative min-h-screen flex items-center pt-16">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[#5a6b7d]/90 z-10 mix-blend-multiply" />
          <Image 
            src={profile.hero_image_url || "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"}
            alt="Hero Background" 
            fill 
            className="object-cover object-top grayscale opacity-50"
            priority
          />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-16 flex flex-col items-center md:items-start text-center md:text-left">
          <h2 className="text-white text-5xl md:text-[5.5rem] font-black tracking-[0.15em] leading-[1.1] mb-2 uppercase">
            I'M
          </h2>
          <h1 className="text-white text-5xl md:text-[5.5rem] font-black tracking-[0.15em] leading-[1.1] mb-8 uppercase flex items-end">
            {fullName.split(' ')[0]} <br className="md:hidden" /> {fullName.split(' ').slice(1).join(' ')}
            <span className="w-4 h-4 md:w-5 md:h-5 bg-[#00e676] rounded-full ml-2 md:ml-4 mb-2 md:mb-4 inline-block animate-pulse" />
          </h1>
          <h3 className="text-gray-300 text-lg md:text-xl tracking-[0.25em] font-medium uppercase border-l-2 border-[#00e676] pl-4">
            {preferredRole}
          </h3>
          
          <div className="mt-12 hidden md:block">
            <button className="border-2 border-[#00e676] text-[#00e676] hover:bg-[#00e676] hover:text-white px-8 py-3 text-sm font-bold tracking-widest uppercase transition-all duration-300">
              EXPLORE MY WORK
            </button>
          </div>
        </div>
      </section>

      {/* ABOUT ME SECTION */}
      <section className="flex flex-col md:flex-row min-h-[60vh]">
        {/* Left: Slate Block */}
        <div className="md:w-1/2 bg-[#343e4a] p-12 md:p-24 flex flex-col justify-center items-center text-center">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-2 border-[#00e676] flex items-center justify-center mb-8 mx-auto">
            <span className="text-[#00e676] text-3xl md:text-4xl font-bold uppercase">{fullName.charAt(0)}</span>
          </div>
          <p className="text-gray-300 leading-loose text-xs md:text-sm max-w-md mx-auto mb-10 tracking-widest uppercase">
            {profile.bio || "Dynamic software engineer committed to structural engineering logic, elegant frontend layouts, and scalable cloud application deployments."}
          </p>
          {displayResumeUrl ? (
            <a href={displayResumeUrl} target="_blank" rel="noopener noreferrer" className="border border-[#00e676] text-white hover:bg-[#00e676] px-8 py-3 text-sm font-medium tracking-widest uppercase transition-colors inline-block no-underline">
              DOWNLOAD RESUME
            </a>
          ) : (
            <button className="border border-[#00e676] text-white hover:bg-[#00e676] px-8 py-3 text-sm font-medium tracking-widest uppercase transition-colors">
              DOWNLOAD RESUME
            </button>
          )}
        </div>
        {/* Right: Image Block */}
        <div className="md:w-1/2 relative min-h-[400px] bg-black">
          <Image 
            src={profile.hero_image_url || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"} 
            alt="About Me" 
            fill 
            className="object-cover grayscale hover:grayscale-0 transition-all duration-700"
          />
        </div>
      </section>

      {/* SKILLS SECTION */}
      <section className="bg-white py-24 px-6 md:px-16">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-12 md:gap-24">
          <div className="md:w-1/3">
            <h2 className="text-4xl font-black tracking-widest text-gray-900 mb-2">01 PROFESSIONAL</h2>
            <p className="text-gray-500 tracking-widest text-sm uppercase">My knowledge level in software</p>
          </div>
          
          <div className="md:w-2/3 space-y-8">
            {skills.map((skill: string, idx: number) => {
              // Generate a random-looking but stable width between 70% and 95%
              const width = 70 + ((skill.length * 7) % 25);
              return (
                <div key={idx} className="flex items-center gap-4">
                  <div className="w-32 text-xs font-bold tracking-widest text-gray-500 uppercase shrink-0">
                    {skill}
                  </div>
                  <div className="flex-1 h-3 bg-gray-100 relative">
                    <div 
                      className="absolute top-0 left-0 h-full bg-[#00e676] transition-all duration-1000 ease-out"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                  <div className="w-8 text-xs font-bold text-gray-500 text-right">
                    {width}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* PORTFOLIO SECTION */}
      <section className="bg-[#4d5c6e] py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black tracking-widest text-white mb-2">02 PORTFOLIO</h2>
          <p className="text-gray-300 tracking-widest text-sm uppercase">My latest work.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 w-full gap-1 p-1">
          {profile.projects && profile.projects.length > 0 ? (
            profile.projects.map((proj: any, idx: number) => {
              const image = demoProjects[idx % demoProjects.length].image;
              return (
                <div key={idx} className="relative group aspect-square md:aspect-auto md:h-[500px] overflow-hidden cursor-pointer bg-black">
                  <Image 
                    src={image}
                    alt={proj.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-70 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-end pb-12 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-6 text-center">
                    <h3 className="text-white text-2xl font-black tracking-widest uppercase">{proj.title}</h3>
                    <p className="text-[#00e676] tracking-[0.2em] text-[10px] font-bold uppercase mt-2">{proj.tech_stack}</p>
                    <p className="text-gray-300 text-xs mt-3 line-clamp-3 max-w-xs">{proj.description}</p>
                    {proj.link && (
                      <a href={proj.link} target="_blank" rel="noopener noreferrer" className="mt-4 px-4 py-1.5 border border-[#00e676] text-[#00e676] hover:bg-[#00e676] hover:text-white text-xs font-bold tracking-wider transition-all uppercase no-underline">
                        LAUNCH PROJECT
                      </a>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            demoProjects.map((proj, idx) => (
              <div key={idx} className="relative group aspect-square md:aspect-auto md:h-[500px] overflow-hidden cursor-pointer bg-black">
                <Image 
                  src={proj.image}
                  alt={proj.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-70 group-hover:opacity-100"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-end pb-12 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <h3 className="text-white text-2xl font-black tracking-widest">{proj.title}</h3>
                  <p className="text-[#00e676] tracking-[0.2em] text-sm font-bold uppercase mt-2">{proj.subtitle}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* EXPERIENCE TIMELINE SECTION */}
      <section className="relative bg-[#5a6b7d] py-32 px-6 overflow-hidden">
        {/* Mountain background blending */}
        <div className="absolute inset-0 z-0 mix-blend-overlay opacity-30">
          <Image 
            src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
            alt="Mountains"
            fill
            className="object-cover"
          />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto">
          {/* Vertical Line */}
          <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-[2px] bg-[#00e676] opacity-50 hidden md:block" />

          {profile.work_experience && profile.work_experience.length > 0 ? (
            profile.work_experience.map((exp: any, idx: number) => {
              const isEven = idx % 2 === 0;
              return (
                <div key={idx} className={`flex flex-col md:flex-row items-center w-full mb-16 relative ${isEven ? "" : "md:flex-row-reverse"}`}>
                  <div className={`md:w-1/2 text-center ${isEven ? "md:pr-16 md:text-right" : "md:pl-16 md:text-left"}`}>
                    <p className="text-[#00e676] font-bold tracking-widest text-sm mb-1">{exp.start_date.toUpperCase()} — {exp.end_date.toUpperCase()}</p>
                    <h3 className="text-white text-3xl font-black tracking-widest uppercase mb-3">{exp.company}</h3>
                    <h4 className="text-gray-300 font-bold tracking-widest text-sm uppercase mb-3">{exp.role}</h4>
                    <p className="text-gray-400 text-sm leading-relaxed mx-auto md:mx-0 max-w-sm whitespace-pre-line">
                      {exp.description}
                    </p>
                  </div>
                  {/* Dot */}
                  <div className="absolute left-1/2 -translate-x-1/2 w-4 h-4 bg-[#00e676] rounded-full hidden md:block shadow-[0_0_15px_rgba(0,230,118,0.5)]" />
                  <div className="md:w-1/2" />
                </div>
              );
            })
          ) : (
            <>
              {/* Timeline Item 1 */}
              <div className="flex flex-col md:flex-row items-center w-full mb-16 relative">
                <div className="md:w-1/2 md:pr-16 text-center md:text-right">
                  <p className="text-[#00e676] font-bold tracking-widest text-sm mb-1">2023-PRESENT</p>
                  <h3 className="text-white text-3xl font-black tracking-widest uppercase mb-3">CYPHERDON</h3>
                  <h4 className="text-gray-300 font-bold tracking-widest text-sm uppercase mb-3">SENIOR DEVELOPER</h4>
                  <p className="text-gray-400 text-sm leading-relaxed mx-auto md:mr-0 max-w-sm">
                    Leading the frontend architecture and building AI-driven solutions. Click here to add your own text and edit me.
                  </p>
                </div>
                {/* Dot */}
                <div className="absolute left-1/2 -translate-x-1/2 w-4 h-4 bg-[#00e676] rounded-full hidden md:block shadow-[0_0_15px_rgba(0,230,118,0.5)]" />
                <div className="md:w-1/2" />
              </div>

              {/* Timeline Item 2 */}
              <div className="flex flex-col md:flex-row-reverse items-center w-full relative">
                <div className="md:w-1/2 md:pl-16 text-center md:text-left mt-8 md:mt-0">
                  <p className="text-[#00e676] font-bold tracking-widest text-sm mb-1">2020-2023</p>
                  <h3 className="text-white text-3xl font-black tracking-widest uppercase mb-3">TECH CORP</h3>
                  <h4 className="text-gray-300 font-bold tracking-widest text-sm uppercase mb-3">SOFTWARE ENGINEER</h4>
                  <p className="text-gray-400 text-sm leading-relaxed mx-auto md:ml-0 max-w-sm">
                    Developed full-stack web applications and scaled backend microservices for enterprise clients.
                  </p>
                </div>
                {/* Dot */}
                <div className="absolute left-1/2 -translate-x-1/2 w-4 h-4 bg-[#00e676] rounded-full hidden md:block shadow-[0_0_15px_rgba(0,230,118,0.5)]" />
                <div className="md:w-1/2" />
              </div>
            </>
          )}
          
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section className="bg-[#343e4a] py-24 px-6 md:px-16 flex justify-center">
        <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24">
          {/* Left Text */}
          <div className="text-white flex flex-col justify-center">
            <h2 className="text-3xl tracking-widest mb-8">CONTACT</h2>
            <p className="text-gray-300 text-sm leading-loose mb-10 max-w-xs">
              Feel free to reach out for consulting engagements, career opportunities, or technical project collaborations.
            </p>
            <div className="text-sm text-gray-300 leading-loose">
              <p>{displayEmail}</p>
              {profile.phone && <p>Tel: {profile.phone}</p>}
            </div>
          </div>
          
          {/* Right Form */}
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-white text-xs tracking-wide">First name *</label>
                <input type="text" className="w-full h-10 px-3 bg-white text-gray-900 outline-none focus:ring-2 focus:ring-[#00e676]" />
              </div>
              <div className="space-y-1.5">
                <label className="text-white text-xs tracking-wide">Last name *</label>
                <input type="text" className="w-full h-10 px-3 bg-white text-gray-900 outline-none focus:ring-2 focus:ring-[#00e676]" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-white text-xs tracking-wide">Email *</label>
              <input type="email" className="w-full h-10 px-3 bg-white text-gray-900 outline-none focus:ring-2 focus:ring-[#00e676]" />
            </div>
            <div className="space-y-1.5">
              <label className="text-white text-xs tracking-wide">Phone</label>
              <input type="tel" className="w-full h-10 px-3 bg-white text-gray-900 outline-none focus:ring-2 focus:ring-[#00e676]" />
            </div>
            <div className="space-y-1.5">
              <label className="text-white text-xs tracking-wide">Message</label>
              <textarea rows={4} className="w-full p-3 bg-white text-gray-900 outline-none focus:ring-2 focus:ring-[#00e676] resize-none" />
            </div>
            <button type="submit" className="w-full h-12 bg-[#00e676] hover:bg-[#00c968] text-white font-medium transition-colors">
              Send
            </button>
          </form>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#29323c] py-8 text-center text-gray-400 text-xs tracking-widest flex flex-col items-center justify-center gap-4">
        <div className="flex justify-center items-center gap-6">
          <a 
            href={profile.linkedin_url || "https://linkedin.com/in/harshwardhan-bhaskar"} 
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-[#00e676] hover:scale-115 transition-all duration-200"
            title="LinkedIn"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
              <rect x="2" y="9" width="4" height="12"/>
              <circle cx="4" cy="4" r="2"/>
            </svg>
          </a>
          <a 
            href="https://facebook.com" 
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-[#00e676] hover:scale-115 transition-all duration-200"
            title="Facebook"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
            </svg>
          </a>
          <a 
            href={profile.github_url || "https://github.com/HarshwardhanBhaskar"} 
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-[#00e676] hover:scale-115 transition-all duration-200"
            title="GitHub"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
            </svg>
          </a>
          <a 
            href="https://instagram.com" 
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-[#00e676] hover:scale-115 transition-all duration-200"
            title="Instagram"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
            </svg>
          </a>
        </div>
        <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">
          &copy; {new Date().getFullYear()} {fullName}. All rights reserved.
        </p>
      </footer>

    </div>
  );
}
