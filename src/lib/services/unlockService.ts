import { MockStore, INITIAL_DEMO_POSTS } from "@/lib/firebase/mockData";
import { ServerStorage } from "@/lib/server/storage";
import { Post, UnlockVerificationResult } from "@/types";

/**
 * V2 Instagram Graph API Comment Verifier Interface
 * Can be plugged in with an Instagram Basic Display or Graph API token
 */
export interface InstagramCommentVerifier {
  verifyComment(params: {
    reelMediaId: string;
    commenterHandle?: string;
    targetKeyword: string;
  }): Promise<{ verified: boolean; error?: string }>;
}

/**
 * Default V2 placeholder implementation
 */
export class InstagramGraphAPIVerifier implements InstagramCommentVerifier {
  private apiToken?: string;

  constructor(token?: string) {
    this.apiToken = token || process.env.INSTAGRAM_GRAPH_API_TOKEN;
  }

  async verifyComment({
    reelMediaId,
    commenterHandle,
    targetKeyword,
  }: {
    reelMediaId: string;
    commenterHandle?: string;
    targetKeyword: string;
  }): Promise<{ verified: boolean; error?: string }> {
    // If Graph API token configured, perform live Meta API lookup
    if (this.apiToken && reelMediaId) {
      try {
        const url = `https://graph.facebook.com/v19.0/${reelMediaId}/comments?fields=from,text&access_token=${this.apiToken}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data && data.data && Array.isArray(data.data)) {
          const match = data.data.some((c: { from?: { username?: string }; text?: string }) => {
            const hasKeyword = c.text && c.text.toUpperCase().includes(targetKeyword.toUpperCase());
            if (commenterHandle) {
              const cleanHandle = commenterHandle.replace(/^@/, "").toLowerCase();
              const fromUser = c.from?.username?.toLowerCase();
              return hasKeyword && (!fromUser || fromUser === cleanHandle);
            }
            return hasKeyword;
          });

          if (!match) {
            return {
              verified: false,
              error: `Reel comments me "${targetKeyword}" nahi mila. Kripya pehle Reel par "${targetKeyword}" comment karein.`,
            };
          }
          return { verified: true };
        }
      } catch (err: unknown) {
        console.error("Instagram Graph API verification error:", err);
      }
    }

    // Handle check validation
    if (commenterHandle !== undefined) {
      const clean = commenterHandle.trim().replace(/^@/, "");
      if (!clean || clean.length < 2) {
        return {
          verified: false,
          error: "Apna sahi Instagram username (@handle) enter karein",
        };
      }
    }

    return { verified: true };
  }
}

/**
 * UnlockVerificationService
 * Handles comment gate unlock + Instagram API architecture
 */
export class UnlockVerificationService {
  private verifier: InstagramCommentVerifier;

  constructor(verifier?: InstagramCommentVerifier) {
    this.verifier = verifier || new InstagramGraphAPIVerifier();
  }

  /**
   * Unlock post content securely.
   * Locked text blocks and images are stored securely on the server and only
   * returned here after unlock verification, preventing client inspection.
   */
  async unlockPost(postId: string, commenterHandle?: string): Promise<UnlockVerificationResult> {
    if (!postId) {
      return { verified: false, error: "Post ID is required" };
    }

    let post: Post | null = null;

    // Fallback to ServerStorage, Mock Store, or INITIAL_DEMO_POSTS
    if (!post) {
      try {
        post = ServerStorage.getPostById(postId);
      } catch (e) {
        console.warn("ServerStorage lookup error:", e);
      }

      if (!post) {
        post = MockStore.getPostById(postId);
      }

      if (!post) {
        post =
          INITIAL_DEMO_POSTS.find(
            (p) =>
              p.id === postId ||
              p.slug === postId ||
              postId.toLowerCase().includes(p.slug.toLowerCase())
          ) || INITIAL_DEMO_POSTS[0] || null;
      }

      if (post) {
        try {
          MockStore.incrementUnlocks(post.id);
          ServerStorage.recordUnlock(post.id, commenterHandle);
        } catch {
          // ignore stat recording errors on serverless
        }
      }
    }

    if (!post) {
      return { verified: false, error: "Post not found or unavailable" };
    }

    // Comment verification check
    if (post.gateEnabled && post.reelUrl) {
      const match = post.reelUrl.match(/(?:reel|p)\/([a-zA-Z0-9_-]+)/);
      const mediaId = match ? match[1] : "";
      const verification = await this.verifier.verifyComment({
        reelMediaId: mediaId,
        commenterHandle,
        targetKeyword: post.gateKeyword,
      });

      if (!verification.verified) {
        return { verified: false, error: verification.error || "Comment not verified" };
      }
    }

    // Return full sensitive content payload
    return {
      verified: true,
      textBlocks: post.textBlocks || [],
      images: post.images || [],
    };
  }
}

export const unlockService = new UnlockVerificationService();
