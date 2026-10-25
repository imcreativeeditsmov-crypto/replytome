"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { PostService } from "@/lib/services/postService";
import { MockStore } from "@/lib/firebase/mockData";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ShareModal } from "@/components/ShareModal";
import { Post, UserProfile } from "@/types";
import { formatCount, validateUsername } from "@/lib/utils";
import {
  Plus,
  Copy,
  Check,
  Share2,
  ExternalLink,
  Lock,
  Eye,
  Unlock,
  Edit3,
  Trash2,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Camera,
  Loader2,
  AlertCircle,
  FileText,
  ArrowRight,
  ShieldCheck,
  LogOut,
  TrendingUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { InstagramIcon } from "@/components/icons/InstagramIcon";

export default function DashboardPage() {
  const router = useRouter();
  const { user, userProfile, updateProfileState, isDemoMode, loading: authLoading, isAdmin, signOut } = useAuth();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [copiedBioLink, setCopiedBioLink] = useState(false);

  // Share Modal state
  const [shareData, setShareData] = useState<{ isOpen: boolean; title: string; url: string }>({
    isOpen: false,
    title: "",
    url: "",
  });

  // Edit Profile Modal
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editInstagramUrl, setEditInstagramUrl] = useState("");
  const [editPhoto, setEditPhoto] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Delete confirmation
  const [deleteModalPost, setDeleteModalPost] = useState<Post | null>(null);

  const origin = typeof window !== "undefined" ? window.location.origin : "https://replyto.me";
  const bioUrl = userProfile?.username ? `${origin}/${userProfile.username}` : "";

  // Load posts
  useEffect(() => {
    if (!authLoading && !user) {
      const cached = typeof window !== "undefined" ? localStorage.getItem("replyto_auth_user_v7") : null;
      if (!cached) {
        const timer = setTimeout(() => {
          if (!user && !localStorage.getItem("replyto_auth_user_v7")) {
            router.push("/login?redirect=/dashboard");
          }
        }, 5000);
        return () => clearTimeout(timer);
      }
      return;
    }

    if (user && !userProfile?.username && !authLoading) {
      router.push("/onboarding");
      return;
    }

    if (user?.uid) {
      fetch(`/api/posts?uid=${encodeURIComponent(user.uid)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.posts)) {
            setPosts(data.posts);
            MockStore.setPosts(data.posts, user.uid);
          } else {
            const fetched = MockStore.getPosts(user.uid);
            setPosts(fetched);
          }
        })
        .catch(() => {
          const fetched = MockStore.getPosts(user.uid);
          setPosts(fetched);
        })
        .finally(() => setLoadingPosts(false));
    }
  }, [user, userProfile, authLoading, router]);

  // Sync profile fields when opening edit modal
  useEffect(() => {
    if (userProfile) {
      setEditName(userProfile.displayName || "");
      setEditUsername(userProfile.username || "");
      setEditBio(userProfile.bio || "");
      setEditInstagramUrl(userProfile.instagramUrl || "");
      setEditPhoto(userProfile.photoURL || "");
    }
  }, [userProfile, isEditProfileOpen]);

  const handleCopyBioLink = async () => {
    if (!bioUrl) return;
    try {
      await navigator.clipboard.writeText(bioUrl);
      setCopiedBioLink(true);
      setTimeout(() => setCopiedBioLink(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenShare = (title: string, url: string) => {
    if (navigator.share) {
      navigator.share({ title, url }).catch(() => {
        setShareData({ isOpen: true, title, url });
      });
    } else {
      setShareData({ isOpen: true, title, url });
    }
  };

  const handleMovePost = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= posts.length) return;

    const newPosts = [...posts];
    const [moved] = newPosts.splice(index, 1);
    newPosts.splice(targetIndex, 0, moved);

    const updated = newPosts.map((p, i) => ({ ...p, order: i }));
    setPosts(updated);

    await PostService.reorderPosts(updated.map((p) => p.id));
  };

  const handleDeletePost = async () => {
    if (!deleteModalPost || !user?.uid) return;
    try {
      const remaining = posts.filter((p) => p.id !== deleteModalPost.id);
      await PostService.deletePost(deleteModalPost.id);
      setPosts(remaining);
      MockStore.setPosts(remaining, user.uid);
      await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ posts: remaining, uid: user.uid }),
      }).catch(console.error);
      setDeleteModalPost(null);
    } catch (err) {
      console.error("Failed to delete post:", err);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !userProfile) return;

    const validation = validateUsername(editUsername);
    if (!validation.isValid) {
      setProfileError(validation.error || "Invalid username");
      return;
    }

    setSavingProfile(true);
    setProfileError(null);

    try {
      if (editUsername.toLowerCase() !== userProfile.username.toLowerCase()) {
        const available = await PostService.isUsernameAvailable(editUsername, user.uid);
        if (!available) {
          setProfileError(`@${editUsername} is already taken`);
          setSavingProfile(false);
          return;
        }
      }

      let finalIg = editInstagramUrl.trim();
      if (finalIg) {
        if (!finalIg.startsWith("http://") && !finalIg.startsWith("https://")) {
          finalIg = `https://instagram.com/${finalIg.replace(/^@/, "")}`;
        }
      }

      const updated = await PostService.saveUserProfile(
        {
          ...userProfile,
          displayName: editName.trim() || userProfile.displayName,
          username: editUsername.toLowerCase().trim(),
          bio: editBio.trim(),
          instagramUrl: finalIg,
          photoURL: editPhoto || userProfile.photoURL,
        },
        userProfile.username
      );

      try {
        await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user: updated }),
        });
      } catch (e) {
        console.warn("Could not sync user to /api/users:", e);
      }

      updateProfileState(updated);
      setIsEditProfileOpen(false);
    } catch (err) {
      console.error(err);
      setProfileError("Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const totalViews = posts.reduce((sum, p) => sum + (p.views || 0), 0);
  const totalUnlocks = posts.reduce((sum, p) => sum + (p.unlocks || 0), 0);
  const publishedCount = posts.filter((p) => p.status === "published").length;
  const conversionRate = totalViews > 0 ? ((totalUnlocks / totalViews) * 100).toFixed(1) : "0.0";

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-[#0071E3]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] flex flex-col font-sans selection:bg-[#0071E3]/15 selection:text-[#0071E3]">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-10">
        {/* Super Admin Access Banner */}
        {isAdmin && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-sm flex-shrink-0">
                <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-amber-800">
                    Admin Console Access
                  </span>
                  <span className="px-2 py-0.2 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-900">
                    Master Admin
                  </span>
                </div>
                <p className="text-xs text-[#86868B] mt-0.5">
                  View global platform impressions, unlock analytics, and manage registered creators.
                </p>
              </div>
            </div>
            <Link
              href="/admin"
              className="apple-btn-dark text-xs py-2 px-4 whitespace-nowrap w-full sm:w-auto"
            >
              <span>Open Admin Console</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>
        )}

        {/* Creator Profile Card */}
        <section className="bg-white rounded-[24px] border border-black/[0.06] p-6 sm:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.03)] mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            {/* User Info */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full overflow-hidden bg-[#F5F5F7] border border-black/[0.08] flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={
                    userProfile?.photoURL ||
                    user?.photoURL ||
                    "/avatar.png"
                  }
                  alt={userProfile?.displayName || user?.displayName || "Creator"}
                  referrerPolicy="no-referrer"
                  crossOrigin="anonymous"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/avatar.png";
                  }}
                />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-semibold text-[#1D1D1F] tracking-tight">
                    {userProfile?.displayName || user?.displayName || "Creator"}
                  </h1>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#0071E3]/10 text-[#0071E3]">
                    Pro
                  </span>
                </div>
                <p className="text-xs font-mono text-[#86868B] mt-0.5">
                  @{userProfile?.username || "username"}
                </p>
                {userProfile?.bio && (
                  <p className="text-xs text-[#86868B] max-w-md mt-1.5 line-clamp-2">
                    {userProfile.bio}
                  </p>
                )}
              </div>
            </div>

            {/* Actions & Bio URL Pill */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto">
              <button
                onClick={() => setIsEditProfileOpen(true)}
                className="apple-btn-secondary text-xs py-2 px-3.5 flex items-center justify-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5 text-[#86868B]" />
                <span>Edit Profile</span>
              </button>

              <div className="flex items-center gap-1.5 bg-[#F5F5F7] p-1 pl-3 rounded-full border border-black/[0.06]">
                <span className="text-xs font-mono text-[#0071E3] truncate max-w-[170px] sm:max-w-[190px]">
                  {bioUrl.replace(/^https?:\/\//, "")}
                </span>

                <button
                  onClick={handleCopyBioLink}
                  aria-label="Copy link in bio"
                  className={`p-1.5 rounded-full text-xs font-medium transition-all apple-btn ${
                    copiedBioLink
                      ? "bg-[#34C759] text-white"
                      : "bg-white text-[#1D1D1F] hover:bg-zinc-100 shadow-sm"
                  }`}
                  title="Copy link"
                >
                  {copiedBioLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                </button>

                <button
                  onClick={() => handleOpenShare(`${userProfile?.displayName}'s Link in Bio`, bioUrl)}
                  aria-label="Share profile link"
                  className="p-1.5 rounded-full bg-white text-[#1D1D1F] hover:bg-zinc-100 shadow-sm transition-all apple-btn"
                  title="Share profile"
                >
                  <Share2 className="w-3.5 h-3.5 text-[#86868B]" />
                </button>

                <Link
                  href={`/${userProfile?.username}`}
                  target="_blank"
                  className="p-1.5 rounded-full bg-[#0071E3] text-white hover:bg-[#0077ED] shadow-sm transition-all apple-btn"
                  title="Open live link"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>

              <button
                type="button"
                onClick={async () => {
                  await signOut();
                  router.push("/login");
                }}
                className="p-2 rounded-full text-[#86868B] hover:text-[#FF3B30] hover:bg-rose-50 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Apple Fitness-style Stat Widgets */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mt-6 pt-6 border-t border-black/[0.06]">
            <div className="p-4 rounded-2xl bg-[#F5F5F7] border border-black/[0.04]">
              <span className="text-[11px] font-semibold text-[#86868B] uppercase tracking-wider block">
                Total Impressions
              </span>
              <p className="text-xl sm:text-2xl font-semibold text-[#1D1D1F] mt-0.5">
                {formatCount(totalViews)}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F5F5F7] border border-black/[0.04]">
              <span className="text-[11px] font-semibold text-[#86868B] uppercase tracking-wider block">
                Comment Unlocks
              </span>
              <p className="text-xl sm:text-2xl font-semibold text-[#0071E3] mt-0.5">
                {formatCount(totalUnlocks)}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F5F5F7] border border-black/[0.04]">
              <span className="text-[11px] font-semibold text-[#86868B] uppercase tracking-wider block">
                Unlock Conversion
              </span>
              <p className="text-xl sm:text-2xl font-semibold text-[#34C759] mt-0.5">
                {conversionRate}%
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F5F5F7] border border-black/[0.04]">
              <span className="text-[11px] font-semibold text-[#86868B] uppercase tracking-wider block">
                Published Resources
              </span>
              <p className="text-xl sm:text-2xl font-semibold text-[#1D1D1F] mt-0.5">
                {publishedCount} <span className="text-xs font-normal text-[#86868B]">/ {posts.length}</span>
              </p>
            </div>
          </div>
        </section>

        {/* Section Header & New Post Button */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-[#1D1D1F] tracking-tight">
              Published Resources
            </h2>
            <p className="text-xs text-[#86868B] mt-0.5">
              Reorder posts to organize your public bio grid.
            </p>
          </div>

          <Link
            href="/dashboard/new"
            className="apple-btn-primary text-xs sm:text-sm py-2 px-4 shadow-none"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>New Post</span>
          </Link>
        </div>

        {/* Post List */}
        {loadingPosts ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-24 rounded-2xl bg-white border border-black/[0.06] animate-pulse p-4 flex items-center gap-4"
              >
                <div className="w-16 h-16 rounded-xl bg-zinc-100 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-zinc-100 rounded w-1/3" />
                  <div className="h-3 bg-zinc-100 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white rounded-3xl border border-black/[0.06] p-12 text-center shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-[#0071E3]/10 text-[#0071E3] flex items-center justify-center mx-auto mb-3.5">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-[#1D1D1F]">No posts yet</h3>
            <p className="text-xs text-[#86868B] max-w-sm mx-auto mt-1 mb-6">
              Create your first link-in-bio resource. Add copyable prompt blocks, files, and gate them behind an Instagram Reel comment.
            </p>
            <Link
              href="/dashboard/new"
              className="apple-btn-primary text-xs py-2 px-5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create First Post</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {posts.map((post, index) => {
                const postUrl = `${origin}/${userProfile?.username}/${post.slug}`;
                const thumbnail =
                  post.images && post.images.length > 0
                    ? post.images[0]
                    : "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80";

                return (
                  <motion.div
                    key={post.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="group bg-white rounded-2xl border border-black/[0.06] p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.05)] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    {/* Left: Reorder controls + Thumbnail + Info */}
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      {/* Reorder Buttons */}
                      <div className="flex flex-col gap-0.5 text-[#86868B]">
                        <button
                          onClick={() => handleMovePost(index, "up")}
                          disabled={index === 0}
                          aria-label="Move post up"
                          className="p-1 rounded hover:bg-[#F5F5F7] disabled:opacity-20 transition-colors"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleMovePost(index, "down")}
                          disabled={index === posts.length - 1}
                          aria-label="Move post down"
                          className="p-1 rounded hover:bg-[#F5F5F7] disabled:opacity-20 transition-colors"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Thumbnail */}
                      <div className="relative w-15 h-15 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-[#F5F5F7] border border-black/[0.06] flex-shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={thumbnail}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {post.images.length > 1 && (
                          <div className="absolute bottom-1 right-1 px-1.5 py-0.2 rounded bg-black/60 backdrop-blur-sm text-[9px] text-white font-medium">
                            +{post.images.length - 1}
                          </div>
                        )}
                      </div>

                      {/* Content details */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span
                            className={`px-2 py-0.2 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                              post.status === "published"
                                ? "bg-[#34C759]/10 text-[#34C759]"
                                : "bg-[#86868B]/10 text-[#86868B]"
                            }`}
                          >
                            {post.status}
                          </span>

                          {post.gateEnabled ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[10px] font-semibold bg-[#0071E3]/10 text-[#0071E3]">
                              <Lock className="w-2.5 h-2.5" />
                              <span>{post.gateKeyword || "LOCKED"}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-full text-[10px] font-medium bg-[#F5F5F7] text-[#86868B]">
                              <Unlock className="w-2.5 h-2.5" />
                              <span>Public</span>
                            </span>
                          )}

                          <span className="text-[11px] text-[#86868B]">
                            {post.textBlocks?.length || 0} blocks
                          </span>
                        </div>

                        <h3 className="text-sm font-semibold text-[#1D1D1F] truncate group-hover:text-[#0071E3] transition-colors">
                          <Link href={`/dashboard/edit/${post.id}`}>
                            {post.title}
                          </Link>
                        </h3>

                        <div className="flex items-center gap-4 text-xs text-[#86868B] mt-1">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5" />
                            {formatCount(post.views || 0)} views
                          </span>
                          {post.gateEnabled && (
                            <span className="flex items-center gap-1 text-[#0071E3]">
                              <Sparkles className="w-3.5 h-3.5" />
                              {formatCount(post.unlocks || 0)} unlocks
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-1.5 self-end sm:self-center">
                      <button
                        onClick={() => handleOpenShare(post.title, postUrl)}
                        className="p-2 rounded-full text-[#86868B] hover:text-[#1D1D1F] hover:bg-[#F5F5F7] transition-colors apple-btn"
                        title="Share post"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>

                      <Link
                        href={`/dashboard/edit/${post.id}`}
                        className="apple-btn-secondary text-xs py-1.5 px-3 flex items-center gap-1"
                      >
                        <Edit3 className="w-3 h-3 text-[#86868B]" />
                        <span>Edit</span>
                      </Link>

                      <button
                        onClick={() => setDeleteModalPost(post)}
                        className="p-2 rounded-full text-[#86868B] hover:text-[#FF3B30] hover:bg-rose-50 transition-colors apple-btn"
                        title="Delete post"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Share Modal */}
      <ShareModal
        isOpen={shareData.isOpen}
        onClose={() => setShareData({ ...shareData, isOpen: false })}
        title={shareData.title}
        url={shareData.url}
      />

      {/* Delete Confirmation Modal */}
      {deleteModalPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setDeleteModalPost(null)}
          />
          <div className="relative w-full max-w-sm rounded-[24px] bg-white p-6 shadow-2xl border border-black/[0.08] z-10 text-center animate-in fade-in zoom-in-95 duration-150">
            <div className="w-10 h-10 rounded-full bg-rose-50 text-[#FF3B30] flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-base text-[#1D1D1F]">Delete post?</h3>
            <p className="text-xs text-[#86868B] mt-1 mb-5">
              &quot;{deleteModalPost.title}&quot; will be permanently removed.
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => setDeleteModalPost(null)}
                className="apple-btn-secondary text-xs py-2"
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePost}
                className="py-2 rounded-full bg-[#FF3B30] text-xs font-semibold text-white hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal (Apple Settings Sheet Style) */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setIsEditProfileOpen(false)}
          />
          <div className="relative w-full max-w-md rounded-[28px] bg-white p-6 sm:p-8 shadow-2xl border border-black/[0.08] z-10 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-semibold text-[#1D1D1F] mb-1">Edit Creator Profile</h3>
            <p className="text-xs text-[#86868B] mb-5">
              Customize how your profile appears to visitors.
            </p>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#1D1D1F] mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F5F7] border border-black/[0.06] text-xs text-[#1D1D1F] focus:bg-white focus:border-[#0071E3] outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#1D1D1F] mb-1">
                  Handle (@username)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-[#86868B] font-mono">
                    @
                  </span>
                  <input
                    type="text"
                    required
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value.toLowerCase().replace(/\s+/g, ""))}
                    className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-[#F5F5F7] border border-black/[0.06] text-xs font-mono text-[#1D1D1F] focus:bg-white focus:border-[#0071E3] outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#1D1D1F] mb-1">
                  Instagram Link
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-500">
                    <InstagramIcon className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="text"
                    value={editInstagramUrl}
                    onChange={(e) => setEditInstagramUrl(e.target.value)}
                    placeholder="https://instagram.com/yourhandle"
                    className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-[#F5F5F7] border border-black/[0.06] text-xs text-[#1D1D1F] focus:bg-white focus:border-[#0071E3] outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#1D1D1F] mb-1">
                  Bio
                </label>
                <textarea
                  rows={2}
                  maxLength={150}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#F5F5F7] border border-black/[0.06] text-xs text-[#1D1D1F] focus:bg-white focus:border-[#0071E3] outline-none resize-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#1D1D1F] mb-1.5">
                  Profile Photo
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-[#F5F5F7] border border-black/[0.08] flex-shrink-0 relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={editPhoto || "/avatar.png"}
                      alt="Avatar"
                      referrerPolicy="no-referrer"
                      crossOrigin="anonymous"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/avatar.png";
                      }}
                    />
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F5F5F7] hover:bg-[#E8E8ED] text-xs font-medium text-[#1D1D1F] cursor-pointer border border-black/[0.06] transition-all apple-btn">
                      <Camera className="w-3.5 h-3.5 text-[#0071E3]" />
                      <span>Upload Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = () => setEditPhoto(reader.result as string);
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {profileError && (
                <p className="text-xs text-[#FF3B30]">{profileError}</p>
              )}

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(false)}
                  className="px-4 py-2 rounded-full text-xs font-medium text-[#86868B] hover:text-[#1D1D1F]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="apple-btn-primary text-xs py-2 px-5 disabled:opacity-50 flex items-center gap-1.5"
                >
                  {savingProfile ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : null}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
