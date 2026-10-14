import React from "react";
import type { Metadata } from "next";
import { ServerStorage } from "@/lib/server/storage";
import { PostService } from "@/lib/services/postService";
import { PublicPostView } from "./PublicPostView";

interface PageProps {
  params: Promise<{ username: string; slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username, slug } = await params;
  let data: { user: any; post: any } | null = null;
  const serverData = ServerStorage.getPostBySlug(username, slug);
  if (serverData) {
    data = {
      user: serverData.user,
      post: PostService.stripGatedContent(serverData.post, false),
    };
  } else {
    data = await PostService.getPublicPostBySlug(username, slug, false);
  }

  if (!data) {
    return {
      title: "Exclusive Resource | Replyto.me",
    };
  }

  const { post, user } = data;
  const title = `${post.title} — ${user.displayName}`;
  const description = post.gateEnabled
    ? post.gateMessage || `Comment "${post.gateKeyword}" on Instagram to unlock.`
    : `Exclusive guide and resources shared by ${user.displayName}.`;

  const ogImages = post.images && post.images.length > 0 ? [{ url: post.images[0] }] : [];

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: ogImages,
      type: "article",
      siteName: "Replyto.me",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: post.images && post.images.length > 0 ? [post.images[0]] : [],
    },
  };
}

export default async function PublicPostPage({ params }: PageProps) {
  const { username, slug } = await params;
  let data: { user: any; post: any } | null = null;
  const serverData = ServerStorage.getPostBySlug(username, slug);
  if (serverData) {
    data = {
      user: serverData.user,
      post: PostService.stripGatedContent(serverData.post, false),
    };
  } else {
    data = await PostService.getPublicPostBySlug(username, slug, false);
  }

  return (
    <PublicPostView
      initialUser={data?.user || null}
      initialPost={data?.post || null}
      username={username}
      slug={slug}
    />
  );
}
