import React from "react";
import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white text-[#1D1D1F] flex flex-col justify-between">
      <header className="h-16 border-b border-[#E5E5EA] flex items-center px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#0071E3] text-white flex items-center justify-center font-bold text-xs">
            R
          </div>
          <span className="font-semibold text-sm">Replyto.me</span>
        </Link>
      </header>

      <main className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-3xl bg-[#F5F5F7] border border-[#E5E5EA] flex items-center justify-center text-[#86868B] mx-auto mb-6">
          <Search className="w-8 h-8" />
        </div>

        <span className="text-xs font-mono font-bold text-[#0071E3] uppercase tracking-widest">
          404 Error
        </span>
        <h1 className="text-3xl font-bold tracking-tight text-[#1D1D1F] mt-2 mb-3">
          Page not found
        </h1>
        <p className="text-sm text-[#6E6E73] leading-relaxed mb-8">
          The link-in-bio page or post you are looking for doesn&apos;t exist, was moved, or has a typo in the URL.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#0071E3] text-white text-xs font-semibold hover:bg-[#0077ED] transition-all apple-btn shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>
          <Link
            href="/aibyshivai"
            className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#F5F5F7] text-[#1D1D1F] text-xs font-semibold hover:bg-[#EBEBED] transition-all border border-[#E5E5EA]"
          >
            Explore Shivai&apos;s Bio
          </Link>
        </div>
      </main>

      <footer className="py-6 text-center border-t border-[#E5E5EA] text-xs text-[#86868B]">
        Replyto.me — Your link in bio, but smarter.
      </footer>
    </div>
  );
}
