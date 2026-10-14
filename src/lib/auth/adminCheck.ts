/**
 * Centralized Platform Super Admin Authorization Rules
 * 
 * Only the platform owner (@aibyshivai) is granted Super Admin privileges.
 * All other users are regular Creators with isolated dashboards and zero admin access.
 */

export const ADMIN_USERNAMES = ["aibyshivai"];
export const ADMIN_UIDS = ["shivai-creator-uid"];
export const ADMIN_EMAIL_PATTERNS = ["aibyshivai", "imcreativeedits"];

export interface UserAuthCheck {
  uid?: string | null;
  username?: string | null;
  email?: string | null;
}

/**
 * Validates whether a user is the legitimate Platform Super Admin.
 * Prevents unauthorized users from escalating privileges.
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
