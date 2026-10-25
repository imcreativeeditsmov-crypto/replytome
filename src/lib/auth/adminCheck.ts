/**
 * Centralized Platform Super Admin Authorization Rules
 * 
 * Only the platform owner (@aibyshivai) is granted Super Admin privileges.
 * All other users are regular Creators with isolated dashboards and zero admin access.
 */

export const ADMIN_USERNAMES = ["creativeedits", "imcreativeedits", "creativeeditsmov"];
export const ADMIN_UIDS = ["creativeedits-owner-uid"];
export const ADMIN_EMAIL_PATTERNS = ["imcreativeedits", "creativeedits"];

export const DEFAULT_ADMIN_PASSCODE = "creative2026";
export const ADMIN_PASSCODE_STORAGE_KEY = "replyto_admin_passcode_hash";
export const ADMIN_SESSION_STORAGE_KEY = "replyto_admin_session_unlocked";

export interface UserAuthCheck {
  uid?: string | null;
  username?: string | null;
  email?: string | null;
}

/**
 * Validates whether a user is the platform admin by profile metadata
 */
export function isPlatformAdmin(user?: UserAuthCheck | null): boolean {
  if (!user) return false;

  // Check username
  if (user.username) {
    const cleanUsername = user.username.toLowerCase().trim().replace(/^@/, "");
    if (ADMIN_USERNAMES.includes(cleanUsername)) {
      return true;
    }
  }

  // Check UID
  if (user.uid && ADMIN_UIDS.includes(user.uid)) {
    return true;
  }

  // Check email
  if (user.email) {
    const emailLower = user.email.toLowerCase().trim();
    if (ADMIN_EMAIL_PATTERNS.some((pattern) => emailLower.includes(pattern))) {
      return true;
    }
  }

  return false;
}

/**
 * Retrieve current configured admin passcode
 */
export function getAdminPasscode(): string {
  if (typeof window === "undefined") return DEFAULT_ADMIN_PASSCODE;
  try {
    return localStorage.getItem(ADMIN_PASSCODE_STORAGE_KEY) || DEFAULT_ADMIN_PASSCODE;
  } catch {
    return DEFAULT_ADMIN_PASSCODE;
  }
}

/**
 * Save new admin passcode
 */
export function setAdminPasscode(newCode: string): boolean {
  if (typeof window === "undefined" || !newCode.trim()) return false;
  try {
    localStorage.setItem(ADMIN_PASSCODE_STORAGE_KEY, newCode.trim());
    return true;
  } catch {
    return false;
  }
}

/**
 * Verify input passcode against current configured passcode or default
 */
export function verifyAdminPasscode(inputCode: string): boolean {
  if (!inputCode) return false;
  const current = getAdminPasscode();
  const trimmed = inputCode.trim();
  return trimmed === current || trimmed === DEFAULT_ADMIN_PASSCODE;
}

/**
 * Check if the admin passcode has been unlocked in the current session
 */
export function isAdminSessionUnlocked(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(ADMIN_SESSION_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

/**
 * Set the admin session unlocked state
 */
export function setAdminSessionUnlocked(unlocked: boolean): void {
  if (typeof window === "undefined") return;
  try {
    if (unlocked) {
      sessionStorage.setItem(ADMIN_SESSION_STORAGE_KEY, "true");
    } else {
      sessionStorage.removeItem(ADMIN_SESSION_STORAGE_KEY);
    }
  } catch {}
}

