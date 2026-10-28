import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const jakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://aibyshivai.com"),
  title: {
    default: "aibyshivai — Exclusive AI Prompts, VFX Builds & Resources",
    template: "%s | aibyshivai",
  },
  description:
    "Official AI Prompts, Hollywood VFX sequences, and creative workflows curated exclusively by ShivAI (@aibyshivai / @creativeedits.mov).",
  keywords: [
    "aibyshivai",
    "AI by Shivai",
    "ShivAI",
    "VFX prompts",
    "AI prompts",
    "Instagram reel unlock",
    "creative edits",
  ],
  authors: [{ name: "aibyshivai" }],
  openGraph: {
    title: "aibyshivai — Exclusive AI Prompts, VFX Builds & Resources",
    description:
      "Official AI Prompts, Hollywood VFX sequences, and creative workflows curated by ShivAI.",
    siteName: "aibyshivai",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "aibyshivai — Exclusive AI Prompts, VFX Builds & Resources",
    description:
      "Official AI Prompts, Hollywood VFX sequences, and creative workflows curated by ShivAI.",
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
  themeColor: "#0D82ED",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${jakartaSans.variable} ${geistMono.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${jakartaSans.className} min-h-screen bg-[#FFFFFF] text-[#0A0A0A] font-sans antialiased selection:bg-[#D2F824] selection:text-[#0A0A0A]`}
        style={{
          fontFamily:
            "'Plus Jakarta Sans', var(--font-jakarta), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        }}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
