"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Loader2,
  Lock,
  User,
  ShieldCheck,
} from "lucide-react";
import { motion } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/dashboard";

  const {
    user,
    userProfile,
    loading: authLoading,
    signInWithGoogle,
    signInWithCustomUser,
    signInAsDemo,
    signOut,
  } = useAuth();

  const [loading, setLoading] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customHandle, setCustomHandle] = useState("");
  const [showCustomForm, setShowCustomForm] = useState(false);

  // Automatic smooth redirect to dashboard
  useEffect(() => {
    if (!authLoading && user && userProfile?.username) {
      router.push(redirectPath);
    }
  }, [user, userProfile, authLoading, redirectPath, router]);

  const handleEnterDashboard = () => {
    router.push(redirectPath);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const result = await signInWithGoogle();
      if (result.success) {
        if (!result.profile || !result.profile.username) {
          router.push("/onboarding");
        } else {
          router.push(redirectPath);
        }
      }
    } catch (err) {
      console.error("Sign in failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    try {
      const res = await signInAsDemo();
      if (res.success) {
        router.push(redirectPath);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCustomLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim() || !customHandle.trim()) return;

    setLoading(true);
    try {
      const res = await signInWithCustomUser({
        displayName: customName.trim(),
        username: customHandle.trim().toLowerCase().replace(/[^a-z0-9._]/g, ""),
      });
      if (res.success) {
        router.push(redirectPath);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex flex-col justify-between selection:bg-[#0071E3]/20">
      {/* Top minimal header */}
      <header className="w-full h-16 frosted-nav px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-7 h-7 rounded-xl bg-[#0071E3] flex items-center justify-center text-white font-bold text-xs shadow-sm group-hover:scale-105 transition-transform">
            R
          </div>
          <span className="font-semibold text-base tracking-tight text-[#1D1D1F]">
            Replyto<span className="text-[#0071E3]">.me</span>
          </span>
        </Link>

        <Link
          href="/"
          className="text-xs font-semibold text-[#6E6E73] hover:text-[#1D1D1F] transition-colors"
        >
          ← Back to home
        </Link>
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md bg-white rounded-[32px] p-7 sm:p-10 border border-[#E5E5EA] shadow-[0_12px_40px_rgba(0,0,0,0.06)]"
        >
          {/* Brand Icon Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-[#0071E3] text-white font-bold text-2xl flex items-center justify-center mx-auto mb-4 shadow-[0_4px_14px_rgba(0,113,227,0.35)]">
              R
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1D1D1F]">
              Sign in to Replyto.me
            </h1>
            <p className="text-xs sm:text-sm text-[#6E6E73] mt-1.5 leading-relaxed">
              Your link in bio, but smarter. Built for Instagram Reel creators.
            </p>
          </div>

          {/* If already signed in */}
          {user && (
            <div className="mb-6 p-4 rounded-2xl bg-[#F5F5F7] border border-[#E5E5EA] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-white border border-[#E5E5EA] flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={userProfile?.photoURL || user.photoURL || "/avatar.png"}
                    alt="Active User"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#1D1D1F] truncate">
                    {userProfile?.displayName || user.displayName || "AI by Shivai"}
                  </p>
                  <p className="text-[11px] text-[#0071E3] font-mono truncate">
                    @{userProfile?.username || "aibyshivai"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleEnterDashboard}
                  className="px-3 py-1.5 rounded-xl bg-[#0071E3] text-white text-xs font-semibold hover:bg-[#0077ED] transition-all apple-btn"
                >
                  Dashboard →
                </button>
              </div>
            </div>
          )}

          {/* Primary Action: Direct Workspace Access */}
          <div className="space-y-3.5">
            <button
              type="button"
              onClick={handleEnterDashboard}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-[#0071E3] hover:bg-[#0077ED] text-white font-semibold text-sm shadow-[0_4px_14px_rgba(0,113,227,0.25)] transition-all apple-btn disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>Enter Workspace as AI by Shivai</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            <Link
              href="/"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-[#F5F5F7] hover:bg-[#EBEBED] text-[#1D1D1F] font-semibold text-xs border border-[#E5E5EA] transition-all apple-btn"
            >
              <span>View Public Link in Bio</span>
            </Link>
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E5E5EA]" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-white text-[#86868B] font-medium">
                or try with your own handle
              </span>
            </div>
          </div>

          {/* Custom handle sign-in toggle */}
          {!showCustomForm ? (
            <button
              type="button"
              onClick={() => setShowCustomForm(true)}
              className="w-full py-2.5 px-4 rounded-2xl bg-[#F5F5F7] hover:bg-[#EBEBED] text-[#1D1D1F] text-xs font-semibold border border-[#E5E5EA] transition-all apple-btn"
            >
              Sign in with custom name & handle
            </button>
          ) : (
            <form onSubmit={handleCustomLogin} className="space-y-3 animate-in fade-in duration-200">
              <div>
                <label className="block text-xs font-semibold text-[#1D1D1F] mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  required
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F5F7] border border-[#E5E5EA] text-xs text-[#1D1D1F] focus:bg-white focus:border-[#0071E3] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1D1D1F] mb-1">
                  Username (Link handle)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#86868B] font-mono">
                    @
                  </span>
                  <input
                    type="text"
                    required
                    value={customHandle}
                    onChange={(e) => setCustomHandle(e.target.value.toLowerCase().replace(/\s+/g, ""))}
                    placeholder="sarahcreates"
                    className="w-full pl-7 pr-3.5 py-2.5 rounded-xl bg-[#F5F5F7] border border-[#E5E5EA] text-xs font-mono text-[#1D1D1F] focus:bg-white focus:border-[#0071E3] outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-[#1D1D1F] hover:bg-black text-white text-xs font-semibold transition-all apple-btn shadow-sm"
              >
                Enter as @{customHandle || "handle"}
              </button>
            </form>
          )}

          <div className="mt-6 pt-5 border-t border-[#E5E5EA] text-center">
            <p className="text-[11px] text-[#86868B]">
              By signing in, you agree to Replyto.me&apos;s clean creator terms. Zero spam, ever.
            </p>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="w-full py-6 text-center text-xs text-[#86868B] border-t border-[#E5E5EA]">
        Replyto.me — Apple-grade simplicity for creators.
      </footer>
    </div>
  );
}
