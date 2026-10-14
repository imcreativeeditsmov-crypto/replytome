"use client";

import React, { useState } from "react";
import { Copy, Check, Share2, X, MessageCircle, Send } from "lucide-react";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  url: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  title,
  url,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const shareWhatsApp = () => {
    window.open(`https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`, "_blank");
  };

  const shareX = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`, "_blank");
  };

  const shareTelegram = () => {
    window.open(`https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-[#E5E5EA] z-10 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-[#E5E5EA]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#0071E3]/10 text-[#0071E3] flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-base text-[#1D1D1F]">Share Link</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-[#F5F5F7] flex items-center justify-center text-[#6E6E73] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-[#6E6E73] mt-3 mb-4 truncate font-medium">
          {title}
        </p>

        {/* Copy Link Input */}
        <div className="flex items-center gap-2 p-1.5 pl-3 rounded-2xl bg-[#F5F5F7] border border-[#E5E5EA] mb-5">
          <input
            type="text"
            readOnly
            value={url}
            className="flex-1 bg-transparent text-xs text-[#1D1D1F] outline-none font-mono truncate"
          />
          <button
            onClick={handleCopy}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all apple-btn ${
              copied
                ? "bg-[#34C759] text-white"
                : "bg-[#0071E3] text-white hover:bg-[#0077ED]"
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        {/* Quick Share Targets */}
        <div>
          <p className="text-[11px] font-semibold text-[#86868B] uppercase tracking-wider mb-2.5">
            Share directly to
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={shareWhatsApp}
              className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-[#F5F5F7] hover:bg-[#EBEBED] border border-[#E5E5EA] transition-all apple-btn"
            >
              <div className="w-8 h-8 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-sm">
                <MessageCircle className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-medium text-[#1D1D1F]">WhatsApp</span>
            </button>

            <button
              onClick={shareX}
              className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-[#F5F5F7] hover:bg-[#EBEBED] border border-[#E5E5EA] transition-all apple-btn"
            >
              <div className="w-8 h-8 rounded-full bg-[#000000] text-white flex items-center justify-center shadow-sm">
                <span className="font-bold text-xs">𝕏</span>
              </div>
              <span className="text-[11px] font-medium text-[#1D1D1F]">X (Twitter)</span>
            </button>

            <button
              onClick={shareTelegram}
              className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-[#F5F5F7] hover:bg-[#EBEBED] border border-[#E5E5EA] transition-all apple-btn"
            >
              <div className="w-8 h-8 rounded-full bg-[#0088cc] text-white flex items-center justify-center shadow-sm">
                <Send className="w-3.5 h-3.5 ml-0.5" />
              </div>
              <span className="text-[11px] font-medium text-[#1D1D1F]">Telegram</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
