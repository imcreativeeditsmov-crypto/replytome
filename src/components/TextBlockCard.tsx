"use client";

import React, { useState } from "react";
import { Copy, Check } from "lucide-react";
import { PostTextBlock } from "@/types";

interface TextBlockCardProps {
  block: PostTextBlock;
  index: number;
}

export const TextBlockCard: React.FC<TextBlockCardProps> = ({ block, index }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(block.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  return (
    <div className="relative rounded-2xl bg-white border border-[#E5E5EA] shadow-sm hover:shadow-md transition-all overflow-hidden">
      {/* Header with Title and Copy button */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#F5F5F7]/70 border-b border-[#E5E5EA]">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-5 h-5 rounded-full bg-[#1D1D1F]/5 text-[#6E6E73] text-[11px] font-semibold flex items-center justify-center flex-shrink-0">
            {index + 1}
          </span>
          <h4 className="text-sm font-semibold text-[#1D1D1F] truncate">
            {block.title || `Content Block #${index + 1}`}
          </h4>
        </div>

        <button
          onClick={handleCopy}
          aria-label="Copy block text"
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all apple-btn ${
            copied
              ? "bg-[#34C759] text-white"
              : "bg-white text-[#1D1D1F] border border-[#E5E5EA] hover:bg-[#F5F5F7] hover:border-[#D1D1D6]"
          }`}
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-[#6E6E73]" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Text block body */}
      <div className="p-4 sm:p-5">
        <pre className="whitespace-pre-wrap font-sans text-sm text-[#1D1D1F] leading-relaxed break-words selection:bg-[#0071E3]/20">
          {block.text}
        </pre>
      </div>
    </div>
  );
};
