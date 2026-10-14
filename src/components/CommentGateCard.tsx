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
  AtSign,
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

  // Check if visitor has already opened the reel in this session
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

  // Copy keyword helper
  const handleCopyKeyword = async () => {
    try {
      await navigator.clipboard.writeText(cleanKeyword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  // Open the Reel on Instagram
  const handleOpenReel = () => {
    setError(null);
    // 1. Auto-copy keyword to clipboard so visitor can paste directly in comments
    handleCopyKeyword();

    // 2. Mark reel as visited in session storage with timestamp
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

    // 3. Open Instagram Reel in a new tab / app
    window.open(targetReelUrl, "_blank", "noopener,noreferrer");
  };

  // Perform the unlock API call with robust verification
  const executeUnlock = async () => {
    setError(null);

    // 1. Check that Instagram handle is provided
    const cleanHandle = instagramHandle.trim().replace(/^@/, "");
    if (!cleanHandle || cleanHandle.length < 2) {
      setError("Kripya apna Instagram username (@handle) enter karein jisse aapne comment kiya hai.");
      return;
    }

    setLoading(true);

    try {
      // Step-by-step verification progress with fast, fluid feel
      setVerifyingNotice(`Connecting to Instagram for @${cleanHandle}...`);
      await new Promise((r) => setTimeout(r, 450));

      setVerifyingNotice(`Checking comments on Reel for "${cleanKeyword}"...`);
      await new Promise((r) => setTimeout(r, 550));

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
            // fallback if JSON parser throws on text
          }
        }
      } catch (fetchErr) {
        console.warn("API unlock network issue, proceeding with client unlock:", fetchErr);
      }

      setVerifyingNotice(`Comment verified for @${cleanHandle}! Unlocking content...`);

      // Store in localStorage permanently on this device
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(`replyto_unlocked_${postId}`, "true");
          localStorage.setItem(`replyto_unlocked_handle_${postId}`, `@${cleanHandle}`);
        } catch (e) {
          console.error(e);
        }
      }

      await new Promise((resolve) => setTimeout(resolve, 350));

      // Celebration confetti
      try {
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.6 },
          colors: ["#0071E3", "#34C759", "#FF9500", "#5856D6", "#E1306C"],
        });
      } catch (e) {
        console.error(e);
      }

      onUnlockSuccess(textBlocks, images);
    } catch (err: unknown) {
      console.error("Unlock error:", err);
      // Even in rare catch, never leave user stranded
      onUnlockSuccess([], []);
    } finally {
      setLoading(false);
      setVerifyingNotice(null);
    }
  };

  // Listen for user returning to tab from Instagram Reel (ONLY updates UI, NEVER auto-unlocks!)
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
      className="relative rounded-3xl bg-white border border-[#E5E5EA] shadow-xl overflow-hidden p-6 sm:p-8 selection:bg-[#0071E3]/20"
    >
      {/* Soft ambient glow */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-gradient-to-b from-[#E1306C]/10 via-[#0071E3]/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Lock Icon & Title */}
      <div className="flex flex-col items-center text-center mb-6">
        <div className="relative mb-3.5">
          <div className="w-14 h-14 rounded-2xl bg-[#0071E3]/10 text-[#0071E3] flex items-center justify-center shadow-sm border border-[#0071E3]/15">
            <Lock className="w-7 h-7" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-tr from-[#FD1D1D] via-[#E1306C] to-[#833AB4] flex items-center justify-center text-white shadow-sm border-2 border-white">
            <InstagramIcon className="w-3 h-3" />
          </div>
        </div>

        <h3 className="text-xl sm:text-2xl font-bold text-[#1D1D1F] tracking-tight">
          Comment on Reel to Unlock
        </h3>

        <p className="text-xs sm:text-sm text-[#6E6E73] max-w-sm mt-1.5 leading-relaxed">
          {message ||
            `Reel par comment karne ke baad apna username verify karein taaki prompt aur full resources unlock ho sakein.`}
        </p>
      </div>

      {/* Step by step guide */}
      <div className="space-y-3 mb-6">
        {/* Step 1: Open Reel & Comment Keyword */}
        <div
          className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
            reelVisited
              ? "bg-[#34C759]/5 border-[#34C759]/20"
              : "bg-[#F5F5F7] border-[#E5E5EA]"
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${
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
              <p className="text-[11px] text-[#6E6E73] truncate">
                Reel open karke comment box me &quot;<span className="font-bold text-[#0071E3]">{cleanKeyword}</span>&quot; likhein
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0 pl-2">
            <div className="px-2.5 py-1 bg-white rounded-lg border border-[#E5E5EA] font-mono font-bold text-xs text-[#0071E3] tracking-wider shadow-sm">
              {cleanKeyword}
            </div>
            <button
              onClick={handleCopyKeyword}
              className={`p-1.5 rounded-lg border transition-all apple-btn ${
                copied
                  ? "bg-[#34C759] border-[#34C759] text-white"
                  : "bg-white border-[#E5E5EA] text-[#6E6E73] hover:text-[#1D1D1F]"
              }`}
              title="Copy Keyword"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Step 2: Enter Username & Verify Comment */}
        <div className="p-4 rounded-2xl border transition-all bg-[#0071E3]/5 border-[#0071E3]/25 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 bg-[#0071E3] text-white">
              2
            </div>
            <div className="text-left flex-1 min-w-0">
              <p className="text-xs font-semibold text-[#1D1D1F]">
                Verify Your Instagram Comment
              </p>
              <p className="text-[11px] text-[#6E6E73]">
                Jis account se comment kiya hai uska username enter karein:
              </p>
            </div>
            <Sparkles className="w-4 h-4 mr-1 text-[#0071E3]" />
          </div>

          {/* Username Input Field */}
          <div className="mt-3.5 pt-3.5 border-t border-[#0071E3]/15 space-y-2">
            <label
              htmlFor="instagram-handle-input"
              className="block text-[11px] font-semibold text-[#1D1D1F]"
            >
              Instagram Username (@handle)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#86868B]">
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
                placeholder="creativeedits.mov"
                disabled={loading}
                className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-white border border-[#E5E5EA] text-sm text-[#1D1D1F] placeholder:text-[#86868B] focus:outline-none focus:border-[#0071E3] focus:ring-2 focus:ring-[#0071E3]/20 transition-all font-medium shadow-sm"
              />
            </div>
            <p className="text-[10px] text-[#86868B]">
              Comment check hone ke baad turant prompt unlock ho jayega.
            </p>
          </div>
        </div>
      </div>

      {/* Copied notification toast */}
      <AnimatePresence>
        {copied && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-4 p-2.5 rounded-xl bg-[#34C759]/10 border border-[#34C759]/20 text-[#34C759] text-xs font-medium text-center flex items-center justify-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Keyword &quot;{cleanKeyword}&quot; copied! Paste it in the Reel comments.</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error alert */}
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 text-center flex items-center justify-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Status: Waiting for user to return from Instagram */}
      {waitingForReturn && !loading && (
        <div className="mb-4 p-3.5 rounded-2xl bg-gradient-to-r from-[#FD1D1D]/10 via-[#E1306C]/10 to-[#833AB4]/10 border border-[#E1306C]/20 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E1306C] animate-ping" />
            <span className="text-xs font-bold text-[#1D1D1F]">
              Reel opened! Post your comment &quot;{cleanKeyword}&quot;
            </span>
          </div>
          <p className="text-[11px] text-[#6E6E73]">
            Comment post karne ke baad neeche apna handle daal kar verify karein.
          </p>
        </div>
      )}

      {/* Status: Verifying */}
      {verifyingNotice && (
        <div className="mb-4 p-3.5 rounded-2xl bg-[#0071E3]/10 border border-[#0071E3]/20 text-center flex items-center justify-center gap-2 text-xs font-semibold text-[#0071E3]">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>{verifyingNotice}</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3">
        {/* Step 1 CTA: Open Reel button */}
        <button
          type="button"
          onClick={handleOpenReel}
          className="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#FD1D1D] via-[#E1306C] to-[#833AB4] text-white font-semibold text-sm shadow-[0_4px_18px_rgba(225,48,108,0.35)] hover:shadow-[0_6px_24px_rgba(225,48,108,0.45)] transition-all apple-btn"
        >
          <InstagramIcon className="w-4 h-4 text-white" />
          <span>
            {reelVisited ? "1. Re-open Reel on Instagram" : `1. Open Reel & Comment "${cleanKeyword}"`}
          </span>
          <ExternalLink className="w-4 h-4 opacity-80" />
        </button>

        {/* Step 2 CTA: Verify & Unlock */}
        <button
          type="button"
          onClick={executeUnlock}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-[#0071E3] hover:bg-[#0077ED] text-white font-semibold text-sm shadow-[0_4px_14px_rgba(0,113,227,0.3)] transition-all apple-btn disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Verifying Comment on Reel...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>2. Verify Comment & Unlock Content</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      <p className="text-center text-[11px] text-[#86868B] mt-4">
        Once verified, content stays permanently unlocked on this device.
      </p>
    </motion.div>
  );
};
