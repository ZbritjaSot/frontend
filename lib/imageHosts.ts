/**
 * Hostnames allowed for next/image remotePatterns.
 * Override / extend with NEXT_PUBLIC_IMAGE_HOSTS (comma-separated).
 */
export function imageRemoteHostnames(): string[] {
  const fromEnv = (process.env.NEXT_PUBLIC_IMAGE_HOSTS ?? "")
    .split(",")
    .map((host) => host.trim())
    .filter(Boolean);

  return Array.from(new Set(["**.r2.dev", ...fromEnv]));
}
