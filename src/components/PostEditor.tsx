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

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!slugEdited) {
      setSlug(slugify(val));
    }
  };

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
      await PostService.savePost({
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
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] flex flex-col font-sans selection:bg-[#0071E3]/15 selection:text-[#0071E3]">
      {/* Top action bar */}
      <header className="sticky top-0 z-30 apple-nav">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-13 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="w-7 h-7 rounded-full bg-white border border-black/[0.08] flex items-center justify-center text-[#1D1D1F] hover:bg-[#F5F5F7] transition-colors apple-btn"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </Link>
            <div>
              <h1 className="text-xs sm:text-sm font-semibold text-[#1D1D1F] truncate max-w-[180px] sm:max-w-md">
                {isEditing ? "Edit Resource" : "New Resource"}
              </h1>
              <p className="text-[10px] text-[#86868B] -mt-0.5">
                {gateEnabled ? `🔒 Comment Gate: ${gateKeyword || "KEYWORD"}` : "🔓 Public resource"}
              </p>
            </div>
          </div>

          {/* Mobile Tab Switcher */}
          <div className="flex lg:hidden bg-black/[0.06] p-0.5 rounded-full text-xs font-medium">
            <button
              onClick={() => setPreviewTab("editor")}
              className={`px-3 py-1 rounded-full transition-all ${
                previewTab === "editor"
                  ? "bg-white text-[#1D1D1F] shadow-sm font-semibold"
                  : "text-[#86868B]"
              }`}
            >
              Editor
            </button>
            <button
              onClick={() => setPreviewTab("preview")}
              className={`px-3 py-1 rounded-full transition-all ${
                previewTab === "preview"
                  ? "bg-white text-[#1D1D1F] shadow-sm font-semibold"
                  : "text-[#86868B]"
              }`}
            >
              Preview
            </button>
          </div>

          {/* Save buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSave("draft")}
              disabled={saving}
              className="apple-btn-secondary text-xs py-1.5 px-3"
            >
              Draft
            </button>
            <button
              type="button"
              onClick={() => handleSave("published")}
              disabled={saving}
              className="apple-btn-primary text-xs py-1.5 px-3.5 flex items-center gap-1.5 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              <span>{isEditing ? "Save" : "Publish"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Two-Column Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form Editor */}
        <div
          className={`lg:col-span-7 space-y-5 ${
            previewTab === "preview" ? "hidden lg:block" : "block"
          }`}
        >
          {/* Post Title & Slug */}
          <div className="bg-white rounded-[24px] p-5 sm:p-6 border border-black/[0.06] shadow-sm space-y-4">
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
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F5F7] border border-black/[0.06] text-xs font-medium text-[#1D1D1F] placeholder-[#A1A1A6] focus:bg-white focus:border-[#0071E3] outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1D1D1F] mb-1.5">
                URL Slug
              </label>
              <div className="flex items-center px-3.5 py-2 rounded-xl bg-[#F5F5F7] border border-black/[0.06] text-xs font-mono text-[#86868B]">
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
          <div className="bg-white rounded-[24px] p-5 sm:p-6 border border-black/[0.06] shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <InstagramIcon className="w-3.5 h-3.5 text-[#E1306C]" />
                <label className="text-xs font-semibold text-[#1D1D1F]">
                  Linked Instagram Reel URL
                </label>
              </div>
              {reelUrl && (
                <span
                  className={`text-[10px] font-semibold px-2 py-0.2 rounded-full ${
                    reelCheck.isValid
                      ? "bg-[#34C759]/10 text-[#34C759]"
                      : "bg-[#FF3B30]/10 text-[#FF3B30]"
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
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F5F7] border border-black/[0.06] text-xs font-mono text-[#1D1D1F] placeholder-[#A1A1A6] focus:bg-white focus:border-[#0071E3] outline-none transition-all"
            />

            {reelUrl && reelCheck.isValid && (
              <div className="pt-2">
                <p className="text-[11px] text-[#86868B] mb-2 font-medium">Reel Card Preview:</p>
                <ReelPreviewCard
                  reelUrl={reelUrl}
                  creatorName={userProfile?.displayName || "Creator"}
                />
              </div>
            )}
          </div>

          {/* Comment Gate Settings Card */}
          <div className="bg-white rounded-[24px] p-5 sm:p-6 border border-black/[0.06] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                    gateEnabled
                      ? "bg-[#0071E3] text-white"
                      : "bg-[#F5F5F7] text-[#86868B] border border-black/[0.06]"
                  }`}
                >
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-semibold text-[#1D1D1F]">
                    Comment to Unlock (Comment Gate)
                  </h3>
                  <p className="text-[11px] text-[#86868B]">
                    Require viewers to comment a keyword on your Reel
                  </p>
                </div>
              </div>

              {/* iOS style toggle */}
              <button
                type="button"
                onClick={() => setGateEnabled(!gateEnabled)}
                className={`w-11 h-6 rounded-full p-0.5 transition-colors ${
                  gateEnabled ? "bg-[#34C759]" : "bg-[#E5E5EA]"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform ${
                    gateEnabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {gateEnabled && (
              <div className="space-y-4 pt-4 border-t border-black/[0.06] animate-in fade-in duration-200">
                <div>
                  <label className="block text-xs font-semibold text-[#1D1D1F] mb-1">
                    Trigger Keyword
                  </label>
                  <input
                    type="text"
                    required
                    value={gateKeyword}
                    onChange={(e) => setGateKeyword(e.target.value.toUpperCase())}
                    placeholder="e.g. PROMPT, CAFE, WORKFLOW"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F5F7] border border-black/[0.06] text-xs font-mono font-bold text-[#0071E3] uppercase tracking-wider focus:bg-white focus:border-[#0071E3] outline-none"
                  />
                  <p className="text-[10px] text-[#86868B] mt-1">
                    Viewers must comment this word on your Reel to unlock the resource.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1D1D1F] mb-1">
                    Lock Message
                  </label>
                  <textarea
                    rows={2}
                    value={gateMessage}
                    onChange={(e) => setGateMessage(e.target.value)}
                    placeholder="e.g. Comment PROMPT on my reel to unlock the full list..."
                    className="w-full px-3.5 py-2 rounded-xl bg-[#F5F5F7] border border-black/[0.06] text-xs text-[#1D1D1F] focus:bg-white focus:border-[#0071E3] outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1D1D1F] mb-1.5">
                    Gate Scope
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(
                      [
                        { id: "text_blocks", label: "Text Blocks" },
                        { id: "images", label: "Pictures" },
                        { id: "both", label: "Everything" },
                      ] as const
                    ).map((scope) => (
                      <button
                        key={scope.id}
                        type="button"
                        onClick={() => setGateScope(scope.id)}
                        className={`py-1.5 px-2.5 rounded-xl text-xs font-medium border text-center transition-all ${
                          gateScope === scope.id
                            ? "bg-[#0071E3] text-white border-[#0071E3] shadow-sm"
                            : "bg-[#F5F5F7] text-[#1D1D1F] border-black/[0.06] hover:bg-[#E8E8ED]"
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
          <div className="bg-white rounded-[24px] p-5 sm:p-6 border border-black/[0.06] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs sm:text-sm font-semibold text-[#1D1D1F]">
                  Post Media (Carousel)
                </h3>
                <p className="text-[11px] text-[#86868B]">
                  Images viewers can swipe through
                </p>
              </div>
              <label className="apple-btn-secondary text-xs py-1 px-3 cursor-pointer">
                <Upload className="w-3.5 h-3.5 text-[#86868B]" />
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

            {images.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {images.map((img, i) => (
                  <div
                    key={i}
                    className="relative group aspect-square rounded-xl overflow-hidden bg-[#F5F5F7] border border-black/[0.06]"
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
                          <ChevronUp className="w-3 h-3 -rotate-90" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="p-1 rounded bg-[#FF3B30] text-white hover:bg-red-600"
                        title="Delete"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                      {i < images.length - 1 && (
                        <button
                          type="button"
                          onClick={() => moveImage(i, "right")}
                          className="p-1 rounded bg-white text-black hover:bg-zinc-100"
                          title="Move right"
                        >
                          <ChevronDown className="w-3 h-3 -rotate-90" />
                        </button>
                      )}
                    </div>
                    {i === 0 && (
                      <span className="absolute top-1.5 left-1.5 px-1.5 py-0.2 rounded bg-black/60 text-white text-[9px] font-medium backdrop-blur-sm">
                        Cover
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <label className="border border-dashed border-black/[0.12] rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#0071E3] transition-colors">
                <ImageIcon className="w-6 h-6 text-[#86868B] mb-1.5" />
                <p className="text-xs font-semibold text-[#1D1D1F]">
                  Upload carousel photos
                </p>
                <p className="text-[10px] text-[#86868B] mt-0.5">
                  JPG, PNG, WEBP supported
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
          </div>

          {/* Copyable Text Blocks Section */}
          <div className="bg-white rounded-[24px] p-5 sm:p-6 border border-black/[0.06] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs sm:text-sm font-semibold text-[#1D1D1F]">
                  Copyable Text Blocks
                </h3>
                <p className="text-[11px] text-[#86868B]">
                  Dedicated one-tap &quot;Copy&quot; buttons for visitors
                </p>
              </div>

              <button
                type="button"
                onClick={addTextBlock}
                className="apple-btn-secondary text-xs py-1 px-3"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Block</span>
              </button>
            </div>

            <div className="space-y-3">
              {textBlocks.map((block, index) => (
                <div
                  key={block.id}
                  className="p-3.5 rounded-xl bg-[#F5F5F7] border border-black/[0.06] space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1 mr-2">
                      <span className="w-4.5 h-4.5 rounded-full bg-[#1D1D1F] text-white text-[9px] font-semibold flex items-center justify-center">
                        {index + 1}
                      </span>
                      <input
                        type="text"
                        value={block.title || ""}
                        onChange={(e) => updateTextBlock(index, "title", e.target.value)}
                        placeholder={`Block #${index + 1} Title`}
                        className="flex-1 bg-transparent text-xs font-semibold text-[#1D1D1F] outline-none border-b border-transparent focus:border-[#0071E3]"
                      />
                    </div>

                    <div className="flex items-center gap-0.5">
                      <button
                        type="button"
                        onClick={() => moveTextBlock(index, "up")}
                        disabled={index === 0}
                        aria-label="Move block up"
                        className="p-1 text-[#86868B] hover:text-[#1D1D1F] disabled:opacity-20"
                      >
                        <ChevronUp className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveTextBlock(index, "down")}
                        disabled={index === textBlocks.length - 1}
                        aria-label="Move block down"
                        className="p-1 text-[#86868B] hover:text-[#1D1D1F] disabled:opacity-20"
                      >
                        <ChevronDown className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeTextBlock(index)}
                        disabled={textBlocks.length <= 1}
                        aria-label="Delete block"
                        className="p-1 text-[#86868B] hover:text-[#FF3B30] disabled:opacity-20"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <textarea
                    rows={3}
                    value={block.text}
                    onChange={(e) => updateTextBlock(index, "text", e.target.value)}
                    placeholder="Paste the prompt, links, markdown, code, or guide here..."
                    className="w-full p-2.5 rounded-lg bg-white border border-black/[0.06] text-xs font-mono text-[#1D1D1F] focus:border-[#0071E3] outline-none transition-all leading-relaxed"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Live Mobile Preview */}
        <div
          className={`lg:col-span-5 sticky top-20 ${
            previewTab === "editor" ? "hidden lg:block" : "block"
          }`}
        >
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#86868B]">
              Real-Time Mobile Preview
            </span>
            {gateEnabled && (
              <button
                type="button"
                onClick={() => setSimulateLocked(!simulateLocked)}
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border transition-all ${
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
              <div>
                <h2 className="text-base font-semibold text-[#1D1D1F] leading-tight">
                  {title || "Untitled Resource"}
                </h2>
                <p className="text-[10px] text-[#86868B] mt-0.5">
                  by {userProfile?.displayName || "You"}
                </p>
              </div>

              {reelUrl && <ReelPreviewCard reelUrl={reelUrl} />}

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

              {gateEnabled &&
              simulateLocked &&
              (gateScope === "text_blocks" || gateScope === "both") ? (
                <div className="p-4 rounded-2xl bg-white border border-black/[0.06] shadow-sm text-center">
                  <div className="w-8 h-8 rounded-xl bg-[#0071E3]/10 text-[#0071E3] flex items-center justify-center mx-auto mb-2">
                    <Lock className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-semibold text-[#1D1D1F]">
                    Comment to Unlock Content
                  </h4>
                  <p className="text-[10px] text-[#86868B] mt-1 mb-2">
                    {gateMessage}
                  </p>
                  <div className="p-1.5 bg-[#F5F5F7] rounded-lg font-mono text-[11px] font-bold text-[#0071E3]">
                    Keyword: {gateKeyword}
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5">
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
