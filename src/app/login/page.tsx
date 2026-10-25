"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth, isInAppBrowser } from "@/context/AuthContext";
import {
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Loader2,
  Lock,
  User,
  ShieldAlert,
  Smartphone,
  ExternalLink,
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
    signInWithGoogleRedirect,
    signInWithCustomUser,
  } = useAuth();

  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [popupBlocked, setPopupBlocked] = useState(false);
  const [isInApp, setIsInApp] = useState(false);
  const [authErrorMessage, setAuthErrorMessage] = useState<string | null>(null);

  // Tab switch: "google" vs "direct"
  const [activeTab, setActiveTab] = useState<"google" | "direct">("google");

  // Custom user fields
  const [customName, setCustomName] = useState("");
  const [customHandle, setCustomHandle] = useState("");
  const [customInstagram, setCustomInstagram] = useState("");

  const queryHandle = searchParams.get("handle");

  // Detect in-app browser
  useEffect(() => {
    if (typeof window !== "undefined") {
      const inApp = isInAppBrowser();
      setIsInApp(inApp);
      if (inApp) {
        setActiveTab("direct");
      }
    }
  }, []);

  // Auto-route if already logged in or returning from Google redirect
  useEffect(() => {
    if (!authLoading && user) {
      if (!userProfile || !userProfile.username) {
        router.push("/onboarding");
      } else {
        router.push(redirectPath);
      }
    }
  }, [user, userProfile, authLoading, router, redirectPath]);

  useEffect(() => {
    if (queryHandle) {
      const clean = queryHandle.toLowerCase().replace(/[^a-z0-9._]/g, "");
      setCustomHandle(clean);
      setCustomInstagram(`https://instagram.com/${clean}`);
      setActiveTab("direct");
    }
  }, [queryHandle]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setAuthErrorMessage(null);
    setPopupBlocked(false);
    try {
      const result = await signInWithGoogle({ targetPath: redirectPath });
      if (result.redirecting) {
        setRedirecting(true);
        return;
      }
      if (result.success && result.user) {
        if (!result.profile || !result.profile.username) {
          router.push("/onboarding");
        } else {
          router.push(redirectPath);
        }
      } else if (result.popupBlocked) {
        setPopupBlocked(true);
      } else if (result.error && !result.cancelled && result.error !== "Popup closed") {
        if (result.error.toLowerCase().includes("popup")) {
          setPopupBlocked(true);
        } else {
          setAuthErrorMessage(result.error);
        }
      }
    } catch (err: any) {
      console.error("Sign in failed:", err);
      if (err?.code === "auth/popup-blocked" || err?.message?.toLowerCase().includes("popup")) {
        setPopupBlocked(true);
      } else {
        setAuthErrorMessage(err?.message || "Google sign-in failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRedirectLogin = async () => {
    setLoading(true);
    setRedirecting(true);
    setAuthErrorMessage(null);
    try {
      await signInWithGoogleRedirect({ targetPath: redirectPath });
    } catch (err: any) {
      console.error("Redirect sign-in failed:", err);
      setRedirecting(false);
      setLoading(false);
      setAuthErrorMessage(
        err?.message || "Failed to redirect to Google. Please check your internet connection or use Creator Sign-In."
      );
    }
  };

  const handleCustomLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customHandle.trim()) return;

    setLoading(true);
    setAuthErrorMessage(null);

    const cleanHandle = customHandle.trim().toLowerCase().replace(/[^a-z0-9._]/g, "");
    const cleanName = customName.trim() || cleanHandle;
    const cleanIg = customInstagram.trim() || `https://instagram.com/${cleanHandle}`;

    try {
      const res = await signInWithCustomUser({
        username: cleanHandle,
        displayName: cleanName,
        instagramUrl: cleanIg,
      });
      if (res && res.success) {
        router.push(redirectPath);
      }
    } catch (err: any) {
      console.error("Custom sign-in failed:", err);
      setAuthErrorMessage(err?.message || "Failed to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] flex flex-col justify-between selection:bg-[#0071E3]/15 selection:text-[#0071E3]">
      {/* Top minimal header */}
      <header className="w-full px-6 py-6 flex items-center justify-between max-w-5xl mx-auto">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-7 h-7 rounded-lg bg-[#0D82ED] flex items-center justify-center text-white font-bold text-xs shadow-sm">
            R
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
              Sign in to Replyto.me
            </h1>
            <p className="text-xs text-[#86868B] mt-1.5 leading-relaxed">
              Automate your bio, gate Reel prompts, and track conversions.
            </p>
          </div>

          {/* Instagram in-app browser detection notice */}
          {isInApp && (
            <div className="mb-6 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 flex items-start gap-2.5">
              <Smartphone className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Instagram In-App Browser Detected:</span>{" "}
                Google blocks OAuth popups inside Instagram. Use the Creator Handle tab below or open in Safari/Chrome.
              </div>
            </div>
          )}

          {/* Segmented Control / Apple Tabs */}
          <div className="p-1 rounded-full bg-[#F5F5F7] border border-black/[0.04] grid grid-cols-2 gap-1 mb-6 text-xs font-medium">
            <button
              type="button"
              onClick={() => setActiveTab("google")}
              className={`py-2 rounded-full transition-all text-center ${
                activeTab === "google"
                  ? "bg-white text-[#1D1D1F] shadow-sm font-semibold"
                  : "text-[#86868B] hover:text-[#1D1D1F]"
              }`}
            >
              Google Account
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("direct")}
              className={`py-2 rounded-full transition-all text-center ${
                activeTab === "direct"
                  ? "bg-white text-[#1D1D1F] shadow-sm font-semibold"
                  : "text-[#86868B] hover:text-[#1D1D1F]"
              }`}
            >
              Creator Handle
            </button>
          </div>

          {/* Error Message */}
          {authErrorMessage && (
            <div className="mb-6 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-700 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{authErrorMessage}</span>
            </div>
          )}

          {/* Tab 1: Google OAuth */}
          {activeTab === "google" && (
            <div className="space-y-4">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading || redirecting}
                className="w-full py-3 px-4 rounded-full bg-white hover:bg-[#F5F5F7] text-[#1D1D1F] border border-black/[0.12] text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-2.5 active:scale-[0.98] disabled:opacity-60"
              >
                {loading && !redirecting ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#0071E3]" />
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                )}
                <span>Continue with Google</span>
              </button>

              {popupBlocked && (
                <div className="p-4 rounded-2xl bg-[#F5F5F7] border border-black/[0.06] text-center space-y-2">
                  <p className="text-xs text-[#86868B]">
                    Popup was blocked by your browser. Use full redirect:
                  </p>
                  <button
                    type="button"
                    onClick={handleGoogleRedirectLogin}
                    disabled={redirecting}
                    className="w-full py-2.5 rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-semibold shadow-sm transition-all"
                  >
                    {redirecting ? "Redirecting to Google..." : "Continue with Full Page Redirect"}
                  </button>
                </div>
              )}

              <p className="text-[11px] text-center text-[#86868B] pt-2">
                By continuing, you agree to Replyto.me Terms of Service and Privacy Policy.
              </p>
            </div>
          )}

          {/* Tab 2: Creator Handle Instant Sign In */}
          {activeTab === "direct" && (
            <form onSubmit={handleCustomLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#1D1D1F] mb-1.5">
                  Creator Handle (@username)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-[#86868B]">
                    @
                  </span>
                  <input
                    type="text"
                    required
                    value={customHandle}
                    onChange={(e) => setCustomHandle(e.target.value.toLowerCase().replace(/[^a-z0-9._]/g, ""))}
                    placeholder="aibyshivai"
                    className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-[#F5F5F7] border border-black/[0.06] text-xs font-mono text-[#1D1D1F] placeholder-[#A1A1A6] focus:outline-none focus:bg-white focus:border-[#0071E3] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#1D1D1F] mb-1.5">
                  Display Name (Optional)
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="AI by Shivai"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F5F7] border border-black/[0.06] text-xs text-[#1D1D1F] placeholder-[#A1A1A6] focus:outline-none focus:bg-white focus:border-[#0071E3] transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !customHandle.trim()}
                className="btn-lime w-full justify-center py-3.5 text-xs font-black disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                ) : (
                  <>
                    <span>Enter Creator Studio</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </>
                )}
              </button>

              <p className="text-[11px] text-center text-[#7E828A] pt-1">
                Instant access without OAuth passwords. Works in all mobile WebViews.
              </p>
            </form>
          )}
        </motion.div>
      </main>

      {/* Minimal Footer */}
      <footer className="w-full py-6 text-center text-xs text-[#7E828A]">
        Replyto.me • Smarter Link in Bio for Creators
      </footer>
    </div>
  );
}
