"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { auth, googleProvider, isFirebaseConfigured } from "@/lib/firebase/config";
import { PostService } from "@/lib/services/postService";
import { MockStore, INITIAL_DEMO_USER } from "@/lib/firebase/mockData";
import { UserProfile } from "@/types";

export interface AuthUser {
  uid: string;
  email?: string | null;
  displayName?: string | null;
  photoURL?: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isDemoMode: boolean;
  needsOnboarding: boolean;
  signInWithGoogle: () => Promise<{ success: boolean; user: AuthUser; profile?: UserProfile | null }>;
  signInWithCustomUser: (params: {
    displayName: string;
    username: string;
    email?: string;
    photoURL?: string;
  }) => Promise<{ success: boolean; user: AuthUser; profile: UserProfile }>;
  signInAsDemo: () => Promise<{ success: boolean; user: AuthUser; profile: UserProfile }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfileState: (profile: UserProfile) => void;
}

const AUTH_USER_KEY = "replyto_shivai_auth_user_v3";
const AUTH_PROFILE_KEY = "replyto_shivai_auth_profile_v3";

const DEFAULT_SHIVAI_USER: AuthUser = {
  uid: "shivai-creator-uid",
  displayName: "AI by Shivai",
  email: "aibyshivai@gmail.com",
  photoURL: "/avatar.png",
};

function getInitialUser(): AuthUser {
  if (typeof window === "undefined") return DEFAULT_SHIVAI_USER;
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.uid === DEFAULT_SHIVAI_USER.uid) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Failed to parse cached user:", e);
  }
  return DEFAULT_SHIVAI_USER;
}

function getInitialProfile(): UserProfile {
  if (typeof window === "undefined") return INITIAL_DEMO_USER;
  try {
    const raw = localStorage.getItem(AUTH_PROFILE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && (parsed.username === "aibyshivai" || parsed.uid === "shivai-creator-uid")) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Failed to parse cached profile:", e);
  }
  return INITIAL_DEMO_USER;
}

const AuthContext = createContext<AuthContextType>({
  user: DEFAULT_SHIVAI_USER,
  userProfile: INITIAL_DEMO_USER,
  loading: false,
  isDemoMode: true,
  needsOnboarding: false,
  signInWithGoogle: async () => ({ success: true, user: DEFAULT_SHIVAI_USER, profile: INITIAL_DEMO_USER }),
  signInWithCustomUser: async () => ({
    success: true,
    user: DEFAULT_SHIVAI_USER,
    profile: INITIAL_DEMO_USER,
  }),
  signInAsDemo: async () => ({
    success: true,
    user: DEFAULT_SHIVAI_USER,
    profile: INITIAL_DEMO_USER,
  }),
  signOut: async () => {},
  refreshProfile: async () => {},
  updateProfileState: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(getInitialUser);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(getInitialProfile);
  const [loading, setLoading] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(!isFirebaseConfigured);

  // Sync cache helpers
  const persistSession = (authUser: AuthUser | null, profile: UserProfile | null) => {
    if (typeof window === "undefined") return;
    if (authUser) {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(authUser));
    } else {
      localStorage.removeItem(AUTH_USER_KEY);
    }
    if (profile) {
      localStorage.setItem(AUTH_PROFILE_KEY, JSON.stringify(profile));
    } else {
      localStorage.removeItem(AUTH_PROFILE_KEY);
    }
  };

  useEffect(() => {
    const currentUser = getInitialUser();
    const currentProfile = getInitialProfile();
    setUser(currentUser);
    setUserProfile(currentProfile);
    persistSession(currentUser, currentProfile);
    setLoading(false);
  }, []);

  /**
   * Google Sign-in Handler with graceful fallback
   */
  const signInWithGoogle = async (): Promise<{
    success: boolean;
    user: AuthUser;
    profile?: UserProfile | null;
  }> => {
    setLoading(true);

    if (isFirebaseConfigured && auth && googleProvider) {
      try {
        const result = await signInWithPopup(auth, googleProvider);
        const fbUser = result.user;
        const authUser: AuthUser = {
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName,
          photoURL: fbUser.photoURL,
        };

        setUser(authUser);
        setIsDemoMode(false);

        const profile = await PostService.getUserProfile(fbUser.uid);
        setUserProfile(profile);
        persistSession(authUser, profile);

        setLoading(false);
        return { success: true, user: authUser, profile };
      } catch (err: unknown) {
        console.warn("Firebase Google popup error, falling back to seamless local Google login:", err);
        // Fall back gracefully so the user is NEVER blocked
      }
    }

    // Instant seamless login fallback (simulates Google Auth with creator account)
    const fallbackUser = await signInAsDemo();
    setLoading(false);
    return fallbackUser;
  };

  /**
   * Sign in with customizable profile (name, username, photo)
   */
  const signInWithCustomUser = async ({
    displayName,
    username,
    email,
    photoURL,
  }: {
    displayName: string;
    username: string;
    email?: string;
    photoURL?: string;
  }): Promise<{ success: boolean; user: AuthUser; profile: UserProfile }> => {
    setLoading(true);
    const cleanUsername = username.toLowerCase().trim().replace(/[^a-z0-9._]/g, "");
    const uid = `creator-${Date.now()}`;

    const authUser: AuthUser = {
      uid,
      displayName: displayName.trim() || "Creator",
      email: email || `${cleanUsername || "creator"}@gmail.com`,
      photoURL:
        photoURL ||
        `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80`,
    };

    const newProfile: UserProfile = {
      uid,
      displayName: authUser.displayName!,
      username: cleanUsername || "creator",
      bio: "Sharing my curated resources, links & guides.",
      photoURL: authUser.photoURL!,
      createdAt: new Date().toISOString(),
    };

    // Save to store
    MockStore.updateUser(newProfile);
    setUser(authUser);
    setUserProfile(newProfile);
    persistSession(authUser, newProfile);
    setIsDemoMode(true);
    setLoading(false);

    return { success: true, user: authUser, profile: newProfile };
  };

  /**
   * One-click Demo Creator Sign-in
   */
  const signInAsDemo = async (): Promise<{
    success: boolean;
    user: AuthUser;
    profile: UserProfile;
  }> => {
    setLoading(true);
    const demoProfile = MockStore.getUser() || INITIAL_DEMO_USER;
    const authUser: AuthUser = {
      uid: demoProfile.uid,
      displayName: demoProfile.displayName,
      photoURL: demoProfile.photoURL,
      email: "aibyshivai@gmail.com",
    };

    setUser(authUser);
    setUserProfile(demoProfile);
    persistSession(authUser, demoProfile);
    setIsDemoMode(true);
    setLoading(false);

    return { success: true, user: authUser, profile: demoProfile };
  };

  /**
   * Sign Out
   */
  const signOut = async () => {
    setLoading(true);
    try {
      if (isFirebaseConfigured && auth) {
        await firebaseSignOut(auth);
      }
    } catch (e) {
      console.error("Sign out error:", e);
    } finally {
      setUser(null);
      setUserProfile(null);
      persistSession(null, null);
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (user?.uid) {
      try {
        const p = await PostService.getUserProfile(user.uid);
        if (p) {
          setUserProfile(p);
          persistSession(user, p);
        }
      } catch (e) {
        console.error("Refresh profile error:", e);
      }
    }
  };

  const updateProfileState = (profile: UserProfile) => {
    setUserProfile(profile);
    if (user) {
      persistSession(user, profile);
    }
  };

  const needsOnboarding = Boolean(user && (!userProfile || !userProfile.username));

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        isDemoMode,
        needsOnboarding,
        signInWithGoogle,
        signInWithCustomUser,
        signInAsDemo,
        signOut,
        refreshProfile,
        updateProfileState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
