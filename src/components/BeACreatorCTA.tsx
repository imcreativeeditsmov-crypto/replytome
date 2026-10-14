"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, CheckCircle2, ShieldCheck, Zap } from "lucide-react";
import { motion } from "framer-motion";

interface BeACreatorCTAProps {
  className?: string;
  source?: string;
}

export const BeACreatorCTA: React.FC<BeACreatorCTAProps> = ({ className = "", source = "bio_page" }) => {
  const router = useRouter();
  const [handle, setHandle] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = handle.trim().toLowerCase().replace(/[^a-z0-9._]/g, "");
    if (clean) {
      router.push(`/login?handle=${encodeURIComponent(clean)}&redirect=/onboarding`);
    } else {
      router.push("/login?redirect=/onboarding");
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35 }}
      className={`relative overflow-hidden rounded-[28px] border border-[#E5E5EA] bg-gradient-to-b from-white via-[#FAFAFC] to-[#F5F5F7] p-6 sm:p-8 shadow-[0_10px_36px_rgba(0,0,0,0.05)] text-center ${className}`}
    >
      {/* Decorative ambient background blur */}
      <div className="absolute -top-16 -right-16 w-36 h-36 bg-[#0071E3]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Pill Badge */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0071E3]/10 text-[#0071E3] text-[11px] font-bold tracking-wide uppercase mb-3">
        <Sparkles className="w-3.5 h-3.5" />
        <span>Be a Creator on Replyto.me</span>
      </div>

      {/* Headline */}
      <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1D1D1F]">
        Create your own link in bio
      </h3>

      {/* Subtitle */}
      <p className="text-xs sm:text-sm text-[#6E6E73] max-w-md mx-auto mt-2 leading-relaxed">
        Lock prompts, guides & files behind Instagram Reel comments. Convert viewers into loyal followers with zero effort.
      </p>

      {/* Interactive Handle Claim Form */}
      <form onSubmit={handleSubmit} className="mt-5 max-w-md mx-auto">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-1.5 bg-white rounded-2xl border border-[#E5E5EA] shadow-sm focus-within:border-[#0071E3] focus-within:ring-2 focus-within:ring-[#0071E3]/20 transition-all">
          <div className="flex items-center pl-3.5 text-xs text-[#86868B] font-mono select-none">
            <span>replyto.me/</span>
            <input
              type="text"
              value={handle}
              onChange={(e) => setHandle(e.target.value.toLowerCase().replace(/\s+/g, ""))}
              placeholder="yourname"
              className="w-full sm:w-32 bg-transparent text-xs text-[#1D1D1F] font-mono outline-none pl-0.5 placeholder:text-[#AEAEB2]"
            />
          </div>

          <button
            type="submit"
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-semibold shadow-[0_2px_10px_rgba(0,113,227,0.3)] transition-all apple-btn whitespace-nowrap"
          >
            <span>Claim Free Link</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>

      {/* Quick Google Sign In Alternate */}
      <div className="mt-3.5 flex items-center justify-center gap-2">
        <span className="text-[11px] text-[#86868B]">Already have an account?</span>
        <Link
          href="/login"
          className="text-[11px] font-semibold text-[#0071E3] hover:underline"
        >
          Sign in →
        </Link>
      </div>

      {/* Value Badges */}
      <div className="mt-6 pt-5 border-t border-[#E5E5EA] flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] text-[#6E6E73]">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#34C759]" />
          <span>100% Free Forever</span>
        </div>
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#34C759]" />
          <span>Reel Comment Lock</span>
        </div>
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#34C759]" />
          <span>Instant Google Setup</span>
        </div>
      </div>
    </motion.section>
  );
};
