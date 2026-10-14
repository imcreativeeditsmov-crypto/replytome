import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const RESERVED_USERNAMES = new Set([
  "dashboard",
  "login",
  "signup",
  "register",
  "api",
  "admin",
  "new",
  "edit",
  "onboarding",
  "auth",
  "settings",
  "user",
  "users",
  "post",
  "posts",
  "explore",
  "terms",
  "privacy",
  "help",
  "support",
  "about",
  "contact",
  "pricing",
  "app",
  "replytome",
  "replyto",
]);

/**
 * Validates username format:
 * - 3 to 30 characters
 * - lowercase letters, numbers, underscores, and dots only
 * - cannot start or end with a dot or underscore
 * - cannot have consecutive dots
 * - cannot be a reserved route name
 */
export function validateUsername(username: string): { isValid: boolean; error?: string } {
  const normalized = username.trim().toLowerCase();

  if (!normalized) {
    return { isValid: false, error: "Username is required" };
  }

  if (normalized.length < 3) {
    return { isValid: false, error: "Username must be at least 3 characters" };
  }

  if (normalized.length > 30) {
    return { isValid: false, error: "Username must be at most 30 characters" };
  }

  const validRegex = /^[a-z0-9._]+$/;
  if (!validRegex.test(normalized)) {
    return {
      isValid: false,
      error: "Username can only contain lowercase letters, numbers, dots, and underscores",
    };
  }

  if (normalized.startsWith(".") || normalized.endsWith(".") || normalized.startsWith("_") || normalized.endsWith("_")) {
    return {
      isValid: false,
      error: "Username cannot start or end with a dot or underscore",
    };
  }

  if (normalized.includes("..")) {
    return {
      isValid: false,
      error: "Username cannot contain consecutive dots",
    };
  }

  if (RESERVED_USERNAMES.has(normalized)) {
    return {
      isValid: false,
      error: `"${normalized}" is reserved and cannot be used`,
    };
  }

  return { isValid: true };
}

/**
 * Creates a clean URL slug from a title
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w-]+/g, "") // Remove all non-word chars
    .replace(/--+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
}

/**
 * Parses and validates an Instagram Reel or Post URL
 */
export function parseInstagramUrl(url: string): {
  isValid: boolean;
  type?: "reel" | "post";
  id?: string;
  cleanUrl?: string;
} {
  if (!url) return { isValid: false };

  const trimmed = url.trim();
  // Regex to match https://www.instagram.com/reel/C123abc/ or /p/C123abc/
  const regex = /(?:instagram\.com\/(?:reel|p|tv)\/([a-zA-Z0-9_-]+))/;
  const match = trimmed.match(regex);

  if (match && match[1]) {
    const isReel = trimmed.includes("/reel/");
    const id = match[1];
    return {
      isValid: true,
      type: isReel ? "reel" : "post",
      id,
      cleanUrl: `https://www.instagram.com/${isReel ? "reel" : "p"}/${id}/`,
    };
  }

  return { isValid: false };
}

/**
 * Formats view/unlock counts cleanly (e.g., 1.2k, 45k)
 */
export function formatCount(count: number): string {
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (count >= 1000) {
    return (count / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  }
  return count.toString();
}

/**
 * Compresses an image file on a canvas to a compact data URL (under 35 KB)
 * Prevents Firestore document limit errors (1MB) and localStorage quota overflow.
 */
export function compressAvatar(file: File, maxSize = 256, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      resolve("");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > maxSize) {
              height = Math.round((height * maxSize) / width);
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width = Math.round((width * maxSize) / height);
              height = maxSize;
            }
          }
          canvas.width = Math.max(width, 1);
          canvas.height = Math.max(height, 1);
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(e.target?.result as string);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL("image/jpeg", quality);
          resolve(compressed);
        } catch {
          resolve(e.target?.result as string);
        }
      };
      img.onerror = () => resolve(e.target?.result as string);
      img.src = e.target?.result as string;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}
