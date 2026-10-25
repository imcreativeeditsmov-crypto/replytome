"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";
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
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3 }}
      className={`relative overflow-hidden rounded-[24px] border border-black/[0.06] bg-[#F5F5F7] p-6 sm:p-8 text-center ${className}`}
    >
      {/* Pill Badge */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-black/[0.06] text-[#0D82ED] text-[10px] font-bold tracking-wider uppercase mb-2.5 shadow-sm">
        <Sparkles className="w-3 h-3 fill-[#0D82ED]" />
        <span>Replyto.me for Creators</span>
      </div>

      {/* Headline */}
      <h3 className="text-lg sm:text-xl font-bold tracking-tight text-[#0A0A0A]">
        Create your own link in bio
      </h3>

      {/* Subtitle */}
      <p className="text-xs text-[#7E828A] max-w-sm mx-auto mt-1 leading-relaxed">
        Gate prompts, Notion guides & files behind Instagram Reel comments in 30 seconds.
      </p>

      {/* Interactive Handle Claim Form */}
      <form onSubmit={handleSubmit} className="mt-4 max-w-sm mx-auto">
        <div className="flex items-center p-1 bg-white rounded-full border border-black/[0.08] shadow-sm focus-within:border-[#0D82ED] transition-all">
          <div className="flex items-center pl-3 text-xs text-[#7E828A] font-mono select-none flex-1 min-w-0">
            <span>replyto.me/</span>
            <input
              type="text"
              value={handle}
              onChange={(e) => setHandle(e.target.value.toLowerCase().replace(/\s+/g, ""))}
              placeholder="yourname"
              className="w-full bg-transparent text-xs text-[#0A0A0A] font-mono font-bold outline-none pl-0.5 placeholder:text-[#A1A1A6]"
            />
          </div>

          <button
            type="submit"
            className="btn-lime text-xs py-1.5 px-3.5 whitespace-nowrap shadow-none"
          >
            <span>Claim</span>
            <ArrowRight className="w-3 h-3 stroke-[2.5]" />
          </button>
        </div>
      </form>

      {/* Value Badges */}
      <div className="mt-5 pt-4 border-t border-black/[0.06] flex items-center justify-center gap-4 text-[11px] text-[#86868B]">
        <div className="flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#34C759]" />
          <span>Free Forever</span>
        </div>
        <span>•</span>
        <div className="flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#34C759]" />
          <span>No DM limits</span>
        </div>
        <span>•</span>
        <div className="flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#34C759]" />
          <span>Instant setup</span>
        </div>
      </div>
    </motion.section>
  );
};
