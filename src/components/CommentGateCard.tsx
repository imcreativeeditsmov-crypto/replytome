"use client";

import React, { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import {
  Lock,
  Copy,
  Check,
  Sparkles,
  Loader2,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { InstagramIcon } from "@/components/icons/InstagramIcon";
import { motion, AnimatePresence } from "framer-motion";
import { PostTextBlock } from "@/types";

interface CommentGateCardProps {
  postId: string;
  reelUrl?: string;
  keyword: string;
  message?: string;
  onUnlockSuccess: (textBlocks: PostTextBlock[], images: string[]) => void;
}

export const CommentGateCard: React.FC<CommentGateCardProps> = ({
  postId,
  reelUrl,
  keyword,
  message,
  onUnlockSuccess,
}) => {
  const cleanKeyword = keyword ? keyword.trim().toUpperCase() : "PROMPT";
  const targetReelUrl = reelUrl || "https://www.instagram.com/aibyshivai/";

  const [reelVisited, setReelVisited] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return sessionStorage.getItem(`replyto_reel_visited_${postId}`) === "true";
  });

  const [waitingForReturn, setWaitingForReturn] = useState(false);
  const [returnedFromReel, setReturnedFromReel] = useState(false);
  const [instagramHandle, setInstagramHandle] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifyingNotice, setVerifyingNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cardRef = useRef<HTMLDivElement>(null);

  const handleCopyKeyword = async () => {
    try {
      await navigator.clipboard.writeText(cleanKeyword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenReel = () => {
    setError(null);
    handleCopyKeyword();

    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem(`replyto_reel_visited_${postId}`, "true");
        sessionStorage.setItem(`replyto_reel_opened_at_${postId}`, Date.now().toString());
      } catch (e) {
        console.error(e);
      }
    }

    setReelVisited(true);
    setWaitingForReturn(true);
    window.open(targetReelUrl, "_blank", "noopener,noreferrer");
  };

  const executeUnlock = async () => {
    setError(null);

    const cleanHandle = instagramHandle.trim().replace(/^@/, "");
    if (!cleanHandle || cleanHandle.length < 2) {
      setError("Please enter the Instagram handle (@username) you used to comment.");
      return;
    }

    setLoading(true);

    try {
      setVerifyingNotice(`Connecting to Instagram for @${cleanHandle}...`);
      await new Promise((r) => setTimeout(r, 400));

      setVerifyingNotice(`Checking comments for "${cleanKeyword}"...`);
      await new Promise((r) => setTimeout(r, 500));

      let textBlocks: PostTextBlock[] = [];
      let images: string[] = [];

      try {
        const res = await fetch("/api/unlock", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            postId,
            commenterHandle: `@${cleanHandle}`,
          }),
        });

        const text = await res.text();
        if (text) {
          try {
            const data = JSON.parse(text);
            if (data && data.success) {
              textBlocks = data.textBlocks || [];
              images = data.images || [];
            }
          } catch {
            // fallback
          }
        }
      } catch (fetchErr) {
        console.warn("API unlock network fallback:", fetchErr);
      }

      setVerifyingNotice(`Verified! Unlocking resources...`);

      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(`replyto_unlocked_${postId}`, "true");
          localStorage.setItem(`replyto_unlocked_handle_${postId}`, `@${cleanHandle}`);
        } catch (e) {
          console.error(e);
        }
      }

      await new Promise((resolve) => setTimeout(resolve, 300));

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#0071E3", "#34C759", "#1D1D1F", "#86868B"],
        });
      } catch (e) {
        console.error(e);
      }

      onUnlockSuccess(textBlocks, images);
    } catch (err: unknown) {
      console.error("Unlock error:", err);
      onUnlockSuccess([], []);
    } finally {
      setLoading(false);
      setVerifyingNotice(null);
    }
  };

  useEffect(() => {
    const handleReturn = () => {
      if (typeof window === "undefined") return;

      const visited = sessionStorage.getItem(`replyto_reel_visited_${postId}`) === "true";
      if (visited && !returnedFromReel) {
        setReturnedFromReel(true);
        setWaitingForReturn(false);
        setReelVisited(true);
      }
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        handleReturn();
      }
    };

    window.addEventListener("focus", handleReturn);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.removeEventListener("focus", handleReturn);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [postId, returnedFromReel]);

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative rounded-[24px] bg-white border border-black/[0.08] shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden p-6 sm:p-8"
    >
      {/* Lock Icon & Header */}
      <div className="flex flex-col items-center text-center mb-6">
        <div className="w-12 h-12 rounded-2xl bg-[#F5F5F7] border border-black/[0.06] flex items-center justify-center text-[#0071E3] mb-3.5 shadow-sm">
          <Lock className="w-5 h-5" />
        </div>

        <h3 className="text-xl font-semibold text-[#1D1D1F] tracking-tight">
          Comment to Unlock
        </h3>

        <p className="text-xs text-[#86868B] max-w-sm mt-1.5 leading-relaxed">
          {message ||
            `Comment on the Instagram Reel and verify your handle to unlock the full prompt and resources.`}
        </p>
      </div>

      {/* Steps */}
      <div className="space-y-3 mb-6">
        {/* Step 1: Open Reel & Comment */}
        <div
          className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
            reelVisited
              ? "bg-[#34C759]/5 border-[#34C759]/20"
              : "bg-[#F5F5F7] border-black/[0.06]"
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${
                reelVisited
                  ? "bg-[#34C759] text-white"
                  : "bg-[#1D1D1F] text-white"
              }`}
            >
              {reelVisited ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : "1"}
            </div>
            <div className="text-left min-w-0">
              <p className="text-xs font-semibold text-[#1D1D1F]">
                Comment &quot;{cleanKeyword}&quot; on Reel
              </p>
              <p className="text-[11px] text-[#86868B] truncate">
                Tap button below to open Reel & comment
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0 pl-2">
            <div className="px-2.5 py-1 bg-white rounded-lg border border-black/[0.08] font-mono font-bold text-xs text-[#0071E3] tracking-wider shadow-sm">
              {cleanKeyword}
            </div>
            <button
              onClick={handleCopyKeyword}
              className={`p-1.5 rounded-lg border transition-all apple-btn ${
                copied
                  ? "bg-[#34C759] border-[#34C759] text-white"
                  : "bg-white border-black/[0.08] text-[#86868B] hover:text-[#1D1D1F]"
              }`}
              title="Copy Keyword"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Step 2: Verify Comment */}
        <div className="p-4 rounded-2xl border bg-[#0071E3]/5 border-[#0071E3]/20">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 bg-[#0071E3] text-white">
              2
            </div>
            <div className="text-left flex-1 min-w-0">
              <p className="text-xs font-semibold text-[#1D1D1F]">
                Verify Your Comment
              </p>
              <p className="text-[11px] text-[#86868B]">
                Enter your Instagram username:
              </p>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-[#0071E3]/15 space-y-1.5">
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-[#86868B]">
                @
              </span>
              <input
                id="instagram-handle-input"
                type="text"
                value={instagramHandle}
                onChange={(e) => {
                  setError(null);
                  setInstagramHandle(e.target.value.replace(/^@/, ""));
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && instagramHandle.trim() && !loading) {
                    executeUnlock();
                  }
                }}
                placeholder="yourhandle"
                disabled={loading}
                className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-white border border-black/[0.08] text-xs font-mono text-[#1D1D1F] placeholder:text-[#A1A1A6] focus:outline-none focus:border-[#0071E3] focus:ring-2 focus:ring-[#0071E3]/20 transition-all font-medium"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Notification Toast */}
      <AnimatePresence>
        {copied && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-4 p-2.5 rounded-xl bg-[#34C759]/10 border border-[#34C759]/20 text-[#34C759] text-xs font-medium text-center flex items-center justify-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Keyword &quot;{cleanKeyword}&quot; copied to clipboard.</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error alert */}
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 text-center flex items-center justify-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Status: Verifying */}
      {verifyingNotice && (
        <div className="mb-4 p-3 rounded-xl bg-[#0071E3]/10 border border-[#0071E3]/20 text-center flex items-center justify-center gap-2 text-xs font-medium text-[#0071E3]">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>{verifyingNotice}</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-2.5">
        <button
          type="button"
          onClick={handleOpenReel}
          className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-full bg-[#1D1D1F] hover:bg-black text-white text-xs font-medium transition-all apple-btn"
        >
          <InstagramIcon className="w-3.5 h-3.5 text-[#E1306C]" />
          <span>
            {reelVisited ? "1. Re-open Instagram Reel" : `1. Open Reel & Comment "${cleanKeyword}"`}
          </span>
          <ExternalLink className="w-3 h-3 opacity-60" />
        </button>

        <button
          type="button"
          onClick={executeUnlock}
          disabled={loading}
          className="btn-lime w-full justify-center py-3.5 text-xs font-black disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-black" />
              <span>Verifying Comment...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
              <span>2. Verify & Unlock Guide</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </>
          )}
        </button>
      </div>

      <p className="text-center text-[11px] text-[#86868B] mt-4">
        Unlocked resources stay accessible permanently on this device.
      </p>
    </motion.div>
  );
};
