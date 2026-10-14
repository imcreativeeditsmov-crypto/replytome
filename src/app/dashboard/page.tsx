"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { PostService } from "@/lib/services/postService";
import { MockStore } from "@/lib/firebase/mockData";
import { Navbar } from "@/components/Navbar";
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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardPage() {
  const router = useRouter();
  const { user, userProfile, updateProfileState, isDemoMode, loading: authLoading } = useAuth();

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
      router.push("/login?redirect=/dashboard");
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
            MockStore.setPosts(data.posts);
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

    // Update order property
    const updated = newPosts.map((p, i) => ({ ...p, order: i }));
    setPosts(updated);

    await PostService.reorderPosts(updated.map((p) => p.id));
  };

  const handleDeletePost = async () => {
    if (!deleteModalPost) return;
    try {
      const remaining = posts.filter((p) => p.id !== deleteModalPost.id);
      await PostService.deletePost(deleteModalPost.id);
      setPosts(remaining);
      MockStore.setPosts(remaining);
      // Explicitly sync remaining array to server storage
      await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ posts: remaining }),
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

      const updated = await PostService.saveUserProfile(
        {
          ...userProfile,
          displayName: editName.trim() || userProfile.displayName,
          username: editUsername.toLowerCase().trim(),
          bio: editBio.trim(),
          photoURL: editPhoto || userProfile.photoURL,
        },
        userProfile.username
      );

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

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-[#0071E3]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Top Profile Card */}
        <section className="bg-white rounded-[28px] border border-[#E5E5EA] p-6 sm:p-8 shadow-sm mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            {/* User Info */}
            <div className="flex items-center gap-4">
              <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-[#F5F5F7] border border-[#E5E5EA] flex-shrink-0 shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={
                    userProfile?.photoURL ||
                    user?.photoURL ||
                    "/avatar.png"
                  }
                  alt={userProfile?.displayName || "AI by Shivai"}
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold text-[#1D1D1F] tracking-tight">
                    {userProfile?.displayName || user?.displayName || "Creator"}
                  </h1>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#0071E3]/10 text-[#0071E3]">
                    Pro
                  </span>
                </div>
                <p className="text-sm font-mono text-[#6E6E73]">
                  @{userProfile?.username || "username"}
                </p>
                {userProfile?.bio && (
                  <p className="text-xs text-[#6E6E73] max-w-md mt-1.5 line-clamp-2">
                    {userProfile.bio}
                  </p>
                )}
              </div>
            </div>

            {/* Actions & Bio URL Pill */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
              <button
                onClick={() => setIsEditProfileOpen(true)}
                className="px-4 py-2 rounded-full bg-[#F5F5F7] hover:bg-[#EBEBED] text-[#1D1D1F] border border-[#E5E5EA] text-xs font-semibold transition-all apple-btn flex items-center justify-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5 text-[#6E6E73]" />
                <span>Edit Profile</span>
              </button>

              <div className="flex items-center gap-2 bg-[#F5F5F7] p-1.5 pl-3 rounded-full border border-[#E5E5EA]">
                <span className="text-xs font-mono text-[#0071E3] truncate max-w-[170px] sm:max-w-[200px]">
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
                  <Share2 className="w-3.5 h-3.5 text-[#6E6E73]" />
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
            </div>
          </div>

          {/* Quick Metrics Chips */}
          <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-[#E5E5EA]">
            <div className="p-3.5 rounded-2xl bg-[#F5F5F7]/70 border border-[#E5E5EA] text-center sm:text-left">
              <span className="text-[11px] font-semibold text-[#86868B] uppercase tracking-wider block">
                Total Views
              </span>
              <p className="text-lg sm:text-2xl font-bold text-[#1D1D1F] mt-0.5">
                {formatCount(totalViews)}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#F5F5F7]/70 border border-[#E5E5EA] text-center sm:text-left">
              <span className="text-[11px] font-semibold text-[#86868B] uppercase tracking-wider block">
                Comment Unlocks
              </span>
              <p className="text-lg sm:text-2xl font-bold text-[#0071E3] mt-0.5">
                {formatCount(totalUnlocks)}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#F5F5F7]/70 border border-[#E5E5EA] text-center sm:text-left">
              <span className="text-[11px] font-semibold text-[#86868B] uppercase tracking-wider block">
                Published Posts
              </span>
              <p className="text-lg sm:text-2xl font-bold text-[#1D1D1F] mt-0.5">
                {publishedCount} <span className="text-xs font-normal text-[#86868B]">/ {posts.length}</span>
              </p>
            </div>
          </div>
        </section>

        {/* Section Header & "New Post" Button */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-[#1D1D1F] tracking-tight">
              Posts & Content Gates
            </h2>
            <p className="text-xs text-[#6E6E73] mt-0.5">
              Drag or reorder posts to customize your public feed.
            </p>
          </div>

          <Link
            href="/dashboard/new"
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white font-semibold text-xs sm:text-sm shadow-[0_4px_14px_rgba(0,113,227,0.3)] transition-all apple-btn"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New Post</span>
          </Link>
        </div>

        {/* Post List */}
        {loadingPosts ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-28 rounded-2xl bg-white border border-[#E5E5EA] animate-pulse p-4 flex items-center gap-4"
              >
                <div className="w-20 h-20 rounded-xl bg-zinc-100 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-zinc-100 rounded w-1/3" />
                  <div className="h-3 bg-zinc-100 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[#E5E5EA] p-12 text-center shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-[#0071E3]/10 text-[#0071E3] flex items-center justify-center mx-auto mb-4">
              <FileText className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-[#1D1D1F]">No posts yet</h3>
            <p className="text-xs text-[#6E6E73] max-w-sm mx-auto mt-1 mb-6">
              Create your first link-in-bio post. Add pictures, multiple copyable text blocks, and lock them behind an Instagram Reel comment!
            </p>
            <Link
              href="/dashboard/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#0071E3] text-white text-xs font-semibold hover:bg-[#0077ED] transition-all apple-btn shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Create Your First Post</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-3.5">
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
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="group bg-white rounded-2xl border border-[#E5E5EA] p-4 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    {/* Left: Reorder controls + Thumbnail + Info */}
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      {/* Reorder Buttons */}
                      <div className="flex flex-col gap-1 text-[#86868B]">
                        <button
                          onClick={() => handleMovePost(index, "up")}
                          disabled={index === 0}
                          aria-label="Move post up"
                          className="p-1 rounded hover:bg-[#F5F5F7] disabled:opacity-20 transition-all"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleMovePost(index, "down")}
                          disabled={index === posts.length - 1}
                          aria-label="Move post down"
                          className="p-1 rounded hover:bg-[#F5F5F7] disabled:opacity-20 transition-all"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Thumbnail */}
                      <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-[#F5F5F7] border border-[#E5E5EA] flex-shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={thumbnail}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {post.images.length > 1 && (
                          <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-sm text-[10px] text-white font-medium">
                            +{post.images.length - 1}
                          </div>
                        )}
                      </div>

                      {/* Content details */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                              post.status === "published"
                                ? "bg-[#34C759]/10 text-[#34C759]"
                                : "bg-[#86868B]/10 text-[#86868B]"
                            }`}
                          >
                            {post.status}
                          </span>

                          {post.gateEnabled ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#0071E3]/10 text-[#0071E3]">
                              <Lock className="w-2.5 h-2.5" />
                              <span>{post.gateKeyword || "LOCKED"}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#F5F5F7] text-[#6E6E73]">
                              <Unlock className="w-2.5 h-2.5" />
                              <span>Public</span>
                            </span>
                          )}

                          <span className="text-[11px] text-[#86868B]">
                            {post.textBlocks?.length || 0} text blocks
                          </span>
                        </div>

                        <h3 className="text-sm sm:text-base font-semibold text-[#1D1D1F] truncate group-hover:text-[#0071E3] transition-colors">
                          <Link href={`/dashboard/edit/${post.id}`}>
                            {post.title}
                          </Link>
                        </h3>

                        <div className="flex items-center gap-4 text-xs text-[#6E6E73] mt-1">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5 text-[#86868B]" />
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
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={() => handleOpenShare(post.title, postUrl)}
                        className="p-2 rounded-xl text-[#6E6E73] hover:text-[#1D1D1F] hover:bg-[#F5F5F7] transition-all apple-btn"
                        title="Share post"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>

                      <Link
                        href={`/dashboard/edit/${post.id}`}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#1D1D1F] bg-[#F5F5F7] hover:bg-[#EBEBED] transition-all apple-btn border border-[#E5E5EA]"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-[#6E6E73]" />
                        <span>Edit</span>
                      </Link>

                      <button
                        onClick={() => setDeleteModalPost(post)}
                        className="p-2 rounded-xl text-[#FF3B30] hover:bg-[#FF3B30]/10 transition-all apple-btn"
                        title="Delete post"
                      >
                        <Trash2 className="w-4 h-4" />
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
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setDeleteModalPost(null)}
          />
          <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-[#E5E5EA] z-10 text-center animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-[#1D1D1F]">Delete post?</h3>
            <p className="text-xs text-[#6E6E73] mt-1 mb-6">
              &quot;{deleteModalPost.title}&quot; will be permanently removed.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setDeleteModalPost(null)}
                className="py-2.5 rounded-2xl bg-[#F5F5F7] text-xs font-semibold text-[#1D1D1F] hover:bg-[#EBEBED] transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePost}
                className="py-2.5 rounded-2xl bg-[#FF3B30] text-xs font-semibold text-white hover:bg-red-600 transition-all shadow-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsEditProfileOpen(false)}
          />
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-[#E5E5EA] z-10 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-[#1D1D1F] mb-1">Edit Profile</h3>
            <p className="text-xs text-[#6E6E73] mb-6">
              Update how you appear on your public link-in-bio page.
            </p>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#1D1D1F] mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F5F7] border border-[#E5E5EA] text-sm text-[#1D1D1F] focus:bg-white focus:border-[#0071E3] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1D1D1F] mb-1">
                  Username
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
                    className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-[#F5F5F7] border border-[#E5E5EA] text-sm font-mono text-[#1D1D1F] focus:bg-white focus:border-[#0071E3] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1D1D1F] mb-1">
                  Bio
                </label>
                <textarea
                  rows={2}
                  maxLength={150}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#F5F5F7] border border-[#E5E5EA] text-sm text-[#1D1D1F] focus:bg-white focus:border-[#0071E3] outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1D1D1F] mb-1">
                  Profile Photo URL
                </label>
                <input
                  type="text"
                  value={editPhoto}
                  onChange={(e) => setEditPhoto(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F5F7] border border-[#E5E5EA] text-xs text-[#1D1D1F] focus:bg-white focus:border-[#0071E3] outline-none"
                />
              </div>

              {profileError && (
                <p className="text-xs text-[#FF3B30]">{profileError}</p>
              )}

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(false)}
                  className="px-4 py-2 rounded-full text-xs font-semibold text-[#6E6E73] hover:bg-[#F5F5F7]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-5 py-2 rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-semibold shadow-sm apple-btn disabled:opacity-50 flex items-center gap-1.5"
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
