"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { PostService } from "@/lib/services/postService";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ShareModal } from "@/components/ShareModal";
import { InstagramIcon } from "@/components/icons/InstagramIcon";
import { MockStore } from "@/lib/firebase/mockData";
import { PublicPost } from "@/types";
import { BeACreatorCTA } from "@/components/BeACreatorCTA";
import {
  Lock,
  ChevronRight,
  ExternalLink,
  Plus,
  LayoutDashboard,
  CheckCircle2,
  Share2,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";

export default function HomePage() {
  const { userProfile } = useAuth();
  const [posts, setPosts] = useState<PublicPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [shareOpen, setShareOpen] = useState(false);

  const displayName = userProfile?.displayName || "AI by Shivai";
  const username = userProfile?.username || "aibyshivai";
  const bio =
    userProfile?.bio ||
    "AI tools, viral prompts & automated creator workflows. Comment on my Instagram Reels to unlock exclusive copyable resources.";
  const avatarUrl = userProfile?.photoURL || "/avatar.png";
  const instagramUrl =
    userProfile?.instagramUrl || "https://www.instagram.com/aibyshivai/";

  const origin = typeof window !== "undefined" ? window.location.origin : "https://replyto.me";
  const profileUrl = `${origin}/${username}`;

  useEffect(() => {
    fetch(`/api/posts?username=${encodeURIComponent(username)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.posts)) {
          setPosts(data.posts.map((p: any) => PostService.stripGatedContent(p, false)));
          MockStore.setPosts(data.posts);
        } else {
          const local = MockStore.getPublishedPostsByUsername(username);
          setPosts(local.map((p) => PostService.stripGatedContent(p, false)));
        }
      })
      .catch(() => {
        const local = MockStore.getPublishedPostsByUsername(username);
        setPosts(local.map((p) => PostService.stripGatedContent(p, false)));
      })
      .finally(() => setLoading(false));
  }, [username]);

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: `${displayName} — Link in Bio`,
          text: bio,
          url: profileUrl,
        })
        .catch(() => setShareOpen(true));
    } else {
      setShareOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#1D1D1F] flex flex-col justify-between selection:bg-[#0071E3]/20">
      <Navbar />

      <main className="w-full max-w-[500px] mx-auto px-4 py-10 sm:py-14 flex-1">
        {/* Creator Bio Header */}
        <div className="text-center mb-8">
          {/* Avatar with subtle diffused ring */}
          <div className="relative inline-block mb-4">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden bg-[#F5F5F7] p-1 border-2 border-[#E5E5EA] shadow-lg mx-auto">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={avatarUrl}
                alt={displayName}
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <div className="absolute bottom-1 right-1 w-7 h-7 rounded-full bg-gradient-to-tr from-[#FD1D1D] via-[#E1306C] to-[#833AB4] flex items-center justify-center text-white shadow-md border-2 border-white">
              <InstagramIcon className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="flex items-center justify-center gap-1.5">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1D1D1F] tracking-tight">
              {displayName}
            </h1>
            <CheckCircle2 className="w-5 h-5 text-[#0071E3] fill-[#0071E3]/15 flex-shrink-0" />
          </div>

          <p className="text-xs font-mono text-[#6E6E73] mt-1">
            @{username}
          </p>

          <p className="text-sm text-[#48484A] max-w-sm mx-auto mt-3 leading-relaxed">
            {bio}
          </p>

          {/* Social action buttons */}
          <div className="flex items-center justify-center gap-2.5 mt-5">
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#FD1D1D] via-[#E1306C] to-[#833AB4] text-white text-xs font-semibold shadow-[0_4px_14px_rgba(225,48,108,0.25)] hover:shadow-[0_6px_20px_rgba(225,48,108,0.35)] transition-all apple-btn"
            >
              <InstagramIcon className="w-4 h-4" />
              <span>Follow @aibyshivai</span>
              <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />
            </a>

            <button
              onClick={handleShare}
              aria-label="Share bio"
              className="w-10 h-10 rounded-full bg-[#F5F5F7] hover:bg-[#EBEBED] border border-[#E5E5EA] flex items-center justify-center text-[#1D1D1F] transition-all apple-btn shadow-sm"
              title="Share profile"
            >
              <Share2 className="w-4 h-4 text-[#6E6E73]" />
            </button>
          </div>
        </div>

        {/* Section Heading */}
        <div id="posts" className="flex items-center justify-between mb-4 pt-4 border-t border-[#E5E5EA]">
          <span className="text-xs font-bold uppercase tracking-wider text-[#86868B]">
            Exclusive Resources & Links
          </span>
          <Link
            href="/dashboard/new"
            className="flex items-center gap-1 text-xs font-semibold text-[#0071E3] hover:underline"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Post</span>
          </Link>
        </div>

        {/* Published Posts Cards Feed */}
        <div className="space-y-3.5">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-20 rounded-2xl bg-[#F5F5F7] animate-pulse border border-[#E5E5EA]"
                />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="p-8 rounded-3xl bg-[#F5F5F7] border border-[#E5E5EA] text-center">
              <p className="text-xs text-[#6E6E73]">
                No posts published yet. Tap &quot;Add Post&quot; to publish your first prompt or link!
              </p>
              <Link
                href="/dashboard/new"
                className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#0071E3] text-white text-xs font-semibold apple-btn"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Post</span>
              </Link>
            </div>
          ) : (
            posts.map((post, idx) => {
              const thumbnail =
                post.images && post.images.length > 0
                  ? post.images[0]
                  : "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80";

              return (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05, duration: 0.2 }}
                >
                  <Link
                    href={`/${username}/${post.slug}`}
                    className="group relative flex items-center gap-3.5 p-3.5 rounded-2xl bg-white border border-[#E5E5EA] shadow-sm hover:shadow-md hover:border-[#0071E3]/30 transition-all apple-btn"
                  >
                    {/* Thumbnail */}
                    <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-xl overflow-hidden bg-[#F5F5F7] flex-shrink-0 border border-[#E5E5EA]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={thumbnail}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {post.gateEnabled && (
                        <div className="absolute top-1 left-1 w-5 h-5 rounded-full bg-black/60 backdrop-blur-sm text-white flex items-center justify-center">
                          <Lock className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </div>

                    {/* Post Content preview */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 mb-1">
                        {post.gateEnabled ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#0071E3] bg-[#0071E3]/10 px-2 py-0.5 rounded-full">
                            <Lock className="w-2.5 h-2.5" />
                            <span>Comment &quot;{post.gateKeyword}&quot; to unlock</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium text-[#6E6E73] bg-[#F5F5F7] px-2 py-0.5 rounded-full">
                            Free Resource
                          </span>
                        )}
                      </div>

                      <h2 className="text-sm font-semibold text-[#1D1D1F] truncate group-hover:text-[#0071E3] transition-colors leading-snug">
                        {post.title}
                      </h2>

                      <p className="text-[11px] text-[#86868B] mt-0.5">
                        {post.gateEnabled
                          ? "Locked prompt pack • Tap to comment & unlock"
                          : `${post.textBlocks?.length || 0} copyable sections`}
                      </p>
                    </div>

                    {/* Chevron */}
                    <div className="w-7 h-7 rounded-full bg-[#F5F5F7] flex items-center justify-center text-[#86868B] group-hover:text-[#0071E3] group-hover:bg-[#0071E3]/10 transition-colors flex-shrink-0">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </Link>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Quick Creator Management Bar */}
        <div className="mt-8 p-4 rounded-2xl bg-[#F5F5F7] border border-[#E5E5EA] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="w-4 h-4 text-[#0071E3]" />
            <span className="text-xs font-semibold text-[#1D1D1F]">
              Creator Management
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="px-3.5 py-1.5 rounded-xl bg-white border border-[#E5E5EA] text-xs font-semibold text-[#1D1D1F] hover:bg-zinc-100 transition-all apple-btn shadow-sm"
            >
              Open Dashboard
            </Link>
            <Link
              href="/dashboard/new"
              className="px-3.5 py-1.5 rounded-xl bg-[#0071E3] text-white text-xs font-semibold hover:bg-[#0077ED] transition-all apple-btn shadow-sm"
            >
              + New Post
            </Link>
          </div>
        </div>

        {/* Be a Creator CTA */}
        <div className="mt-6">
          <BeACreatorCTA source="home_page" />
        </div>
      </main>

      <Footer />

      {/* Share Modal */}
      <ShareModal
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        title={`${displayName} (@${username})`}
        url={profileUrl}
      />
    </div>
  );
}
