"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, ExternalLink } from "lucide-react";
import { InstagramIcon } from "@/components/icons/InstagramIcon";
import { motion } from "framer-motion";

interface BeACreatorCTAProps {
  className?: string;
  source?: string;
}

export const BeACreatorCTA: React.FC<BeACreatorCTAProps> = ({ className = "", source = "bio_page" }) => {
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
        <span>aibyshivai</span>
      </div>

      {/* Headline */}
      <h3 className="text-lg sm:text-xl font-bold tracking-tight text-[#0A0A0A]">
        Curated by @aibyshivai
      </h3>

      {/* Subtitle */}
      <p className="text-xs text-[#7E828A] max-w-sm mx-auto mt-1 leading-relaxed">
        Hollywood VFX prompts, 10-second continuous camera takes & automated creator toolkits.
      </p>

      {/* Action Buttons */}
      <div className="mt-5 flex items-center justify-center gap-3">
        <a
          href="https://www.instagram.com/creativeedits.mov/"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-lime text-xs py-2 px-4 shadow-sm flex items-center gap-1.5"
        >
          <InstagramIcon className="w-3.5 h-3.5 text-black" />
          <span>Follow @creativeedits.mov</span>
        </a>

        <Link
          href="/"
          className="py-2 px-4 rounded-full bg-white border border-black/[0.08] text-xs font-bold text-[#0A0A0A] hover:bg-black/5 transition-colors flex items-center gap-1.5 shadow-sm"
        >
          <span>Home</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Value Badges */}
      <div className="mt-5 pt-4 border-t border-black/[0.06] flex items-center justify-center gap-4 text-[11px] text-[#86868B]">
        <span>Verified AI Prompts</span>
        <span>•</span>
        <span>VFX Sequences</span>
        <span>•</span>
        <span>Instant Unlocks</span>
      </div>
    </motion.section>
  );
};
