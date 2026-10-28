import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ServerStorage } from "@/lib/server/storage";
import { PostService } from "@/lib/services/postService";
import { PublicProfileView } from "./PublicProfileView";

interface PageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;
  const user = ServerStorage.getUser(username);

  if (!user) {
    return {
      title: "Creator Not Found | aibyshivai",
    };
  }

  const title = `${user.displayName} (@${user.username}) — aibyshivai`;
  const description = user.bio || `Check out ${user.displayName}'s exclusive resources and links.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: user.photoURL ? [{ url: user.photoURL }] : [],
      type: "profile",
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: user.photoURL ? [user.photoURL] : [],
    },
  };
}

export default async function PublicProfilePage({ params }: PageProps) {
  const { username } = await params;
  const user = ServerStorage.getUser(username);

  if (!user) {
    notFound();
  }

  const rawPosts = ServerStorage.getPublishedPostsByUsername(username);
  const posts = rawPosts.map((p) => PostService.stripGatedContent(p, false));

  return <PublicProfileView user={user} initialPosts={posts} />;
}
