// Only these emails may open /admin. Keep in sync with the database allowlist.
export const ADMIN_EMAILS = ["ritesh.bhopal@gmail.com"] as const;

export function isAllowlistedAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.some((e) => e.toLowerCase() === email.toLowerCase());
}
