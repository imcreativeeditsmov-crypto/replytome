import fs from "fs";
import path from "path";
import { UserProfile, Post } from "@/types";
import { INITIAL_DEMO_USER, INITIAL_DEMO_POSTS } from "@/lib/firebase/mockData";

export interface ServerStoreData {
  user: UserProfile;
  users: UserProfile[];
  posts: Post[];
}

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_FILE = path.join(DATA_DIR, "store.json");

// In-memory cache for serverless environments
let memoryStore: ServerStoreData | null = null;

function ensureStoreFile(): ServerStoreData {
  if (memoryStore) {
    return memoryStore;
  }

  try {
    if (fs.existsSync(STORE_FILE)) {
      const raw = fs.readFileSync(STORE_FILE, "utf-8");
      if (raw && raw.trim().length > 0) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.posts && Array.isArray(parsed.posts)) {
          // Normalize users list
          const usersList: UserProfile[] = Array.isArray(parsed.users)
            ? parsed.users
            : [parsed.user || INITIAL_DEMO_USER];

          // Ensure AI by Shivai (Admin) exists in the users list
          const hasAdmin = usersList.some(
            (u) => u.username.toLowerCase() === "aibyshivai" || u.uid === "shivai-creator-uid"
          );
          if (!hasAdmin) {
            usersList.unshift(INITIAL_DEMO_USER);
          } else {
            // Guarantee admin rights for aibyshivai
            const adminUser = usersList.find(
              (u) => u.username.toLowerCase() === "aibyshivai" || u.uid === "shivai-creator-uid"
            );
            if (adminUser) {
              adminUser.isAdmin = true;
              adminUser.role = "admin";
            }
          }

          memoryStore = {
            user: parsed.user || INITIAL_DEMO_USER,
            users: usersList,
            posts: parsed.posts,
          };
          return memoryStore;
        }
      }
    }
  } catch (err) {
    console.warn("Could not read store.json from disk, falling back to memory:", err);
  }

  // Safe fallback seed without forcing write to disk on serverless
  memoryStore = {
    user: INITIAL_DEMO_USER,
    users: [INITIAL_DEMO_USER],
    posts: INITIAL_DEMO_POSTS,
  };
  return memoryStore;
}

function writeStore(data: ServerStoreData): void {
  memoryStore = data;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    // Silently ignore write failures on read-only serverless platforms like Vercel
    console.warn("Server storage write skipped (read-only environment):", err);
  }
}

export const ServerStorage = {
  getStore(): ServerStoreData {
    return ensureStoreFile();
  },

  getAllUsers(): UserProfile[] {
    const store = ensureStoreFile();
    return store.users || [store.user || INITIAL_DEMO_USER];
  },

  getUser(usernameOrUid?: string): UserProfile {
    const store = ensureStoreFile();
    if (!usernameOrUid) return store.user || INITIAL_DEMO_USER;

    const query = usernameOrUid.trim().toLowerCase();
    const users = store.users || [store.user || INITIAL_DEMO_USER];

    const match = users.find(
      (u) =>
        u.uid.toLowerCase() === query ||
        u.username.toLowerCase() === query
    );

    if (match) return match;
    if (store.user && (store.user.username.toLowerCase() === query || store.user.uid.toLowerCase() === query)) {
      return store.user;
    }

    return store.user || INITIAL_DEMO_USER;
  },

  getUserByUsername(username: string): UserProfile | null {
    const store = ensureStoreFile();
    const query = username.trim().toLowerCase();
    const users = store.users || [store.user || INITIAL_DEMO_USER];
    return users.find((u) => u.username.toLowerCase() === query) || null;
  },

  isUsernameAvailable(username: string, excludeUid?: string): boolean {
    const store = ensureStoreFile();
    const query = username.trim().toLowerCase();
    const users = store.users || [store.user || INITIAL_DEMO_USER];
    return !users.some(
      (u) => u.username.toLowerCase() === query && (!excludeUid || u.uid !== excludeUid)
    );
  },

  saveUser(user: UserProfile): UserProfile {
    const store = ensureStoreFile();
    const users = store.users || [store.user || INITIAL_DEMO_USER];
    const now = new Date().toISOString();

    const isSystemAdmin =
      user.username.toLowerCase() === "aibyshivai" ||
      user.uid === "shivai-creator-uid" ||
      user.email?.toLowerCase().includes("aibyshivai");

    const updatedUser: UserProfile = {
      ...user,
      isAdmin: isSystemAdmin ? true : Boolean(user.isAdmin),
      role: isSystemAdmin ? "admin" : (user.role || "creator"),
      updatedAt: now,
    };

    const idx = users.findIndex(
      (u) => u.uid === user.uid || u.username.toLowerCase() === user.username.toLowerCase()
    );

    if (idx !== -1) {
      users[idx] = updatedUser;
    } else {
      users.push(updatedUser);
    }

    // If updating main user
    if (isSystemAdmin || user.uid === store.user.uid) {
      store.user = updatedUser;
    }

    store.users = users;
    writeStore(store);
    return updatedUser;
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
    const user = this.getUserByUsername(username);
    if (!user) return [];
    return store.posts
      .filter((p) => (p.uid === user.uid || !p.uid) && p.status === "published")
      .sort((a, b) => a.order - b.order);
  },

  getPostBySlug(username: string, slug: string): { user: UserProfile; post: Post } | null {
    const store = ensureStoreFile();
    const user = this.getUserByUsername(username);
    if (!user) return null;
    const post = store.posts.find(
      (p) =>
        p.slug.toLowerCase() === slug.toLowerCase() &&
        (p.uid === user.uid || !p.uid || user.username.toLowerCase() === "aibyshivai")
    );
    if (!post) return null;
    return { user, post };
  },

  getPostById(postId: string): Post | null {
    const store = ensureStoreFile();
    const query = postId.trim().toLowerCase();
    return (
      store.posts.find(
        (p) =>
          p.id === postId ||
          p.slug.toLowerCase() === query ||
          query.includes(p.slug.toLowerCase()) ||
          p.slug.toLowerCase().includes(query)
      ) || null
    );
  },

  savePost(
    postData: Omit<Post, "createdAt" | "updatedAt" | "views" | "unlocks"> & {
      id?: string;
      createdAt?: string;
      views?: number;
      unlocks?: number;
    }
  ): Post {
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

  bulkSyncPosts(clientPosts: Post[], uid?: string): void {
    if (!clientPosts || !Array.isArray(clientPosts)) return;
    const store = ensureStoreFile();

    if (uid) {
      // Replace only this user's posts
      const otherPosts = store.posts.filter((p) => p.uid !== uid);
      const userPosts = clientPosts.map((p, i) => ({ ...p, uid, order: i }));
      store.posts = [...userPosts, ...otherPosts];
    } else {
      store.posts = clientPosts.map((p, i) => ({ ...p, order: i }));
    }

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

    for (const leftover of map.values()) {
      reordered.push({ ...leftover, order: reordered.length });
    }

    writeStore({ ...store, posts: reordered });
  },

  /**
   * Super Admin Analytics & Stats Aggregator
   */
  getAdminStats() {
    const store = ensureStoreFile();
    const users = store.users || [store.user || INITIAL_DEMO_USER];
    const posts = store.posts || [];

    const totalUsers = users.length;
    const totalPosts = posts.length;
    const totalViews = posts.reduce((sum, p) => sum + (p.views || 0), 0);
    const totalUnlocks = posts.reduce((sum, p) => sum + (p.unlocks || 0), 0);
    const unlockRate = totalViews > 0 ? ((totalUnlocks / totalViews) * 100).toFixed(1) : "0.0";

    // Build rich creator details
    const creatorsWithStats = users.map((user) => {
      const userPosts = posts.filter((p) => p.uid === user.uid);
      const userViews = userPosts.reduce((sum, p) => sum + (p.views || 0), 0);
      const userUnlocks = userPosts.reduce((sum, p) => sum + (p.unlocks || 0), 0);

      return {
        ...user,
        postsCount: userPosts.length,
        views: userViews,
        unlocks: userUnlocks,
        unlockRate: userViews > 0 ? ((userUnlocks / userViews) * 100).toFixed(1) : "0.0",
      };
    });

    // Build rich post details with creator info
    const postsWithCreator = posts.map((post) => {
      const creator = users.find((u) => u.uid === post.uid) || store.user || INITIAL_DEMO_USER;
      return {
        ...post,
        creatorName: creator.displayName,
        creatorUsername: creator.username,
        creatorAvatar: creator.photoURL,
      };
    });

    return {
      totalUsers,
      totalPosts,
      totalViews,
      totalUnlocks,
      unlockRate,
      creators: creatorsWithStats,
      posts: postsWithCreator,
    };
  },
};
