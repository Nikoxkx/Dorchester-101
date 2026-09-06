import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const root = path.dirname(fileURLToPath(import.meta.url));

/**
 * Build id.
 *
 * A random id per build — the previous value here — makes every deploy look like
 * a new version to every cache and breaks reproducible builds, which is the one
 * property an open-source community project can actually guarantee. The commit
 * sha is used instead, falling back to a fixed string when git is absent (a
 * source zip, or the packaged Electron build).
 */
function buildId(): string {
  try {
    return execSync("git rev-parse --short HEAD", { cwd: root, stdio: ["ignore", "pipe", "ignore"] })
      .toString()
      .trim();
  } catch {
    return process.env.NEXT_PUBLIC_BUILD_ID ?? "dev";
  }
}

/**
 * Security headers. Applied for the web build; the Electron window loads
 * localhost and ignores them, which is why none of them assume HTTPS.
 *
 * No third-party script origins are whitelisted: the app ships its own fonts and
 * has no analytics, so the strictest CSP the UI tolerates is the honest default.
 */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(self), browsing-history=(), interest-cohort=()",
  },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // Leaflet and the map need inline styles for transforms and sizes; the
      // tile layer is the only cross-origin image source allowed.
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://server.arcgisonline.com https://basemap.nationalmap.gov https://tile.openstreetmap.org",
      "font-src 'self'",
      "connect-src 'self'",
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  turbopack: { root },
  generateBuildId: buildId,
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [360, 420, 640, 768, 1024, 1280, 1536],
    imageSizes: [16, 24, 32, 48, 64, 96, 128, 256],
    // No remote hosts: every image is either bundled in /public or drawn by the
    // OG route. `domains: ['example.com']` sat here for a reason nobody had.
    localPatterns: [{ pathname: "/**", search: "" }],
  },
  // Tree-shake the three libraries that would otherwise ship whole icon and
  // chart families to a phone in Dorchester on a prepaid data plan.
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion", "recharts", "date-fns"],
  },
  async headers() {
    return [
      { source: "/(.*)", headers: securityHeaders },
      // Static tiles and photos are content-hashed by the build or versioned by
      // hand, so they can be held a long time.
      {
        source: "/img/(.*)",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }],
      },
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
    ];
  },
};

export default nextConfig;
