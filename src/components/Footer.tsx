import React from "react";
import Link from "next/link";

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-[#E5E5EA] bg-[#F5F5F7] py-12 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-[#6E6E73]">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-lg bg-[#0071E3] flex items-center justify-center text-white font-bold text-[10px]">
            R
          </div>
          <span className="font-medium text-[#1D1D1F]">Replyto.me</span>
          <span>—</span>
          <span>Your link in bio, but smarter.</span>
        </div>

        <div className="flex items-center gap-6 text-[13px]">
          <Link href="/aibyshivai" className="hover:text-[#1D1D1F] transition-colors">
            @aibyshivai Bio
          </Link>
          <a
            href="https://www.instagram.com/aibyshivai/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#1D1D1F] transition-colors"
          >
            Instagram Profile
          </a>
          <span>Apple-grade design</span>
        </div>

        <div className="text-xs text-[#86868B]">
          © {new Date().getFullYear()} Replyto.me. Built for creators.
        </div>
      </div>
    </footer>
  );
};
