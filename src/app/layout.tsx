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
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://replyto.me"),
  title: {
    default: "Replyto.me — Smarter link in bio for creators",
    template: "%s | Replyto.me",
  },
  description:
    "Turn Reel comments into instant conversions with automated keyword-to-unlock link in bio.",
  keywords: [
    "link in bio",
    "Instagram reel unlock",
    "comment to unlock",
    "creator tools",
    "reply to me",
  ],
  authors: [{ name: "Replyto.me" }],
  openGraph: {
    title: "Replyto.me — Smarter link in bio for creators",
    description:
      "Automated comment-to-unlock link in bio for Instagram creators.",
    siteName: "Replyto.me",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Replyto.me — Smarter link in bio for creators",
    description:
      "Automated comment-to-unlock link in bio for creators.",
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
