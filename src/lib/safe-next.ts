const FALLBACK = "/profile";

/**
 * Where to send someone after sign-in, limited to paths on this site.
 * Rejects anything a browser could read as another host: "//evil.com", "/\evil.com",
 * backslashes or control characters anywhere, and absolute URLs.
 */
export function safeNext(value: unknown, fallback = FALLBACK): string {
  if (typeof value !== "string" || value.length > 512) return fallback;
  if (!value.startsWith("/") || value.startsWith("//")) return fallback;
  if (/[\\\u0000-\u001f\u007f]/.test(value)) return fallback;
  return value;
}
