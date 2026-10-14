import React from "react";

interface PhoneMockupProps {
  children: React.ReactNode;
  urlBarText?: string;
}

export const PhoneMockup: React.FC<PhoneMockupProps> = ({
  children,
  urlBarText = "replyto.me/aibyshivai",
}) => {
  return (
    <div className="relative mx-auto w-full max-w-[340px] sm:max-w-[380px] aspect-[9/19] rounded-[48px] p-3 bg-[#1D1D1F] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] ring-1 ring-[#1D1D1F]/20 select-none">
      {/* Outer antenna bands */}
      <div className="absolute -left-1 top-24 w-1 h-8 bg-zinc-700/60 rounded-l" />
      <div className="absolute -left-1 top-36 w-1 h-12 bg-zinc-700/60 rounded-l" />
      <div className="absolute -left-1 top-52 w-1 h-12 bg-zinc-700/60 rounded-l" />
      <div className="absolute -right-1 top-32 w-1 h-16 bg-zinc-700/60 rounded-r" />

      {/* Screen container */}
      <div className="relative w-full h-full rounded-[40px] bg-white overflow-hidden flex flex-col border border-black/5">
        {/* Dynamic Island / Notch */}
        <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-full z-30 flex items-center justify-end px-3">
          <div className="w-2.5 h-2.5 rounded-full bg-[#111] ring-1 ring-zinc-800" />
        </div>

        {/* Minimal browser / status bar */}
        <div className="pt-9 pb-2 px-4 bg-white/95 backdrop-blur-md border-b border-[#E5E5EA] flex items-center justify-between text-[11px] text-[#86868B] z-20">
          <div className="w-12 text-left font-medium text-[#1D1D1F]">9:41</div>
          <div className="flex-1 max-w-[190px] mx-auto py-1 px-3 bg-[#F5F5F7] rounded-full text-center truncate text-[11px] text-[#1D1D1F] font-mono">
            {urlBarText}
          </div>
          <div className="w-12 text-right">5G 100%</div>
        </div>

        {/* Scrollable screen viewport */}
        <div className="flex-1 overflow-y-auto no-scrollbar bg-white">
          {children}
        </div>

        {/* Home indicator bar */}
        <div className="h-5 w-full bg-transparent flex items-center justify-center pointer-events-none pb-1">
          <div className="w-32 h-1 bg-black/25 rounded-full" />
        </div>
      </div>
    </div>
  );
};
