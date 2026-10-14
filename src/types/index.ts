export type PostGateScope = "text_blocks" | "images" | "both";
export type PostStatus = "draft" | "published";

export interface PostTextBlock {
  id: string;
  title?: string;
  text: string;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  username: string;
  bio: string;
  photoURL: string;
  instagramUrl?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Post {
  id: string;
  uid: string;
  slug: string;
  title: string;
  images: string[];
  textBlocks: PostTextBlock[];
  reelUrl?: string;
  gateEnabled: boolean;
  gateKeyword: string;
  gateMessage: string;
  gateScope: PostGateScope;
  status: PostStatus;
  order: number;
  views: number;
  unlocks: number;
  allowDownload?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PublicPost {
  id: string;
  uid: string;
  slug: string;
  title: string;
  // If gateEnabled and locked:
  // - if scope is 'images' or 'both', images will only have 1 blurred placeholder or empty
  // - if scope is 'text_blocks' or 'both', textBlocks is empty until unlocked
  images: string[];
  textBlocks: PostTextBlock[];
  reelUrl?: string;
  gateEnabled: boolean;
  gateKeyword: string;
  gateMessage: string;
  gateScope: PostGateScope;
  status: PostStatus;
  views: number;
  unlocks: number;
  allowDownload?: boolean;
  order?: number;
  createdAt: string;
  isUnlocked?: boolean;
}

export interface UnlockVerificationResult {
  verified: boolean;
  textBlocks?: PostTextBlock[];
  images?: string[];
  error?: string;
}
