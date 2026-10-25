"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { PostService } from "@/lib/services/postService";
import { validateUsername, slugify, compressAvatar } from "@/lib/utils";
import {
  Check,
  X,
  Loader2,
  Copy,
  Sparkles,
  ArrowRight,
  Camera,
} from "lucide-react";
import { motion } from "framer-motion";
import { InstagramIcon } from "@/components/icons/InstagramIcon";
import { UserProfile } from "@/types";

export default function OnboardingPage() {
  const router = useRouter();
  const { user, userProfile, updateProfileState, loading: authLoading } = useAuth();

  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [imageError, setImageError] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Availability check states
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [suggestedAlternative, setSuggestedAlternative] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Initialize from authenticated user or existing profile
  useEffect(() => {
    if (!authLoading && !user) {
      const timer = setTimeout(() => {
        if (!user) {
          router.push("/login");
        }
      }, 1200);
      return () => clearTimeout(timer);
    }

    if (user) {
      if (userProfile?.username) {
        router.push("/dashboard");
        return;
      }

      PostService.getUserProfile(user.uid).then((existing) => {
        if (existing && existing.username) {
          updateProfileState(existing);
          router.push("/dashboard");
          return;
        }
      }).catch(() => {});

      setDisplayName(user.displayName || "");
      let claimed = "";
      if (typeof window !== "undefined") {
        try {
          claimed = localStorage.getItem("replyto_claimed_handle") || "";
        } catch {}
      }
      let rawSlug = claimed || slugify(user.displayName || "creator").replace(/-/g, "_");
      if (!rawSlug || rawSlug === "new_creator" || rawSlug === "creator") {
        rawSlug = `creator_${Math.floor(100 + Math.random() * 900)}`;
      }
      setUsername(rawSlug);
      setInstagramUrl(`https://instagram.com/${rawSlug}`);
      setPhotoURL(user.photoURL || "");
      setImageError(false);
    }
  }, [user, userProfile, authLoading, router, updateProfileState]);

  // Debounced live username availability check
  useEffect(() => {
    if (!username) {
      setUsernameAvailable(null);
      setUsernameError(null);
      setSuggestedAlternative(null);
      return;
    }

    const validation = validateUsername(username);
    if (!validation.isValid) {
      setUsernameAvailable(false);
      setUsernameError(validation.error || "Invalid username format");
      setSuggestedAlternative(null);
      return;
    }

    setUsernameError(null);
    setCheckingUsername(true);

    const timer = setTimeout(async () => {
      try {
        const isAvailable = await PostService.isUsernameAvailable(
          username,
          user?.uid
        );
        setUsernameAvailable(isAvailable);
        if (!isAvailable) {
          setUsernameError(`@${username} is already taken`);
          const num = Math.floor(10 + Math.random() * 90);
          setSuggestedAlternative(`${username}_${num}`);
        } else {
          setSuggestedAlternative(null);
        }
      } catch (err) {
        console.error("Availability check failed:", err);
        setUsernameAvailable(true);
      } finally {
        setCheckingUsername(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [username, user?.uid]);

  const origin = typeof window !== "undefined" ? window.location.origin : "https://replyto.me";
  const previewUrl = `${origin}/${username || "yourhandle"}`;

  const handleCopyPreviewLink = async () => {
    try {
      await navigator.clipboard.writeText(previewUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setImageError(false);

    try {
      const dataUri = await compressAvatar(file, 256);
      setPhotoURL(dataUri);

      if (user?.uid) {
        try {
          const uploadedUrl = await PostService.uploadImage(file, user.uid);
          if (uploadedUrl) {
            setPhotoURL(uploadedUrl);
          }
        } catch {
          // Keep compressed base64 if Firebase storage fails
        }
      }
    } catch (err) {
      console.error("Error reading avatar file:", err);
      const reader = new FileReader();
      reader.onload = () => {
        setPhotoURL(reader.result as string);
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !usernameAvailable) return;

    setSubmitting(true);
    try {
      let finalIg = instagramUrl.trim();
      if (finalIg) {
        if (!finalIg.startsWith("http://") && !finalIg.startsWith("https://")) {
          finalIg = `https://instagram.com/${finalIg.replace(/^@/, "")}`;
        }
      } else {
        finalIg = `https://instagram.com/${username.toLowerCase().trim()}`;
      }

      const cleanUsername = username.toLowerCase().trim();

      const profile: UserProfile = {
        uid: user.uid,
        displayName: displayName.trim() || "Creator",
        username: cleanUsername,
        bio: bio.trim(),
        instagramUrl: finalIg,
        email: user.email || undefined,
        photoURL:
          photoURL ||
          `https://api.dicebear.com/7.x/identicon/svg?seed=${cleanUsername}`,
        createdAt: new Date().toISOString(),
      };

      updateProfileState(profile);

      const saved = await PostService.saveUserProfile(profile);
      updateProfileState(saved || profile);

      try {
        const syncPromise = fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user: saved || profile }),
        });
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("API timeout")), 2000)
        );
        await Promise.race([syncPromise, timeoutPromise]);
      } catch (e) {
        console.warn("Could not sync to /api/users:", e);
      }

      router.push("/dashboard");
    } catch (error) {
      console.error("Error creating profile:", error);
      router.push("/dashboard");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFFFF]">
        <Loader2 className="w-6 h-6 animate-spin text-[#0071E3]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] flex flex-col justify-center items-center py-12 px-4 sm:px-6 font-sans selection:bg-[#0071E3]/15 selection:text-[#0071E3]">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-lg bg-white rounded-[28px] p-6 sm:p-10 border border-black/[0.08] shadow-[0_12px_40px_rgba(0,0,0,0.06)]"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-[#1D1D1F] text-white font-semibold text-base flex items-center justify-center mx-auto mb-3 shadow-sm">
            R
          </div>
          <h1 className="text-2xl font-semibold text-[#1D1D1F] tracking-tight">
            Claim your link in bio
          </h1>
          <p className="text-xs text-[#86868B] mt-1">
            Set up your public Replyto.me creator handle.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center">
            <div className="relative group">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-[#F5F5F7] border border-black/[0.08] shadow-inner flex items-center justify-center relative">
                {photoURL && !imageError ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={photoURL}
                    alt={displayName || "Avatar"}
                    referrerPolicy="no-referrer"
                    crossOrigin="anonymous"
                    className="w-full h-full object-cover"
                    onError={() => {
                      setImageError(true);
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-[#F5F5F7] text-[#86868B]">
                    <span className="text-xl font-semibold uppercase select-none">
                      {(displayName || username || "C").trim().charAt(0) || "C"}
                    </span>
                  </div>
                )}

                {uploadingImage && (
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  </div>
                )}
              </div>

              <label
                htmlFor="avatar-file-input"
                className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white flex items-center justify-center shadow-sm cursor-pointer transition-colors border-2 border-white"
                title="Upload photo"
              >
                <Camera className="w-3 h-3" />
              </label>

              <input
                id="avatar-file-input"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            <label
              htmlFor="avatar-file-input"
              className="text-[11px] font-medium text-[#0071E3] hover:underline mt-2 cursor-pointer flex items-center gap-1"
            >
              <span>Upload photo</span>
            </label>
          </div>

          {/* Display Name */}
          <div>
            <label className="block text-xs font-medium text-[#1D1D1F] mb-1">
              Display Name
            </label>
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Alex Rivera"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F5F7] border border-black/[0.06] text-xs text-[#1D1D1F] placeholder-[#A1A1A6] focus:bg-white focus:border-[#0071E3] outline-none transition-all"
            />
          </div>

          {/* Username */}
          <div>
            <label className="block text-xs font-medium text-[#1D1D1F] mb-1">
              Creator Handle (@username)
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-[#86868B] font-mono">
                @
              </div>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ""))}
                placeholder="yourhandle"
                className="w-full pl-8 pr-10 py-2.5 rounded-xl bg-[#F5F5F7] border border-black/[0.06] text-xs text-[#1D1D1F] placeholder-[#A1A1A6] font-mono focus:bg-white focus:border-[#0071E3] outline-none transition-all"
              />
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                {checkingUsername ? (
                  <Loader2 className="w-3.5 h-3.5 text-[#86868B] animate-spin" />
                ) : usernameAvailable === true ? (
                  <div className="w-4.5 h-4.5 rounded-full bg-[#34C759] text-white flex items-center justify-center">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                ) : usernameAvailable === false ? (
                  <div className="w-4.5 h-4.5 rounded-full bg-[#FF3B30] text-white flex items-center justify-center">
                    <X className="w-3 h-3 stroke-[3]" />
                  </div>
                ) : null}
              </div>
            </div>

            {usernameError ? (
              <div className="flex items-center justify-between text-xs mt-1.5 pl-1">
                <span className="text-[#FF3B30]">{usernameError}</span>
                {suggestedAlternative && (
                  <button
                    type="button"
                    onClick={() => {
                      setUsername(suggestedAlternative);
                      setSuggestedAlternative(null);
                    }}
                    className="text-[#0071E3] font-medium hover:underline"
                  >
                    Try @{suggestedAlternative}
                  </button>
                )}
              </div>
            ) : usernameAvailable ? (
              <p className="text-[11px] text-[#34C759] mt-1 pl-1 font-medium">
                @{username} is available.
              </p>
            ) : (
              <p className="text-[10px] text-[#86868B] mt-1 pl-1">
                Letters, numbers, underscores and dots. 3–30 chars.
              </p>
            )}
          </div>

          {/* Live URL Preview */}
          <div className="p-3 rounded-xl bg-[#F5F5F7] border border-black/[0.04] flex items-center justify-between">
            <div className="min-w-0 flex-1 pr-2">
              <span className="text-[10px] font-semibold text-[#86868B] uppercase tracking-wider block">
                Your Link in Bio
              </span>
              <p className="text-xs font-mono text-[#0071E3] font-medium truncate mt-0.5">
                {previewUrl}
              </p>
            </div>
            <button
              type="button"
              onClick={handleCopyPreviewLink}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white text-[#1D1D1F] border border-black/[0.06] text-xs font-medium hover:bg-zinc-100 transition-all apple-btn"
            >
              {copiedLink ? <Check className="w-3 h-3 text-[#34C759]" /> : <Copy className="w-3 h-3 text-[#86868B]" />}
              <span>{copiedLink ? "Copied" : "Copy"}</span>
            </button>
          </div>

          {/* Instagram Profile URL */}
          <div>
            <label className="block text-xs font-medium text-[#1D1D1F] mb-1">
              Instagram Profile Link
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-pink-500">
                <InstagramIcon className="w-3.5 h-3.5" />
              </div>
              <input
                type="text"
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
                placeholder="https://instagram.com/yourhandle"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#F5F5F7] border border-black/[0.06] text-xs text-[#1D1D1F] placeholder-[#A1A1A6] focus:bg-white focus:border-[#0071E3] outline-none transition-all"
              />
            </div>
          </div>

          {/* Bio */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-medium text-[#1D1D1F]">
                Bio (Optional)
              </label>
              <span className="text-[10px] text-[#86868B]">
                {bio.length}/150
              </span>
            </div>
            <textarea
              rows={2}
              maxLength={150}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell your audience what you create..."
              className="w-full px-3.5 py-2 rounded-xl bg-[#F5F5F7] border border-black/[0.06] text-xs text-[#1D1D1F] placeholder-[#A1A1A6] focus:bg-white focus:border-[#0071E3] outline-none transition-all resize-none"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting || !usernameAvailable || checkingUsername}
            className="w-full py-3 rounded-full bg-[#1D1D1F] hover:bg-black text-white font-medium text-xs shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98]"
          >
            {submitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Creating profile...</span>
              </>
            ) : (
              <>
                <span>Complete Setup & Go to Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
