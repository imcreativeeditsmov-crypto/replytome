"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { UserProfile, PublicPost, PostTextBlock } from "@/types";
import { Carousel } from "@/components/Carousel";
import { ReelPreviewCard } from "@/components/ReelPreviewCard";
import { TextBlockCard } from "@/components/TextBlockCard";
import { CommentGateCard } from "@/components/CommentGateCard";
import { ShareModal } from "@/components/ShareModal";
import { MockStore, INITIAL_DEMO_POSTS } from "@/lib/firebase/mockData";
import { PostService } from "@/lib/services/postService";
import {
  ArrowLeft,
  Share2,
  Lock,
  Unlock,
  Sparkles,
  CheckCircle2,
  Loader2,
  Search,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PublicPostViewProps {
  initialUser: UserProfile | null;
  initialPost: PublicPost | null;
  username: string;
  slug: string;
}

export const PublicPostView: React.FC<PublicPostViewProps> = ({
  initialUser,
  initialPost,
  username,
  slug,
}) => {
  const [post, setPost] = useState<PublicPost | null>(initialPost);
  const [user, setUser] = useState<UserProfile | null>(initialUser);
  const [isResolving, setIsResolving] = useState<boolean>(!initialPost);
  const [isUnlocked, setIsUnlocked] = useState<boolean>(
    initialPost ? !initialPost.gateEnabled : false
  );
  const [shareOpen, setShareOpen] = useState(false);

  const origin = typeof window !== "undefined" ? window.location.origin : "https://aibyshivai.com";
  const postUrl = `${origin}/${username}/${slug}`;

  // Client hydration & sync check
  useEffect(() => {
    if (!post) {
      const local = MockStore.getPostBySlug(username, slug);
      if (local) {
        const stripped = PostService.stripGatedContent(local.post, false);
        setPost(stripped);
        setUser(local.user);
        setIsUnlocked(!local.post.gateEnabled);
        setIsResolving(false);

        fetch("/api/posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ post: local.post }),
        }).catch(console.error);
        return;
      }

      fetch(`/api/posts?username=${encodeURIComponent(username)}&slug=${encodeURIComponent(slug)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.post) {
            setPost(PostService.stripGatedContent(data.post, false));
            setUser(data.user);
            setIsUnlocked(!data.post.gateEnabled);
          }
        })
        .catch(console.error)
        .finally(() => {
          setIsResolving(false);
        });
    } else {
      setIsResolving(false);
    }
  }, [post, username, slug]);

  // Record view on mount & check localStorage unlock state
  useEffect(() => {
    if (!post) return;

    fetch("/api/analytics/view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId: post.id }),
    }).catch((e) => console.error(e));

    if (post.gateEnabled && typeof window !== "undefined") {
      const stored = localStorage.getItem(`replyto_unlocked_${post.id}`);
      if (stored === "true") {
        fetch("/api/unlock", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ postId: post.id, isRestore: true }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.success) {
              setPost((prev) =>
                prev
                  ? {
                      ...prev,
                      textBlocks: data.textBlocks || [],
                      images: data.images && data.images.length > 0 ? data.images : prev.images,
                    }
                  : null
              );
              setIsUnlocked(true);
            }
          })
          .catch((e) => console.error(e));
      }
    }
  }, [post?.id, post?.gateEnabled]);

  const handleUnlockSuccess = (textBlocks: PostTextBlock[], images: string[]) => {
    let finalBlocks = textBlocks;
    if (!finalBlocks || finalBlocks.length === 0) {
      const match =
        INITIAL_DEMO_POSTS.find(
          (p) => p.id === post?.id || p.slug === slug || p.slug === "cafe-build-prompt"
        ) || INITIAL_DEMO_POSTS[0];
      finalBlocks = match?.textBlocks || [];
    }

    setPost((prev) =>
      prev
        ? {
            ...prev,
            textBlocks: finalBlocks,
            images: images && images.length > 0 ? images : prev.images,
          }
        : null
    );
    setIsUnlocked(true);
  };

  const handleShare = () => {
    if (!post) return;
    if (navigator.share) {
      navigator
        .share({
          title: post.title,
          text: `Check out ${post.title} by ${user?.displayName || "Creator"}`,
          url: postUrl,
        })
        .catch(() => setShareOpen(true));
    } else {
      setShareOpen(true);
    }
  };

  // Loading Screen
  if (isResolving) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="w-7 h-7 animate-spin text-[#0071E3] mb-3" />
        <p className="text-xs font-medium text-[#86868B]">Loading resource...</p>
      </div>
    );
  }

  // Not Found State
  if (!post || !user) {
    return (
      <div className="min-h-screen bg-white text-[#1D1D1F] flex flex-col justify-between selection:bg-[#0071E3]/20">
        <header className="h-14 border-b border-black/[0.06] flex items-center px-6">
          <Link href={`/${username}`} className="flex items-center gap-2 group text-xs font-medium text-[#86868B] hover:text-[#1D1D1F]">
            <ArrowLeft className="w-4 h-4" />
            <span>@{username}</span>
          </Link>
        </header>

        <main className="max-w-md mx-auto px-4 py-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#F5F5F7] border border-black/[0.06] flex items-center justify-center text-[#86868B] mx-auto mb-4">
            <Search className="w-6 h-6" />
          </div>
          <span className="text-[11px] font-mono font-semibold text-[#0071E3] uppercase tracking-wider">
            Resource Not Found
          </span>
          <h1 className="text-2xl font-semibold tracking-tight text-[#1D1D1F] mt-1 mb-2">
            Post not available
          </h1>
          <p className="text-xs text-[#86868B] leading-relaxed mb-6">
            This guide or prompt pack may have been removed or the link is incorrect.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href={`/${username}`}
              className="apple-btn-primary text-xs py-2 px-5"
            >
              ← Back to Bio
            </Link>
            <Link
              href="/dashboard"
              className="apple-btn-secondary text-xs py-2 px-5"
            >
              Creator Dashboard
            </Link>
          </div>
        </main>

        <footer className="py-6 text-center border-t border-black/[0.06] text-xs text-[#86868B]">
          aibyshivai — Exclusive AI Prompts & Resources by ShivAI.
        </footer>
      </div>
    );
  }

  const isImagesLocked =
    post.gateEnabled &&
    !isUnlocked &&
    (post.gateScope === "images" || post.gateScope === "both");

  const isTextLocked =
    post.gateEnabled &&
    !isUnlocked &&
    (post.gateScope === "text_blocks" || post.gateScope === "both");

  return (
    <div className="min-h-screen bg-[#FFFFFF] selection:bg-[#0071E3]/20 flex flex-col justify-between font-sans">
      {/* Top sticky Apple navigation bar */}
      <header className="sticky top-0 z-30 apple-nav">
        <div className="max-w-[540px] mx-auto px-4 h-13 flex items-center justify-between">
          <Link
            href={`/${username}`}
            className="flex items-center gap-2 text-xs font-medium text-[#1D1D1F] hover:text-[#0071E3] transition-colors apple-btn"
          >
            <ArrowLeft className="w-4 h-4 text-[#86868B]" />
            <div className="flex items-center gap-1.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={user.photoURL || "/avatar.png"}
                alt={user.displayName}
                referrerPolicy="no-referrer"
                crossOrigin="anonymous"
                className="w-5 h-5 rounded-full object-cover border border-black/[0.08]"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/avatar.png";
                }}
              />
              <span className="truncate max-w-[140px] sm:max-w-[200px] font-semibold">
                {user.displayName}
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              aria-label="Share post"
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#F5F5F7] hover:bg-[#E8E8ED] text-xs font-medium text-[#1D1D1F] border border-black/[0.06] transition-all apple-btn"
            >
              <Share2 className="w-3.5 h-3.5 text-[#86868B]" />
              <span>Share</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-[540px] mx-auto px-4 py-6 sm:py-8 space-y-6 flex-1">
        {/* Post Title & Creator Meta */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            {post.gateEnabled ? (
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                  isUnlocked
                    ? "bg-[#34C759]/10 text-[#34C759]"
                    : "bg-[#0071E3]/10 text-[#0071E3]"
                }`}
              >
                {isUnlocked ? (
                  <>
                    <Unlock className="w-3 h-3" />
                    <span>Unlocked</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3 h-3" />
                    <span>Comment &quot;{post.gateKeyword}&quot; to unlock</span>
                  </>
                )}
              </span>
            ) : (
              <span className="text-[11px] font-medium text-[#86868B] bg-[#F5F5F7] px-2.5 py-0.5 rounded-full">
                Public Resource
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-semibold text-[#1D1D1F] tracking-tight leading-tight">
            {post.title}
          </h1>

          <div className="flex items-center gap-2 text-xs text-[#86868B] mt-2">
            <span>by</span>
            <Link
              href={`/${username}`}
              className="font-medium text-[#1D1D1F] hover:text-[#0071E3] transition-colors"
            >
              @{username}
            </Link>
            <span>•</span>
            <span>
              {isUnlocked
                ? `${post.textBlocks?.length || 0} copyable sections`
                : `Comment to unlock`}
            </span>
          </div>
        </div>

        {/* Linked Instagram Reel Card */}
        {post.reelUrl && (
          <ReelPreviewCard
            reelUrl={post.reelUrl}
            creatorName={user.displayName}
            postId={post.id}
          />
        )}

        {/* Swipeable Carousel */}
        {post.images && post.images.length > 0 && (
          <Carousel
            images={post.images}
            isLocked={isImagesLocked}
            gateKeyword={post.gateKeyword}
            postTitle={post.title}
            allowDownload={post.allowDownload !== false}
            onUnlockClick={() => {
              const el = document.getElementById("comment-gate-section");
              if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
            }}
          />
        )}

        {/* Comment Gate Lock Overlay OR Unlocked Content */}
        {isTextLocked ? (
          <div id="comment-gate-section">
            <CommentGateCard
              postId={post.id}
              reelUrl={post.reelUrl}
              keyword={post.gateKeyword}
              message={post.gateMessage}
              onUnlockSuccess={handleUnlockSuccess}
            />
          </div>
        ) : (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {post.gateEnabled && (
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#34C759]/10 border border-[#34C759]/20 text-[#34C759]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-xs font-semibold">
                      Content Unlocked! Tap any &quot;Copy&quot; button below.
                    </span>
                  </div>
                  <Sparkles className="w-4 h-4" />
                </div>
              )}

              {/* Text Blocks */}
              {post.textBlocks && post.textBlocks.length > 0 ? (
                <div className="space-y-4">
                  {post.textBlocks.map((block, index) => (
                    <TextBlockCard key={block.id || index} block={block} index={index} />
                  ))}
                </div>
              ) : (
                <div className="p-8 rounded-2xl bg-[#F5F5F7] border border-black/[0.04] text-center text-xs text-[#86868B]">
                  No text content added to this post.
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Bottom Share Box */}
        <div className="pt-4 border-t border-black/[0.06]">
          <button
            onClick={handleShare}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-full bg-[#F5F5F7] hover:bg-[#E8E8ED] text-[#1D1D1F] border border-black/[0.06] text-xs font-medium transition-all apple-btn"
          >
            <Share2 className="w-4 h-4 text-[#86868B]" />
            <span>Share this resource</span>
          </button>
        </div>
      </main>

      {/* Apple Footer */}
      <footer className="w-full py-8 text-center border-t border-black/[0.06] bg-[#F5F5F7]">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#86868B] hover:text-[#1D1D1F] transition-colors"
        >
          <span>Curated on</span>
          <span className="font-semibold text-[#1D1D1F]">aibyshivai</span>
        </Link>
        <p className="text-[11px] text-[#86868B] mt-0.5">
          Exclusive AI prompts & Hollywood VFX build sequences by ShivAI.
        </p>
      </footer>

      {/* Share Modal */}
      <ShareModal
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        title={post.title}
        url={postUrl}
      />
    </div>
  );
};
