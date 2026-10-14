import fs from "fs";
import path from "path";
import { UserProfile, Post } from "@/types";
import { INITIAL_DEMO_USER, INITIAL_DEMO_POSTS } from "@/lib/firebase/mockData";

interface ServerStoreData {
  user: UserProfile;
  posts: Post[];
}

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_FILE = path.join(DATA_DIR, "store.json");

function ensureStoreFile(): ServerStoreData {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(STORE_FILE)) {
      const raw = fs.readFileSync(STORE_FILE, "utf-8");
      if (raw && raw.trim().length > 0) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.posts && Array.isArray(parsed.posts)) {
          return parsed;
        }
      }
    }

    // Default seed
    const initialData: ServerStoreData = {
      user: INITIAL_DEMO_USER,
      posts: INITIAL_DEMO_POSTS,
    };
    fs.writeFileSync(STORE_FILE, JSON.stringify(initialData, null, 2), "utf-8");
    return initialData;
  } catch (err) {
    console.error("Error reading server store:", err);
    return {
      user: INITIAL_DEMO_USER,
      posts: INITIAL_DEMO_POSTS,
    };
  }
}

function writeStore(data: ServerStoreData): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing server store:", err);
  }
}

export const ServerStorage = {
  getStore(): ServerStoreData {
    return ensureStoreFile();
  },

  getUser(username?: string): UserProfile {
    const store = ensureStoreFile();
    if (!username) return store.user;
    if (store.user.username.toLowerCase() === username.toLowerCase()) {
      return store.user;
    }
    return store.user;
  },

  saveUser(user: UserProfile): UserProfile {
    const store = ensureStoreFile();
    store.user = {
      ...store.user,
      ...user,
      updatedAt: new Date().toISOString(),
    };
    writeStore(store);
    return store.user;
  },

  getPosts(uid?: string): Post[] {
    const store = ensureStoreFile();
    if (uid) {
      return store.posts.filter((p) => p.uid === uid).sort((a, b) => a.order - b.order);
    }
    return store.posts.sort((a, b) => a.order - b.order);
  },

  getPublishedPostsByUsername(username: string): Post[] {
    const store = ensureStoreFile();
    const user = this.getUser(username);
    if (!user) return [];
    return store.posts
      .filter((p) => p.uid === user.uid && p.status === "published")
      .sort((a, b) => a.order - b.order);
  },

  getPostBySlug(username: string, slug: string): { user: UserProfile; post: Post } | null {
    const store = ensureStoreFile();
    const user = this.getUser(username);
    if (!user) return null;
    const post = store.posts.find(
      (p) => p.slug.toLowerCase() === slug.toLowerCase() && (p.uid === user.uid || !p.uid)
    );
    if (!post) return null;
    return { user, post };
  },

  getPostById(postId: string): Post | null {
    const store = ensureStoreFile();
    return store.posts.find((p) => p.id === postId) || null;
  },

  savePost(postData: Omit<Post, "createdAt" | "updatedAt" | "views" | "unlocks"> & { id?: string; createdAt?: string; views?: number; unlocks?: number }): Post {
    const store = ensureStoreFile();
    const now = new Date().toISOString();
    const posts = store.posts;

    if (postData.id) {
      const index = posts.findIndex((p) => p.id === postData.id);
      if (index !== -1) {
        const updated: Post = {
          ...posts[index],
          ...postData,
          id: postData.id,
          updatedAt: now,
        };
        posts[index] = updated;
        writeStore({ ...store, posts });
        return updated;
      }
    }

    // New post
    const newPost: Post = {
      ...postData,
      id: postData.id || `post_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      views: postData.views || 0,
      unlocks: postData.unlocks || 0,
      createdAt: postData.createdAt || now,
      updatedAt: now,
    };

    posts.unshift(newPost);
    // Re-index order
    const ordered = posts.map((p, i) => ({ ...p, order: i }));
    writeStore({ ...store, posts: ordered });
    return newPost;
  },

  recordUnlock(postId: string, handle?: string): void {
    const store = ensureStoreFile();
    const post = store.posts.find((p) => p.id === postId || p.slug === postId);
    if (post) {
      post.unlocks = (post.unlocks || 0) + 1;
      writeStore(store);
    }
  },

  bulkSyncPosts(clientPosts: Post[]): void {
    if (!clientPosts || !Array.isArray(clientPosts)) return;
    const store = ensureStoreFile();
    // Authoritative update: sync the server store to the client's current posts
    store.posts = clientPosts.map((p, i) => ({ ...p, order: i }));
    writeStore(store);
  },

  deletePost(postId: string): boolean {
    const store = ensureStoreFile();
    const initialLen = store.posts.length;
    const filtered = store.posts.filter((p) => p.id !== postId && p.slug !== postId);
    if (filtered.length !== initialLen) {
      writeStore({ ...store, posts: filtered.map((p, i) => ({ ...p, order: i })) });
      return true;
    }
    return false;
  },

  reorderPosts(postIds: string[]): void {
    const store = ensureStoreFile();
    const map = new Map(store.posts.map((p) => [p.id, p]));
    const reordered: Post[] = [];

    for (const id of postIds) {
      const p = map.get(id);
      if (p) {
        reordered.push({ ...p, order: reordered.length });
        map.delete(id);
      }
    }

    // append any leftovers
    for (const leftover of map.values()) {
      reordered.push({ ...leftover, order: reordered.length });
    }

    writeStore({ ...store, posts: reordered });
  },
};
