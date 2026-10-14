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
  LogOut,
} from "lucide-react";
import { motion } from "framer-motion";
import { InstagramIcon } from "@/components/icons/InstagramIcon";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/dashboard";

  const {
    user,
    userProfile,
    loading: authLoading,
    isAdmin,
    signInWithGoogle,
    signInWithCustomUser,
    signInAsDemo,
    signOut,
  } = useAuth();

  const [loading, setLoading] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customHandle, setCustomHandle] = useState("");
  const [customInstagram, setCustomInstagram] = useState("");
  const [showCustomForm, setShowCustomForm] = useState(false);

  const queryHandle = searchParams.get("handle");

  useEffect(() => {
    if (queryHandle) {
      const clean = queryHandle.toLowerCase().replace(/[^a-z0-9._]/g, "");
      setCustomHandle(clean);
      setCustomInstagram(`https://instagram.com/${clean}`);
      setShowCustomForm(true);
    }
  }, [queryHandle]);

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
      let finalIg = customInstagram.trim();
      if (finalIg) {
        if (!finalIg.startsWith("http://") && !finalIg.startsWith("https://")) {
          finalIg = `https://instagram.com/${finalIg.replace(/^@/, "")}`;
        }
      } else {
        finalIg = `https://instagram.com/${customHandle.trim().toLowerCase()}`;
      }

      const res = await signInWithCustomUser({
        displayName: customName.trim(),
        username: customHandle.trim().toLowerCase().replace(/[^a-z0-9._]/g, ""),
        instagramUrl: finalIg,
      });
      if (res.success) {
        router.push(redirectPath);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
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
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold text-[#1D1D1F] truncate">
                      {userProfile?.displayName || user.displayName || "AI by Shivai"}
                    </p>
                    {isAdmin && (
                      <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-amber-500/20 text-amber-800">
                        Admin
                      </span>
                    )}
                  </div>
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
                <button
                  onClick={handleSignOut}
                  title="Sign out of current account"
                  className="p-1.5 rounded-xl bg-white border border-[#E5E5EA] text-[#6E6E73] hover:text-[#FF3B30] transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Primary Action 1: Continue with Google */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-2xl bg-white hover:bg-[#F5F5F7] text-[#1D1D1F] font-semibold text-sm border border-[#E5E5EA] shadow-sm transition-all apple-btn disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
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
              <span>Continue with Google</span>
            </button>

            {/* Primary Action 2: Admin Quick Sign-In */}
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-white hover:bg-amber-500/15 text-[#1D1D1F] font-semibold text-xs border border-amber-500/30 transition-all apple-btn"
            >
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>Sign in as Admin (@aibyshivai)</span>
              <ArrowRight className="w-3.5 h-3.5 ml-0.5 text-amber-700" />
            </button>

            <Link
              href="/"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-[#F5F5F7] hover:bg-[#EBEBED] text-[#1D1D1F] font-semibold text-xs border border-[#E5E5EA] transition-all apple-btn"
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
                or setup a custom creator profile
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
              Create custom account with handle & Instagram
            </button>
          ) : (
            <form onSubmit={handleCustomLogin} className="space-y-3 animate-in fade-in duration-200">
              <div>
                <label className="block text-xs font-semibold text-[#1D1D1F] mb-1">
                  Your Display Name
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
                  Username (Bio link handle)
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

              <div>
                <label className="block text-xs font-semibold text-[#1D1D1F] mb-1">
                  Instagram Profile Link
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-500">
                    <InstagramIcon className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="text"
                    value={customInstagram}
                    onChange={(e) => setCustomInstagram(e.target.value)}
                    placeholder="https://instagram.com/sarahcreates"
                    className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-[#F5F5F7] border border-[#E5E5EA] text-xs text-[#1D1D1F] focus:bg-white focus:border-[#0071E3] outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-semibold transition-all apple-btn shadow-sm"
              >
                Launch workspace as @{customHandle || "handle"}
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
