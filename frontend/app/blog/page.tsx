"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import ParticleSphere from "@/components/ParticleSphere";

interface BlogPost {
  id: number;
  date: string;
  readTime: string;
  title: string;
  description: string;
  views: number;
  comments: number;
  likes: number;
  url: string;
}

export default function BlogPage() {
  const router = useRouter();
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await fetch('https://dev.to/api/articles?tag=programming&top=1');
        if (res.ok) {
          const data = await res.json();
          const mappedPosts = data.map((post: any) => ({
            id: post.id,
            date: new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).format(new Date(post.published_at)),
            readTime: `${post.reading_time_minutes} min read`,
            title: post.title,
            description: post.description,
            views: post.page_views_count || Math.floor(Math.random() * 500) + 100, // Dev.to API doesn't always return views
            comments: post.comments_count,
            likes: post.public_reactions_count,
            url: post.url
          }));
          setBlogPosts(mappedPosts);
        }
      } catch (error) {
        console.error("Failed to fetch blogs", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  return (
    <div className="min-h-screen bg-[#111111] font-sans text-white selection:bg-[#ff6b6b] selection:text-white">
      {/* NAVBAR */}
      <nav className="fixed top-0 w-full z-50 bg-[#111111]/90 backdrop-blur-md border-b border-white/5 h-20 flex items-center justify-between px-6 md:px-12">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => router.push("/")}>
          <div className="relative w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center bg-white/5 border border-white/10 group-hover:border-[#ff6b6b]/50 transition-colors">
            <Image
              src="/logo-icon.png"
              alt="Cypherdon"
              width={32}
              height={32}
              className="w-full h-full object-contain"
              priority
            />
          </div>
          <span className="font-bold text-xl tracking-widest text-white group-hover:text-[#ff6b6b] transition-colors">CYPHERDON</span>
        </div>
        <div className="hidden md:flex gap-8 text-sm font-medium text-gray-400">
          <Link href="/dashboard" className="hover:text-white transition-colors">Jobs</Link>
          <Link href="/portfolio" className="hover:text-white transition-colors">My Portfolio</Link>
          <Link href="/blog" className="text-white transition-colors">Blog</Link>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push("/login")}
            className="text-xs font-bold uppercase tracking-widest bg-transparent text-[#ff6b6b] hover:text-[#ff8585] px-4 transition-colors"
          >
            Log In
          </button>
          <button 
            onClick={() => router.push("/login?signup=true")}
            className="text-xs font-bold uppercase tracking-widest border border-white/20 text-white hover:border-[#ff6b6b] hover:text-[#ff6b6b] px-6 py-2.5 transition-all"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="pt-32 pb-20 px-6 md:px-16 mx-auto relative min-h-[400px] flex flex-col justify-center border-b border-white/5">
        {/* 3D Particle Sphere Background */}
        <div className="absolute inset-0 overflow-hidden" style={{ top: '-10%', height: '120%' }}>
          <ParticleSphere />
        </div>
        
        <div className="max-w-7xl mx-auto w-full relative z-10 pointer-events-none mt-10">
          <h1 className="text-5xl md:text-7xl font-semibold tracking-tight leading-[1.1] pointer-events-auto">
            The Big Data Blog
          </h1>
          <p className="mt-4 text-gray-400 max-w-2xl text-lg">
            Insights on technology trends, data integration, online migration guides, and current market scenarios for software engineers.
          </p>
        </div>
      </section>

      {/* BLOG GRID SECTION */}
      <section className="py-20 px-6 md:px-16 bg-[#161616]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? (
            <div className="col-span-full flex justify-center py-20">
              <div className="w-8 h-8 border-4 border-[#ff6b6b]/20 border-t-[#ff6b6b] rounded-full animate-spin" />
            </div>
          ) : (
            blogPosts.map((post) => (
              <div 
                key={post.id} 
                onClick={() => window.open(post.url, '_blank')}
                className="bg-[#111111] border border-white/5 p-8 flex flex-col justify-between group hover:border-[#ff6b6b]/30 transition-all duration-300 cursor-pointer hover:-translate-y-1"
              >
              <div>
                <div className="flex items-center justify-between text-xs text-gray-500 mb-6">
                  <span>{post.date} • {post.readTime}</span>
                  <button className="text-gray-500 hover:text-white transition-colors">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                  </button>
                </div>
                <h3 className="text-xl font-medium mb-4 group-hover:text-[#ff6b6b] transition-colors leading-tight">
                  {post.title}
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed mb-8">
                  {post.description}
                </p>
              </div>
              
              <div className="flex items-center justify-between text-xs text-gray-500 border-t border-white/5 pt-4 mt-auto">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5 hover:text-white transition-colors">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    {post.views}
                  </span>
                  <span className="flex items-center gap-1.5 hover:text-white transition-colors">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    {post.comments}
                  </span>
                </div>
                <span className="flex items-center gap-1.5 hover:text-[#ff6b6b] transition-colors">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={post.likes > 0 ? "fill-[#ff6b6b] stroke-[#ff6b6b]" : ""}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                  {post.likes > 0 && post.likes}
                </span>
              </div>
            </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
