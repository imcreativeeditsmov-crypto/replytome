import React from "react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
      <div className="w-10 h-10 rounded-2xl bg-[#0071E3]/10 flex items-center justify-center mb-4">
        <div className="w-5 h-5 border-2 border-[#0071E3] border-t-transparent rounded-full animate-spin" />
      </div>
      <p className="text-xs font-semibold text-[#86868B] tracking-tight">
        Loading aibyshivai...
      </p>
    </div>
  );
}
