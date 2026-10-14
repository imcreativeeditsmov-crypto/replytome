"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut as firebaseSignOut,
} from "firebase/auth";
import {
  auth,
  googleProvider,
  isFirebaseConfigured,
  getFirebaseAuth,
  getGoogleProvider,
} from "@/lib/firebase/config";
import { MockStore, INITIAL_DEMO_USER } from "@/lib/firebase/mockData";
import { UserProfile } from "@/types";
import { isPlatformAdmin } from "@/lib/auth/adminCheck";

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
  isAdmin: boolean;
  isDemoMode: boolean;
  needsOnboarding: boolean;
  signInWithGoogle: (options?: { useRedirect?: boolean }) => Promise<{
    success: boolean;
    user: AuthUser | null;
    profile?: UserProfile | null;
    popupBlocked?: boolean;
    redirecting?: boolean;
    error?: string;
  }>;
  signInWithGoogleRedirect: () => Promise<void>;
  signInWithCustomUser: (params: {
    displayName: string;
    username: string;
    email?: string;
    photoURL?: string;
    instagramUrl?: string;
  }) => Promise<{ success: boolean; user: AuthUser; profile: UserProfile }>;
  signInAsDemo: () => Promise<{ success: boolean; user: AuthUser; profile: UserProfile }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfileState: (profile: UserProfile) => void;
}

const AUTH_USER_KEY = "replyto_auth_user_v7";
const AUTH_PROFILE_KEY = "replyto_auth_profile_v7";

export const DEFAULT_SHIVAI_USER: AuthUser = {
  uid: "shivai-creator-uid",
  displayName: "AI by Shivai",
  email: "aibyshivai@gmail.com",
  photoURL: "/avatar.png",
};

function getInitialUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.uid) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Failed to parse cached user:", e);
  }
  return null;
}

function getInitialProfile(): UserProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_PROFILE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.username) {
        const isSysAdmin = isPlatformAdmin(parsed);
        return {
          ...parsed,
          isAdmin: isSysAdmin,
          role: isSysAdmin ? "admin" : "creator",
        };
      }
    }
  } catch (e) {
    console.error("Failed to parse cached profile:", e);
  }
  return null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: false,
  isAdmin: false,
  isDemoMode: false,
  needsOnboarding: false,
  signInWithGoogle: async () => ({ success: false, user: null }),
  signInWithGoogleRedirect: async () => {},
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
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Sync cache helpers
  const persistSession = (authUser: AuthUser | null, profile: UserProfile | null) => {
    if (typeof window === "undefined") return;
    try {
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
    } catch (e) {
      console.warn("Storage quota exceeded or storage disabled, session kept in memory:", e);
    }
  };

  useEffect(() => {
    const currentUser = getInitialUser();
    const currentProfile = getInitialProfile();
    setUser(currentUser);
    setUserProfile(currentProfile);
    setLoading(false);
  }, []);

  // Listen to Firebase auth state and redirect results
  useEffect(() => {
    const authInstance = getFirebaseAuth() || auth;
    if (isFirebaseConfigured && authInstance) {
      // 1. Process redirect result if returning from Google OAuth redirect
      getRedirectResult(authInstance)
        .then(async (result) => {
          if (result && result.user) {
            const fbUser = result.user;
            const authUser: AuthUser = {
              uid: fbUser.uid,
              email: fbUser.email,
              displayName: fbUser.displayName,
              photoURL: fbUser.photoURL,
            };
            setUser(authUser);
            setIsDemoMode(false);

            let profile: UserProfile | null = null;
            try {
              const res = await fetch(`/api/users?uid=${encodeURIComponent(fbUser.uid)}`);
              const data = await res.json();
              if (data.success && data.user) {
                profile = data.user;
              }
            } catch {
              profile = MockStore.getUser(fbUser.uid);
            }

            setUserProfile(profile);
            persistSession(authUser, profile);
          }
        })
        .catch((err) => {
          console.error("Firebase getRedirectResult error:", err);
        });

      // 2. Active auth state listener
      const unsubscribe = onAuthStateChanged(authInstance, async (fbUser) => {
        if (fbUser) {
          const authUser: AuthUser = {
            uid: fbUser.uid,
            email: fbUser.email,
            displayName: fbUser.displayName,
            photoURL: fbUser.photoURL,
          };
          setUser(authUser);

          // Fetch profile from server
          try {
            const res = await fetch(`/api/users?uid=${encodeURIComponent(fbUser.uid)}`);
            const data = await res.json();
            if (data.success && data.user) {
              setUserProfile(data.user);
              persistSession(authUser, data.user);
            } else {
              setUserProfile(null);
            }
          } catch {
            const local = MockStore.getUser(fbUser.uid);
            setUserProfile(local);
          }
        }
      });
      return () => unsubscribe();
    }
  }, []);

  /**
   * One-click Google Sign-in Handler via Firebase Auth
   * Tries popup first; if browser blocks popups, falls back directly to signInWithRedirect.
   */
  const signInWithGoogle = async (options?: {
    useRedirect?: boolean;
  }): Promise<{
    success: boolean;
    user: AuthUser | null;
    profile?: UserProfile | null;
    popupBlocked?: boolean;
    redirecting?: boolean;
    error?: string;
  }> => {
    setLoading(true);

    const authInstance = getFirebaseAuth() || auth;
    const provider = getGoogleProvider() || googleProvider;

    if (isFirebaseConfigured && authInstance && provider) {
      if (options?.useRedirect) {
        try {
          await signInWithRedirect(authInstance, provider);
          return { success: true, user: null, redirecting: true };
        } catch (redirectErr: any) {
          setLoading(false);
          console.error("signInWithRedirect error:", redirectErr);
          return {
            success: false,
            user: null,
            error: redirectErr?.message || "Google redirect sign-in failed.",
          };
        }
      }

      try {
        const result = await signInWithPopup(authInstance, provider);
        const fbUser = result.user;
        const authUser: AuthUser = {
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName,
          photoURL: fbUser.photoURL,
        };

        setUser(authUser);
        setIsDemoMode(false);

        // Fetch user profile from server
        let profile: UserProfile | null = null;
        try {
          const res = await fetch(`/api/users?uid=${encodeURIComponent(fbUser.uid)}`);
          const data = await res.json();
          if (data.success && data.user) {
            profile = data.user;
          }
        } catch {
          profile = MockStore.getUser(fbUser.uid);
        }

        setUserProfile(profile);
        persistSession(authUser, profile);

        setLoading(false);
        return { success: true, user: authUser, profile };
      } catch (err: any) {
        console.error("Firebase Google sign-in error:", err);

        if (err?.code === "auth/popup-closed-by-user" || err?.code === "auth/cancelled-popup-request") {
          setLoading(false);
          return { success: false, user: null, error: "Popup closed" };
        }

        // Automatic fallback if browser blocks popups
        if (err?.code === "auth/popup-blocked") {
          console.warn("Popup blocked by browser. Attempting full-page redirect to Google...");
          try {
            await signInWithRedirect(authInstance, provider);
            return { success: true, user: null, redirecting: true };
          } catch (redirectErr: any) {
            console.error("Redirect fallback error:", redirectErr);
            setLoading(false);
            return {
              success: false,
              user: null,
              popupBlocked: true,
              error: "Popup blocked by your browser. Please tap the redirect button below.",
            };
          }
        }

        setLoading(false);

        if (err?.code === "auth/unauthorized-domain") {
          const currentDomain = typeof window !== "undefined" ? window.location.hostname : "replytome-three.vercel.app";
          const msg = `Domain (${currentDomain}) is not authorized in Firebase! Please add "${currentDomain}" to Firebase Console -> Authentication -> Settings -> Authorized Domains.`;
          if (typeof window !== "undefined") {
            alert(msg);
          }
          return { success: false, user: null, error: msg };
        }

        return { success: false, user: null, error: err?.message || "Google sign-in failed" };
      }
    }

    setLoading(false);
    return { success: false, user: null, error: "Firebase Authentication is not ready. Please try again." };
  };

  /**
   * Direct Full-Page Redirect Sign-In
   */
  const signInWithGoogleRedirect = async (): Promise<void> => {
    setLoading(true);
    const authInstance = getFirebaseAuth() || auth;
    const provider = getGoogleProvider() || googleProvider;

    if (isFirebaseConfigured && authInstance && provider) {
      await signInWithRedirect(authInstance, provider);
    } else {
      setLoading(false);
      throw new Error("Firebase Authentication is not ready.");
    }
  };


  /**
   * Sign in with customizable profile (name, username, photo, instagramUrl)
   */
  const signInWithCustomUser = async ({
    displayName,
    username,
    email,
    photoURL,
    instagramUrl,
  }: {
    displayName: string;
    username: string;
    email?: string;
    photoURL?: string;
    instagramUrl?: string;
  }): Promise<{ success: boolean; user: AuthUser; profile: UserProfile }> => {
    setLoading(true);
    const cleanUsername = username.toLowerCase().trim().replace(/[^a-z0-9._]/g, "");
    const uid = `user_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

    const isSystemAdmin = isPlatformAdmin({
      username: cleanUsername,
      email: email,
      uid: uid,
    });

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
      email: authUser.email!,
      bio: "Sharing my curated resources, links & guides.",
      photoURL: authUser.photoURL!,
      instagramUrl: instagramUrl || (cleanUsername ? `https://www.instagram.com/${cleanUsername}/` : undefined),
      isAdmin: isSystemAdmin,
      role: isSystemAdmin ? "admin" : "creator",
      createdAt: new Date().toISOString(),
    };

    // Save to local store
    MockStore.addUser(newProfile);

    // Save to server
    try {
      await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: newProfile }),
      });
    } catch (e) {
      console.warn("Failed to save new user to server:", e);
    }

    setUser(authUser);
    setUserProfile(newProfile);
    persistSession(authUser, newProfile);
    setIsDemoMode(true);
    setLoading(false);

    return { success: true, user: authUser, profile: newProfile };
  };

  /**
   * One-click Super Admin Sign-in (AI by Shivai)
   */
  const signInAsDemo = async (): Promise<{
    success: boolean;
    user: AuthUser;
    profile: UserProfile;
  }> => {
    setLoading(true);
    const adminProfile: UserProfile = {
      ...INITIAL_DEMO_USER,
      isAdmin: true,
      role: "admin",
    };

    const authUser: AuthUser = {
      uid: adminProfile.uid,
      displayName: adminProfile.displayName,
      photoURL: adminProfile.photoURL,
      email: "aibyshivai@gmail.com",
    };

    setUser(authUser);
    setUserProfile(adminProfile);
    persistSession(authUser, adminProfile);
    setIsDemoMode(true);
    setLoading(false);

    return { success: true, user: authUser, profile: adminProfile };
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
        const res = await fetch(`/api/users?uid=${encodeURIComponent(user.uid)}`);
        const data = await res.json();
        if (data.success && data.user) {
          setUserProfile(data.user);
          persistSession(user, data.user);
        }
      } catch (e) {
        console.error("Refresh profile error:", e);
      }
    }
  };

  const updateProfileState = (profile: UserProfile) => {
    const isSysAdmin = isPlatformAdmin(profile);
    const safeProfile: UserProfile = {
      ...profile,
      isAdmin: isSysAdmin,
      role: isSysAdmin ? "admin" : "creator",
    };
    setUserProfile(safeProfile);
    if (user) {
      persistSession(user, safeProfile);
    }
  };

  const isAdmin = Boolean(
    user &&
      (isPlatformAdmin(userProfile) ||
        isPlatformAdmin({
          uid: user.uid,
          email: user.email,
          username: userProfile?.username,
        }))
  );


  const needsOnboarding = Boolean(user && (!userProfile || !userProfile.username));

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        isAdmin,
        isDemoMode,
        needsOnboarding,
        signInWithGoogle,
        signInWithGoogleRedirect,
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
