"use client";

import React, { useState } from "react";
import Link from "next/link";
import { UserProfile, PublicPost } from "@/types";
import { ShareModal } from "@/components/ShareModal";
import { formatCount } from "@/lib/utils";
import {
  Share2,
  Lock,
  ChevronRight,
  Sparkles,
  ExternalLink,
  Layers,
  CheckCircle2,
  FileText,
} from "lucide-react";
import { InstagramIcon } from "@/components/icons/InstagramIcon";
import { motion } from "framer-motion";

import { MockStore } from "@/lib/firebase/mockData";
import { PostService } from "@/lib/services/postService";
import { BeACreatorCTA } from "@/components/BeACreatorCTA";

interface PublicProfileViewProps {
  user: UserProfile;
  initialPosts: PublicPost[];
}

export const PublicProfileView: React.FC<PublicProfileViewProps> = ({
  user,
  initialPosts,
}) => {
  const [posts, setPosts] = useState<PublicPost[]>(initialPosts);
  const [shareOpen, setShareOpen] = useState(false);

  const origin = typeof window !== "undefined" ? window.location.origin : "https://replyto.me";
  const profileUrl = `${origin}/${user.username}`;

  // Client hydration & sync check
  React.useEffect(() => {
    fetch(`/api/posts?username=${encodeURIComponent(user.username)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.posts)) {
          const stripped = data.posts.map((p: any) => PostService.stripGatedContent(p, false));
          setPosts(stripped);
          MockStore.setPosts(data.posts);
        }
      })
      .catch((err) => console.error("Error fetching published posts:", err));
  }, [user.username]);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${user.displayName} on aibyshivai`,
        text: user.bio,
        url: profileUrl,
      }).catch(() => setShareOpen(true));
    } else {
      setShareOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] selection:bg-[#0071E3]/20 flex flex-col justify-between font-sans">
      <main className="w-full max-w-[480px] mx-auto px-4 py-8 sm:py-12 flex-1">
        {/* Top bar with share */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-medium text-[#86868B] hover:text-[#1D1D1F] transition-colors"
          >
            <div className="w-5 h-5 rounded-md bg-[#0D82ED] text-white flex items-center justify-center font-semibold text-[10px]">
              S
            </div>
            <span>aibyshivai</span>
          </Link>

          <button
            onClick={handleShare}
            aria-label="Share creator profile"
            className="w-8 h-8 rounded-full bg-[#F5F5F7] border border-black/[0.06] flex items-center justify-center text-[#1D1D1F] hover:bg-[#E8E8ED] transition-all apple-btn"
          >
            <Share2 className="w-3.5 h-3.5 text-[#86868B]" />
          </button>
        </div>

        {/* Creator Bio Header */}
        <div className="text-center mb-8">
          {/* Avatar with Apple subtle ring */}
          <div className="relative inline-block mb-3.5">
            <div className="w-22 h-22 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-[#F5F5F7] p-0.5 border border-black/[0.08] shadow-sm mx-auto">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={
                  user.photoURL ||
                  `https://api.dicebear.com/7.x/identicon/svg?seed=${user.username}`
                }
                alt={user.displayName}
                referrerPolicy="no-referrer"
                crossOrigin="anonymous"
                className="w-full h-full object-cover rounded-full"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/identicon/svg?seed=${user.username}`;
                }}
              />
            </div>
          </div>

          <div className="flex items-center justify-center gap-1.5">
            <h1 className="text-xl sm:text-2xl font-semibold text-[#1D1D1F] tracking-tight">
              {user.displayName}
            </h1>
            <CheckCircle2 className="w-4 h-4 text-[#0071E3] fill-[#0071E3]/15 flex-shrink-0" />
          </div>

          <p className="text-xs font-mono text-[#86868B] mt-0.5">
            @{user.username}
          </p>

          {user.bio && (
            <p className="text-xs sm:text-sm text-[#86868B] max-w-sm mx-auto mt-2.5 leading-relaxed font-normal">
              {user.bio}
            </p>
          )}

          {/* Instagram Action Button */}
          <div className="flex items-center justify-center gap-2 mt-4">
            <a
              href={user.instagramUrl || `https://www.instagram.com/${user.username}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#1D1D1F] hover:bg-black text-white text-xs font-medium shadow-sm transition-all apple-btn"
            >
              <InstagramIcon className="w-3.5 h-3.5 text-[#E1306C]" />
              <span>Instagram</span>
              <ExternalLink className="w-3 h-3 opacity-60 ml-0.5" />
            </a>
          </div>
        </div>

        {/* Section Title */}
        <div className="flex items-center justify-between mb-3 px-1 text-xs text-[#86868B]">
          <span className="font-semibold text-[#1D1D1F]">Resources & Links</span>
          <span>{posts.length} {posts.length === 1 ? "item" : "items"}</span>
        </div>

        {/* Published Posts Cards */}
        <div className="space-y-3">
          {posts.length === 0 ? (
            <div className="p-8 rounded-2xl bg-[#F5F5F7] border border-black/[0.04] text-center">
              <p className="text-xs text-[#86868B]">
                No posts published yet. Check back soon!
              </p>
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
                  transition={{ delay: idx * 0.04, duration: 0.25 }}
                >
                  <Link
                    href={`/${user.username}/${post.slug}`}
                    className="group relative flex items-center gap-3.5 p-3 rounded-2xl bg-white border border-black/[0.06] shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] hover:border-black/[0.12] transition-all apple-btn"
                  >
                    {/* Thumbnail */}
                    <div className="relative w-15 h-15 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-[#F5F5F7] flex-shrink-0 border border-black/[0.04]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={thumbnail}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {post.gateEnabled && (
                        <div className="absolute top-1 left-1 w-4.5 h-4.5 rounded-full bg-black/60 backdrop-blur-sm text-white flex items-center justify-center">
                          <Lock className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </div>

                    {/* Post Content preview */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 mb-1">
                        {post.gateEnabled ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#0071E3] bg-[#0071E3]/10 px-2 py-0.2 rounded-full">
                            <Lock className="w-2.5 h-2.5" />
                            <span>Comment to Unlock</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium text-[#86868B] bg-[#F5F5F7] px-2 py-0.2 rounded-full">
                            Free Resource
                          </span>
                        )}
                      </div>

                      <h2 className="text-xs sm:text-sm font-semibold text-[#1D1D1F] truncate group-hover:text-[#0071E3] transition-colors leading-snug">
                        {post.title}
                      </h2>

                      <p className="text-[11px] text-[#86868B] mt-0.5 truncate">
                        {post.gateEnabled
                          ? `Comment "${post.gateKeyword || "KEYWORD"}" on Instagram`
                          : `${post.textBlocks?.length || 0} copyable sections`}
                      </p>
                    </div>

                    {/* Chevron */}
                    <div className="w-6 h-6 rounded-full bg-[#F5F5F7] flex items-center justify-center text-[#86868B] group-hover:text-[#0071E3] group-hover:bg-[#0071E3]/10 transition-colors flex-shrink-0">
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </Link>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Be a Creator CTA */}
        <div className="mt-8">
          <BeACreatorCTA source="profile_view" />
        </div>
      </main>

      {/* Apple-style Footer */}
      <footer className="w-full py-8 text-center border-t border-black/[0.06] bg-[#F5F5F7] text-xs text-[#86868B]">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 font-medium text-[#86868B] hover:text-[#1D1D1F] transition-colors"
        >
          <span>Curated on</span>
          <span className="font-semibold text-[#1D1D1F]">aibyshivai</span>
        </Link>
        <p className="text-[11px] text-[#86868B] mt-1">
          Exclusive AI prompts & Hollywood VFX build sequences by ShivAI.
        </p>
      </footer>

      {/* Share Modal */}
      <ShareModal
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        title={`${user.displayName} on aibyshivai`}
        url={profileUrl}
      />
    </div>
  );
};
