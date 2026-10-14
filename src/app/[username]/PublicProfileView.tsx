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
        title: `${user.displayName} on Replyto.me`,
        text: user.bio,
        url: profileUrl,
      }).catch(() => setShareOpen(true));
    } else {
      setShareOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-white selection:bg-[#0071E3]/20 flex flex-col justify-between">
      <main className="w-full max-w-[480px] mx-auto px-4 py-10 sm:py-14 flex-1">
        {/* Top bar with share */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-semibold text-[#86868B] hover:text-[#1D1D1F] transition-colors"
          >
            <div className="w-5 h-5 rounded-md bg-[#0071E3] text-white flex items-center justify-center font-bold text-[10px]">
              R
            </div>
            <span>Replyto.me</span>
          </Link>

          <button
            onClick={handleShare}
            aria-label="Share creator profile"
            className="w-9 h-9 rounded-full bg-[#F5F5F7] border border-[#E5E5EA] flex items-center justify-center text-[#1D1D1F] hover:bg-[#EBEBED] transition-all apple-btn"
          >
            <Share2 className="w-4 h-4 text-[#6E6E73]" />
          </button>
        </div>

        {/* Creator Bio Header */}
        <div className="text-center mb-8">
          {/* Avatar with diffused glow */}
          <div className="relative inline-block mb-3.5">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-[#F5F5F7] p-1 border border-[#E5E5EA] shadow-md mx-auto">
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
            <h1 className="text-xl sm:text-2xl font-bold text-[#1D1D1F] tracking-tight">
              {user.displayName}
            </h1>
            <CheckCircle2 className="w-4 h-4 text-[#0071E3] fill-[#0071E3]/15 flex-shrink-0" />
          </div>

          <p className="text-xs font-mono text-[#6E6E73] mt-0.5">
            @{user.username}
          </p>

          {user.bio && (
            <p className="text-sm text-[#48484A] max-w-sm mx-auto mt-2.5 leading-relaxed font-normal">
              {user.bio}
            </p>
          )}

          {/* Instagram Action Button */}
          <div className="flex items-center justify-center gap-2 mt-4">
            <a
              href={user.instagramUrl || `https://www.instagram.com/${user.username}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#FD1D1D] via-[#E1306C] to-[#833AB4] text-white text-xs font-semibold shadow-sm hover:opacity-95 transition-all apple-btn"
            >
              <InstagramIcon className="w-3.5 h-3.5" />
              <span>Follow @{user.username}</span>
              <ExternalLink className="w-3 h-3 opacity-80" />
            </a>
          </div>
        </div>

        {/* Published Posts Cards */}
        <div className="space-y-3.5">
          {posts.length === 0 ? (
            <div className="p-8 rounded-3xl bg-[#F5F5F7] border border-[#E5E5EA] text-center">
              <p className="text-xs text-[#6E6E73]">
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
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05, duration: 0.25 }}
                >
                  <Link
                    href={`/${user.username}/${post.slug}`}
                    className="group relative flex items-center gap-3.5 p-3 rounded-2xl bg-white border border-[#E5E5EA] shadow-sm hover:shadow-md hover:border-[#0071E3]/30 transition-all apple-btn"
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
                      <div className="flex items-center gap-1.5 mb-0.5">
                        {post.gateEnabled ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#0071E3] bg-[#0071E3]/10 px-2 py-0.5 rounded-full">
                            <Lock className="w-2.5 h-2.5" />
                            <span>Comment to Unlock</span>
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
                          ? `Comment "${post.gateKeyword || "KEYWORD"}" to unlock`
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

        {/* Be a Creator CTA */}
        <div className="mt-8">
          <BeACreatorCTA source="profile_view" />
        </div>
      </main>

      {/* Subtle Apple-style Footer */}
      <footer className="w-full py-8 text-center border-t border-[#E5E5EA] bg-[#F5F5F7]">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#6E6E73] hover:text-[#1D1D1F] transition-colors"
        >
          <span>Powered by</span>
          <span className="font-semibold text-[#1D1D1F]">Replyto.me</span>
          <span className="text-[10px] bg-white border border-[#E5E5EA] px-1.5 py-0.2 rounded-md text-[#86868B]">
            Free
          </span>
        </Link>
        <p className="text-[11px] text-[#86868B] mt-1">
          Your link in bio, but smarter.
        </p>
      </footer>

      {/* Share Modal */}
      <ShareModal
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        title={`${user.displayName} on Replyto.me`}
        url={profileUrl}
      />
    </div>
  );
};
