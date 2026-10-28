"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { verifyAdminPasscode, setAdminSessionUnlocked } from "@/lib/auth/adminCheck";
import {
  Sparkles,
  Loader2,
  Lock,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  KeyRound,
  AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const { user, userProfile, loading: authLoading } = useAuth();

  const [passcode, setPasscode] = useState("");
  const [passcodeError, setPasscodeError] = useState<string | null>(null);
  const [entering, setEntering] = useState(false);

  // Auto-route to /dashboard if logged in as owner
  useEffect(() => {
    if (!authLoading && user) {
      const timer = setTimeout(() => {
        router.push("/dashboard");
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [user, authLoading, router]);

  const handleOwnerDirectEntry = () => {
    setEntering(true);
    setAdminSessionUnlocked(true);
    router.push("/dashboard");
  };

  const handlePasscodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) {
      setPasscodeError("Please enter your owner passcode");
      return;
    }

    if (verifyAdminPasscode(passcode.trim())) {
      setAdminSessionUnlocked(true);
      setEntering(true);
      router.push("/dashboard");
    } else {
      setPasscodeError("Invalid passcode. Access restricted to @aibyshivai.");
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
            aibyshiv<span className="text-[#0D82ED]">ai</span>
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
            <div className="w-14 h-14 rounded-2xl bg-[#0D82ED]/10 border border-[#0D82ED]/20 flex items-center justify-center text-[#0D82ED] mx-auto mb-4 shadow-sm">
              <ShieldCheck className="w-7 h-7 text-[#0D82ED]" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-800 text-[10px] font-bold tracking-wider uppercase mb-3">
              <Sparkles className="w-3 h-3 text-amber-600 fill-amber-600" />
              <span>Owner Access Only</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-[#0A0A0A]">
              aibyshivai Dashboard
            </h1>
            <p className="text-xs text-[#86868B] mt-1.5 leading-relaxed">
              Public sign-ins are closed. This portal is exclusively for{" "}
              <strong className="text-[#0A0A0A]">@aibyshivai</strong>.
            </p>
          </div>

          {/* Quick Direct Owner Launch */}
          <div className="space-y-4">
            <button
              type="button"
              onClick={handleOwnerDirectEntry}
              disabled={entering}
              className="w-full btn-lime py-3.5 px-5 rounded-full text-xs font-black uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              {entering ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                  <span>Opening Dashboard...</span>
                </>
              ) : (
                <>
                  <span>Enter as ShivAI</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </>
              )}
            </button>

            {/* Passcode Unlock Form */}
            <div className="pt-4 border-t border-black/[0.06]">
              <form onSubmit={handlePasscodeSubmit} className="space-y-3">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#7E828A]">
                  Owner Passcode
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={passcode}
                    onChange={(e) => {
                      setPasscode(e.target.value);
                      setPasscodeError(null);
                    }}
                    placeholder="Enter owner passcode"
                    className="w-full px-4 py-3 rounded-xl bg-[#F5F5F7] border border-black/[0.08] text-xs font-mono outline-none focus:border-[#0D82ED] focus:bg-white transition-all pr-10"
                  />
                  <KeyRound className="w-4 h-4 text-[#A1A1A6] absolute right-3.5 top-1/2 -translate-y-1/2" />
                </div>

                {passcodeError && (
                  <p className="text-[11px] text-rose-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{passcodeError}</span>
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-[#0A0A0A] text-white hover:bg-[#222222] text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Unlock with Passcode</span>
                </button>
              </form>
            </div>

            <div className="pt-2 text-center">
              <p className="text-[11px] text-[#86868B]">
                Curated by @creativeedits.mov • All changes sync directly to live bio
              </p>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Minimal Footer */}
      <footer className="w-full py-6 text-center text-xs text-[#7E828A]">
        aibyshivai • Exclusive Creator Platform
      </footer>
    </div>
  );
}
