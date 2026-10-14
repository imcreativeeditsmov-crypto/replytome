"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { PostService } from "@/lib/services/postService";
import { slugify, parseInstagramUrl } from "@/lib/utils";
import { Post, PostTextBlock, PostGateScope, PostStatus } from "@/types";
import { Carousel } from "@/components/Carousel";
import { ReelPreviewCard } from "@/components/ReelPreviewCard";
import { TextBlockCard } from "@/components/TextBlockCard";
import { PhoneMockup } from "@/components/PhoneMockup";
import {
  ArrowLeft,
  Upload,
  X,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Lock,
  Unlock,
  Check,
  Eye,
  Loader2,
  Layers,
  Sparkles,
  Download,
  Image as ImageIcon,
} from "lucide-react";
import { InstagramIcon } from "@/components/icons/InstagramIcon";

interface PostEditorProps {
  initialPost?: Post;
  isEditing?: boolean;
}

export const PostEditor: React.FC<PostEditorProps> = ({
  initialPost,
  isEditing = false,
}) => {
  const router = useRouter();
  const { user, userProfile } = useAuth();

  // Form states
  const [title, setTitle] = useState(initialPost?.title || "");
  const [slug, setSlug] = useState(initialPost?.slug || "");
  const [slugEdited, setSlugEdited] = useState(Boolean(initialPost?.slug));
  const [images, setImages] = useState<string[]>(initialPost?.images || []);
  const [reelUrl, setReelUrl] = useState(initialPost?.reelUrl || "");
  const [gateEnabled, setGateEnabled] = useState(initialPost?.gateEnabled || false);
  const [gateKeyword, setGateKeyword] = useState(initialPost?.gateKeyword || "PROMPT");
  const [gateMessage, setGateMessage] = useState(
    initialPost?.gateMessage || "Comment PROMPT on the reel to unlock the full guide & resources."
  );
  const [gateScope, setGateScope] = useState<PostGateScope>(
    initialPost?.gateScope || "text_blocks"
  );
  const [allowDownload, setAllowDownload] = useState<boolean>(
    initialPost?.allowDownload ?? true
  );
  const [status, setStatus] = useState<PostStatus>(initialPost?.status || "published");
  const [textBlocks, setTextBlocks] = useState<PostTextBlock[]>(
    initialPost?.textBlocks || [
      {
        id: `block_${Date.now()}_1`,
        title: "Block 1: Prompt / Resource",
        text: "Add your high-value copyable content, link list, or prompt here...",
      },
    ]
  );

  // UI state
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [previewTab, setPreviewTab] = useState<"editor" | "preview">("editor");
  const [simulateLocked, setSimulateLocked] = useState(true);

  // Handle title change and auto-slug
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!slugEdited) {
      setSlug(slugify(val));
    }
  };

  // Image Upload handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !user) return;

    setUploadingImage(true);
    try {
      const uploadPromises = Array.from(files).map((file) =>
        PostService.uploadImage(file, user.uid)
      );
      const uploadedUrls = await Promise.all(uploadPromises);
      setImages((prev) => [...prev, ...uploadedUrls]);
    } catch (err) {
      console.error("Failed to upload images:", err);
      alert("Error uploading images. Please try again.");
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const moveImage = (index: number, direction: "left" | "right") => {
    const target = direction === "left" ? index - 1 : index + 1;
    if (target < 0 || target >= images.length) return;
    const copy = [...images];
    const [item] = copy.splice(index, 1);
    copy.splice(target, 0, item);
    setImages(copy);
  };

  // Text block helpers
  const addTextBlock = () => {
    setTextBlocks((prev) => [
      ...prev,
      {
        id: `block_${Date.now()}_${prev.length + 1}`,
        title: `Block ${prev.length + 1}`,
        text: "",
      },
    ]);
  };

  const updateTextBlock = (index: number, field: "title" | "text", value: string) => {
    setTextBlocks((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const removeTextBlock = (index: number) => {
    setTextBlocks((prev) => prev.filter((_, i) => i !== index));
  };

  const moveTextBlock = (index: number, direction: "up" | "down") => {
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= textBlocks.length) return;
    const copy = [...textBlocks];
    const [item] = copy.splice(index, 1);
    copy.splice(target, 0, item);
    setTextBlocks(copy);
  };

  // Save Post
  const handleSave = async (customStatus?: PostStatus) => {
    if (!user) return;
    if (!title.trim()) {
      alert("Please provide a post title");
      return;
    }

    const finalSlug = slug.trim() ? slugify(slug) : slugify(title);
    const finalStatus = customStatus || status;

    setSaving(true);
    try {
      const saved = await PostService.savePost({
        id: initialPost?.id,
        uid: user.uid,
        title: title.trim(),
        slug: finalSlug,
        images,
        reelUrl: reelUrl.trim() || undefined,
        gateEnabled,
        gateKeyword: gateKeyword.trim().toUpperCase(),
        gateMessage: gateMessage.trim(),
        gateScope,
        allowDownload,
        status: finalStatus,
        order: initialPost?.order ?? 0,
        textBlocks: textBlocks.filter((b) => b.text.trim().length > 0),
      });

      router.push("/dashboard");
    } catch (err) {
      console.error("Error saving post:", err);
      alert("Failed to save post");
    } finally {
      setSaving(false);
    }
  };

  const reelCheck = parseInstagramUrl(reelUrl);

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex flex-col">
      {/* Top action bar */}
      <header className="sticky top-0 z-30 frosted-nav">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="w-8 h-8 rounded-full bg-white border border-[#E5E5EA] flex items-center justify-center text-[#1D1D1F] hover:bg-[#F5F5F7] shadow-sm transition-all apple-btn"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-sm sm:text-base font-bold text-[#1D1D1F] truncate max-w-[200px] sm:max-w-md">
                {isEditing ? "Edit Post" : "Create New Post"}
              </h1>
              <p className="text-[11px] text-[#6E6E73]">
                {gateEnabled ? `🔒 Gate: ${gateKeyword || "KEYWORD"}` : "🔓 Public post"}
              </p>
            </div>
          </div>

          {/* Mobile Tab Switcher */}
          <div className="flex lg:hidden bg-[#E5E5EA]/80 p-0.5 rounded-full text-xs font-semibold">
            <button
              onClick={() => setPreviewTab("editor")}
              className={`px-3 py-1 rounded-full transition-all ${
                previewTab === "editor"
                  ? "bg-white text-[#1D1D1F] shadow-sm"
                  : "text-[#6E6E73]"
              }`}
            >
              Editor
            </button>
            <button
              onClick={() => setPreviewTab("preview")}
              className={`px-3 py-1 rounded-full transition-all ${
                previewTab === "preview"
                  ? "bg-white text-[#1D1D1F] shadow-sm"
                  : "text-[#6E6E73]"
              }`}
            >
              Live Preview
            </button>
          </div>

          {/* Desktop Save buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSave("draft")}
              disabled={saving}
              className="px-3.5 py-1.5 rounded-full bg-white border border-[#E5E5EA] text-xs font-semibold text-[#1D1D1F] hover:bg-[#F5F5F7] transition-all apple-btn"
            >
              Save as Draft
            </button>
            <button
              type="button"
              onClick={() => handleSave("published")}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-semibold shadow-sm transition-all apple-btn disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              <span>{isEditing ? "Update Post" : "Publish"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Two-Column Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form Editor */}
        <div
          className={`lg:col-span-7 space-y-6 ${
            previewTab === "preview" ? "hidden lg:block" : "block"
          }`}
        >
          {/* Post Title & Slug */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E5E5EA] shadow-sm space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#1D1D1F] mb-1.5">
                Post Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. 50+ System Prompts for ChatGPT & Claude"
                className="w-full px-4 py-3 rounded-2xl bg-[#F5F5F7] border border-[#E5E5EA] text-sm font-medium text-[#1D1D1F] placeholder-[#86868B] focus:bg-white focus:border-[#0071E3] outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1D1D1F] mb-1.5">
                URL Slug
              </label>
              <div className="flex items-center px-4 py-2.5 rounded-2xl bg-[#F5F5F7] border border-[#E5E5EA] text-xs font-mono text-[#6E6E73]">
                <span>/{userProfile?.username || "username"}/</span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => {
                    setSlugEdited(true);
                    setSlug(slugify(e.target.value));
                  }}
                  placeholder="post-slug"
                  className="flex-1 bg-transparent text-[#1D1D1F] outline-none pl-1"
                />
              </div>
            </div>
          </div>

          {/* Instagram Reel Integration */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E5E5EA] shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <InstagramIcon className="w-4 h-4 text-[#E1306C]" />
                <label className="text-xs font-semibold text-[#1D1D1F]">
                  Linked Instagram Reel URL
                </label>
              </div>
              {reelUrl && (
                <span
                  className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                    reelCheck.isValid
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {reelCheck.isValid ? "Valid Reel" : "Invalid URL"}
                </span>
              )}
            </div>

            <input
              type="url"
              value={reelUrl}
              onChange={(e) => setReelUrl(e.target.value)}
              placeholder="https://www.instagram.com/reel/C123456/..."
              className="w-full px-4 py-3 rounded-2xl bg-[#F5F5F7] border border-[#E5E5EA] text-xs font-mono text-[#1D1D1F] placeholder-[#86868B] focus:bg-white focus:border-[#0071E3] outline-none transition-all"
            />

            {reelUrl && reelCheck.isValid && (
              <div className="pt-2">
                <p className="text-[11px] text-[#86868B] mb-2 font-medium">Reel Card Preview:</p>
                <ReelPreviewCard
                  reelUrl={reelUrl}
                  creatorName={userProfile?.displayName || "AI by Shivai"}
                />
              </div>
            )}
          </div>

          {/* Comment Gate Settings Card */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E5E5EA] shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                    gateEnabled
                      ? "bg-[#0071E3] text-white"
                      : "bg-[#F5F5F7] text-[#6E6E73] border border-[#E5E5EA]"
                  }`}
                >
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1D1D1F]">
                    Comment to Unlock (Comment Gate)
                  </h3>
                  <p className="text-xs text-[#6E6E73]">
                    Require visitors to comment on your Reel before revealing content
                  </p>
                </div>
              </div>

              {/* iOS style toggle */}
              <button
                type="button"
                onClick={() => setGateEnabled(!gateEnabled)}
                className={`w-12 h-7 rounded-full p-1 transition-colors ${
                  gateEnabled ? "bg-[#34C759]" : "bg-[#E5E5EA]"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                    gateEnabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {gateEnabled && (
              <div className="space-y-4 pt-4 border-t border-[#E5E5EA] animate-in fade-in duration-200">
                {/* Gate Keyword */}
                <div>
                  <label className="block text-xs font-semibold text-[#1D1D1F] mb-1.5">
                    Unlock Keyword (Instagram comment word)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={gateKeyword}
                      onChange={(e) => setGateKeyword(e.target.value.toUpperCase())}
                      placeholder="e.g. PROMPT, LINK, SEND"
                      className="w-full px-4 py-3 rounded-2xl bg-[#F5F5F7] border border-[#E5E5EA] text-sm font-mono font-bold text-[#0071E3] uppercase tracking-wider focus:bg-white focus:border-[#0071E3] outline-none"
                    />
                  </div>
                  <p className="text-[11px] text-[#86868B] mt-1">
                    Visitors will be instructed to comment this word on your linked Reel.
                  </p>
                </div>

                {/* Custom Lock Message */}
                <div>
                  <label className="block text-xs font-semibold text-[#1D1D1F] mb-1.5">
                    Lock Screen Message
                  </label>
                  <textarea
                    rows={2}
                    value={gateMessage}
                    onChange={(e) => setGateMessage(e.target.value)}
                    placeholder="e.g. Comment PROMPT on my reel to unlock the full list..."
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#F5F5F7] border border-[#E5E5EA] text-xs text-[#1D1D1F] focus:bg-white focus:border-[#0071E3] outline-none resize-none"
                  />
                </div>

                {/* Lock Scope Selector */}
                <div>
                  <label className="block text-xs font-semibold text-[#1D1D1F] mb-2">
                    What should be locked?
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(
                      [
                        { id: "text_blocks", label: "Text Blocks Only" },
                        { id: "images", label: "Images Only" },
                        { id: "both", label: "Both" },
                      ] as const
                    ).map((scope) => (
                      <button
                        key={scope.id}
                        type="button"
                        onClick={() => setGateScope(scope.id)}
                        className={`py-2 px-3 rounded-xl text-xs font-medium border text-center transition-all ${
                          gateScope === scope.id
                            ? "bg-[#0071E3] text-white border-[#0071E3] shadow-sm"
                            : "bg-[#F5F5F7] text-[#1D1D1F] border-[#E5E5EA] hover:bg-[#EBEBED]"
                        }`}
                      >
                        {scope.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Pictures Carousel Uploader */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E5E5EA] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#1D1D1F]">
                  Post Pictures (Carousel)
                </h3>
                <p className="text-xs text-[#6E6E73]">
                  Upload multiple pictures visitors can swipe through
                </p>
              </div>
              <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F5F5F7] hover:bg-[#EBEBED] text-[#1D1D1F] border border-[#E5E5EA] text-xs font-semibold cursor-pointer apple-btn">
                <Upload className="w-3.5 h-3.5 text-[#6E6E73]" />
                <span>Upload Photos</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Image Preview Grid */}
            {images.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {images.map((img, i) => (
                  <div
                    key={i}
                    className="relative group aspect-square rounded-2xl overflow-hidden bg-[#F5F5F7] border border-[#E5E5EA]"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img}
                      alt={`Upload ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                      {i > 0 && (
                        <button
                          type="button"
                          onClick={() => moveImage(i, "left")}
                          className="p-1 rounded bg-white text-black hover:bg-zinc-100"
                          title="Move left"
                        >
                          <ChevronUp className="w-3.5 h-3.5 -rotate-90" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="p-1 rounded bg-red-600 text-white hover:bg-red-700"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      {i < images.length - 1 && (
                        <button
                          type="button"
                          onClick={() => moveImage(i, "right")}
                          className="p-1 rounded bg-white text-black hover:bg-zinc-100"
                          title="Move right"
                        >
                          <ChevronDown className="w-3.5 h-3.5 -rotate-90" />
                        </button>
                      )}
                    </div>
                    {i === 0 && (
                      <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/60 text-white text-[10px] font-medium backdrop-blur-sm">
                        Cover
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <label className="border-2 border-dashed border-[#E5E5EA] rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#0071E3]/40 transition-colors">
                <ImageIcon className="w-8 h-8 text-[#86868B] mb-2" />
                <p className="text-xs font-semibold text-[#1D1D1F]">
                  Drag and drop or click to upload pictures
                </p>
                <p className="text-[11px] text-[#86868B] mt-0.5">
                  Supports JPG, PNG, WEBP
                </p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            )}

            {uploadingImage && (
              <div className="flex items-center gap-2 text-xs text-[#0071E3]">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Uploading pictures...</span>
              </div>
            )}

            {/* Allow Image Download Option */}
            <div className="flex items-center justify-between pt-3 border-t border-[#E5E5EA]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#0071E3]/10 text-[#0071E3] flex items-center justify-center flex-shrink-0">
                  <Download className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#1D1D1F]">
                    Allow visitors to download pictures
                  </p>
                  <p className="text-[11px] text-[#6E6E73]">
                    Visitors can save individual photos or download all slides once unlocked
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setAllowDownload(!allowDownload)}
                className={`w-11 h-6 rounded-full p-0.5 transition-colors flex-shrink-0 ${
                  allowDownload ? "bg-[#34C759]" : "bg-[#E5E5EA]"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                    allowDownload ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Copyable Text Blocks Section */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E5E5EA] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#1D1D1F]">
                  Copyable Text Blocks
                </h3>
                <p className="text-xs text-[#6E6E73]">
                  Each block gets a dedicated one-tap &quot;Copy&quot; button on your public page
                </p>
              </div>

              <button
                type="button"
                onClick={addTextBlock}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0071E3] text-white text-xs font-semibold hover:bg-[#0077ED] transition-all apple-btn shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Text Block</span>
              </button>
            </div>

            <div className="space-y-4">
              {textBlocks.map((block, index) => (
                <div
                  key={block.id}
                  className="p-4 rounded-2xl bg-[#F5F5F7] border border-[#E5E5EA] space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1 mr-2">
                      <span className="w-5 h-5 rounded-full bg-[#1D1D1F] text-white text-[10px] font-semibold flex items-center justify-center">
                        {index + 1}
                      </span>
                      <input
                        type="text"
                        value={block.title || ""}
                        onChange={(e) => updateTextBlock(index, "title", e.target.value)}
                        placeholder={`Block #${index + 1} Title (Optional)`}
                        className="flex-1 bg-transparent text-xs font-semibold text-[#1D1D1F] outline-none border-b border-transparent focus:border-[#0071E3]"
                      />
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => moveTextBlock(index, "up")}
                        disabled={index === 0}
                        aria-label="Move block up"
                        className="p-1 text-[#86868B] hover:text-[#1D1D1F] disabled:opacity-20"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveTextBlock(index, "down")}
                        disabled={index === textBlocks.length - 1}
                        aria-label="Move block down"
                        className="p-1 text-[#86868B] hover:text-[#1D1D1F] disabled:opacity-20"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeTextBlock(index)}
                        disabled={textBlocks.length <= 1}
                        aria-label="Delete block"
                        className="p-1 text-[#FF3B30] hover:bg-red-100 rounded disabled:opacity-20"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <textarea
                    rows={4}
                    value={block.text}
                    onChange={(e) => updateTextBlock(index, "text", e.target.value)}
                    placeholder="Paste the prompt, links, markdown, code, or guide here..."
                    className="w-full p-3 rounded-xl bg-white border border-[#E5E5EA] text-xs font-sans text-[#1D1D1F] focus:border-[#0071E3] outline-none transition-all leading-relaxed"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Live Mobile Preview */}
        <div
          className={`lg:col-span-5 sticky top-24 ${
            previewTab === "editor" ? "hidden lg:block" : "block"
          }`}
        >
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#86868B]">
              Real-Time Mobile Preview
            </span>
            {gateEnabled && (
              <button
                type="button"
                onClick={() => setSimulateLocked(!simulateLocked)}
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-all ${
                  simulateLocked
                    ? "bg-[#0071E3]/10 text-[#0071E3] border-[#0071E3]/20"
                    : "bg-[#34C759]/10 text-[#34C759] border-[#34C759]/20"
                }`}
              >
                {simulateLocked ? "Simulating Locked" : "Simulating Unlocked"}
              </button>
            )}
          </div>

          <PhoneMockup
            urlBarText={`replyto.me/${userProfile?.username || "creator"}/${slug || "preview"}`}
          >
            <div className="p-4 space-y-4 pb-12">
              {/* Post Title */}
              <div>
                <h2 className="text-lg font-bold text-[#1D1D1F] leading-tight">
                  {title || "Untitled Post"}
                </h2>
                <p className="text-[11px] text-[#6E6E73] mt-1">
                  by {userProfile?.displayName || "You"}
                </p>
              </div>

              {/* Linked Reel */}
              {reelUrl && <ReelPreviewCard reelUrl={reelUrl} />}

              {/* Carousel */}
              {images.length > 0 && (
                <Carousel
                  images={images}
                  isLocked={
                    gateEnabled &&
                    simulateLocked &&
                    (gateScope === "images" || gateScope === "both")
                  }
                  gateKeyword={gateKeyword}
                  allowDownload={allowDownload}
                  postTitle={title || "post"}
                />
              )}

              {/* Gate or Text Blocks */}
              {gateEnabled &&
              simulateLocked &&
              (gateScope === "text_blocks" || gateScope === "both") ? (
                <div className="p-4 rounded-2xl bg-white border border-[#E5E5EA] shadow-sm text-center">
                  <div className="w-10 h-10 rounded-xl bg-[#0071E3]/10 text-[#0071E3] flex items-center justify-center mx-auto mb-2">
                    <Lock className="w-5 h-5" />
                  </div>
                  <h4 className="text-xs font-bold text-[#1D1D1F]">
                    Comment to Unlock Content
                  </h4>
                  <p className="text-[11px] text-[#6E6E73] mt-1 mb-3">
                    {gateMessage}
                  </p>
                  <div className="p-2 bg-[#F5F5F7] rounded-xl font-mono text-xs font-bold text-[#0071E3]">
                    Keyword: {gateKeyword}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {textBlocks.map((b, i) => (
                    <TextBlockCard key={b.id} block={b} index={i} />
                  ))}
                </div>
              )}
            </div>
          </PhoneMockup>
        </div>
      </div>
    </div>
  );
};
