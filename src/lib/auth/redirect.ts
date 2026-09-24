export const DEFAULT_AFTER_CONFIRM_PATH = "/onboarding";

/**
 * Returns `next` only if it is a same-site relative path (a single leading
 * "/"). Anything else (full URLs, protocol-relative "//host", "/\host", which
 * browsers treat like "//host", control characters, or missing values) falls
 * back to /onboarding. This stops the confirm link being used as an open
 * redirect.
 */
export function safeNextPath(next: string | null | undefined): string {
  if (typeof next !== "string") return DEFAULT_AFTER_CONFIRM_PATH;
  if (!next.startsWith("/")) return DEFAULT_AFTER_CONFIRM_PATH;
  if (next.startsWith("//")) return DEFAULT_AFTER_CONFIRM_PATH;
  if (next.includes("\\")) return DEFAULT_AFTER_CONFIRM_PATH;
  if (/[\u0000-\u001f\u007f]/.test(next)) return DEFAULT_AFTER_CONFIRM_PATH;
  return next;
}
