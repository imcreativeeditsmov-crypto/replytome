"use client";

import React from "react";
import { parseInstagramUrl } from "@/lib/utils";
import { ExternalLink, Play } from "lucide-react";
import { InstagramIcon } from "@/components/icons/InstagramIcon";

interface ReelPreviewCardProps {
  reelUrl: string;
  creatorName?: string;
  postId?: string;
  onReelClick?: () => void;
}

export const ReelPreviewCard: React.FC<ReelPreviewCardProps> = ({
  reelUrl,
  creatorName,
  postId,
  onReelClick,
}) => {
  const parsed = parseInstagramUrl(reelUrl);

  if (!reelUrl) return null;

  const handleClick = () => {
    if (postId && typeof window !== "undefined") {
      try {
        sessionStorage.setItem(`replyto_reel_visited_${postId}`, "true");
      } catch (e) {
        console.error(e);
      }
    }
    onReelClick?.();
  };

  return (
    <a
      href={parsed.cleanUrl || reelUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className="group relative flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-[#F5F5F7] via-white to-[#F5F5F7] border border-[#E5E5EA] shadow-sm hover:shadow-md hover:border-[#0071E3]/30 transition-all apple-btn overflow-hidden"
    >
      {/* Decorative gradient glow on hover */}
      <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-gradient-to-tr from-[#FD1D1D]/10 via-[#E1306C]/10 to-[#405DE6]/10 rounded-full blur-2xl group-hover:scale-150 transition-transform pointer-events-none" />

      <div className="flex items-center gap-3.5 z-10 min-w-0">
        {/* Instagram Reel Icon Box */}
        <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#FD1D1D] via-[#E1306C] to-[#833AB4] flex items-center justify-center text-white shadow-sm flex-shrink-0 group-hover:scale-105 transition-transform">
          <Play className="w-5 h-5 fill-white ml-0.5" />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1D1D1F]">
            <InstagramIcon className="w-3.5 h-3.5 text-[#E1306C]" />
            <span>Watch Instagram Reel</span>
            <span className="text-[10px] font-normal text-[#6E6E73] bg-[#E5E5EA]/70 px-1.5 py-0.2 rounded-md">
              Original
            </span>
          </div>
          <p className="text-xs text-[#6E6E73] truncate mt-0.5">
            {creatorName ? `by ${creatorName}` : "Tap to open and comment"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 text-xs font-medium text-[#0071E3] group-hover:translate-x-0.5 transition-transform flex-shrink-0 pl-2">
        <span>Open Reel</span>
        <ExternalLink className="w-3.5 h-3.5" />
      </div>
    </a>
  );
};
