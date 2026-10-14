import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  increment,
  writeBatch,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage, isFirebaseConfigured } from "@/lib/firebase/config";
import { MockStore } from "@/lib/firebase/mockData";
import { UserProfile, Post, PublicPost } from "@/types";

export const PostService = {
  /**
   * Check if Firebase is currently connected or if using Demo Mock Store
   */
  isConfigured(): boolean {
    return isFirebaseConfigured && !!db;
  },

  /**
   * Fetch a user profile by UID
   */
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    if (!this.isConfigured()) {
      const user = MockStore.getUser();
      return user.uid === uid ? user : null;
    }

    try {
      const docRef = doc(db!, "users", uid);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return snap.data() as UserProfile;
      }
      return null;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return MockStore.getUser();
    }
  },

  /**
   * Fetch a user profile by username
   */
  async getUserByUsername(username: string): Promise<UserProfile | null> {
    const normalized = username.trim().toLowerCase();

    if (!this.isConfigured()) {
      return MockStore.getUserByUsername(normalized);
    }

    try {
      const usernamesRef = doc(db!, "usernames", normalized);
      const usernameSnap = await getDoc(usernamesRef);

      if (usernameSnap.exists()) {
        const uid = usernameSnap.data()?.uid;
        if (uid) {
          const userSnap = await getDoc(doc(db!, "users", uid));
          if (userSnap.exists()) {
            return userSnap.data() as UserProfile;
          }
        }
      }
      return null;
    } catch (error) {
      console.error("Error fetching user by username:", error);
      return MockStore.getUserByUsername(normalized);
    }
  },

  /**
   * Check if a username is available
   */
  async isUsernameAvailable(username: string, currentUid?: string): Promise<boolean> {
    const normalized = username.trim().toLowerCase();

    if (!this.isConfigured()) {
      return !MockStore.isUsernameTaken(normalized, currentUid);
    }

    try {
      const docRef = doc(db!, "usernames", normalized);
      const snap = await getDoc(docRef);
      if (!snap.exists()) return true;

      // If the current user already owns it, it's valid for them
      const data = snap.data();
      return data?.uid === currentUid;
    } catch (error) {
      console.error("Error checking username availability:", error);
      return !MockStore.isUsernameTaken(normalized, currentUid);
    }
  },

  /**
   * Create or update user profile + username document in Firestore batch
   */
  async saveUserProfile(profile: UserProfile, oldUsername?: string): Promise<UserProfile> {
    const normalizedUsername = profile.username.toLowerCase();

    if (!this.isConfigured()) {
      return MockStore.updateUser({ ...profile, username: normalizedUsername });
    }

    try {
      const batch = writeBatch(db!);
      const userRef = doc(db!, "users", profile.uid);

      batch.set(
        userRef,
        {
          ...profile,
          username: normalizedUsername,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      // Claim new username
      const newUsernameRef = doc(db!, "usernames", normalizedUsername);
      batch.set(newUsernameRef, { uid: profile.uid, createdAt: new Date().toISOString() });

      // If username changed, delete the old username entry
      if (oldUsername && oldUsername.toLowerCase() !== normalizedUsername) {
        const oldUsernameRef = doc(db!, "usernames", oldUsername.toLowerCase());
        batch.delete(oldUsernameRef);
      }

      await batch.commit();
      return profile;
    } catch (error) {
      console.error("Error saving user profile:", error);
      return MockStore.updateUser({ ...profile, username: normalizedUsername });
    }
  },

  /**
   * Fetch all posts for creator dashboard
   */
  async getCreatorPosts(uid: string): Promise<Post[]> {
    if (!this.isConfigured()) {
      return MockStore.getPosts(uid);
    }

    try {
      const postsRef = collection(db!, "posts");
      const q = query(postsRef, where("uid", "==", uid), orderBy("order", "asc"));
      const snapshot = await getDocs(q);

      return snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as Post[];
    } catch (error) {
      console.error("Error fetching creator posts:", error);
      return MockStore.getPosts(uid);
    }
  },

  /**
   * Fetch published posts for public profile page
   */
  async getPublicProfilePosts(username: string): Promise<{ user: UserProfile | null; posts: PublicPost[] }> {
    const user = await this.getUserByUsername(username);
    if (!user) {
      return { user: null, posts: [] };
    }

    if (!this.isConfigured()) {
      const posts = MockStore.getPublishedPostsByUsername(username);
      return {
        user,
        posts: posts.map((p) => this.stripGatedContent(p, false)),
      };
    }

    try {
      const postsRef = collection(db!, "posts");
      const q = query(
        postsRef,
        where("uid", "==", user.uid),
        where("status", "==", "published"),
        orderBy("order", "asc")
      );
      const snapshot = await getDocs(q);
      const rawPosts = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Post));

      return {
        user,
        posts: rawPosts.map((p) => this.stripGatedContent(p, false)),
      };
    } catch (error) {
      console.error("Error fetching public profile posts:", error);
      const posts = MockStore.getPublishedPostsByUsername(username);
      return {
        user,
        posts: posts.map((p) => this.stripGatedContent(p, false)),
      };
    }
  },

  /**
   * Get public post by slug (locked content is securely stripped if gate is enabled!)
   */
  async getPublicPostBySlug(
    username: string,
    slug: string,
    isUnlocked: boolean = false
  ): Promise<{ user: UserProfile; post: PublicPost } | null> {
    const user = await this.getUserByUsername(username);
    if (!user) return null;

    if (!this.isConfigured()) {
      const data = MockStore.getPostBySlug(username, slug);
      if (!data) return null;
      return {
        user: data.user,
        post: this.stripGatedContent(data.post, isUnlocked),
      };
    }

    try {
      const postsRef = collection(db!, "posts");
      const q = query(
        postsRef,
        where("uid", "==", user.uid),
        where("slug", "==", slug),
        where("status", "==", "published")
      );
      const snapshot = await getDocs(q);
      if (snapshot.empty) return null;

      const docSnap = snapshot.docs[0];
      const fullPost = { id: docSnap.id, ...docSnap.data() } as Post;

      return {
        user,
        post: this.stripGatedContent(fullPost, isUnlocked),
      };
    } catch (error) {
      console.error("Error fetching post by slug:", error);
      const data = MockStore.getPostBySlug(username, slug);
      if (!data) return null;
      return {
        user: data.user,
        post: this.stripGatedContent(data.post, isUnlocked),
      };
    }
  },

  /**
   * Fetch full post by ID (for creator editing)
   */
  async getPostById(postId: string): Promise<Post | null> {
    if (!this.isConfigured()) {
      return MockStore.getPostById(postId);
    }

    try {
      const docRef = doc(db!, "posts", postId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return { id: snap.id, ...snap.data() } as Post;
      }
      return null;
    } catch (error) {
      console.error("Error fetching post by ID:", error);
      return MockStore.getPostById(postId);
    }
  },

  /**
   * Save (create or update) a post
   */
  async savePost(
    postData: Omit<Post, "id" | "createdAt" | "updatedAt" | "views" | "unlocks"> & { id?: string }
  ): Promise<Post> {
    if (!this.isConfigured()) {
      const saved = MockStore.savePost(postData);
      if (typeof window !== "undefined") {
        fetch("/api/posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ post: saved }),
        }).catch((e) => console.error("Error syncing post to server:", e));
      }
      return saved;
    }

    try {
      const now = new Date().toISOString();
      const postsRef = collection(db!, "posts");

      if (postData.id) {
        const postRef = doc(db!, "posts", postData.id);
        await updateDoc(postRef, {
          ...postData,
          updatedAt: now,
        });
        const saved = await this.getPostById(postData.id);
        return saved!;
      } else {
        const newDocRef = doc(postsRef);
        const newPost: Post = {
          ...postData,
          id: newDocRef.id,
          views: 0,
          unlocks: 0,
          createdAt: now,
          updatedAt: now,
        };
        await setDoc(newDocRef, newPost);
        return newPost;
      }
    } catch (error) {
      console.error("Error saving post to Firestore:", error);
      const saved = MockStore.savePost(postData);
      if (typeof window !== "undefined") {
        fetch("/api/posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ post: saved }),
        }).catch((e) => console.error("Error syncing post to server:", e));
      }
      return saved;
    }
  },

  /**
   * Delete a post
   */
  async deletePost(postId: string): Promise<boolean> {
    if (!this.isConfigured()) {
      const res = MockStore.deletePost(postId);
      if (typeof window !== "undefined") {
        fetch("/api/posts", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: postId }),
        }).catch((e) => console.error("Error syncing delete to server:", e));
      }
      return res;
    }

    try {
      await deleteDoc(doc(db!, "posts", postId));
      return true;
    } catch (error) {
      console.error("Error deleting post:", error);
      const res = MockStore.deletePost(postId);
      if (typeof window !== "undefined") {
        fetch("/api/posts", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: postId }),
        }).catch((e) => console.error("Error syncing delete to server:", e));
      }
      return res;
    }
  },

  /**
   * Reorder posts
   */
  async reorderPosts(postIds: string[]): Promise<void> {
    if (!this.isConfigured()) {
      MockStore.reorderPosts(postIds);
      if (typeof window !== "undefined") {
        fetch("/api/posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "reorder", postIds }),
        }).catch((e) => console.error("Error syncing reorder to server:", e));
      }
      return;
    }

    try {
      const batch = writeBatch(db!);
      postIds.forEach((id, index) => {
        const ref = doc(db!, "posts", id);
        batch.update(ref, { order: index });
      });
      await batch.commit();
    } catch (error) {
      console.error("Error reordering posts:", error);
      MockStore.reorderPosts(postIds);
      if (typeof window !== "undefined") {
        fetch("/api/posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "reorder", postIds }),
        }).catch((e) => console.error("Error syncing reorder to server:", e));
      }
    }
  },

  /**
   * Upload an image to Firebase Storage (or data URL fallback for instant preview)
   */
  async uploadImage(file: File, uid: string): Promise<string> {
    if (this.isConfigured() && storage) {
      try {
        const fileExt = file.name.split(".").pop() || "jpg";
        const filename = `images/${uid}/${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
        const storageRef = ref(storage, filename);
        await uploadBytes(storageRef, file);
        return await getDownloadURL(storageRef);
      } catch (error) {
        console.warn("Storage upload failed, falling back to data URL:", error);
      }
    }

    // Fallback: convert file to Base64 data URL
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  },

  /**
   * Strip locked content if gated and not unlocked yet
   */
  stripGatedContent(post: Post, isUnlocked: boolean): PublicPost {
    if (!post.gateEnabled || isUnlocked) {
      return { ...post, isUnlocked: true };
    }

    // Post is gated and locked
    const publicCopy: PublicPost = {
      ...post,
      isUnlocked: false,
      textBlocks: [],
      images: [...post.images],
    };

    if (post.gateScope === "text_blocks" || post.gateScope === "both") {
      publicCopy.textBlocks = []; // Never send locked text blocks!
    }

    if (post.gateScope === "images" || post.gateScope === "both") {
      // Keep only first image as teaser preview
      publicCopy.images = post.images.length > 0 ? [post.images[0]] : [];
    }

    return publicCopy;
  },

  /**
   * Increment view count
   */
  async recordView(postId: string): Promise<void> {
    if (!this.isConfigured()) {
      MockStore.incrementViews(postId);
      return;
    }

    try {
      const postRef = doc(db!, "posts", postId);
      await updateDoc(postRef, { views: increment(1) });
    } catch (error) {
      console.error("Error incrementing view count:", error);
      MockStore.incrementViews(postId);
    }
  },
};
