import React from "react";
import Link from "next/link";
import { InstagramIcon } from "@/components/icons/InstagramIcon";

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#F5F5F7] border-t border-black/[0.06] text-[#86868B] text-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 pb-16">
        {/* Footnote / Disclaimer section like Apple */}
        <div className="border-b border-black/[0.08] pb-6 mb-8 text-[11px] leading-relaxed text-[#86868B]">
          <p>
            1. Instant comment-to-unlock operates in the viewer&apos;s mobile browser with zero DM delay, no Instagram API rate limits, and full compatibility with Instagram in-app browsers.
          </p>
          <p className="mt-2">
            2. Replyto.me is built for creators, photographers, VFX artists, and educators who want clean link delivery without spamming direct messages.
          </p>
        </div>

        {/* Apple 4-Column Directory */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Column 1: Product */}
          <div>
            <h4 className="text-[12px] font-semibold text-[#1D1D1F] tracking-tight mb-3">
              Product
            </h4>
            <ul className="space-y-2 text-[12px]">
              <li>
                <Link href="/#features" className="hover:text-[#1D1D1F] transition-colors">
                  Comment Gating
                </Link>
              </li>
              <li>
                <Link href="/#demo" className="hover:text-[#1D1D1F] transition-colors">
                  Live Reel Simulator
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-[#1D1D1F] transition-colors">
                  Creator Analytics
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-[#1D1D1F] transition-colors">
                  Instant Setup
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Solutions */}
          <div>
            <h4 className="text-[12px] font-semibold text-[#1D1D1F] tracking-tight mb-3">
              For Creators
            </h4>
            <ul className="space-y-2 text-[12px]">
              <li>
                <Link href="/#demo" className="hover:text-[#1D1D1F] transition-colors">
                  Interactive Live Reel Demo
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-[#1D1D1F] transition-colors">
                  Claim Your Bio Handle
                </Link>
              </li>
              <li>
                <Link href="/#about" className="hover:text-[#1D1D1F] transition-colors">
                  Platform Architecture
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Resources */}
          <div>
            <h4 className="text-[12px] font-semibold text-[#1D1D1F] tracking-tight mb-3">
              Resources
            </h4>
            <ul className="space-y-2 text-[12px]">
              <li>
                <span className="hover:text-[#1D1D1F] transition-colors cursor-pointer">
                  Prompt Engineering
                </span>
              </li>
              <li>
                <span className="hover:text-[#1D1D1F] transition-colors cursor-pointer">
                  Reel Comment Strategies
                </span>
              </li>
              <li>
                <span className="hover:text-[#1D1D1F] transition-colors cursor-pointer">
                  Mobile In-App Browser Guide
                </span>
              </li>
              <li>
                <span className="hover:text-[#1D1D1F] transition-colors cursor-pointer">
                  Notion Templates
                </span>
              </li>
            </ul>
          </div>

          {/* Column 4: Replyto.me Account */}
          <div>
            <h4 className="text-[12px] font-semibold text-[#1D1D1F] tracking-tight mb-3">
              Account
            </h4>
            <ul className="space-y-2 text-[12px]">
              <li>
                <Link href="/login" className="hover:text-[#1D1D1F] transition-colors">
                  Sign In with Google
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-[#1D1D1F] transition-colors">
                  Creator Handle Sign In
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-[#1D1D1F] transition-colors">
                  Manage Bio Links
                </Link>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/creativeedits.mov/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#0A0A0A] transition-colors flex items-center gap-1.5 font-bold text-[#0D82ED]"
                >
                  <InstagramIcon className="w-3.5 h-3.5 text-[#E1306C]" />
                  <span>@creativeedits.mov</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Creator Attribution Box */}
        <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-white border border-black/[0.08] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FD1D1D] via-[#E1306C] to-[#833AB4] flex items-center justify-center text-white shadow-sm flex-shrink-0">
              <InstagramIcon className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-[#0A0A0A]">
                Website Designed & Built by <span className="text-[#0D82ED]">Creative Edits</span>
              </p>
              <p className="text-[11px] text-[#7E828A]">
                Visual effects, motion graphics & full-stack creator platform engineering
              </p>
            </div>
          </div>

          <a
            href="https://www.instagram.com/creativeedits.mov/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-lime text-xs px-4 py-2 flex items-center gap-1.5 whitespace-nowrap shadow-sm hover:scale-105 transition-transform"
          >
            <InstagramIcon className="w-3.5 h-3.5 text-black" />
            <span>Follow @creativeedits.mov</span>
          </a>
        </div>

        {/* Bottom Bar: Copyright + Status */}
        <div className="pt-6 border-t border-black/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-[#0A0A0A]">
              Copyright © {new Date().getFullYear()} Replyto.me Inc.
            </span>
            <span>•</span>
            <span>
              Crafted with ❤️ by{" "}
              <a
                href="https://www.instagram.com/creativeedits.mov/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-extrabold text-[#0A0A0A] hover:text-[#0D82ED] underline underline-offset-2"
              >
                @creativeedits.mov
              </a>
            </span>
          </div>

          <div className="flex items-center gap-4 text-[#7E828A]">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#34C759] animate-pulse" />
              <span>All Systems Operational</span>
            </span>
            <span>•</span>
            <Link
              href="/admin"
              className="text-[#7E828A] hover:text-[#0A0A0A] opacity-60 hover:opacity-100 transition-opacity"
              title="Super Admin Portal"
            >
              🔒
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
