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
  Sliders,
  CheckCircle2,
  Users,
  Eye,
  Terminal,
  Smartphone,
  Play,
  Share2,
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
      if (res.success && res.user) {
        if (!res.profile || !res.profile.username) {
          router.push("/onboarding");
        } else {
          router.push("/dashboard");
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-[#F5F5F7] selection:bg-[#0071E3]/40 selection:text-white flex flex-col font-sans overflow-x-hidden">
      {/* Background Ambient Glow Accents */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[550px] bg-gradient-to-b from-[#0071E3]/25 via-[#5856D6]/15 to-transparent blur-[140px] rounded-full" />
        <div className="absolute top-[800px] -right-40 w-[600px] h-[600px] bg-gradient-to-br from-[#E1306C]/15 to-transparent blur-[150px] rounded-full" />
        <div className="absolute top-[1800px] -left-40 w-[600px] h-[600px] bg-gradient-to-tr from-[#0071E3]/15 to-transparent blur-[150px] rounded-full" />
      </div>

      {/* Modern Frosted Header */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-[#0A0A0C]/80 border-b border-white/[0.08] transition-all">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#0071E3] to-[#0051B3] flex items-center justify-center text-white font-bold text-sm shadow-[0_0_20px_rgba(0,113,227,0.5)] group-hover:scale-105 transition-transform">
              R
            </div>
            <span className="font-bold text-lg tracking-tight text-white">
              Replyto<span className="text-[#2997FF]">.me</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-white/70">
            <a href="#how-it-works" className="hover:text-white transition-colors">
              How It Works
            </a>
            <a href="#demo" className="hover:text-white transition-colors">
              Live Demo
            </a>
            <a href="#features" className="hover:text-white transition-colors">
              Features
            </a>
            <a href="#creators" className="hover:text-white transition-colors">
              Top Creators
            </a>
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard"
                  className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/15 text-white text-xs font-semibold border border-white/15 transition-all flex items-center gap-2"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={userProfile?.photoURL || user.photoURL || "/avatar.png"}
                    alt="User"
                    className="w-4 h-4 rounded-full object-cover"
                  />
                  <span>Dashboard</span>
                  <ArrowRight className="w-3 h-3 text-[#2997FF]" />
                </Link>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-xs font-medium text-white/80 hover:text-white px-3 py-1.5 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/login"
                  className="px-4 py-2 rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-semibold shadow-[0_0_25px_rgba(0,113,227,0.45)] hover:shadow-[0_0_35px_rgba(0,113,227,0.6)] transition-all apple-btn"
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
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.12] backdrop-blur-md mb-6 shadow-sm"
        >
          <span className="flex h-2 w-2 rounded-full bg-[#34C759] animate-pulse" />
          <span className="text-[11px] font-semibold tracking-wide text-white/90 uppercase">
            The #1 Link in Bio Built for Instagram Reels
          </span>
          <span className="text-white/40">•</span>
          <span className="text-[11px] font-medium text-[#2997FF]">100% Free</span>
        </motion.div>

        {/* Hero Title */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.08] max-w-4xl mx-auto"
        >
          Turn Reel Comments into{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#2997FF] via-[#A855F7] to-[#EC4899]">
            Viral Conversions.
          </span>
        </motion.h1>

        {/* Hero Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-base sm:text-xl text-white/70 max-w-2xl mx-auto mt-6 leading-relaxed"
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
            className="p-1.5 rounded-2xl bg-white/[0.07] border border-white/20 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex items-center gap-1.5 focus-within:border-[#2997FF] focus-within:ring-2 focus-within:ring-[#2997FF]/20 transition-all"
          >
            <div className="pl-3.5 pr-1 flex items-center text-sm font-mono text-white/50 select-none">
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
              className="flex-1 min-w-0 bg-transparent py-2.5 text-sm font-semibold text-white placeholder-white/30 focus:outline-none font-mono"
            />
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#0071E3] to-[#2997FF] text-white font-semibold text-xs whitespace-nowrap shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <span>Claim Handle</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {handleError && (
            <p className="text-xs text-[#FF453A] mt-2 font-medium">{handleError}</p>
          )}

          {/* Quick Google 1-Click Alternate */}
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-3 text-xs text-white/60">
            <button
              type="button"
              onClick={handle1ClickGoogle}
              disabled={googleLoading}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-white transition-all"
            >
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
              <span>{googleLoading ? "Connecting..." : "Or continue with Google"}</span>
            </button>
            <span className="hidden sm:inline">•</span>
            <span>⚡ Instant 1-click setup • No credit card</span>
          </div>
        </motion.div>
      </section>

      {/* STATS TICKER */}
      <section className="relative z-10 border-y border-white/[0.08] bg-white/[0.02] py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          <div>
            <p className="text-2xl sm:text-3xl font-extrabold text-white">10x</p>
            <p className="text-xs text-white/50 mt-1 uppercase tracking-wider font-medium">
              Comment Engagement
            </p>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-extrabold text-[#2997FF]">98.4%</p>
            <p className="text-xs text-white/50 mt-1 uppercase tracking-wider font-medium">
              Unlock Rate
            </p>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-extrabold text-white">1.2M+</p>
            <p className="text-xs text-white/50 mt-1 uppercase tracking-wider font-medium">
              Prompts Delivered
            </p>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-extrabold text-[#34C759]">&lt; 0.2s</p>
            <p className="text-xs text-white/50 mt-1 uppercase tracking-wider font-medium">
              Instant Bio Speed
            </p>
          </div>
        </div>
      </section>

      {/* INTERACTIVE LIVE REEL UNLOCK SIMULATOR (THE CRAZY DEMO) */}
      <section id="demo" className="relative z-10 py-20 px-4 sm:px-6 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-xs font-bold text-[#2997FF] uppercase tracking-wider">
            Interactive Experience
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mt-2">
            See how Comment Gating works in real life
          </h2>
          <p className="text-sm text-white/60 max-w-lg mx-auto mt-2">
            Try unlocking this live resource by typing the Reel keyword{" "}
            <span className="font-mono text-white font-bold bg-white/10 px-2 py-0.5 rounded">
              CAFE
            </span>{" "}
            below.
          </p>
        </div>

        {/* Two-Column Simulator Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-white/[0.04] border border-white/[0.1] rounded-[32px] p-6 sm:p-10 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
          {/* Left Column: Simulated Instagram Reel */}
          <div className="relative rounded-3xl overflow-hidden border border-white/[0.12] bg-[#121214] shadow-2xl">
            {/* Phone Header Mockup */}
            <div className="p-3.5 bg-black/60 border-b border-white/[0.08] flex items-center justify-between">
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
                <div className="mt-3 flex items-center gap-2 text-[10px] font-semibold text-white/70">
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
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#0071E3]/20 text-[#2997FF] border border-[#0071E3]/30">
                REPLYTO.ME CONTENT GATE
              </span>
              <span className="text-xs text-white/40">Live Demo</span>
            </div>

            <h3 className="text-2xl font-bold text-white tracking-tight">
              Cafe Build VFX Prompt Pack
            </h3>
            <p className="text-xs text-white/60 mt-1">
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
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white text-black text-xs font-bold shadow-md hover:bg-zinc-200 transition-all apple-btn"
                    >
                      {copiedPrompt ? <Check className="w-3.5 h-3.5 text-[#34C759]" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedPrompt ? "Copied!" : "Copy Prompt"}</span>
                    </button>
                  </div>

                  <div className="p-3.5 rounded-xl bg-black/60 border border-white/10 font-mono text-[11px] text-white/90 max-h-36 overflow-y-auto leading-relaxed">
                    RESTAURANT VFX BUILD — 10-SECOND ONE-TAKE FPV<br />
                    USE THE UPLOADED REFERENCE IMAGE AS THE FINAL ARCHITECTURAL AND INTERIOR DESIGN TARGET ONLY.<br />
                    At 00:00, the restaurant interior is completely empty. The entire 10 seconds must be captured by one uninterrupted FPV camera movement.
                  </div>

                  <p className="text-[11px] text-[#34C759] mt-3 font-medium">
                    ✨ This is what your Reel viewers experience in 1 second!
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="locked"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="mt-6 p-5 rounded-2xl bg-white/[0.05] border border-white/10"
                >
                  <div className="flex items-center gap-2 text-amber-400 mb-2">
                    <Lock className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">
                      Locked Content Gate
                    </span>
                  </div>
                  <p className="text-xs text-white/70 leading-relaxed mb-4">
                    Comment <span className="font-bold text-white bg-white/10 px-1.5 py-0.5 rounded">CAFE</span> on Instagram to unlock the full prompt & workflow!
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
                        className="flex-1 px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/20 text-xs font-mono text-white placeholder-white/30 focus:outline-none focus:border-[#2997FF]"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2.5 rounded-xl bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-semibold shadow-md apple-btn whitespace-nowrap"
                      >
                        Unlock Now →
                      </button>
                    </div>

                    {demoError && (
                      <p className="text-xs text-[#FF453A] font-medium">
                        Try entering &quot;CAFE&quot; (case-insensitive) to simulate unlocking!
                      </p>
                    )}
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-5 pt-4 border-t border-white/[0.08] flex items-center justify-between text-xs text-white/50">
              <span>Try it with your own keyword</span>
              <Link href="/login" className="text-[#2997FF] hover:underline font-semibold">
                Create Free Link →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3-STEP VIRAL ENGINE */}
      <section id="how-it-works" className="relative z-10 py-20 px-4 sm:px-6 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-xs font-bold text-[#2997FF] uppercase tracking-wider">
            How It Works
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mt-2">
            The 3-Step Viral Loop for Instagram Creators
          </h2>
          <p className="text-sm text-white/60 max-w-md mx-auto mt-2">
            From zero to thousands of qualified reel comments that trick the algorithm into pushing your content.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="p-7 rounded-3xl bg-white/[0.04] border border-white/[0.08] hover:border-[#0071E3]/50 transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-[#0071E3]/15 text-[#2997FF] border border-[#0071E3]/30 flex items-center justify-center font-bold text-lg mb-5 group-hover:scale-110 transition-transform">
              1
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              Create & Lock Content
            </h3>
            <p className="text-xs text-white/60 mt-2.5 leading-relaxed">
              Add multiple copyable text blocks (prompts, scripts, Notion templates), upload your hero preview photos, and set a custom trigger keyword.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-7 rounded-3xl bg-white/[0.04] border border-white/[0.08] hover:border-purple-500/50 transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/15 text-purple-400 border border-purple-500/30 flex items-center justify-center font-bold text-lg mb-5 group-hover:scale-110 transition-transform">
              2
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              Tell Viewers to Comment
            </h3>
            <p className="text-xs text-white/60 mt-2.5 leading-relaxed">
              In your Instagram Reel caption or on-screen text, say: &quot;Comment CAFE and tap link in bio for the complete workflow.&quot;
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-7 rounded-3xl bg-white/[0.04] border border-white/[0.08] hover:border-[#34C759]/50 transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-[#34C759]/15 text-[#34C759] border border-[#34C759]/30 flex items-center justify-center font-bold text-lg mb-5 group-hover:scale-110 transition-transform">
              3
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              Explode in Algorithm
            </h3>
            <p className="text-xs text-white/60 mt-2.5 leading-relaxed">
              Instagram sees massive authentic comment velocity and sends your Reel to Explore. Replyto.me verifies and delivers the resources instantly.
            </p>
          </div>
        </div>
      </section>

      {/* FEATURES BENTO GRID */}
      <section id="features" className="relative z-10 py-20 px-4 sm:px-6 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-xs font-bold text-[#2997FF] uppercase tracking-wider">
            Features
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mt-2">
            Engineered for high-performing creators
          </h2>
          <p className="text-sm text-white/60 max-w-md mx-auto mt-2">
            Everything you need to turn casual reel viewers into loyal fans and subscribers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Bento Card 1: Multi-Block Text */}
          <div className="md:col-span-2 p-8 rounded-3xl bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-white/[0.1] relative overflow-hidden group">
            <div className="w-10 h-10 rounded-2xl bg-[#0071E3]/20 text-[#2997FF] flex items-center justify-center mb-4">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              Multi-Block Copyable Resources
            </h3>
            <p className="text-xs text-white/70 mt-2 max-w-md leading-relaxed">
              No more messy caption cut-offs. Structure Midjourney prompts, ChatGPT instructions, and code blocks into neat, individually copyable cards.
            </p>
            <div className="mt-6 p-4 rounded-2xl bg-black/50 border border-white/10 flex items-center justify-between font-mono text-xs text-white/80">
              <span className="truncate pr-4">cinematic 8k lighting --v 6.1 --ar 16:9</span>
              <span className="px-2.5 py-1 rounded-lg bg-white/10 text-[10px] font-bold text-[#2997FF]">
                1-Click Copy
              </span>
            </div>
          </div>

          {/* Bento Card 2: Automatic Gate Verification */}
          <div className="p-8 rounded-3xl bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-white/[0.1] relative overflow-hidden">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              Keyword Gating
            </h3>
            <p className="text-xs text-white/70 mt-2 leading-relaxed">
              Lock prompt text, direct downloads, or both behind your custom secret word.
            </p>
            <div className="mt-6 flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-mono font-bold">
                KEYWORD: CAFE
              </span>
            </div>
          </div>

          {/* Bento Card 3: Deep Analytics */}
          <div className="p-8 rounded-3xl bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-white/[0.1] relative overflow-hidden">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-4">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              Real-time Analytics
            </h3>
            <p className="text-xs text-white/70 mt-2 leading-relaxed">
              Track link views, unlock conversion rates, and clipboard copy statistics right in your dashboard.
            </p>
          </div>

          {/* Bento Card 4: Apple-Grade Bio Experience */}
          <div className="md:col-span-2 p-8 rounded-3xl bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-white/[0.1] relative overflow-hidden">
            <div className="w-10 h-10 rounded-2xl bg-[#34C759]/20 text-[#34C759] flex items-center justify-center mb-4">
              <Smartphone className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              Apple-Grade Mobile Speed & Clean Design
            </h3>
            <p className="text-xs text-white/70 mt-2 max-w-md leading-relaxed">
              Zero lag, zero cookie popups, zero intrusive ads. Your profile loads in less than 200ms on all mobile devices with native Instagram in-app browser optimization.
            </p>
          </div>
        </div>
      </section>

      {/* FEATURED CREATOR SPOTLIGHT */}
      <section id="creators" className="relative z-10 py-20 px-4 sm:px-6 max-w-5xl mx-auto">
        <div className="p-8 sm:p-12 rounded-[36px] bg-gradient-to-r from-white/[0.08] via-white/[0.04] to-transparent border border-white/[0.12] backdrop-blur-2xl flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
          <div className="flex items-center gap-5">
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-white/20 p-1 bg-white/10 shadow-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/avatar.png"
                  alt="AI by Shivai"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <div className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-gradient-to-tr from-[#FD1D1D] to-[#833AB4] flex items-center justify-center text-white border-2 border-[#0A0A0C]">
                <InstagramIcon className="w-3.5 h-3.5" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#2997FF] uppercase tracking-wider">
                  Featured Top Creator
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#34C759]/20 text-[#34C759]">
                  Verified
                </span>
              </div>
              <h3 className="text-2xl font-bold text-white tracking-tight mt-0.5">
                AI by Shivai
              </h3>
              <p className="text-xs font-mono text-white/50">@aibyshivai</p>
              <p className="text-xs text-white/70 max-w-md mt-2 line-clamp-2">
                AI tools, viral prompts & automated creator workflows. Comment on Instagram Reels to unlock exclusive copyable resources.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <Link
              href="/aibyshivai"
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-white text-black text-xs font-bold shadow-lg hover:bg-zinc-200 transition-all apple-btn flex items-center justify-center gap-2"
            >
              <span>View Shivai&apos;s Live Bio</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/aibyshivai/cafe-build-prompt"
              className="w-full sm:w-auto px-5 py-3 rounded-full bg-white/10 hover:bg-white/15 text-white border border-white/15 text-xs font-semibold transition-all apple-btn flex items-center justify-center gap-1.5"
            >
              <span>Cafe Prompt Post</span>
              <ChevronRight className="w-3.5 h-3.5 text-white/60" />
            </Link>
          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION (CTA) */}
      <section className="relative z-10 py-24 px-4 sm:px-6 max-w-4xl mx-auto text-center">
        <div className="p-10 sm:p-16 rounded-[40px] bg-gradient-to-b from-[#0071E3]/25 via-white/[0.04] to-transparent border border-[#0071E3]/30 backdrop-blur-3xl shadow-[0_20px_80px_rgba(0,113,227,0.2)]">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Ready to 10x your Instagram reel engagement?
          </h2>
          <p className="text-sm sm:text-base text-white/70 max-w-lg mx-auto mt-4 leading-relaxed">
            Claim your custom Replyto.me handle today. Zero upfront cost, 1-click Google sign in, and active in under 60 seconds.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handle1ClickGoogle}
              disabled={googleLoading}
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-[#0071E3] to-[#2997FF] hover:brightness-110 text-white font-bold text-sm shadow-[0_0_35px_rgba(0,113,227,0.5)] transition-all apple-btn flex items-center justify-center gap-2"
            >
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
              <span>{googleLoading ? "Connecting..." : "Get Started Free with Google"}</span>
            </button>

            <Link
              href="/login"
              className="w-full sm:w-auto px-7 py-4 rounded-full bg-white/10 hover:bg-white/15 text-white border border-white/20 text-xs font-semibold transition-all apple-btn"
            >
              Sign In to Existing Account
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-white/[0.08] bg-[#0A0A0C] py-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-white/50">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-lg bg-[#0071E3] text-white flex items-center justify-center font-bold text-[10px]">
              R
            </div>
            <span className="text-white/80 font-semibold">Replyto.me</span>
            <span>— The intelligent link in bio for Instagram Reel creators.</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/aibyshivai" className="hover:text-white transition-colors">
              @aibyshivai
            </Link>
            <Link href="/login" className="hover:text-white transition-colors">
              Creator Login
            </Link>
            <span>© {new Date().getFullYear()} Replyto.me</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
