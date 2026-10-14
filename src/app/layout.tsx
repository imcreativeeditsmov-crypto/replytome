import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://replyto.me"),
  title: {
    default: "Replyto.me — Your link in bio, but smarter",
    template: "%s | Replyto.me",
  },
  description:
    "The Apple-style, comment-to-unlock link in bio for creators. Gate prompts, links, and guides behind Instagram reel comments.",
  keywords: [
    "link in bio",
    "Instagram reel unlock",
    "comment to unlock",
    "creator tools",
    "reply to me",
  ],
  authors: [{ name: "Replyto.me" }],
  openGraph: {
    title: "Replyto.me — Your link in bio, but smarter",
    description:
      "The Apple-style, comment-to-unlock link in bio for creators. Gate prompts, links, and guides behind Instagram reel comments.",
    siteName: "Replyto.me",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Replyto.me — Your link in bio, but smarter",
    description:
      "The Apple-style, comment-to-unlock link in bio for creators.",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#FFFFFF",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-[#FFFFFF] text-[#1D1D1F] antialiased selection:bg-[#0071E3]/15 selection:text-[#0071E3]">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
