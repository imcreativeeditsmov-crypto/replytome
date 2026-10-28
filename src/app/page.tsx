"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { InstagramIcon } from "@/components/icons/InstagramIcon";
import {
  Sparkles,
  Lock,
  Unlock,
  Copy,
  Check,
  ArrowUpRight,
  TrendingUp,
  Zap,
  ShieldCheck,
  Layers,
  BarChart3,
  ExternalLink,
  ChevronRight,
  CheckCircle2,
  Smartphone,
  Play,
  Share2,
  Loader2,
  MessageSquare,
  FileText,
  Clock,
  Flame,
  Star,
  Plus,
  ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

export default function LandingHomePage() {
  const router = useRouter();
  const { user, userProfile, signInWithGoogle } = useAuth();

  // Handle Reservation Bar State
  const [handleInput, setHandleInput] = useState("");
  const [handleError, setHandleError] = useState<string | null>(null);

  // Interactive Live Reel Unlock Demo State
  const [demoKeyword, setDemoKeyword] = useState("");
  const [isDemoUnlocked, setIsDemoUnlocked] = useState(false);
  const [demoError, setDemoError] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleClaim = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = handleInput.trim().toLowerCase().replace(/[^a-z0-9._]/g, "");
    if (!clean) {
      setHandleError("Please enter a valid handle name");
      return;
    }
    if (clean.length < 3) {
      setHandleError("Handle must be at least 3 characters");
      return;
    }
    setHandleError(null);
    router.push(`/login?handle=${encodeURIComponent(clean)}`);
  };

  const handleDemoUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (demoKeyword.trim().toUpperCase() === "CAFE") {
      setIsDemoUnlocked(true);
      setDemoError(false);
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#D2F824", "#0D82ED", "#FFFFFF", "#0A0A0A"],
        });
      } catch (err) {
        console.error(err);
      }
    } else {
      setDemoError(true);
    }
  };

  const handleCopyDemoPrompt = async () => {
    try {
      await navigator.clipboard.writeText(
        "RESTAURANT VFX BUILD — 10-SECOND CONTINUOUS FPV ONE-TAKE TIMELAPSE INTERIOR ARCHITECTURE BUILD SEQUENCE."
      );
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2200);
    } catch (e) {
      console.error(e);
    }
  };

  const onGoogleClick = async () => {
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      router.push("/dashboard");
    } catch (e) {
      console.error(e);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#0A0A0A] flex flex-col font-sans selection:bg-[#D2F824] selection:text-[#0A0A0A]">
      <Navbar />

      {/* ========================================================================= */}
      {/* 1. HERO SECTION: SKY BLUE WITH CLOUDS & 3D FAN OF CARDS                   */}
      {/* ========================================================================= */}
      <section className="relative px-3 sm:px-6 pt-3 pb-8">
        <div
          style={{
            background: "linear-gradient(180deg, #0972D3 0%, #0D82ED 35%, #2499FC 70%, #5EB2FA 100%)",
          }}
          className="hero-sky-bg rounded-b-[40px] sm:rounded-b-[56px] rounded-t-[28px] sm:rounded-t-[36px] pt-32 sm:pt-36 pb-20 sm:pb-28 px-4 sm:px-8 text-center text-white relative"
        >
          
          {/* Hero Content */}
          <div className="relative z-20 max-w-4xl mx-auto space-y-6">
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.08]"
            >
              Exclusive AI Prompts & VFX with <br />
              <span className="text-[#D2F824]">aibyshivai</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="text-white/85 text-sm sm:text-base md:text-lg max-w-2xl mx-auto font-medium leading-relaxed"
            >
              Curated Hollywood-grade VFX build prompts, continuous FPV camera takes, and instant Instagram Reel comment-to-unlock resources by ShivAI.
            </motion.p>

            {/* Two Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="flex items-center justify-center gap-3 pt-2"
            >
              <Link href="/aibyshivai" className="btn-glass-hero">
                <span>Explore Prompts</span>
              </Link>
              <Link href="/dashboard" className="btn-lime">
                <span>Open Dashboard</span>
                <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
              </Link>
            </motion.div>
          </div>

          {/* 3D Fan / Arc of Floating Cards (Suspended over the clouds) */}
          <div className="relative z-20 mt-16 sm:mt-20 max-w-6xl mx-auto overflow-hidden sm:overflow-visible py-4">
            <div className="flex items-end justify-center gap-2 sm:gap-3.5 px-2 select-none">
              
              {/* Card 1 (Far Left): Bar chart card */}
              <div className="hidden lg:block w-36 h-48 rounded-2xl bg-white text-[#0A0A0A] p-3 shadow-2xl border border-black/5 transform -rotate-12 translate-y-7 transition-transform hover:translate-y-2 hover:rotate-0 duration-300">
                <div className="text-[10px] font-bold text-[#7E828A]">Analytics</div>
                <div className="text-xs font-black mt-0.5">Every Decision</div>
                <div className="mt-4 flex items-end justify-between h-20 px-1 gap-1">
                  <div className="w-3 bg-[#0D82ED]/30 h-10 rounded-sm" />
                  <div className="w-3 bg-[#0D82ED]/50 h-14 rounded-sm" />
                  <div className="w-3 bg-[#0D82ED]/70 h-8 rounded-sm" />
                  <div className="w-3 bg-[#0D82ED] h-18 rounded-sm" />
                  <div className="w-3 bg-[#D2F824] h-16 rounded-sm" />
                </div>
              </div>

              {/* Card 2 (Left): Pricing / Stats card */}
              <div className="hidden md:block w-40 h-52 rounded-2xl bg-white text-[#0A0A0A] p-3.5 shadow-2xl border border-black/5 transform -rotate-6 translate-y-3 transition-transform hover:translate-y-0 hover:rotate-0 duration-300">
                <div className="text-[10px] font-bold text-[#7E828A]">Total Unlocks</div>
                <div className="text-sm font-extrabold text-[#0D82ED]">120k+</div>
                <div className="space-y-2 mt-4 text-[10px]">
                  <div className="flex justify-between border-b pb-1">
                    <span className="text-[#7E828A]">Views</span>
                    <span className="font-bold">520k</span>
                  </div>
                  <div className="flex justify-between border-b pb-1">
                    <span className="text-[#7E828A]">Comments</span>
                    <span className="font-bold">48.2k</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#7E828A]">Rate</span>
                    <span className="font-bold text-emerald-600">96.4%</span>
                  </div>
                </div>
              </div>

              {/* Card 3 (Mid-Left): Portrait with Badge */}
              <div className="w-44 sm:w-48 h-56 sm:h-60 rounded-2xl bg-white text-[#0A0A0A] p-2 shadow-2xl border border-black/5 transform -rotate-2 -translate-y-1 transition-transform hover:translate-y-[-8px] hover:rotate-0 duration-300 flex flex-col justify-between overflow-hidden">
                <div className="relative w-full h-36 rounded-xl overflow-hidden bg-zinc-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://lh3.googleusercontent.com/a/ACg8ocJ9qWnDSojX5KvmBmcLNNTSuvefpZR2yQRh0rsX2DynIXdeo7I=s96-c"
                    alt="ShivAI"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/avatar.png";
                    }}
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/60 text-white text-[9px] font-bold backdrop-blur-sm">
                    Verified Owner
                  </div>
                </div>
                <div className="p-1">
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span>ShivAI</span>
                    <span className="text-[#0D82ED]">@aibyshivai</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between px-2 py-1 bg-[#F4F5F7] rounded-lg text-[10px] font-mono font-bold">
                    <span>VFX Creator</span>
                    <span className="text-emerald-600">Active</span>
                  </div>
                </div>
              </div>

              {/* Card 4 (Center): Area Chart with Smooth Curve */}
              <div className="w-48 sm:w-56 h-60 sm:h-64 rounded-2xl bg-white text-[#0A0A0A] p-4 shadow-2xl border border-black/5 transform rotate-0 -translate-y-4 transition-transform hover:translate-y-[-10px] duration-300 z-10">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#7E828A]">Live Growth</span>
                  <span className="w-2 h-2 rounded-full bg-[#D2F824] animate-ping" />
                </div>
                <div className="text-sm font-extrabold mt-1">Intelligence in Decision</div>
                <div className="mt-4 h-28 flex items-center justify-center">
                  <svg className="w-full h-full" viewBox="0 0 100 50">
                    <path
                      d="M 0 40 Q 25 35, 45 20 T 90 10 L 100 5"
                      fill="none"
                      stroke="#0D82ED"
                      strokeWidth="3.5"
                    />
                    <path
                      d="M 0 40 Q 25 35, 45 20 T 90 10 L 100 5 L 100 50 L 0 50 Z"
                      fill="rgba(13, 130, 237, 0.12)"
                    />
                  </svg>
                </div>
                <div className="flex justify-between items-center text-[10px] font-bold text-[#7E828A] mt-2">
                  <span>Day 1</span>
                  <span className="text-[#0D82ED]">+340% Viral</span>
                  <span>Day 30</span>
                </div>
              </div>

              {/* Card 5 (Mid-Right): Dark Card with Yellow Dot */}
              <div className="w-44 sm:w-48 h-56 sm:h-60 rounded-2xl bg-[#0A0A0A] text-white p-4 shadow-2xl border border-white/10 transform rotate-2 -translate-y-1 transition-transform hover:translate-y-[-8px] hover:rotate-0 duration-300 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#D2F824]" />
                    <span className="text-[10px] font-bold tracking-widest text-[#D2F824] uppercase">
                      Automation
                    </span>
                  </div>
                  <div className="text-xs font-bold leading-snug mt-3 text-zinc-100">
                    Expertise that combines strategy, data, and comment triggers.
                  </div>
                </div>
                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-zinc-400">
                  <span>Zero DM block</span>
                  <span className="text-[#D2F824] font-bold">100% Direct</span>
                </div>
              </div>

              {/* Card 6 (Right): Cyan Glass Card with + Icon */}
              <div className="hidden md:block w-40 h-52 rounded-2xl bg-[#2496F8]/85 text-white p-3.5 shadow-2xl border border-white/30 backdrop-blur-md transform rotate-6 translate-y-3 transition-transform hover:translate-y-0 hover:rotate-0 duration-300 flex flex-col justify-between">
                <div>
                  <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white mb-2">
                    <Plus className="w-4 h-4" />
                  </div>
                  <div className="text-xs font-extrabold text-white">Data training</div>
                  <div className="text-[10px] text-white/80 mt-1">
                    Upload your digital assets & prompts.
                  </div>
                </div>
                <div className="text-[9px] bg-black/20 rounded-md p-1.5 font-mono text-center">
                  Instant unlock ready
                </div>
              </div>

              {/* Card 7 (Far Right): 520k+ Stats Card */}
              <div className="hidden lg:block w-36 h-48 rounded-2xl bg-white text-[#0A0A0A] p-3 shadow-2xl border border-black/5 transform rotate-12 translate-y-7 transition-transform hover:translate-y-2 hover:rotate-0 duration-300">
                <div className="text-[10px] font-bold text-[#7E828A]">Total Reach</div>
                <div className="text-lg font-black text-[#0A0A0A] mt-0.5">520k+</div>
                <div className="mt-3 space-y-1.5 text-[9px] text-[#7E828A]">
                  <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                    <div className="bg-[#D2F824] h-full w-[85%]" />
                  </div>
                  <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                    <div className="bg-[#0D82ED] h-full w-[70%]" />
                  </div>
                  <p className="pt-2 text-[10px] font-bold text-[#0A0A0A]">
                    Global viewers unlocked
                  </p>
                </div>
              </div>

            </div>

            {/* Rating Badge Below Cards matching Aeline */}
            <div className="mt-8 flex items-center justify-center gap-2 text-white text-xs sm:text-sm font-semibold">
              <span>Rated 4.9/5 by 4,900+ creators</span>
              <div className="flex items-center text-amber-300">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                ))}
              </div>
            </div>
          </div>

          {/* Realistic Cloud Layers at the bottom of the hero */}
          <div className="cloud-layer-1" />
          <div className="cloud-layer-2" />
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. PARTNER / LOGO TICKER (Logoipsum style minimalist monochrome marquee)   */}
      {/* ========================================================================= */}
      <section className="py-8 bg-white border-b border-black/[0.06] overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 mb-3 text-center">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#7E828A]">
            Trusted by creators across leading platforms
          </p>
        </div>

        <div className="relative w-full overflow-hidden flex items-center">
          <div className="animate-marquee flex items-center gap-12 sm:gap-20 text-[#7E828A]">
            {[
              "Logoipsum",
              "Instagram Reels",
              "TikTok",
              "YouTube Shorts",
              "Threads",
              "Notion",
              "Gumroad",
              "Beehiiv",
              "Logoipsum",
              "Instagram Reels",
              "TikTok",
              "YouTube Shorts",
              "Threads",
              "Notion",
              "Gumroad",
              "Beehiiv",
            ].map((brand, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-sm sm:text-base font-bold tracking-tight text-[#7E828A]/80 hover:text-[#0A0A0A] transition-colors whitespace-nowrap cursor-default"
              >
                <div className="w-4 h-4 rounded-full bg-[#7E828A]/20 flex items-center justify-center text-[9px] font-black">
                  ✦
                </div>
                <span>{brand}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. "ABOUT US" VALUE PROPOSITION WITH INLINE BADGES & BENTO GRID          */}
      {/* ========================================================================= */}
      <section id="about" className="py-20 sm:py-28 px-4 sm:px-6 max-w-7xl mx-auto w-full space-y-16">
        
        {/* Section Header with Inline Badges matching Aeline */}
        <div className="text-center space-y-4 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.25em] text-[#0A0A0A]">
            <span className="w-2 h-2 rounded-full bg-[#0D82ED]" />
            <span>About Us</span>
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#0A0A0A] leading-[1.15]">
            A smart link-in-bio engine<br />
            dedicated to building{" "}
            <span className="inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#0D82ED] text-white align-middle mx-1 shadow-md">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 fill-white" />
            </span>{" "}
            smarter<br />
            <span className="text-[#8E939B]">
              and{" "}
              <span className="inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#D2F824] text-black align-middle mx-1 shadow-md">
                <span className="w-2.5 h-2.5 rounded-full bg-black" />
              </span>{" "}
              more adaptive
            </span>
          </h2>
        </div>

        {/* 4 BENTO CARDS MATCHING AELINE LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
          
          {/* Card 1 (Left): Sky Blue Card with Creator Photo & 120+ Inset Card */}
          <div className="lg:col-span-4 rounded-3xl bg-[#0D82ED] text-white p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden min-h-[460px] shadow-sm">
            {/* Top Bar with IPSUM Logo and Graphic Widget */}
            <div className="flex items-center justify-between z-10">
              <div className="font-extrabold text-base tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#D2F824]" />
                <span>AIBYSHIVAI</span>
              </div>
              <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                <BarChart3 className="w-4 h-4" />
              </div>
            </div>

            {/* Cutout Photo of Creator */}
            <div className="relative z-0 my-auto py-6 flex items-center justify-center">
              <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-full overflow-hidden border-4 border-white/20 shadow-xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=500&q=80"
                  alt="Creative Director"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Inset White Card at Bottom: 120+ Collaborating */}
            <div className="relative z-10 bg-white rounded-2xl p-5 text-[#0A0A0A] shadow-lg">
              <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#0A0A0A]">
                120k+
              </div>
              <p className="text-xs text-[#7E828A] mt-1 font-medium leading-relaxed">
                Reel comments automatically unlocked without rate limits or manual DM messaging.
              </p>
            </div>
          </div>

          {/* Card 2 (Middle): White Card with 100% Commitment & Creator Quote */}
          <div className="lg:col-span-4 rounded-3xl bg-[#F8F9FA] border border-black/[0.06] p-6 sm:p-8 flex flex-col justify-between min-h-[460px] shadow-sm">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#7E828A]">
                Commitment to measurable
              </span>
              <div className="text-5xl sm:text-6xl font-black text-[#0A0A0A] tracking-tight mt-2">
                100%
              </div>
            </div>

            <div className="space-y-4 pt-8">
              {/* Overlapping Avatars */}
              <div className="flex -space-x-2">
                {[
                  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
                  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
                  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80",
                ].map((img, i) => (
                  <div
                    key={i}
                    className="w-9 h-9 rounded-full ring-2 ring-white overflow-hidden bg-zinc-200"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt="creator" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>

              {/* Quote */}
              <blockquote className="text-sm sm:text-base font-medium text-[#0A0A0A] leading-relaxed">
                &ldquo;Their comment-to-unlock strategy completely reshaped our viral Reel workflow.
                It&apos;s efficient, instantaneous, and friction-free.&rdquo;
              </blockquote>
              <p className="text-xs text-[#7E828A]">
                — Marcus Vance, Creative Director & Motion Artist
              </p>
            </div>
          </div>

          {/* Right Column: Stacked Lime Card (520k+) & Pitch Black Card (20+) */}
          <div className="lg:col-span-4 flex flex-col gap-5 sm:gap-6">
            
            {/* Card 3 (Top Right): Electric Lime Neon Card (520k+) */}
            <div className="rounded-3xl bg-[#D2F824] text-[#0A0A0A] p-6 sm:p-8 flex flex-col justify-between flex-1 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A]/70">
                Data Points
              </span>
              <div className="my-4">
                <div className="text-5xl sm:text-6xl font-black tracking-tight text-[#0A0A0A]">
                  520k+
                </div>
                <p className="text-xs sm:text-sm font-semibold text-[#0A0A0A]/80 mt-2 leading-relaxed">
                  Analyzed monthly to power smarter conversion strategies and instant Reel unlocks.
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#0A0A0A]">
                <span>0.2s instant unlock speed</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Card 4 (Bottom Right): Pitch Black Card (20+ Continents / Creators) */}
            <div className="rounded-3xl bg-[#0A0A0A] text-white p-6 sm:p-8 flex flex-col justify-between shadow-sm min-h-[160px]">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Active Countries & Continents
              </span>
              <div className="flex items-baseline justify-between mt-3">
                <div className="text-4xl sm:text-5xl font-black tracking-tight text-white">
                  20+
                </div>
                <span className="text-xs font-mono font-bold text-[#D2F824]">
                  Zero DM Blocks
                </span>
              </div>
            </div>

          </div>

        </div>

      </section>

      {/* ========================================================================= */}
      {/* 4. LIVE INTERACTIVE REEL SIMULATOR SECTION                                 */}
      {/* ========================================================================= */}
      <section id="demo" className="py-20 bg-[#F8F9FA] border-y border-black/[0.06] px-4 sm:px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#0D82ED]">
              Interactive Simulator
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#0A0A0A]">
              Try the comment-to-unlock engine live
            </h2>
            <p className="text-sm text-[#7E828A]">
              Type <strong className="text-[#0A0A0A]">&ldquo;CAFE&rdquo;</strong> below to simulate a viewer
              unlocking an exclusive prompt resource.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center max-w-4xl mx-auto bg-white rounded-3xl p-6 sm:p-10 border border-black/[0.08] shadow-md">
            
            {/* Left: Simulated Instagram Reel Player */}
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden aspect-[9/14] bg-zinc-950 flex flex-col justify-between p-4 text-white shadow-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/cafe-build.png"
                  alt="Cafe Build Reel"
                  className="absolute inset-0 w-full h-full object-cover opacity-60"
                />
                
                <div className="relative z-10 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#0D82ED] text-white flex items-center justify-center font-bold text-xs">
                      C
                    </div>
                    <span className="font-bold">@creativeedits.mov</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-black/60 text-[10px] font-mono">
                    Reel
                  </span>
                </div>

                <div className="relative z-10 space-y-2">
                  <p className="text-xs leading-snug font-medium text-white/95">
                    10-second FPV restaurant build prompt. Comment <span className="text-[#D2F824] font-black underline">&ldquo;CAFE&rdquo;</span> to unlock complete prompt + blueprints!
                  </p>
                  <div className="flex items-center gap-2 text-[11px] text-white/70">
                    <InstagramIcon className="w-3.5 h-3.5 text-[#E1306C]" />
                    <span>aibyshivai.com/cafe-build-prompt</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Unlock Gate Verification Form */}
            <div className="space-y-6">
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#0D82ED]">
                  Step 2 of 2
                </span>
                <h3 className="text-xl font-extrabold text-[#0A0A0A] mt-1">
                  Verify & Reveal Content
                </h3>
                <p className="text-xs text-[#7E828A] mt-1 leading-relaxed">
                  In production, viewers tap your bio link, enter their Instagram handle or keyword, and your content unlocks instantly.
                </p>
              </div>

              {!isDemoUnlocked ? (
                <form onSubmit={handleDemoUnlock} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#0A0A0A] mb-1.5 uppercase tracking-wider">
                      Enter Trigger Keyword
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={demoKeyword}
                        onChange={(e) => {
                          setDemoKeyword(e.target.value);
                          setDemoError(false);
                        }}
                        placeholder='Try typing "CAFE"'
                        className="w-full px-4 py-3 rounded-2xl bg-[#F4F5F7] border border-black/10 text-sm font-bold text-[#0A0A0A] placeholder:text-[#7E828A] focus:outline-none focus:border-[#0D82ED] focus:ring-2 focus:ring-[#0D82ED]/20"
                      />
                      <button
                        type="button"
                        onClick={() => setDemoKeyword("CAFE")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-[#0D82ED] hover:underline px-2 py-1"
                      >
                        Autofill
                      </button>
                    </div>
                    {demoError && (
                      <p className="text-xs font-semibold text-red-600 mt-1.5">
                        Please enter &ldquo;CAFE&rdquo; to unlock this demonstration.
                      </p>
                    )}
                  </div>

                  <button type="submit" className="btn-lime w-full justify-center py-3.5 text-xs">
                    <Unlock className="w-4 h-4 stroke-[2.5]" />
                    <span>Verify & Unlock Instant Prompt</span>
                  </button>
                </form>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-2 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
                    <span>Keyword Verified! Resource Unlocked.</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#F8F9FA] border border-black/[0.08] space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-extrabold text-[#0A0A0A]">
                        Block 1: Midjourney VFX Prompt
                      </span>
                      <button
                        onClick={handleCopyDemoPrompt}
                        className="flex items-center gap-1 text-[11px] font-bold text-[#0D82ED] hover:underline"
                      >
                        {copiedPrompt ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedPrompt ? "Copied!" : "Copy Text"}</span>
                      </button>
                    </div>
                    <p className="text-xs text-[#0A0A0A] font-mono leading-relaxed bg-white p-3 rounded-xl border border-black/5">
                      RESTAURANT VFX BUILD — 10-SECOND CONTINUOUS FPV ONE-TAKE TIMELAPSE INTERIOR ARCHITECTURE BUILD SEQUENCE.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setIsDemoUnlocked(false);
                      setDemoKeyword("");
                    }}
                    className="text-xs font-bold text-[#7E828A] hover:text-[#0A0A0A] underline"
                  >
                    Reset Demo
                  </button>
                </motion.div>
              )}

            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. AIBYSHIVAI SHOWCASE & PLATFORM ACCESS                                  */}
      {/* ========================================================================= */}
      <section className="py-20 px-4 sm:px-6 max-w-4xl mx-auto w-full text-center space-y-6">
        <span className="text-xs font-extrabold uppercase tracking-widest text-[#0D82ED]">
          Curated by ShivAI
        </span>
        <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-[#0A0A0A]">
          Exclusive Prompts & VFX Workflows
        </h2>
        <p className="text-sm sm:text-base text-[#7E828A] max-w-xl mx-auto font-medium">
          Explore complete Hollywood cinema build sequences, keyword-gated resources, and creator toolkits by @aibyshivai.
        </p>

        {/* Action Buttons for ShivAI Platform */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link href="/aibyshivai" className="btn-lime text-xs px-6 py-3 font-black uppercase tracking-wider">
            <span>Explore All Prompts</span>
            <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </Link>
          <Link href="/dashboard" className="px-5 py-3 rounded-full bg-[#0A0A0A] text-white hover:bg-[#222] text-xs font-bold transition-all shadow-sm flex items-center gap-2">
            <span>Creator Dashboard</span>
            <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </Link>
        </div>

        <div className="flex items-center justify-center gap-6 text-xs text-[#7E828A] font-medium pt-4">
          <span className="flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
            <span>Verified AI Prompts</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
            <span>Hollywood Continuous FPV</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
            <span>Zero DM limits</span>
          </span>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* CREATOR & ARCHITECT ATTRIBUTION HIGHLIGHT                                 */}
      {/* ========================================================================= */}
      <section className="pb-16 px-4 sm:px-6 max-w-4xl mx-auto w-full">
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#0D82ED]/10 via-[#F8F9FA] to-[#D2F824]/20 border border-black/[0.08] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#FD1D1D] via-[#E1306C] to-[#833AB4] flex items-center justify-center text-white shadow-md flex-shrink-0">
              <InstagramIcon className="w-7 h-7 text-white" />
            </div>
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#0D82ED]">
                Creator & Developer
              </span>
              <h3 className="text-xl font-black text-[#0A0A0A] mt-0.5">
                Built & Designed by Creative Edits
              </h3>
              <p className="text-xs text-[#7E828A] mt-1 font-medium">
                Engineered with automated comment unlocks, fast delivery & high-converting UI.
              </p>
            </div>
          </div>

          <a
            href="https://www.instagram.com/creativeedits.mov/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-lime text-xs font-black px-6 py-3.5 flex items-center gap-2 whitespace-nowrap shadow-md hover:scale-105 transition-transform"
          >
            <InstagramIcon className="w-4 h-4 text-black" />
            <span>@creativeedits.mov</span>
            <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
          </a>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. DIRECTORY FOOTER                                                       */}
      {/* ========================================================================= */}
      <Footer />
    </div>
  );
}
