"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import {
  ExternalLink,
  Sparkles,
  LogOut,
  Menu,
  X,
  ChevronDown,
  LayoutDashboard,
  ArrowUpRight,
} from "lucide-react";
import { isAdminSessionUnlocked } from "@/lib/auth/adminCheck";

export const Navbar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, userProfile, isAdmin, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [adminUnlocked, setAdminUnlocked] = useState(false);

  const isHome = pathname === "/";
  const displayName = userProfile?.displayName || user?.displayName || "Creator";
  const avatarUrl = userProfile?.photoURL || user?.photoURL || "/avatar.png";

  useEffect(() => {
    setAdminUnlocked(isAdminSessionUnlocked());
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  // On home page top, navbar is translucent white-text over sky blue. On scroll or inner pages, crisp glass.
  const isTransparent = isHome && !scrolled;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isTransparent
          ? "bg-transparent py-4 text-white"
          : "bg-white/90 backdrop-blur-md border-b border-black/[0.06] py-3 text-[#0A0A0A] shadow-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 flex items-center justify-between">
        {/* Brand: Geometric origami-style logo matching Aeline */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105 ${
              isTransparent
                ? "bg-white text-[#0D82ED]"
                : "bg-[#0D82ED] text-white"
            }`}
          >
            {/* Origami delta geometric icon */}
            <svg
              className="w-4 h-4 fill-current"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 2L2 22h20L12 2zm0 5l6.5 13H5.5L12 7z" />
            </svg>
          </div>
          <span
            className={`font-extrabold text-base tracking-tight transition-colors ${
              isTransparent ? "text-white" : "text-[#0A0A0A]"
            }`}
          >
            Replyto<span className={isTransparent ? "text-[#D2F824]" : "text-[#0D82ED]"}>.me</span>
          </span>
        </Link>

        {/* Center Desktop Navigation: Uppercase, tracking-wider */}
        <nav
          className={`hidden md:flex items-center gap-8 text-[12px] font-bold uppercase tracking-widest transition-colors ${
            isTransparent ? "text-white/85" : "text-[#7E828A]"
          }`}
        >
          <Link
            href="/"
            className={`transition-colors ${
              isTransparent ? "hover:text-white" : "hover:text-[#0A0A0A]"
            }`}
          >
            Home
          </Link>
          <Link
            href="/#features"
            className={`transition-colors ${
              isTransparent ? "hover:text-white" : "hover:text-[#0A0A0A]"
            }`}
          >
            Services
          </Link>
          <Link
            href="/#about"
            className={`transition-colors ${
              isTransparent ? "hover:text-white" : "hover:text-[#0A0A0A]"
            }`}
          >
            About Us
          </Link>
          <Link
            href="/#demo"
            className={`transition-colors flex items-center gap-1 ${
              isTransparent ? "hover:text-white" : "hover:text-[#0A0A0A]"
            }`}
          >
            <span>Live Demo</span>
            <ChevronDown className="w-3 h-3 opacity-70" />
          </Link>

          {userProfile?.username && (
            <Link
              href={`/${userProfile.username}`}
              className={`transition-colors flex items-center gap-1 ${
                isTransparent ? "hover:text-white" : "hover:text-[#0A0A0A]"
              }`}
            >
              <span>My Bio</span>
              <ArrowUpRight className="w-3.5 h-3.5 opacity-80" />
            </Link>
          )}

          {(user?.email?.toLowerCase().trim() === "aibyshivai@gmail.com" || isAdmin) && (
            <Link
              href="/admin"
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-black shadow-sm hover:bg-amber-300 transition-all hover:scale-105"
            >
              <Sparkles className="w-3 h-3 fill-black" />
              <span>ADMIN</span>
            </Link>
          )}
        </nav>

        {/* Right CTA Button: Neon Lime Pill "GET STARTED" */}
        <div className="hidden sm:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard"
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                  isTransparent
                    ? "bg-white/15 text-white hover:bg-white/25 border border-white/20"
                    : "bg-[#F4F5F7] text-[#0A0A0A] hover:bg-[#EAEBED]"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={avatarUrl}
                  alt={displayName}
                  referrerPolicy="no-referrer"
                  crossOrigin="anonymous"
                  className="w-4 h-4 rounded-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/avatar.png";
                  }}
                />
                <span className="max-w-[100px] truncate">{displayName}</span>
              </Link>
              <button
                onClick={() => signOut()}
                className={`p-2 rounded-full transition-colors ${
                  isTransparent
                    ? "text-white/70 hover:text-white hover:bg-white/10"
                    : "text-[#7E828A] hover:text-[#0A0A0A] hover:bg-black/5"
                }`}
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className={`text-xs font-bold uppercase tracking-wider transition-colors mr-2 ${
                isTransparent
                  ? "text-white/90 hover:text-white"
                  : "text-[#7E828A] hover:text-[#0A0A0A]"
              }`}
            >
              Sign In
            </Link>
          )}

          <Link
            href={user ? "/dashboard" : "/login"}
            className="btn-lime text-xs font-black uppercase tracking-wider"
          >
            <span>{user ? "Dashboard" : "Get Started"}</span>
            <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </Link>
        </div>

        {/* Mobile menu trigger */}
        <div className="flex sm:hidden items-center gap-2">
          <Link
            href={user ? "/dashboard" : "/login"}
            className="btn-lime text-[11px] px-3.5 py-1.5"
          >
            Start
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`p-2 rounded-lg transition-colors ${
              isTransparent ? "text-white hover:bg-white/10" : "text-[#0A0A0A]"
            }`}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-white text-[#0A0A0A] border-b border-black/10 px-6 py-6 space-y-4 shadow-xl">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-bold uppercase tracking-wider text-[#0A0A0A]"
          >
            Home
          </Link>
          <Link
            href="/#features"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-bold uppercase tracking-wider text-[#7E828A]"
          >
            Services
          </Link>
          <Link
            href="/#about"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-bold uppercase tracking-wider text-[#7E828A]"
          >
            About Us
          </Link>
          <Link
            href="/#demo"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-bold uppercase tracking-wider text-[#7E828A]"
          >
            Live Demo
          </Link>
          {userProfile?.username && (
            <Link
              href={`/${userProfile.username}`}
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-bold uppercase tracking-wider text-[#0D82ED]"
            >
              My Live Bio ↗
            </Link>
          )}
          {(user?.email?.toLowerCase().trim() === "aibyshivai@gmail.com" || isAdmin) && (
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-bold uppercase tracking-wider text-amber-600 flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>Super Admin Console</span>
            </Link>
          )}
          <div className="pt-2">
            <Link
              href={user ? "/dashboard" : "/login"}
              onClick={() => setMobileMenuOpen(false)}
              className="btn-lime w-full justify-center"
            >
              Get Started ↗
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
