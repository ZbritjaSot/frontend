import type { NextConfig } from "next";

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
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.r2.dev",
      },
    ],
  },
  distDir: process.env.E2E_NEXT === "1" ? ".next-e2e" : ".next",
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
