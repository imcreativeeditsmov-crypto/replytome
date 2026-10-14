"use client";

import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Lock,
  Download,
  Check,
  Maximize2,
  X,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CarouselProps {
  images: string[];
  isLocked?: boolean;
  gateKeyword?: string;
  allowDownload?: boolean;
  postTitle?: string;
  onUnlockClick?: () => void;
}

export const Carousel: React.FC<CarouselProps> = ({
  images,
  isLocked = false,
  gateKeyword,
  allowDownload = true,
  postTitle = "post",
  onUnlockClick,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [fullscreenOpen, setFullscreenOpen] = useState(false);

  if (!images || images.length === 0) return null;

  const nextSlide = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevSlide = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleDownloadImage = async (url: string, index: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (isLocked) return;

    setDownloading(true);
    try {
      const cleanTitle = postTitle.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
      const filename = `${cleanTitle || "image"}-slide-${index + 1}.jpg`;

      // Fetch blob to trigger a real file download in all modern browsers
      const response = await fetch(url, { mode: "cors" });
      const blob = await response.blob();
      const objectUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(objectUrl);

      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 2500);
    } catch (err) {
      console.warn("Direct blob download failed, falling back to window.open/anchor:", err);
      const link = document.createElement("a");
      link.href = url;
      link.target = "_blank";
      link.download = `${postTitle || "image"}-${index + 1}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 2500);
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadAll = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLocked) return;

    setDownloading(true);
    for (let i = 0; i < images.length; i++) {
      await handleDownloadImage(images[i], i);
      // Small pause between multiple downloads so browser queue doesn't block them
      await new Promise((res) => setTimeout(res, 350));
    }
    setDownloading(false);
  };

  return (
    <>
      <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] rounded-2xl overflow-hidden bg-[#F5F5F7] border border-[#E5E5EA] group shadow-sm select-none">
        {/* Slide Image */}
        <div className="relative w-full h-full overflow-hidden">
          <AnimatePresence initial={false} mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="w-full h-full relative cursor-pointer"
              onClick={() => !isLocked && setFullscreenOpen(true)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={images[currentIndex]}
                alt={`Slide ${currentIndex + 1}`}
                className={`w-full h-full object-cover transition-all duration-300 ${
                  isLocked ? "blur-xl scale-110 brightness-90" : "hover:scale-[1.02]"
                }`}
              />
            </motion.div>
          </AnimatePresence>

          {/* Lock Overlay if image gated */}
          {isLocked && (
            <div
              onClick={onUnlockClick}
              className="absolute inset-0 bg-black/30 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center text-white cursor-pointer transition-all hover:bg-black/35 z-20"
            >
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-lg flex items-center justify-center mb-3 shadow-lg border border-white/30">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <p className="font-semibold text-base mb-1 tracking-tight">
                Images Locked by Creator
              </p>
              <p className="text-xs text-white/80 max-w-xs">
                {gateKeyword
                  ? `Comment "${gateKeyword}" on the reel to unlock and download all pictures`
                  : "Complete the reel step below to reveal"}
              </p>
              <button className="mt-4 px-4 py-2 rounded-full bg-white text-[#1D1D1F] text-xs font-semibold shadow-md hover:bg-zinc-100 transition-all apple-btn">
                Unlock Images
              </button>
            </div>
          )}
        </div>

        {/* Top Controls Bar (Download & Fullscreen) */}
        {!isLocked && (
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-none">
            {/* Left: Download Button */}
            {allowDownload && (
              <div className="flex items-center gap-1.5 pointer-events-auto">
                <button
                  type="button"
                  onClick={(e) => handleDownloadImage(images[currentIndex], currentIndex, e)}
                  disabled={downloading}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md border shadow-sm transition-all apple-btn ${
                    downloaded
                      ? "bg-[#34C759] text-white border-[#34C759]"
                      : "bg-white/85 text-[#1D1D1F] border-white/40 hover:bg-white"
                  }`}
                  title="Download this picture"
                >
                  {downloading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : downloaded ? (
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  ) : (
                    <Download className="w-3.5 h-3.5 text-[#0071E3]" />
                  )}
                  <span>{downloaded ? "Saved!" : "Download"}</span>
                </button>

                {images.length > 1 && (
                  <button
                    type="button"
                    onClick={handleDownloadAll}
                    disabled={downloading}
                    className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium bg-black/40 text-white backdrop-blur-md border border-white/20 hover:bg-black/60 transition-all apple-btn"
                    title="Download all pictures in this post"
                  >
                    <span>All ({images.length})</span>
                  </button>
                )}
              </div>
            )}

            {/* Right: Counter Pill & Fullscreen Zoom */}
            <div className="flex items-center gap-1.5 pointer-events-auto ml-auto">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setFullscreenOpen(true);
                }}
                className="w-7 h-7 rounded-full bg-white/85 text-[#1D1D1F] backdrop-blur-md border border-white/40 flex items-center justify-center hover:bg-white transition-all shadow-sm apple-btn"
                title="View full resolution"
              >
                <Maximize2 className="w-3.5 h-3.5 text-[#1D1D1F]" />
              </button>

              {images.length > 1 && (
                <div className="px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md text-[11px] font-medium text-white">
                  {currentIndex + 1} / {images.length}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation Arrows (if > 1 image) */}
        {images.length > 1 && !isLocked && (
          <>
            <button
              onClick={prevSlide}
              aria-label="Previous slide"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-md border border-black/10 flex items-center justify-center text-[#1D1D1F] opacity-0 group-hover:opacity-100 transition-all hover:bg-white shadow-md z-10 apple-btn"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextSlide}
              aria-label="Next slide"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-md border border-black/10 flex items-center justify-center text-[#1D1D1F] opacity-0 group-hover:opacity-100 transition-all hover:bg-white shadow-md z-10 apple-btn"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Dots Indicator */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/30 backdrop-blur-md z-10">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndex(i);
                  }}
                  className={`h-1.5 rounded-full transition-all ${
                    currentIndex === i ? "w-4 bg-white" : "w-1.5 bg-white/50"
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Fullscreen Lightbox Modal */}
      {fullscreenOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 sm:p-8 animate-in fade-in duration-200">
          {/* Close button */}
          <button
            onClick={() => setFullscreenOpen(false)}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all z-20 apple-btn"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Fullscreen Image */}
          <div className="relative max-w-4xl max-h-[85vh] w-full h-full flex flex-col items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images[currentIndex]}
              alt={`Full view ${currentIndex + 1}`}
              className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl"
            />

            {/* Bottom Actions in Lightbox */}
            <div className="mt-4 flex items-center gap-3">
              {images.length > 1 && (
                <button
                  onClick={prevSlide}
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}

              {allowDownload && (
                <button
                  onClick={(e) => handleDownloadImage(images[currentIndex], currentIndex, e)}
                  disabled={downloading}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-semibold shadow-lg transition-all apple-btn"
                >
                  {downloaded ? (
                    <>
                      <Check className="w-4 h-4 stroke-[2.5]" />
                      <span>Image Saved!</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Download High-Res</span>
                    </>
                  )}
                </button>
              )}

              {images.length > 1 && (
                <button
                  onClick={nextSlide}
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-all"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
