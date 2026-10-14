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
  AtSign,
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
      router.push("/");
      return;
    }

    if (user) {
      if (userProfile?.username) {
        // Already onboarded
        router.push("/dashboard");
        return;
      }

      setDisplayName(user.displayName || "");
      let rawSlug = slugify(user.displayName || "creator").replace(/-/g, "_");
      if (!rawSlug || rawSlug === "new_creator" || rawSlug === "creator") {
        rawSlug = `creator_${Math.floor(100 + Math.random() * 900)}`;
      }
      setUsername(rawSlug);
      setInstagramUrl(`https://instagram.com/${rawSlug}`);
      setPhotoURL(user.photoURL || "");
      setImageError(false);
    }
  }, [user, userProfile, authLoading, router]);

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
      setUsernameError(validation.error || "Invalid username");
      setSuggestedAlternative(null);
      return;
    }

    setUsernameError(null);
    setCheckingUsername(true);

    const timer = setTimeout(async () => {
      try {
        const available = await PostService.isUsernameAvailable(username, user?.uid);
        setUsernameAvailable(available);
        if (!available) {
          const randomSuffix = Math.floor(10 + Math.random() * 90);
          setSuggestedAlternative(`${username}_${randomSuffix}`);
          setUsernameError(`@${username} is already taken`);
        } else {
          setSuggestedAlternative(null);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setCheckingUsername(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [username, user?.uid]);

  const origin = typeof window !== "undefined" ? window.location.origin : "https://replyto.me";
  const previewUrl = `${origin}/${username || "yourname"}`;

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

    setImageError(false);
    setUploadingImage(true);

    try {
      // 1. Instant client-side compression to lightweight 256x256 JPEG (~20KB)
      const compressed = await compressAvatar(file, 256, 0.82);
      setPhotoURL(compressed);
      setUploadingImage(false);

      // 2. Non-blocking background attempt to upload to storage
      if (user?.uid) {
        PostService.uploadImage(file, user.uid)
          .then((cloudUrl) => {
            if (cloudUrl) setPhotoURL(cloudUrl);
          })
          .catch((err) => {
            console.warn("Background upload skipped, keeping compressed avatar:", err);
          });
      }
    } catch (err) {
      console.error("Failed to process image:", err);
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const validation = validateUsername(username);
    if (!validation.isValid) {
      setUsernameError(validation.error || "Invalid username");
      return;
    }

    if (!usernameAvailable) {
      setUsernameError("Please choose an available username");
      return;
    }

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

      // 1. Immediately update local state so user gets instant feedback
      updateProfileState(profile);

      // 2. Save profile in DB / MockStore
      const saved = await PostService.saveUserProfile(profile);
      updateProfileState(saved || profile);

      // 3. Persist to server API with 2s timeout
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

      // 4. Navigate directly to dashboard!
      router.push("/dashboard");
    } catch (error) {
      console.error("Error creating profile:", error);
      // Even if remote write had an issue, route user to dashboard
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
    <div className="min-h-screen bg-[#F5F5F7] flex flex-col justify-center items-center py-12 px-4 sm:px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-lg bg-white rounded-[32px] p-6 sm:p-10 border border-[#E5E5EA] shadow-xl"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-[#0071E3] text-white font-bold text-xl flex items-center justify-center mx-auto mb-3 shadow-md">
            R
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1D1D1F] tracking-tight">
            Claim your link in bio
          </h1>
          <p className="text-sm text-[#6E6E73] mt-1.5">
            Set up your public Replyto.me profile in seconds.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Upload with Instant Preview & Camera Badge */}
          <div className="flex flex-col items-center">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-[#F5F5F7] border-2 border-[#E5E5EA] shadow-inner flex items-center justify-center relative">
                {photoURL && !imageError ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={photoURL}
                    alt={displayName || "Avatar preview"}
                    referrerPolicy="no-referrer"
                    crossOrigin="anonymous"
                    className="w-full h-full object-cover"
                    onError={() => {
                      console.warn("Avatar failed to load, falling back to initial");
                      setImageError(true);
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#0071E3]/15 to-[#0071E3]/25 text-[#0071E3]">
                    <span className="text-2xl font-bold uppercase select-none">
                      {(displayName || username || "C").trim().charAt(0) || "C"}
                    </span>
                  </div>
                )}

                {/* Uploading indicator */}
                {uploadingImage && (
                  <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin text-white" />
                  </div>
                )}
              </div>

              {/* Full circular click / hover overlay */}
              <label
                htmlFor="avatar-file-input"
                className="absolute inset-0 rounded-full bg-black/40 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <Camera className="w-5 h-5 mb-0.5" />
                <span className="text-[10px] font-semibold">Change</span>
              </label>

              {/* Camera icon badge in corner for instant discoverability */}
              <label
                htmlFor="avatar-file-input"
                className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white flex items-center justify-center shadow-md cursor-pointer transition-colors border-2 border-white"
                title="Upload custom photo"
              >
                <Camera className="w-3.5 h-3.5" />
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
              className="text-xs font-medium text-[#0071E3] hover:underline mt-2.5 cursor-pointer flex items-center gap-1.5"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Tap to upload custom photo</span>
            </label>
          </div>

          {/* Display Name */}
          <div>
            <label className="block text-xs font-semibold text-[#1D1D1F] mb-1.5">
              Display Name
            </label>
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. AI by Shivai"
              className="w-full px-4 py-3 rounded-2xl bg-[#F5F5F7] border border-[#E5E5EA] text-sm text-[#1D1D1F] placeholder-[#86868B] focus:bg-white focus:border-[#0071E3] focus:ring-2 focus:ring-[#0071E3]/20 outline-none transition-all"
            />
          </div>

          {/* Username (Handle) */}
          <div>
            <label className="block text-xs font-semibold text-[#1D1D1F] mb-1.5">
              Username (URL slug)
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[#86868B] font-mono">
                @
              </div>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ""))}
                placeholder="yourhandle"
                className="w-full pl-8 pr-10 py-3 rounded-2xl bg-[#F5F5F7] border border-[#E5E5EA] text-sm text-[#1D1D1F] placeholder-[#86868B] font-mono focus:bg-white focus:border-[#0071E3] focus:ring-2 focus:ring-[#0071E3]/20 outline-none transition-all"
              />
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                {checkingUsername ? (
                  <Loader2 className="w-4 h-4 text-[#86868B] animate-spin" />
                ) : usernameAvailable === true ? (
                  <div className="w-5 h-5 rounded-full bg-[#34C759] text-white flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                ) : usernameAvailable === false ? (
                  <div className="w-5 h-5 rounded-full bg-[#FF3B30] text-white flex items-center justify-center">
                    <X className="w-3.5 h-3.5 stroke-[3]" />
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
                    className="text-[#0071E3] font-semibold hover:underline cursor-pointer"
                  >
                    Try @{suggestedAlternative}
                  </button>
                )}
              </div>
            ) : usernameAvailable ? (
              <p className="text-xs text-[#34C759] mt-1.5 pl-1 font-medium">
                Awesome! @{username} is available.
              </p>
            ) : (
              <p className="text-[11px] text-[#86868B] mt-1.5 pl-1">
                Letters, numbers, underscores and dots. 3–30 chars.
              </p>
            )}
          </div>

          {/* Live URL Preview */}
          <div className="p-3 rounded-2xl bg-[#F5F5F7] border border-[#E5E5EA] flex items-center justify-between">
            <div className="min-w-0 flex-1 pr-2">
              <span className="text-[10px] font-semibold text-[#86868B] uppercase tracking-wider block">
                Your Link in Bio
              </span>
              <p className="text-xs font-mono text-[#0071E3] font-semibold truncate mt-0.5">
                {previewUrl}
              </p>
            </div>
            <button
              type="button"
              onClick={handleCopyPreviewLink}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white text-[#1D1D1F] border border-[#E5E5EA] text-xs font-medium hover:bg-zinc-100 transition-all apple-btn"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-[#34C759]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? "Copied" : "Copy"}</span>
            </button>
          </div>

          {/* Instagram Profile URL */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold text-[#1D1D1F]">
                Instagram Profile Link
              </label>
              <span className="text-[11px] text-[#86868B]">
                For Reel comments & followers
              </span>
            </div>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-500">
                <InstagramIcon className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
                placeholder="https://instagram.com/yourhandle"
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#F5F5F7] border border-[#E5E5EA] text-sm text-[#1D1D1F] placeholder-[#86868B] focus:bg-white focus:border-[#0071E3] focus:ring-2 focus:ring-[#0071E3]/20 outline-none transition-all"
              />
            </div>
            <p className="text-[11px] text-[#86868B] mt-1.5 pl-1">
              Add your Instagram profile link or handle so visitors can follow and comment on your Reels.
            </p>
          </div>

          {/* Bio */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold text-[#1D1D1F]">
                Bio (Optional)
              </label>
              <span className="text-[11px] text-[#86868B]">
                {bio.length}/150
              </span>
            </div>
            <textarea
              rows={3}
              maxLength={150}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell your audience what you create..."
              className="w-full px-4 py-3 rounded-2xl bg-[#F5F5F7] border border-[#E5E5EA] text-sm text-[#1D1D1F] placeholder-[#86868B] focus:bg-white focus:border-[#0071E3] focus:ring-2 focus:ring-[#0071E3]/20 outline-none transition-all resize-none"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting || !usernameAvailable || checkingUsername}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-[#0071E3] hover:bg-[#0077ED] text-white font-semibold text-sm shadow-[0_4px_14px_rgba(0,113,227,0.3)] transition-all apple-btn disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating your profile...</span>
              </>
            ) : (
              <>
                <span>Complete Setup & Go to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
