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
import { PostService } from "@/lib/services/postService";
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
  signInWithGoogle: (options?: { useRedirect?: boolean; targetPath?: string }) => Promise<{
    success: boolean;
    user: AuthUser | null;
    profile?: UserProfile | null;
    popupBlocked?: boolean;
    redirecting?: boolean;
    cancelled?: boolean;
    error?: string;
  }>;
  signInWithGoogleRedirect: (options?: { targetPath?: string }) => Promise<void>;
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
const REDIRECT_TARGET_KEY = "replyto_auth_redirect_target";
const REDIRECT_PENDING_KEY = "replyto_google_redirect_pending";

export function isInAppBrowser(): boolean {
  if (typeof window === "undefined") return false;
  const ua = navigator.userAgent || navigator.vendor || (window as any).opera || "";
  return /Instagram|FBAN|FBAV|TikTok|Line|Twitter|MicroMessenger/i.test(ua);
}

function getInitialUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Only discard the obsolete dummy mock UID
      if (parsed && parsed.uid === "shivai-creator-uid") {
        localStorage.removeItem(AUTH_USER_KEY);
        localStorage.removeItem(AUTH_PROFILE_KEY);
        return null;
      }
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
      // Only discard the obsolete dummy mock UID
      if (parsed && parsed.uid === "shivai-creator-uid") {
        localStorage.removeItem(AUTH_USER_KEY);
        localStorage.removeItem(AUTH_PROFILE_KEY);
        return null;
      }
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

export async function fetchUserProfileSafely(
  uid: string,
  fallbackEmail?: string | null,
  fallbackUsername?: string | null
): Promise<UserProfile | null> {
  if (!uid) return null;

  // 1. Existing cached profile in localStorage if uid matches (instant 0ms)
  try {
    const cached = getInitialProfile();
    if (cached && (cached.uid === uid || (fallbackEmail && cached.email === fallbackEmail)) && cached.username) {
      return cached;
    }
  } catch {}

  // Special Super Admin Provision for Owner (aibyshivai@gmail.com)
  const isOwner =
    fallbackEmail?.toLowerCase().trim() === "aibyshivai@gmail.com" ||
    fallbackEmail?.toLowerCase().includes("aibyshivai");
  if (isOwner) {
    const ownerProfile: UserProfile = {
      uid,
      displayName: "shivai",
      username: "aibyshivai",
      email: "aibyshivai@gmail.com",
      bio: "Creator & Platform Super Admin @creativeedits.mov",
      photoURL: "https://lh3.googleusercontent.com/a/ACg8ocJ9qWnDSojX5KvmBmcLNNTSuvefpZR2yQRh0rsX2DynIXdeo7I=s96-c",
      instagramUrl: "https://www.instagram.com/creativeedits.mov/",
      isAdmin: true,
      role: "admin",
      createdAt: new Date().toISOString(),
    };
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(AUTH_PROFILE_KEY, JSON.stringify(ownerProfile));
      }
      PostService.saveUserProfile(ownerProfile).catch(() => {});
      MockStore.addUser(ownerProfile);
    } catch {}
    return ownerProfile;
  }

  // 2. MockStore quick check (memory, 0ms)
  try {
    const mock = MockStore.getUser(uid);
    if (mock && mock.username) {
      return mock;
    }
  } catch {}

  // 3. PostService Firestore direct check with short 1000ms timeout
  try {
    const firestoreProfile = await Promise.race([
      PostService.getUserProfile(uid),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 1000)),
    ]);
    if (firestoreProfile && firestoreProfile.username) {
      return firestoreProfile;
    }
  } catch (e) {
    console.warn("PostService.getUserProfile quick check:", e);
  }

  // 4. Server API endpoint /api/users?uid=... with 1200ms timeout
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);
    const res = await fetch(`/api/users?uid=${encodeURIComponent(uid)}`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.user && data.user.username) {
        return data.user;
      }
    }
  } catch (e) {
    console.warn("API /api/users quick check:", e);
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
    user: {
      uid: INITIAL_DEMO_USER.uid,
      displayName: INITIAL_DEMO_USER.displayName,
      email: INITIAL_DEMO_USER.email,
      photoURL: INITIAL_DEMO_USER.photoURL,
    },
    profile: INITIAL_DEMO_USER,
  }),
  signInAsDemo: async () => ({
    success: true,
    user: {
      uid: INITIAL_DEMO_USER.uid,
      displayName: INITIAL_DEMO_USER.displayName,
      email: INITIAL_DEMO_USER.email,
      photoURL: INITIAL_DEMO_USER.photoURL,
    },
    profile: INITIAL_DEMO_USER,
  }),
  signOut: async () => {},
  refreshProfile: async () => {},
  updateProfileState: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(getInitialUser);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(getInitialProfile);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Sync cache helpers
  const persistSession = (authUser: AuthUser | null, profile?: UserProfile | null) => {
    if (typeof window === "undefined") return;
    try {
      if (authUser) {
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(authUser));
      } else {
        localStorage.removeItem(AUTH_USER_KEY);
      }
      if (profile) {
        localStorage.setItem(AUTH_PROFILE_KEY, JSON.stringify(profile));
      } else if (authUser === null) {
        localStorage.removeItem(AUTH_PROFILE_KEY);
      }
    } catch (e) {
      console.warn("Storage quota exceeded or storage disabled, session kept in memory:", e);
    }
  };

  useEffect(() => {
    const currentUser = getInitialUser();
    const currentProfile = getInitialProfile();
    if (currentUser) {
      setUser(currentUser);
      setUserProfile(currentProfile);
      setLoading(false);
    }
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
            persistSession(authUser, null);

            let profile: UserProfile | null = null;
            try {
              profile = await fetchUserProfileSafely(fbUser.uid, fbUser.email);
              if (profile) {
                setUserProfile(profile);
                persistSession(authUser, profile);
              }
            } catch (e) {
              console.warn("Profile fetch after redirect:", e);
            }

            const redirectTarget = typeof window !== "undefined"
              ? sessionStorage.getItem(REDIRECT_TARGET_KEY)
              : null;
            if (typeof window !== "undefined") {
              sessionStorage.removeItem(REDIRECT_PENDING_KEY);
              sessionStorage.removeItem(REDIRECT_TARGET_KEY);
            }

            // CRITICAL: Always send directly to /dashboard post-login!
            const destination = "/dashboard";

            if (typeof window !== "undefined") {
              const currentPath = window.location.pathname.replace(/\/$/, "");
              if (currentPath === "/login" || currentPath === "" || currentPath === "/") {
                window.location.replace(destination);
              }
            }
          }
        })
        .catch((err) => {
          console.error("Firebase getRedirectResult error:", err);
          if (typeof window !== "undefined") {
            sessionStorage.removeItem(REDIRECT_PENDING_KEY);
            sessionStorage.removeItem(REDIRECT_TARGET_KEY);
          }
        })
        .finally(() => {
          setLoading(false);
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

          // Fast-path: If platform owner aibyshivai@gmail.com, immediately set his owner profile
          const isOwner =
            fbUser.email?.toLowerCase().trim() === "aibyshivai@gmail.com" ||
            fbUser.email?.toLowerCase().includes("aibyshivai");
          if (isOwner) {
            const ownerProfile: UserProfile = {
              uid: fbUser.uid,
              displayName: fbUser.displayName || "shivai",
              username: "aibyshivai",
              email: "aibyshivai@gmail.com",
              bio: "Creator & Platform Super Admin @creativeedits.mov",
              photoURL: fbUser.photoURL || "https://lh3.googleusercontent.com/a/ACg8ocJ9qWnDSojX5KvmBmcLNNTSuvefpZR2yQRh0rsX2DynIXdeo7I=s96-c",
              instagramUrl: "https://www.instagram.com/creativeedits.mov/",
              isAdmin: true,
              role: "admin",
              createdAt: new Date().toISOString(),
            };
            setUserProfile(ownerProfile);
            persistSession(authUser, ownerProfile);
            setLoading(false);
            return;
          }

          // Fetch or auto-provision profile safely for regular creators
          try {
            let profile = await fetchUserProfileSafely(fbUser.uid, fbUser.email);
            if (!profile || !profile.username) {
              const fallbackUsername = (fbUser.displayName || fbUser.email?.split("@")[0] || "creator")
                .toLowerCase()
                .replace(/[^a-z0-9._]/g, "") || `creator_${fbUser.uid.slice(0, 5)}`;
              profile = {
                uid: fbUser.uid,
                displayName: fbUser.displayName || "Creator",
                username: fallbackUsername,
                email: fbUser.email || `${fallbackUsername}@gmail.com`,
                bio: "Sharing my curated resources, links & guides.",
                photoURL: fbUser.photoURL || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
                instagramUrl: `https://instagram.com/${fallbackUsername}`,
                isAdmin: false,
                role: "creator",
                createdAt: new Date().toISOString(),
              };
            }
            setUserProfile(profile);
            persistSession(authUser, profile);
          } catch (e) {
            console.warn("onAuthStateChanged profile check:", e);
          }
        } else {
          // Firebase onAuthStateChanged returned null.
          // NEVER wipe the session if localStorage has a cached user!
          // Only explicit signOut() wipes the session.
          const cachedUser = getInitialUser();
          if (!cachedUser) {
            setUser(null);
            setUserProfile(null);
          }
        }
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      setLoading(false);
    }
  }, []);

  /**
   * One-click Google Sign-in Handler via Firebase Auth
   * Tries popup first; if browser blocks popups or redirect requested, falls back cleanly to signInWithRedirect.
   */
  const signInWithGoogle = async (options?: {
    useRedirect?: boolean;
    targetPath?: string;
  }): Promise<{
    success: boolean;
    user: AuthUser | null;
    profile?: UserProfile | null;
    popupBlocked?: boolean;
    redirecting?: boolean;
    cancelled?: boolean;
    error?: string;
  }> => {
    setLoading(true);

    const authInstance = getFirebaseAuth() || auth;
    const provider = getGoogleProvider() || googleProvider;

    if (!isFirebaseConfigured || !authInstance || !provider) {
      setLoading(false);
      return {
        success: false,
        user: null,
        error: "Firebase Authentication is not ready. Please refresh the page.",
      };
    }

    const targetPath = options?.targetPath || "/dashboard";

    // Only use redirect if explicitly requested by options:
    if (options?.useRedirect) {
      try {
        if (typeof window !== "undefined") {
          sessionStorage.setItem(REDIRECT_PENDING_KEY, "true");
          sessionStorage.setItem(REDIRECT_TARGET_KEY, targetPath);
        }
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

    // Try popup first
    try {
      const result = await signInWithPopup(authInstance, provider);
      const fbUser = result.user;
      const authUser: AuthUser = {
        uid: fbUser.uid,
        email: fbUser.email,
        displayName: fbUser.displayName,
        photoURL: fbUser.photoURL,
      };

      // Fast profile provisioning
      const isOwner =
        fbUser.email?.toLowerCase().trim() === "aibyshivai@gmail.com" ||
        fbUser.email?.toLowerCase().includes("aibyshivai");

      let profile: UserProfile;
      if (isOwner) {
        profile = {
          uid: fbUser.uid,
          displayName: fbUser.displayName || "shivai",
          username: "aibyshivai",
          email: "aibyshivai@gmail.com",
          bio: "Creator & Platform Super Admin @creativeedits.mov",
          photoURL: fbUser.photoURL || "https://lh3.googleusercontent.com/a/ACg8ocJ9qWnDSojX5KvmBmcLNNTSuvefpZR2yQRh0rsX2DynIXdeo7I=s96-c",
          instagramUrl: "https://www.instagram.com/creativeedits.mov/",
          isAdmin: true,
          role: "admin",
          createdAt: new Date().toISOString(),
        };
      } else {
        const fetched = await fetchUserProfileSafely(fbUser.uid, fbUser.email).catch(() => null);
        if (fetched && fetched.username) {
          profile = fetched;
        } else {
          const defaultUsername = (fbUser.displayName || fbUser.email?.split("@")[0] || "creator")
            .toLowerCase()
            .replace(/[^a-z0-9._]/g, "") || `creator_${fbUser.uid.slice(0, 5)}`;
          profile = {
            uid: fbUser.uid,
            displayName: fbUser.displayName || defaultUsername,
            username: defaultUsername,
            email: fbUser.email || `${defaultUsername}@gmail.com`,
            bio: "Sharing my curated resources, links & guides.",
            photoURL: fbUser.photoURL || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
            instagramUrl: `https://instagram.com/${defaultUsername}`,
            isAdmin: false,
            role: "creator",
            createdAt: new Date().toISOString(),
          };
        }
      }

      setUser(authUser);
      setUserProfile(profile);
      setIsDemoMode(false);
      persistSession(authUser, profile);
      setLoading(false);
      return { success: true, user: authUser, profile };
    } catch (err: any) {
      console.error("Firebase Google sign-in error:", err);

      if (
        err?.code === "auth/popup-closed-by-user" ||
        err?.code === "auth/cancelled-popup-request"
      ) {
        // 1. Check if user was actually signed in before popup was dismissed
        const current = authInstance.currentUser;
        if (current) {
          const authUser: AuthUser = {
            uid: current.uid,
            email: current.email,
            displayName: current.displayName,
            photoURL: current.photoURL,
          };
          setUser(authUser);
          persistSession(authUser, undefined);
          const profile = await fetchUserProfileSafely(current.uid, current.email);
          if (profile) {
            setUserProfile(profile);
            persistSession(authUser, profile);
          }
          setLoading(false);
          return { success: true, user: authUser, profile };
        }

        // 2. Automatically fall back to full-page Google redirect so login succeeds 100%
        try {
          if (typeof window !== "undefined") {
            sessionStorage.setItem(REDIRECT_PENDING_KEY, "true");
            sessionStorage.setItem(REDIRECT_TARGET_KEY, targetPath);
          }
          await signInWithRedirect(authInstance, provider);
          return { success: true, user: null, redirecting: true };
        } catch {
          setLoading(false);
          return {
            success: false,
            user: null,
            cancelled: true,
            error: "Sign in was interrupted. Please tap Continue with Google again.",
          };
        }
      }

      if (err?.code === "auth/popup-blocked") {
        console.warn("Popup blocked. Attempting full-page redirect to Google...");
        try {
          if (typeof window !== "undefined") {
            sessionStorage.setItem(REDIRECT_PENDING_KEY, "true");
            sessionStorage.setItem(REDIRECT_TARGET_KEY, targetPath);
          }
          await signInWithRedirect(authInstance, provider);
          return { success: true, user: null, redirecting: true };
        } catch (redirectErr: any) {
          console.error("Redirect fallback error:", redirectErr);
          setLoading(false);
          return {
            success: false,
            user: null,
            popupBlocked: true,
            error: "Popup was blocked. Please tap the Direct Redirect button below.",
          };
        }
      }

      setLoading(false);

      if (err?.code === "auth/unauthorized-domain") {
        const currentDomain = typeof window !== "undefined" ? window.location.hostname : "replytome-three.vercel.app";
        const msg = `Domain (${currentDomain}) is not authorized in Firebase! Please add "${currentDomain}" to Firebase Console -> Authentication -> Settings -> Authorized Domains.`;
        return { success: false, user: null, error: msg };
      }

      if (err?.code === "auth/operation-not-allowed") {
        return {
          success: false,
          user: null,
          error: "Google Sign-In is not enabled yet in Firebase Console -> Authentication -> Sign-in method.",
        };
      }

      return {
        success: false,
        user: null,
        error: err?.message || "Google sign-in failed. Please try direct redirect below.",
      };
    }
  };

  /**
   * Direct Full-Page Redirect Sign-In
   */
  const signInWithGoogleRedirect = async (options?: { targetPath?: string }): Promise<void> => {
    setLoading(true);
    const authInstance = getFirebaseAuth() || auth;
    const provider = getGoogleProvider() || googleProvider;

    if (isFirebaseConfigured && authInstance && provider) {
      const targetPath = options?.targetPath || "/dashboard";
      if (typeof window !== "undefined") {
        sessionStorage.setItem(REDIRECT_PENDING_KEY, "true");
        sessionStorage.setItem(REDIRECT_TARGET_KEY, targetPath);
      }
      await signInWithRedirect(authInstance, provider);
    } else {
      setLoading(false);
      throw new Error("Firebase Authentication is not ready.");
    }
  };

  /**
   * Sign in with customizable profile (name, username, photo, instagramUrl)
   * Also seamlessly matches and restores existing creator profile by handle or email
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

    // 1. Check if user profile already exists
    let existingProfile: UserProfile | null = null;
    try {
      existingProfile = await PostService.getUserByUsername(cleanUsername);
      if (!existingProfile && email) {
        existingProfile = await PostService.getUserByEmail(email);
      }
    } catch {}

    const uid = existingProfile?.uid || `user_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

    const isSystemAdmin = isPlatformAdmin({
      username: cleanUsername,
      email: email || existingProfile?.email,
      uid: uid,
    });

    const authUser: AuthUser = {
      uid,
      displayName: displayName.trim() || existingProfile?.displayName || "Creator",
      email: email || existingProfile?.email || `${cleanUsername || "creator"}@gmail.com`,
      photoURL:
        photoURL ||
        existingProfile?.photoURL ||
        `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80`,
    };

    const newProfile: UserProfile = existingProfile ? {
      ...existingProfile,
      displayName: displayName.trim() || existingProfile.displayName,
      photoURL: photoURL || existingProfile.photoURL,
      instagramUrl: instagramUrl || existingProfile.instagramUrl,
      isAdmin: isSystemAdmin,
      role: isSystemAdmin ? "admin" : "creator",
      updatedAt: new Date().toISOString(),
    } : {
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

    // Save to Firestore / local store
    try {
      await PostService.saveUserProfile(newProfile);
    } catch {}

    MockStore.addUser(newProfile);

    // Save to server API
    try {
      await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: newProfile }),
      });
    } catch (e) {
      console.warn("Failed to sync user to server:", e);
    }

    setUser(authUser);
    setUserProfile(newProfile);
    persistSession(authUser, newProfile);
    setIsDemoMode(false);
    setLoading(false);

    return { success: true, user: authUser, profile: newProfile };
  };

  const signInAsDemo = async (): Promise<{
    success: boolean;
    user: AuthUser;
    profile: UserProfile;
  }> => {
    setLoading(true);
    const demoProfile: UserProfile = {
      ...INITIAL_DEMO_USER,
    };

    const authUser: AuthUser = {
      uid: demoProfile.uid,
      displayName: demoProfile.displayName,
      photoURL: demoProfile.photoURL,
      email: demoProfile.email,
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
      const authInstance = getFirebaseAuth() || auth;
      if (isFirebaseConfigured && authInstance) {
        await firebaseSignOut(authInstance);
      }
    } catch (e) {
      console.error("Sign out error:", e);
    } finally {
      setUser(null);
      setUserProfile(null);
      persistSession(null, null);
      setIsDemoMode(false);
      if (typeof window !== "undefined") {
        sessionStorage.clear();
      }
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (user?.uid) {
      try {
        const profile = await fetchUserProfileSafely(user.uid, user.email, userProfile?.username);
        if (profile) {
          setUserProfile(profile);
          persistSession(user, profile);
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
