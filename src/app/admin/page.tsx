"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { UserProfile, Post } from "@/types";
import {
  ShieldCheck,
  Users,
  FileText,
  Eye,
  Unlock,
  TrendingUp,
  Search,
  ExternalLink,
  ArrowLeft,
  Sparkles,
  RefreshCw,
  Crown,
  CheckCircle2,
  Lock,
  ChevronRight,
  Filter,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { InstagramIcon } from "@/components/icons/InstagramIcon";
import {
  isPlatformAdmin,
  verifyAdminPasscode,
  isAdminSessionUnlocked,
  setAdminSessionUnlocked,
  setAdminPasscode,
} from "@/lib/auth/adminCheck";
import { KeyRound, EyeOff } from "lucide-react";

interface CreatorWithStats extends UserProfile {
  postsCount: number;
  views: number;
  unlocks: number;
  unlockRate: string;
}

interface PostWithCreator extends Post {
  creatorName: string;
  creatorUsername: string;
  creatorAvatar: string;
}

interface AdminStats {
  totalUsers: number;
  totalPosts: number;
  totalViews: number;
  totalUnlocks: number;
  unlockRate: string;
  creators: CreatorWithStats[];
  posts: PostWithCreator[];
}

export default function AdminPage() {
  const router = useRouter();
  const { user, userProfile, isAdmin, loading: authLoading } = useAuth();

  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passcodeInput, setPasscodeInput] = useState("");
  const [passcodeError, setPasscodeError] = useState("");
  const [showPasscodeText, setShowPasscodeText] = useState(false);
  const [showChangeModal, setShowChangeModal] = useState(false);
  const [newPasscode, setNewPasscode] = useState("");
  const [passcodeNotice, setPasscodeNotice] = useState("");

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"creators" | "posts">("creators");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setIsUnlocked(isAdminSessionUnlocked());
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const uidParam = encodeURIComponent(user?.uid || userProfile?.uid || "");
      const userParam = encodeURIComponent(userProfile?.username || "");
      const res = await fetch(
        `/api/admin/stats?requesterUid=${uidParam}&requesterUsername=${userParam}&passcode=creative2026`
      );
      const data = await res.json();
      if (data.success && data.stats) {
        setStats(data.stats);
      }
    } catch (e) {
      console.error("Failed to load admin stats:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isUnlocked) {
      fetchStats();
    }
  }, [isUnlocked]);

  // Security Gate: require admin passcode
  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-[28px] p-8 border border-black/[0.08] shadow-[0_16px_40px_rgba(0,0,0,0.06)] text-center space-y-6"
        >
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto border border-amber-500/20 shadow-sm">
            <Lock className="w-8 h-8 text-amber-500" />
          </div>

          <div>
            <h1 className="text-xl font-black text-[#0A0A0A] tracking-tight">Super Admin Security Gate</h1>
            <p className="text-xs text-[#7E828A] mt-2 leading-relaxed">
              Platform management is restricted. Enter your private Admin Passcode to view creator analytics, user directory, and post gates.
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (verifyAdminPasscode(passcodeInput)) {
                setAdminSessionUnlocked(true);
                setIsUnlocked(true);
                setPasscodeError("");
              } else {
                setPasscodeError("Incorrect Admin Passcode. Access denied.");
              }
            }}
            className="space-y-4 text-left"
          >
            <div>
              <label className="block text-xs font-semibold text-[#0A0A0A] mb-1.5">
                Admin Passcode
              </label>
              <div className="relative">
                <input
                  type={showPasscodeText ? "text" : "password"}
                  required
                  value={passcodeInput}
                  onChange={(e) => {
                    setPasscodeInput(e.target.value);
                    setPasscodeError("");
                  }}
                  placeholder="Enter admin passcode"
                  className="w-full px-4 py-3 rounded-xl bg-[#F5F5F7] border border-black/[0.08] text-xs font-mono text-[#0A0A0A] outline-none focus:bg-white focus:border-[#0D82ED] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPasscodeText(!showPasscodeText)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#7E828A] hover:text-[#0A0A0A]"
                >
                  {showPasscodeText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passcodeError && (
                <p className="text-xs text-rose-600 font-medium mt-1.5">{passcodeError}</p>
              )}
            </div>

            <button
              type="submit"
              className="btn-lime w-full justify-center py-3 text-xs font-black shadow-sm"
            >
              <span>Unlock Admin Console</span>
              <Unlock className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </form>

          <div className="pt-2 border-t border-black/[0.06]">
            <Link
              href="/"
              className="text-xs text-[#7E828A] hover:text-[#0A0A0A] font-semibold transition-colors"
            >
              ← Back to Homepage
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  const filteredCreators = (stats?.creators || []).filter(
    (c) =>
      c.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPosts = (stats?.posts || []).filter(
    (p) =>
      p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.creatorName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.creatorUsername?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.gateKeyword?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#FBFBFD] text-[#1D1D1F] flex flex-col">
      {/* Top Admin Navbar */}
      <header className="sticky top-0 z-40 w-full frosted-nav border-b border-[#E5E5EA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="p-2 rounded-xl bg-white border border-[#E5E5EA] text-[#6E6E73] hover:text-[#1D1D1F] shadow-sm transition-all apple-btn"
              title="Back to Creator Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-400 text-white flex items-center justify-center shadow-sm">
                <Crown className="w-4 h-4" />
              </div>
              <div>
                <h1 className="text-sm font-bold tracking-tight text-[#1D1D1F] flex items-center gap-1.5">
                  <span>Replyto.me Admin Console</span>
                  <span className="text-[10px] font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">
                    Super Admin
                  </span>
                </h1>
                <p className="text-[11px] text-[#6E6E73]">
                  Platform-wide overview, creators registry & analytics
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={fetchStats}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-[#F5F5F7] text-xs font-semibold text-[#1D1D1F] border border-[#E5E5EA] shadow-sm transition-all apple-btn"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#6E6E73] ${loading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              onClick={() => setShowChangeModal(true)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white hover:bg-[#F5F5F7] text-xs font-semibold text-[#1D1D1F] border border-[#E5E5EA] shadow-sm transition-all"
            >
              <span>Change Passcode</span>
            </button>

            <button
              onClick={() => {
                setAdminSessionUnlocked(false);
                setIsUnlocked(false);
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-rose-50 hover:bg-rose-100 text-xs font-semibold text-rose-700 border border-rose-200 transition-all"
              title="Lock Admin Console"
            >
              <Lock className="w-3 h-3 text-rose-600" />
              <span>Lock Admin</span>
            </button>

            {userProfile?.username && (
              <Link
                href={`/${userProfile.username}`}
                target="_blank"
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#0D82ED] hover:bg-[#0972D3] text-xs font-semibold text-white shadow-sm transition-all apple-btn"
              >
                <span>My Bio</span>
                <ExternalLink className="w-3 h-3 opacity-80" />
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Admin Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 flex-1 w-full">
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Card 1: Total Creators */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 sm:p-6 rounded-3xl bg-white border border-[#E5E5EA] shadow-sm flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#6E6E73]">Registered Creators</span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0071E3] flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#1D1D1F] tracking-tight">
                {stats?.totalUsers || 0}
              </span>
              <p className="text-[11px] text-[#6E6E73] mt-0.5">Active creator accounts</p>
            </div>
          </motion.div>

          {/* Card 2: Total Links / Resources */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="p-5 sm:p-6 rounded-3xl bg-white border border-[#E5E5EA] shadow-sm flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#6E6E73]">Gated Resources</span>
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#1D1D1F] tracking-tight">
                {stats?.totalPosts || 0}
              </span>
              <p className="text-[11px] text-[#6E6E73] mt-0.5">Listed across platform</p>
            </div>
          </motion.div>

          {/* Card 3: Total Views */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-5 sm:p-6 rounded-3xl bg-white border border-[#E5E5EA] shadow-sm flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#6E6E73]">Total Impressions</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Eye className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#1D1D1F] tracking-tight">
                {(stats?.totalViews || 0).toLocaleString()}
              </span>
              <p className="text-[11px] text-[#6E6E73] mt-0.5">Views across all bio links</p>
            </div>
          </motion.div>

          {/* Card 4: Total Unlocks */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="p-5 sm:p-6 rounded-3xl bg-white border border-[#E5E5EA] shadow-sm flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#6E6E73]">Verified Unlocks</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Unlock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#1D1D1F] tracking-tight">
                {(stats?.totalUnlocks || 0).toLocaleString()}
              </span>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                {stats?.unlockRate || "0.0"}% conv.
              </span>
            </div>
            <p className="text-[11px] text-[#6E6E73] mt-0.5">Instagram comment unlocks</p>
          </motion.div>
        </div>

        {/* Tab Controls & Real-Time Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2">
          {/* Segmented Tab Pill */}
          <div className="flex p-1 bg-[#F5F5F7] rounded-2xl border border-[#E5E5EA] self-start sm:self-auto">
            <button
              onClick={() => setActiveTab("creators")}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "creators"
                  ? "bg-white text-[#1D1D1F] shadow-sm"
                  : "text-[#6E6E73] hover:text-[#1D1D1F]"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Creators ({stats?.creators?.length || 0})</span>
            </button>
            <button
              onClick={() => setActiveTab("posts")}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "posts"
                  ? "bg-white text-[#1D1D1F] shadow-sm"
                  : "text-[#6E6E73] hover:text-[#1D1D1F]"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Resources & Links ({stats?.posts?.length || 0})</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-[#86868B] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={activeTab === "creators" ? "Search creators..." : "Search resources..."}
              className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-white border border-[#E5E5EA] text-xs text-[#1D1D1F] placeholder:text-[#86868B] focus:outline-none focus:border-[#0071E3] focus:ring-2 focus:ring-[#0071E3]/20 shadow-sm transition-all"
            />
          </div>
        </div>

        {/* Tab 1: Creators Directory */}
        {activeTab === "creators" && (
          <div className="bg-white rounded-3xl border border-[#E5E5EA] shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E5E5EA] flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-[#1D1D1F]">All Registered Creators</h2>
                <p className="text-xs text-[#6E6E73]">
                  Detailed breakdown of every creator registered on Replyto.me
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#F5F5F7] text-[#6E6E73] border border-[#E5E5EA]">
                {filteredCreators.length} results
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FBFBFD] text-[#6E6E73] font-semibold border-b border-[#E5E5EA]">
                  <tr>
                    <th className="py-3.5 px-6">Creator</th>
                    <th className="py-3.5 px-4">Role</th>
                    <th className="py-3.5 px-4">Instagram</th>
                    <th className="py-3.5 px-4 text-center">Listed Links</th>
                    <th className="py-3.5 px-4 text-center">Total Views</th>
                    <th className="py-3.5 px-4 text-center">Total Unlocks</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E5EA]">
                  {filteredCreators.map((creator) => (
                    <tr key={creator.uid} className="hover:bg-[#F5F5F7]/50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={creator.photoURL || "/avatar.png"}
                            alt={creator.displayName}
                            referrerPolicy="no-referrer"
                            crossOrigin="anonymous"
                            className="w-9 h-9 rounded-full object-cover border border-[#E5E5EA] flex-shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/avatar.png";
                            }}
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-[#1D1D1F] truncate">{creator.displayName}</p>
                            <p className="text-[11px] font-mono text-[#6E6E73]">@{creator.username}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        {isPlatformAdmin(creator) ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                            <Crown className="w-3 h-3 text-amber-600" />
                            <span>Super Admin</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-[#0071E3] border border-blue-100">
                            <span>Creator</span>
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        {creator.instagramUrl ? (
                          <a
                            href={creator.instagramUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-[#E1306C] hover:underline"
                          >
                            <InstagramIcon className="w-3.5 h-3.5" />
                            <span>Profile</span>
                          </a>
                        ) : (
                          <span className="text-[#86868B] text-[11px]">Not linked</span>
                        )}
                      </td>

                      <td className="py-4 px-4 text-center font-bold text-[#1D1D1F]">
                        {creator.postsCount}
                      </td>

                      <td className="py-4 px-4 text-center font-bold text-[#1D1D1F]">
                        {creator.views.toLocaleString()}
                      </td>

                      <td className="py-4 px-4 text-center">
                        <div className="inline-flex items-center gap-1 font-bold text-emerald-600">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{creator.unlocks.toLocaleString()}</span>
                        </div>
                      </td>

                      <td className="py-4 px-6 text-right">
                        <Link
                          href={`/${creator.username}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#F5F5F7] hover:bg-[#EBEBED] text-xs font-semibold text-[#1D1D1F] border border-[#E5E5EA] transition-all apple-btn"
                        >
                          <span>View Bio</span>
                          <ExternalLink className="w-3 h-3 text-[#86868B]" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredCreators.length === 0 && (
                <div className="p-10 text-center text-xs text-[#6E6E73]">
                  No creators found matching &quot;{searchQuery}&quot;
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: All Content & Resources */}
        {activeTab === "posts" && (
          <div className="bg-white rounded-3xl border border-[#E5E5EA] shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E5E5EA] flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-[#1D1D1F]">All Platform Resources & Prompts</h2>
                <p className="text-xs text-[#6E6E73]">
                  Inspect every link, keyword gate, and engagement performance
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#F5F5F7] text-[#6E6E73] border border-[#E5E5EA]">
                {filteredPosts.length} resources
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FBFBFD] text-[#6E6E73] font-semibold border-b border-[#E5E5EA]">
                  <tr>
                    <th className="py-3.5 px-6">Resource Title</th>
                    <th className="py-3.5 px-4">Creator</th>
                    <th className="py-3.5 px-4">Keyword Gate</th>
                    <th className="py-3.5 px-4 text-center">Views</th>
                    <th className="py-3.5 px-4 text-center">Unlocks</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E5EA]">
                  {filteredPosts.map((post) => (
                    <tr key={post.id} className="hover:bg-[#F5F5F7]/50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          {post.images && post.images.length > 0 ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={post.images[0]}
                              alt={post.title}
                              className="w-10 h-10 rounded-xl object-cover border border-[#E5E5EA] flex-shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-[#F5F5F7] border border-[#E5E5EA] flex items-center justify-center text-[#86868B] flex-shrink-0">
                              <FileText className="w-4 h-4" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-bold text-[#1D1D1F] truncate">{post.title}</p>
                            <p className="text-[11px] font-mono text-[#6E6E73]">/{post.slug}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-[#1D1D1F]">{post.creatorName}</span>
                          <span className="text-[11px] font-mono text-[#86868B]">
                            (@{post.creatorUsername})
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        {post.gateEnabled ? (
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-[11px] px-2 py-0.5 rounded-md bg-[#0071E3]/10 text-[#0071E3] border border-[#0071E3]/20">
                              {post.gateKeyword || "COMMENT"}
                            </span>
                            {post.reelUrl && (
                              <a
                                href={post.reelUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#E1306C] hover:opacity-80"
                                title="Open Reel"
                              >
                                <InstagramIcon className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        ) : (
                          <span className="text-[#86868B] text-[11px]">Ungated</span>
                        )}
                      </td>

                      <td className="py-4 px-4 text-center font-bold text-[#1D1D1F]">
                        {(post.views || 0).toLocaleString()}
                      </td>

                      <td className="py-4 px-4 text-center">
                        <span className="font-bold text-emerald-600">
                          {(post.unlocks || 0).toLocaleString()}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-center">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            post.status === "published"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          {post.status || "published"}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-right">
                        <Link
                          href={`/${post.creatorUsername}/${post.slug}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#0071E3] hover:bg-[#0077ED] text-xs font-semibold text-white shadow-sm transition-all apple-btn"
                        >
                          <span>Open Resource</span>
                          <ExternalLink className="w-3 h-3 opacity-80" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredPosts.length === 0 && (
                <div className="p-10 text-center text-xs text-[#6E6E73]">
                  No resources found matching &quot;{searchQuery}&quot;
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Change Passcode Modal */}
      {showChangeModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm bg-white rounded-[24px] p-6 border border-black/[0.08] shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#0A0A0A]">Change Admin Passcode</h3>
              <button
                onClick={() => {
                  setShowChangeModal(false);
                  setPasscodeNotice("");
                  setNewPasscode("");
                }}
                className="text-xs text-[#7E828A] hover:text-[#0A0A0A]"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#7E828A]">
              Set your new custom Admin Passcode. Default is <code className="bg-black/5 px-1 py-0.5 rounded font-mono">creative2026</code>.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (newPasscode.trim().length < 4) {
                  setPasscodeNotice("Passcode must be at least 4 characters.");
                  return;
                }
                setAdminPasscode(newPasscode.trim());
                setPasscodeNotice("Passcode updated successfully! ✅");
                setTimeout(() => {
                  setShowChangeModal(false);
                  setPasscodeNotice("");
                  setNewPasscode("");
                }, 1500);
              }}
              className="space-y-3"
            >
              <input
                type="text"
                required
                value={newPasscode}
                onChange={(e) => setNewPasscode(e.target.value)}
                placeholder="Enter new passcode"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F5F7] border border-black/[0.08] text-xs font-mono text-[#0A0A0A] outline-none focus:bg-white focus:border-[#0D82ED]"
              />

              {passcodeNotice && (
                <p className="text-xs font-semibold text-emerald-600">{passcodeNotice}</p>
              )}

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowChangeModal(false)}
                  className="flex-1 py-2 rounded-xl bg-[#F5F5F7] hover:bg-[#EAEBED] text-xs font-semibold text-[#0A0A0A]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl btn-lime text-xs font-black shadow-none justify-center"
                >
                  Save Passcode
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
