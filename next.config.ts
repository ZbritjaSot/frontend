import type { NextConfig } from "next";
import { imageRemoteHostnames } from "./lib/imageHosts";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const nextConfig: NextConfig = {
  // Coming Soon (`coming-soon` branch) stays on `output: "export"` for Cloudflare Pages.
  // Feature app needs a Node host for SSR + Sanctum cookie auth — no static export here.
  poweredByHeader: false,
  images: {
    // Photos are already resized WebP on the public bucket. `unoptimized` skips a second pass.
    // Add custom CDN hosts via NEXT_PUBLIC_IMAGE_HOSTS (comma-separated hostnames).
    remotePatterns: imageRemoteHostnames().map((hostname) => ({
      protocol: "https" as const,
      hostname,
    })),
  },
  // Keep production and Playwright builds out of the folder `npm run dev` uses.
  distDir:
    process.env.NEXT_DIST_DIR ||
    (process.env.E2E_NEXT === "1" ? ".next-e2e" : ".next"),
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
