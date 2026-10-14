"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { InstagramIcon } from "@/components/icons/InstagramIcon";
import {
  Plus,
  LayoutDashboard,
  ExternalLink,
  Sparkles,
} from "lucide-react";

export const Navbar: React.FC = () => {
  const { userProfile } = useAuth();
  const displayName = userProfile?.displayName || "AI by Shivai";
  const avatarUrl = userProfile?.photoURL || "/avatar.png";
  const instagramUrl = userProfile?.instagramUrl || "https://www.instagram.com/aibyshivai/";

  return (
    <header className="sticky top-0 z-40 w-full frosted-nav transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand: Shivai's Avatar + Name */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-full overflow-hidden bg-[#F5F5F7] border border-[#E5E5EA] shadow-sm group-hover:scale-105 transition-transform flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={avatarUrl}
              alt={displayName}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm tracking-tight text-[#1D1D1F] flex items-center gap-1.5">
              <span>{displayName}</span>
              <span className="text-[10px] font-semibold bg-[#0071E3]/10 text-[#0071E3] px-1.5 py-0.2 rounded-full">
                Creator
              </span>
            </span>
            <span className="text-[11px] font-mono text-[#6E6E73] -mt-0.5">
              @aibyshivai
            </span>
          </div>
        </Link>

        {/* Center Links */}
        <nav className="hidden md:flex items-center gap-6 text-[13px] font-medium text-[#6E6E73]">
          <Link
            href="/#posts"
            className="hover:text-[#1D1D1F] transition-colors"
          >
            Resources & Posts
          </Link>
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#1D1D1F] transition-colors flex items-center gap-1.5"
          >
            <InstagramIcon className="w-3.5 h-3.5 text-[#E1306C]" />
            <span>@aibyshivai</span>
            <ExternalLink className="w-3 h-3 text-[#86868B]" />
          </a>
          <Link
            href="/dashboard"
            className="hover:text-[#1D1D1F] transition-colors flex items-center gap-1.5"
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-[#0071E3]" />
            <span>Dashboard</span>
          </Link>
        </nav>

        {/* Actions: Direct access to Dashboard & New Post */}
        <div className="flex items-center gap-2.5">
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#1D1D1F] bg-[#F5F5F7] hover:bg-[#EBEBED] border border-[#E5E5EA] transition-all apple-btn"
          >
            <InstagramIcon className="w-3.5 h-3.5 text-[#E1306C]" />
            <span>Instagram</span>
          </a>

          <Link
            href="/dashboard/new"
            className="apple-btn flex items-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold bg-[#0071E3] hover:bg-[#0077ED] text-white shadow-[0_2px_10px_rgba(0,113,227,0.3)]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New Post</span>
          </Link>
        </div>
      </div>
    </header>
  );
};
