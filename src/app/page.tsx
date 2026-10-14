"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { InstagramIcon } from "@/components/icons/InstagramIcon";
import {
  Sparkles,
  Lock,
  Unlock,
  Copy,
  Check,
  ArrowRight,
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
    router.push(`/login?handle=${clean}&redirect=/onboarding`);
  };

  const handleUnlockDemo = (e: React.FormEvent) => {
    e.preventDefault();
    if (demoKeyword.trim().toUpperCase() === "CAFE") {
      setIsDemoUnlocked(true);
      setDemoError(false);
      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
          colors: ["#0071E3", "#34C759", "#FF9500", "#5856D6"],
        });
      } catch (err) {
        console.error(err);
      }
    } else {
      setDemoError(true);
      setTimeout(() => setDemoError(false), 2500);
    }
  };

  const handleCopyPrompt = async () => {
    const promptText = `RESTAURANT VFX BUILD — 10-SECOND ONE-TAKE FPV
USE THE UPLOADED REFERENCE IMAGE AS THE FINAL ARCHITECTURAL AND INTERIOR DESIGN TARGET ONLY.
At 00:00, the restaurant interior is completely empty. The video must show the restaurant being physically constructed from nothing during one continuous, dynamic FPV camera shot.`;
    try {
      await navigator.clipboard.writeText(promptText);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handle1ClickGoogle = async () => {
    setGoogleLoading(true);
    try {
      const res = await signInWithGoogle();
      if (res.redirecting) {
        return; // Page is navigating to Google accounts
      }
      if (res.success && res.user) {
        if (!res.profile || !res.profile.username) {
          router.push("/onboarding");
        } else {
          router.push("/dashboard");
        }
      } else if (res.popupBlocked) {
        router.push("/login");
      } else if (res.error && res.error !== "Popup closed") {
        if (res.error.toLowerCase().includes("popup")) {
          router.push("/login");
        } else {
          alert(res.error);
        }
      }
    } catch (e: any) {
      console.error("Google sign-in error:", e);
      if (e?.code === "auth/popup-blocked" || e?.message?.toLowerCase().includes("popup")) {
        router.push("/login");
      } else {
        alert(e?.message || "Google sign-in failed. Please try again.");
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#1D1D1F] selection:bg-[#0071E3]/20 selection:text-[#0071E3] flex flex-col font-sans overflow-x-hidden">
      {/* Background Soft Glow Accents */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[550px] bg-gradient-to-b from-[#0071E3]/8 via-[#5856D6]/5 to-transparent blur-[140px] rounded-full" />
        <div className="absolute top-[800px] -right-40 w-[600px] h-[600px] bg-gradient-to-br from-[#E1306C]/5 to-transparent blur-[150px] rounded-full" />
      </div>

      {/* Modern Frosted White Header */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-white/80 border-b border-[#E5E5EA] transition-all">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-[#0071E3] flex items-center justify-center text-white font-bold text-sm shadow-sm group-hover:scale-105 transition-transform">
              R
            </div>
            <span className="font-bold text-lg tracking-tight text-[#1D1D1F]">
              Replyto<span className="text-[#0071E3]">.me</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-[#6E6E73]">
            <a href="#how-it-works" className="hover:text-[#1D1D1F] transition-colors">
              How It Works
            </a>
            <a href="#demo" className="hover:text-[#1D1D1F] transition-colors">
              Live Demo
            </a>
            <a href="#features" className="hover:text-[#1D1D1F] transition-colors">
              Features
            </a>
            <a href="#creators" className="hover:text-[#1D1D1F] transition-colors">
              Top Creators
            </a>
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard"
                  className="px-4 py-2 rounded-full bg-[#F5F5F7] hover:bg-[#EBEBED] text-[#1D1D1F] text-xs font-semibold border border-[#E5E5EA] transition-all flex items-center gap-2 apple-btn"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={userProfile?.photoURL || user.photoURL || "/avatar.png"}
                    alt="User"
                    referrerPolicy="no-referrer"
                    crossOrigin="anonymous"
                    className="w-4 h-4 rounded-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/avatar.png";
                    }}
                  />
                  <span>Dashboard</span>
                  <ArrowRight className="w-3 h-3 text-[#0071E3]" />
                </Link>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-xs font-semibold text-[#6E6E73] hover:text-[#1D1D1F] px-3 py-1.5 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-semibold shadow-[0_4px_14px_rgba(0,113,227,0.3)] transition-all apple-btn"
                >
                  Claim Handle Free
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative z-10 pt-16 sm:pt-24 pb-16 px-4 sm:px-6 max-w-5xl mx-auto text-center">
        {/* Floating Feature Pill */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F5F5F7] border border-[#E5E5EA] shadow-sm mb-6"
        >
          <span className="flex h-2 w-2 rounded-full bg-[#34C759] animate-pulse" />
          <span className="text-[11px] font-semibold tracking-wide text-[#1D1D1F] uppercase">
            The #1 Link in Bio for Instagram Reels
          </span>
          <span className="text-[#86868B]">•</span>
          <span className="text-[11px] font-semibold text-[#0071E3]">100% Free</span>
        </motion.div>

        {/* Hero Title */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-[#1D1D1F] leading-[1.08] max-w-4xl mx-auto"
        >
          Turn Reel Comments into{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#0071E3] via-[#833AB4] to-[#E1306C]">
            Viral Conversions.
          </span>
        </motion.h1>

        {/* Hero Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-base sm:text-xl text-[#6E6E73] max-w-2xl mx-auto mt-6 leading-relaxed font-normal"
        >
          Stop losing 90% of your audience to dead links. Lock Midjourney prompts,
          Notion workflows, and digital downloads behind a single Instagram Reel comment keyword.
        </motion.p>

        {/* Live Handle Claimer Input */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-9 max-w-md mx-auto"
        >
          <form
            onSubmit={handleClaim}
            className="p-1.5 rounded-2xl bg-white border-2 border-[#E5E5EA] shadow-[0_8px_30px_rgba(0,0,0,0.06)] flex items-center gap-1.5 focus-within:border-[#0071E3] focus-within:ring-2 focus-within:ring-[#0071E3]/20 transition-all"
          >
            <div className="pl-3.5 pr-1 flex items-center text-sm font-mono text-[#86868B] select-none">
              replyto.me/
            </div>
            <input
              type="text"
              value={handleInput}
              onChange={(e) => {
                setHandleInput(e.target.value.toLowerCase().replace(/\s+/g, ""));
                setHandleError(null);
              }}
              placeholder="yourhandle"
              className="flex-1 min-w-0 bg-transparent py-2.5 text-sm font-semibold text-[#1D1D1F] placeholder-[#86868B] focus:outline-none font-mono"
            />
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#0071E3] hover:bg-[#0077ED] text-white font-semibold text-xs whitespace-nowrap shadow-sm active:scale-95 transition-all flex items-center gap-1.5 apple-btn"
            >
              <span>Claim Handle</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {handleError && (
            <p className="text-xs text-[#FF3B30] mt-2 font-medium">{handleError}</p>
          )}

          {/* Quick Google 1-Click Alternate */}
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-3 text-xs text-[#6E6E73]">
            <button
              type="button"
              onClick={handle1ClickGoogle}
              disabled={googleLoading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white hover:bg-[#F5F5F7] border border-[#E5E5EA] text-[#1D1D1F] font-semibold transition-all shadow-sm apple-btn disabled:opacity-50"
            >
              {googleLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0071E3]" />
              ) : (
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              )}
              <span>{googleLoading ? "Connecting..." : "Or continue with Google"}</span>
            </button>
            <span className="hidden sm:inline text-[#86868B]">•</span>
            <span>⚡ Instant 1-click setup • No credit card</span>
          </div>
        </motion.div>
      </section>

      {/* STATS TICKER */}
      <section className="relative z-10 border-y border-[#E5E5EA] bg-[#F5F5F7]/70 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          <div>
            <p className="text-2xl sm:text-3xl font-extrabold text-[#1D1D1F]">10x</p>
            <p className="text-xs text-[#86868B] mt-1 uppercase tracking-wider font-semibold">
              Comment Engagement
            </p>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-extrabold text-[#0071E3]">98.4%</p>
            <p className="text-xs text-[#86868B] mt-1 uppercase tracking-wider font-semibold">
              Unlock Rate
            </p>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-extrabold text-[#1D1D1F]">1.2M+</p>
            <p className="text-xs text-[#86868B] mt-1 uppercase tracking-wider font-semibold">
              Prompts Delivered
            </p>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-extrabold text-[#34C759]">&lt; 0.2s</p>
            <p className="text-xs text-[#86868B] mt-1 uppercase tracking-wider font-semibold">
              Instant Bio Speed
            </p>
          </div>
        </div>
      </section>

      {/* INTERACTIVE LIVE REEL UNLOCK SIMULATOR */}
      <section id="demo" className="relative z-10 py-20 px-4 sm:px-6 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs font-bold text-[#0071E3] uppercase tracking-wider">
            Interactive Experience
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1D1D1F] tracking-tight mt-2">
            See how Comment Gating works in real life
          </h2>
          <p className="text-sm text-[#6E6E73] max-w-lg mx-auto mt-2">
            Try unlocking this live resource by typing the Reel keyword{" "}
            <span className="font-mono text-[#0071E3] font-bold bg-[#0071E3]/10 px-2 py-0.5 rounded">
              CAFE
            </span>{" "}
            below.
          </p>
        </div>

        {/* Two-Column Simulator Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-white border border-[#E5E5EA] rounded-[32px] p-6 sm:p-10 shadow-[0_12px_40px_rgba(0,0,0,0.06)]">
          {/* Left Column: Simulated Instagram Reel */}
          <div className="relative rounded-3xl overflow-hidden border border-[#E5E5EA] bg-black shadow-xl">
            {/* Phone Header Mockup */}
            <div className="p-3.5 bg-black/80 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/avatar.png"
                  alt="Shivai"
                  className="w-6 h-6 rounded-full object-cover border border-white/20"
                />
                <span className="text-xs font-bold text-white">aibyshivai</span>
                <span className="text-[10px] text-white/50">• Follow</span>
              </div>
              <InstagramIcon className="w-4 h-4 text-pink-500" />
            </div>

            {/* Reel Video Visual Simulation */}
            <div className="relative aspect-[4/5] bg-zinc-900 overflow-hidden group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/cafe-build.png"
                alt="Cafe Build Reel"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30" />

              {/* Play Badge */}
              <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white">
                <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
              </div>

              {/* Reel Caption Overlay */}
              <div className="absolute bottom-4 left-4 right-4 text-left">
                <p className="text-xs font-bold text-white drop-shadow-md">
                  Cafe Restaurant VFX Build (FPV 10s Take)
                </p>
                <p className="text-[11px] text-white/90 mt-1 leading-snug drop-shadow-md">
                  Comment <strong className="text-amber-400 font-extrabold uppercase">CAFE</strong>{" "}
                  below & tap link in bio to unlock the full prompt & workflow! ☕⚡
                </p>
                <div className="mt-3 flex items-center gap-2 text-[10px] font-semibold text-white/80">
                  <span className="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md">
                    23.4k Comments
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md">
                    184k Likes
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Replyto.me Resource Gate */}
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#0071E3]/10 text-[#0071E3] border border-[#0071E3]/20">
                REPLYTO.ME CONTENT GATE
              </span>
              <span className="text-xs text-[#86868B]">Live Demo</span>
            </div>

            <h3 className="text-2xl font-bold text-[#1D1D1F] tracking-tight">
              Cafe Build VFX Prompt Pack
            </h3>
            <p className="text-xs text-[#6E6E73] mt-1">
              Curated by @aibyshivai • Photorealistic Hollywood VFX Camera Rule
            </p>

            {/* Unlocked State */}
            <AnimatePresence mode="wait">
              {isDemoUnlocked ? (
                <motion.div
                  key="unlocked"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="mt-6 p-5 rounded-2xl bg-[#34C759]/10 border border-[#34C759]/30 backdrop-blur-md"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-[#34C759]">
                      <Unlock className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase tracking-wider">
                        Resource Unlocked!
                      </span>
                    </div>
                    <button
                      onClick={handleCopyPrompt}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#0071E3] text-white text-xs font-semibold shadow-sm hover:bg-[#0077ED] transition-all apple-btn"
                    >
                      {copiedPrompt ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedPrompt ? "Copied!" : "Copy Prompt"}</span>
                    </button>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white border border-[#E5E5EA] font-mono text-[11px] text-[#1D1D1F] max-h-36 overflow-y-auto leading-relaxed">
                    RESTAURANT VFX BUILD — 10-SECOND ONE-TAKE FPV<br />
                    USE THE UPLOADED REFERENCE IMAGE AS THE FINAL ARCHITECTURAL AND INTERIOR DESIGN TARGET ONLY.<br />
                    At 00:00, the restaurant interior is completely empty. The entire 10 seconds must be captured by one uninterrupted FPV camera movement.
                  </div>

                  <p className="text-[11px] text-[#34C759] mt-3 font-semibold">
                    ✨ This is what your Reel viewers experience in 1 second!
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="locked"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="mt-6 p-5 rounded-2xl bg-[#F5F5F7] border border-[#E5E5EA]"
                >
                  <div className="flex items-center gap-2 text-amber-600 mb-2">
                    <Lock className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      Locked Content Gate
                    </span>
                  </div>
                  <p className="text-xs text-[#6E6E73] leading-relaxed mb-4">
                    Comment <span className="font-bold text-[#1D1D1F] bg-white border border-[#E5E5EA] px-1.5 py-0.5 rounded">CAFE</span> on Instagram to unlock the full prompt & workflow!
                  </p>

                  <form onSubmit={handleUnlockDemo} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={demoKeyword}
                        onChange={(e) => {
                          setDemoKeyword(e.target.value);
                          setDemoError(false);
                        }}
                        placeholder="Type CAFE to unlock..."
                        className="flex-1 px-3.5 py-2.5 rounded-xl bg-white border border-[#E5E5EA] text-xs font-mono text-[#1D1D1F] placeholder-[#86868B] focus:outline-none focus:border-[#0071E3]"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2.5 rounded-xl bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-semibold shadow-sm apple-btn whitespace-nowrap"
                      >
                        Unlock Now →
                      </button>
                    </div>

                    {demoError && (
                      <p className="text-xs text-[#FF3B30] font-medium">
                        Try entering &quot;CAFE&quot; (case-insensitive) to simulate unlocking!
                      </p>
                    )}
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-5 pt-4 border-t border-[#E5E5EA] flex items-center justify-between text-xs text-[#6E6E73]">
              <span>Try it with your own keyword</span>
              <Link href="/login" className="text-[#0071E3] hover:underline font-semibold">
                Create Free Link →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3-STEP VIRAL ENGINE */}
      <section id="how-it-works" className="relative z-10 py-20 px-4 sm:px-6 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-xs font-bold text-[#0071E3] uppercase tracking-wider">
            How It Works
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1D1D1F] tracking-tight mt-2">
            The 3-Step Viral Loop for Instagram Creators
          </h2>
          <p className="text-sm text-[#6E6E73] max-w-md mx-auto mt-2">
            From zero to thousands of qualified reel comments that trick the algorithm into pushing your content.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="p-7 rounded-3xl bg-white border border-[#E5E5EA] shadow-sm hover:shadow-md hover:border-[#0071E3]/40 transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-[#0071E3]/10 text-[#0071E3] flex items-center justify-center font-bold text-lg mb-5 group-hover:scale-110 transition-transform">
              1
            </div>
            <h3 className="text-lg font-bold text-[#1D1D1F] tracking-tight">
              Create & Lock Content
            </h3>
            <p className="text-xs text-[#6E6E73] mt-2.5 leading-relaxed">
              Add multiple copyable text blocks (prompts, scripts, Notion templates), upload your hero preview photos, and set a custom trigger keyword.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-7 rounded-3xl bg-white border border-[#E5E5EA] shadow-sm hover:shadow-md hover:border-purple-500/40 transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold text-lg mb-5 group-hover:scale-110 transition-transform">
              2
            </div>
            <h3 className="text-lg font-bold text-[#1D1D1F] tracking-tight">
              Tell Viewers to Comment
            </h3>
            <p className="text-xs text-[#6E6E73] mt-2.5 leading-relaxed">
              In your Instagram Reel caption or on-screen text, say: &quot;Comment CAFE and tap link in bio for the complete workflow.&quot;
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-7 rounded-3xl bg-white border border-[#E5E5EA] shadow-sm hover:shadow-md hover:border-[#34C759]/40 transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-[#34C759]/10 text-[#34C759] flex items-center justify-center font-bold text-lg mb-5 group-hover:scale-110 transition-transform">
              3
            </div>
            <h3 className="text-lg font-bold text-[#1D1D1F] tracking-tight">
              Explode in Algorithm
            </h3>
            <p className="text-xs text-[#6E6E73] mt-2.5 leading-relaxed">
              Instagram sees massive authentic comment velocity and sends your Reel to Explore. Replyto.me verifies and delivers the resources instantly.
            </p>
          </div>
        </div>
      </section>

      {/* FEATURES BENTO GRID */}
      <section id="features" className="relative z-10 py-20 px-4 sm:px-6 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-xs font-bold text-[#0071E3] uppercase tracking-wider">
            Features
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#1D1D1F] tracking-tight mt-2">
            Engineered for high-performing creators
          </h2>
          <p className="text-sm text-[#6E6E73] max-w-md mx-auto mt-2">
            Everything you need to turn casual reel viewers into loyal fans and subscribers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Bento Card 1: Multi-Block Text */}
          <div className="md:col-span-2 p-8 rounded-3xl bg-white border border-[#E5E5EA] shadow-sm hover:shadow-md transition-all group">
            <div className="w-10 h-10 rounded-2xl bg-[#0071E3]/10 text-[#0071E3] flex items-center justify-center mb-4">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-[#1D1D1F] tracking-tight">
              Multi-Block Copyable Resources
            </h3>
            <p className="text-xs text-[#6E6E73] mt-2 max-w-md leading-relaxed">
              No more messy caption cut-offs. Structure Midjourney prompts, ChatGPT instructions, and code blocks into neat, individually copyable cards.
            </p>
            <div className="mt-6 p-4 rounded-2xl bg-[#F5F5F7] border border-[#E5E5EA] flex items-center justify-between font-mono text-xs text-[#1D1D1F]">
              <span className="truncate pr-4">cinematic 8k lighting --v 6.1 --ar 16:9</span>
              <span className="px-2.5 py-1 rounded-lg bg-white border border-[#E5E5EA] text-[10px] font-bold text-[#0071E3] shadow-sm">
                1-Click Copy
              </span>
            </div>
          </div>

          {/* Bento Card 2: Automatic Gate Verification */}
          <div className="p-8 rounded-3xl bg-white border border-[#E5E5EA] shadow-sm hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-[#1D1D1F] tracking-tight">
              Keyword Gating
            </h3>
            <p className="text-xs text-[#6E6E73] mt-2 leading-relaxed">
              Lock prompt text, direct downloads, or both behind your custom secret word.
            </p>
            <div className="mt-6 flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-amber-500/15 text-amber-800 text-xs font-mono font-bold">
                KEYWORD: CAFE
              </span>
            </div>
          </div>

          {/* Bento Card 3: Deep Analytics */}
          <div className="p-8 rounded-3xl bg-white border border-[#E5E5EA] shadow-sm hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center mb-4">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-[#1D1D1F] tracking-tight">
              Real-time Analytics
            </h3>
            <p className="text-xs text-[#6E6E73] mt-2 leading-relaxed">
              Track link views, unlock conversion rates, and clipboard copy statistics right in your dashboard.
            </p>
          </div>

          {/* Bento Card 4: Apple-Grade Bio Experience */}
          <div className="md:col-span-2 p-8 rounded-3xl bg-white border border-[#E5E5EA] shadow-sm hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-2xl bg-[#34C759]/10 text-[#34C759] flex items-center justify-center mb-4">
              <Smartphone className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-[#1D1D1F] tracking-tight">
              Apple-Grade Mobile Speed & Clean Design
            </h3>
            <p className="text-xs text-[#6E6E73] mt-2 max-w-md leading-relaxed">
              Zero lag, zero cookie popups, zero intrusive ads. Your profile loads in less than 200ms on all mobile devices with native Instagram in-app browser optimization.
            </p>
          </div>
        </div>
      </section>

      {/* FEATURED CREATOR SPOTLIGHT */}
      <section id="creators" className="relative z-10 py-20 px-4 sm:px-6 max-w-5xl mx-auto">
        <div className="p-8 sm:p-12 rounded-[36px] bg-[#F5F5F7] border border-[#E5E5EA] shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-5">
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-[#E5E5EA] p-1 bg-white shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/avatar.png"
                  alt="AI by Shivai"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <div className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-gradient-to-tr from-[#FD1D1D] to-[#833AB4] flex items-center justify-center text-white border-2 border-white shadow-sm">
                <InstagramIcon className="w-3.5 h-3.5" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#0071E3] uppercase tracking-wider">
                  Featured Top Creator
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#34C759]/10 text-[#34C759]">
                  Verified
                </span>
              </div>
              <h3 className="text-2xl font-bold text-[#1D1D1F] tracking-tight mt-0.5">
                AI by Shivai
              </h3>
              <p className="text-xs font-mono text-[#6E6E73]">@aibyshivai</p>
              <p className="text-xs text-[#48484A] max-w-md mt-2 line-clamp-2 leading-relaxed">
                AI tools, viral prompts & automated creator workflows. Comment on Instagram Reels to unlock exclusive copyable resources.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <Link
              href="/aibyshivai"
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#1D1D1F] hover:bg-black text-white text-xs font-semibold shadow-sm transition-all apple-btn flex items-center justify-center gap-2"
            >
              <span>View Shivai&apos;s Live Bio</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/aibyshivai/cafe-build-prompt"
              className="w-full sm:w-auto px-5 py-3 rounded-full bg-white hover:bg-zinc-100 text-[#1D1D1F] border border-[#E5E5EA] text-xs font-semibold transition-all apple-btn flex items-center justify-center gap-1.5 shadow-sm"
            >
              <span>Cafe Prompt Post</span>
              <ChevronRight className="w-3.5 h-3.5 text-[#86868B]" />
            </Link>
          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION (CTA) */}
      <section className="relative z-10 py-24 px-4 sm:px-6 max-w-4xl mx-auto text-center">
        <div className="p-10 sm:p-16 rounded-[40px] bg-gradient-to-b from-[#0071E3]/10 via-[#F5F5F7] to-white border border-[#E5E5EA] shadow-xl">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-[#1D1D1F] tracking-tight leading-tight">
            Ready to 10x your Instagram reel engagement?
          </h2>
          <p className="text-sm sm:text-base text-[#6E6E73] max-w-lg mx-auto mt-4 leading-relaxed">
            Claim your custom Replyto.me handle today. Zero upfront cost, 1-click Google sign in, and active in under 60 seconds.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handle1ClickGoogle}
              disabled={googleLoading}
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white font-bold text-sm shadow-[0_4px_16px_rgba(0,113,227,0.35)] transition-all apple-btn flex items-center justify-center gap-2"
            >
              {googleLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#FFFFFF"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#FFFFFF"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FFFFFF"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#FFFFFF"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              )}
              <span>{googleLoading ? "Connecting to Google..." : "Get Started Free with Google"}</span>
            </button>

            <Link
              href="/login"
              className="w-full sm:w-auto px-7 py-4 rounded-full bg-white hover:bg-zinc-100 text-[#1D1D1F] border border-[#E5E5EA] text-xs font-semibold transition-all apple-btn shadow-sm"
            >
              Sign In to Existing Account
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-[#E5E5EA] bg-white py-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-[#86868B]">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-lg bg-[#0071E3] text-white flex items-center justify-center font-bold text-[10px]">
              R
            </div>
            <span className="text-[#1D1D1F] font-semibold">Replyto.me</span>
            <span>— The intelligent link in bio for Instagram Reel creators.</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/aibyshivai" className="hover:text-[#1D1D1F] transition-colors">
              @aibyshivai
            </Link>
            <Link href="/login" className="hover:text-[#1D1D1F] transition-colors">
              Creator Login
            </Link>
            <span>© {new Date().getFullYear()} Replyto.me</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
