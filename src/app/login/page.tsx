"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth, isInAppBrowser } from "@/context/AuthContext";
import {
  Sparkles,
  Loader2,
  Lock,
  ShieldAlert,
  Smartphone,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { motion } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/dashboard";
  const queryHandle = searchParams.get("handle");

  const {
    user,
    userProfile,
    loading: authLoading,
    signInWithGoogle,
    signInWithCustomUser,
  } = useAuth();

  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [popupBlocked, setPopupBlocked] = useState(false);
  const [isInApp, setIsInApp] = useState(false);
  const [isUnauthorizedDomain, setIsUnauthorizedDomain] = useState(false);
  const [authErrorMessage, setAuthErrorMessage] = useState<string | null>(null);

  // If handle passed in query, persist for onboarding
  useEffect(() => {
    if (queryHandle && typeof window !== "undefined") {
      const clean = queryHandle.toLowerCase().replace(/[^a-z0-9._]/g, "");
      try {
        localStorage.setItem("replyto_claimed_handle", clean);
      } catch {}
    }
  }, [queryHandle]);

  // Detect in-app browser (Instagram/TikTok/FB)
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsInApp(isInAppBrowser());
    }
  }, []);

  // Auto-route if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      setRedirecting(true);
      const isOwner = user.email?.toLowerCase().trim() === "aibyshivai@gmail.com" || user.email?.toLowerCase().includes("aibyshivai");
      const dest = isOwner
        ? (redirectPath || "/dashboard")
        : (!userProfile || !userProfile.username) ? "/onboarding" : redirectPath;
      router.push(dest);
      if (typeof window !== "undefined") {
        setTimeout(() => {
          if (window.location.pathname === "/login") {
            window.location.href = dest;
          }
        }, 400);
      }
    }
  }, [user, userProfile, authLoading, redirectPath, router]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setAuthErrorMessage(null);
    setPopupBlocked(false);
    try {
      const result = await signInWithGoogle({
        useRedirect: isInApp,
        targetPath: redirectPath,
      });

      if (result.success && result.user) {
        setRedirecting(true);
        const isOwner = result.user.email?.toLowerCase().trim() === "aibyshivai@gmail.com";
        const dest = isOwner
          ? (redirectPath || "/dashboard")
          : (!result.profile || !result.profile.username) ? "/onboarding" : redirectPath;
        router.push(dest);
        setTimeout(() => {
          if (typeof window !== "undefined" && window.location.pathname === "/login") {
            window.location.href = dest;
          }
        }, 600);
        return;
      } else if (result.redirecting) {
        setRedirecting(true);
        return;
      } else if (result.popupBlocked) {
        setRedirecting(true);
        await signInWithGoogle({ useRedirect: true, targetPath: redirectPath });
        return;
      } else if (result.error && !result.cancelled && result.error !== "Popup closed") {
        if (
          result.error.toLowerCase().includes("unauthorized-domain") ||
          result.error.toLowerCase().includes("unauthorized domain")
        ) {
          setIsUnauthorizedDomain(true);
        } else {
          setAuthErrorMessage(result.error);
        }
      }
    } catch (err: any) {
      console.error("Sign in failed:", err);
      if (
        err?.code === "auth/unauthorized-domain" ||
        err?.message?.toLowerCase().includes("unauthorized-domain")
      ) {
        setIsUnauthorizedDomain(true);
      } else if (err?.code === "auth/popup-blocked") {
        setRedirecting(true);
        await signInWithGoogle({ useRedirect: true, targetPath: redirectPath });
      } else {
        setAuthErrorMessage(err?.message || "Google sign-in failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] flex flex-col justify-between selection:bg-[#0D82ED]/15 selection:text-[#0D82ED]">
      {/* Top minimal header */}
      <header className="w-full px-6 py-6 flex items-center justify-between max-w-5xl mx-auto">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded-lg bg-[#0D82ED] flex items-center justify-center text-white font-bold text-xs shadow-sm">
            <svg
              className="w-4 h-4 fill-current"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 2L2 22h20L12 2zm0 5l6.5 13H5.5L12 7z" />
            </svg>
          </div>
          <span className="font-extrabold text-base tracking-tight text-[#0A0A0A]">
            Replyto<span className="text-[#0D82ED]">.me</span>
          </span>
        </Link>

        <Link
          href="/"
          className="text-xs font-bold uppercase tracking-wider text-[#7E828A] hover:text-[#0A0A0A] transition-colors"
        >
          Back to Home
        </Link>
      </header>

      {/* Main Auth Card */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md bg-white rounded-[28px] border border-black/[0.08] shadow-[0_12px_40px_rgba(0,0,0,0.06)] p-8 sm:p-10"
        >
          {/* Card Header */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-[#0D82ED]/10 border border-[#0D82ED]/20 flex items-center justify-center text-[#0D82ED] mx-auto mb-4 shadow-sm">
              <Lock className="w-5 h-5 text-[#0D82ED]" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-[#0A0A0A]">
              Sign in with Google
            </h1>
            <p className="text-xs text-[#86868B] mt-1.5 leading-relaxed">
              1-click access to your creator dashboard, keyword gates, and links.
            </p>
          </div>

          {/* Reserved Handle Banner if coming from claim input */}
          {queryHandle && (
            <div className="mb-6 p-3.5 rounded-2xl bg-[#0D82ED]/10 border border-[#0D82ED]/20 text-xs text-[#0D82ED] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#0D82ED]" />
                <span>
                  Reserving handle: <strong className="font-mono font-bold">@{queryHandle}</strong>
                </span>
              </div>
              <span className="text-[10px] bg-[#0D82ED] text-white px-2 py-0.5 rounded-full font-bold uppercase">
                Claim
              </span>
            </div>
          )}

          {/* Instagram in-app browser detection notice */}
          {isInApp && (
            <div className="mb-6 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 flex items-start gap-2.5">
              <Smartphone className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">In-App Browser Detected:</span>{" "}
                Tap below to continue with full Google redirect.
              </div>
            </div>
          )}

          {/* Unauthorized Domain Guidance Card */}
          {isUnauthorizedDomain && (
            <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-2.5">
              <div className="font-bold flex items-center gap-1.5 text-amber-900">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <span>1-Step Firebase Whitelist Required</span>
              </div>
              <p className="leading-relaxed text-[11px] text-amber-900/90">
                Google Firebase requires you to whitelist your Vercel domain in your Firebase Console.
              </p>
              <div className="p-2 rounded-lg bg-white/80 border border-amber-200/80 font-mono text-[10px] select-all">
                replytome-three.vercel.app
              </div>
              <a
                href="https://console.firebase.google.com/project/replytome/authentication/settings"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-colors shadow-sm"
              >
                <span>Add in Firebase Console ↗</span>
              </a>
            </div>
          )}

          {/* Error Message */}
          {authErrorMessage && !isUnauthorizedDomain && (
            <div className="mb-6 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-700 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{authErrorMessage}</span>
            </div>
          )}

          {/* Single Pure Google Auth Action */}
          <div className="space-y-4">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading || redirecting}
              className="w-full py-3.5 px-5 rounded-full bg-white hover:bg-[#F9FAFB] text-[#0A0A0A] border-2 border-black/[0.1] hover:border-black/[0.2] text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-60"
            >
              {loading || redirecting ? (
                <Loader2 className="w-4 h-4 animate-spin text-[#0D82ED]" />
              ) : (
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
              )}
              <span>
                {redirecting
                  ? "Redirecting to creator profile..."
                  : loading
                  ? "Connecting with Google..."
                  : "Continue with Google"}
              </span>
            </button>

            <div className="pt-2 text-center">
              <p className="text-[11px] text-[#86868B]">
                Fast, secure sign in powered by Google Firebase. No password required.
              </p>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Minimal Footer */}
      <footer className="w-full py-6 text-center text-xs text-[#7E828A]">
        Replyto.me • Smarter Link in Bio for Creators
      </footer>
    </div>
  );
}
