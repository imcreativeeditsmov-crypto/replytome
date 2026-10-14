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

  const origin = typeof window !== "undefined" ? window.location.origin : "https://replyto.me";
  const postUrl = `${origin}/${username}/${slug}`;

  // Client hydration & sync check
  useEffect(() => {
    if (!post) {
      // 1. Check local client MockStore
      const local = MockStore.getPostBySlug(username, slug);
      if (local) {
        const stripped = PostService.stripGatedContent(local.post, false);
        setPost(stripped);
        setUser(local.user);
        setIsUnlocked(!local.post.gateEnabled);
        setIsResolving(false);

        // Upload to server so it is persisted permanently in data/store.json
        fetch("/api/posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ post: local.post }),
        }).catch(console.error);
        return;
      }

      // 2. Fetch from /api/posts route
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

    // 1. Record analytics view
    fetch("/api/analytics/view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId: post.id }),
    }).catch((e) => console.error(e));

    // 2. Check if previously unlocked on this device
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
          text: `Check out ${post.title} by ${user?.displayName || "AI by Shivai"}`,
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
        <Loader2 className="w-8 h-8 animate-spin text-[#0071E3] mb-3" />
        <p className="text-sm font-medium text-[#1D1D1F]">Loading resource...</p>
      </div>
    );
  }

  // Not Found State
  if (!post || !user) {
    return (
      <div className="min-h-screen bg-white text-[#1D1D1F] flex flex-col justify-between selection:bg-[#0071E3]/20">
        <header className="h-16 border-b border-[#E5E5EA] flex items-center px-6">
          <Link href={`/${username}`} className="flex items-center gap-2 group">
            <ArrowLeft className="w-4 h-4 text-[#86868B] group-hover:text-[#1D1D1F]" />
            <span className="font-semibold text-sm">@{username}</span>
          </Link>
        </header>

        <main className="max-w-md mx-auto px-4 py-16 text-center">
          <div className="w-16 h-16 rounded-3xl bg-[#F5F5F7] border border-[#E5E5EA] flex items-center justify-center text-[#86868B] mx-auto mb-6">
            <Search className="w-8 h-8" />
          </div>
          <span className="text-xs font-mono font-bold text-[#0071E3] uppercase tracking-widest">
            Resource Not Found
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1D1D1F] mt-2 mb-3">
            Post not available
          </h1>
          <p className="text-sm text-[#6E6E73] leading-relaxed mb-8">
            This guide or prompt pack may have been removed or the link is incorrect.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href={`/${username}`}
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#0071E3] text-white text-xs font-semibold hover:bg-[#0077ED] transition-all apple-btn shadow-sm"
            >
              ← Back to Shivai&apos;s Bio
            </Link>
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#F5F5F7] text-[#1D1D1F] text-xs font-semibold hover:bg-[#EBEBED] transition-all border border-[#E5E5EA]"
            >
              Creator Dashboard
            </Link>
          </div>
        </main>

        <footer className="py-6 text-center border-t border-[#E5E5EA] text-xs text-[#86868B]">
          Replyto.me — Your link in bio, but smarter.
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
    <div className="min-h-screen bg-white selection:bg-[#0071E3]/20 flex flex-col justify-between">
      {/* Top sticky frosted navigation bar */}
      <header className="sticky top-0 z-30 frosted-nav">
        <div className="max-w-[540px] mx-auto px-4 h-14 flex items-center justify-between">
          <Link
            href={`/${username}`}
            className="flex items-center gap-2 text-xs font-semibold text-[#1D1D1F] hover:text-[#0071E3] transition-colors apple-btn"
          >
            <ArrowLeft className="w-4 h-4 text-[#86868B]" />
            <div className="flex items-center gap-1.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={user.photoURL || "/avatar.png"}
                alt={user.displayName}
                referrerPolicy="no-referrer"
                crossOrigin="anonymous"
                className="w-5 h-5 rounded-full object-cover border border-[#E5E5EA]"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/avatar.png";
                }}
              />
              <span className="truncate max-w-[140px] sm:max-w-[200px]">
                {user.displayName}
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              aria-label="Share post"
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#F5F5F7] hover:bg-[#EBEBED] text-xs font-semibold text-[#1D1D1F] border border-[#E5E5EA] transition-all apple-btn"
            >
              <Share2 className="w-3.5 h-3.5 text-[#6E6E73]" />
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
                    <span>Locked • Comment &quot;{post.gateKeyword}&quot;</span>
                  </>
                )}
              </span>
            ) : (
              <span className="text-[11px] font-medium text-[#6E6E73] bg-[#F5F5F7] px-2.5 py-0.5 rounded-full">
                Public Resource
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-[#1D1D1F] tracking-tight leading-tight">
            {post.title}
          </h1>

          <div className="flex items-center gap-2 text-xs text-[#6E6E73] mt-2">
            <span>by</span>
            <Link
              href={`/${username}`}
              className="font-semibold text-[#1D1D1F] hover:text-[#0071E3] transition-colors"
            >
              @{username}
            </Link>
            <span>
              {isUnlocked
                ? `${post.textBlocks?.length || 0} copyable sections`
                : `Locked content • Comment to unlock`}
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
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
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
                <div className="p-8 rounded-2xl bg-[#F5F5F7] border border-[#E5E5EA] text-center text-xs text-[#6E6E73]">
                  No text content added to this post.
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Floating / Bottom Share Box */}
        <div className="pt-4 border-t border-[#E5E5EA]">
          <button
            onClick={handleShare}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-[#F5F5F7] hover:bg-[#EBEBED] text-[#1D1D1F] border border-[#E5E5EA] text-xs font-semibold transition-all apple-btn"
          >
            <Share2 className="w-4 h-4 text-[#6E6E73]" />
            <span>Share this post with a friend</span>
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-8 text-center border-t border-[#E5E5EA] bg-[#F5F5F7]">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#6E6E73] hover:text-[#1D1D1F] transition-colors"
        >
          <span>Powered by</span>
          <span className="font-semibold text-[#1D1D1F]">Replyto.me</span>
        </Link>
        <p className="text-[11px] text-[#86868B] mt-0.5">
          Your link in bio, but smarter.
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
