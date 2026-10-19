import type { NextConfig } from "next";
import socialImage from "./src/lib/social-image.json";
import { readFileSync } from "node:fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const root = path.dirname(fileURLToPath(import.meta.url));

/** Read once: the app version shown in the UI and stamped on the .exe. */
const packageVersion: string = JSON.parse(
  readFileSync(path.join(root, "package.json"), "utf8"),
).version as string;

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
/**
 * The preview environment (and any tunnel used to review a dev build) serves the
 * page from a different origin than the dev server, so the frame-blocking
 * headers and Next's cross-origin dev-resource guard have to be relaxed for
 * `next dev` only. A production build keeps all of them.
 */
const isDev = process.env.NODE_ENV !== "production";

/** Origins allowed to reach `/_next/*` dev resources (HMR, dev fonts). */
const allowedDevOrigins = isDev
  ? ["*.e2b.app", "3000-ialb6dlm5uifjn8e7xths.e2b.app", "*.localhost", "127.0.0.1"]
  : [];

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(self), browsing-history=(), interest-cohort=()",
  },
  // Only when the app is really deployed: a preview iframe is a legitimate
  // parent, and sending SAMEORIGIN from a dev server just shows a blank frame.
  ...(isDev ? [] : [{ key: "X-Frame-Options", value: "SAMEORIGIN" }]),
  // HSTS — 2-year preload, only over HTTPS (Vercel terminates TLS; local dev is http so skip)
  ...(isDev ? [] : [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }]),
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // Leaflet and the map need inline styles for transforms and sizes; the
      // tile layer is the only cross-origin image source allowed.
      // In production we drop 'unsafe-eval' — it's needed only for Next dev HMR.
      isDev ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'" : "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://services.arcgisonline.com https://server.arcgisonline.com https://basemap.nationalmap.gov https://tile.openstreetmap.org https://*.tile.openstreetmap.org https://api.qrserver.com",
      "font-src 'self'",
      // Allow same-origin API fetches + Vercel vitals beacon + Open-Meteo for NowBar
      "connect-src 'self' https://vitals.vercel-insights.com https://*.vercel-scripts.com https://api.open-meteo.com https://air-quality-api.open-meteo.com",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  allowedDevOrigins,
  poweredByHeader: false,
  compress: true,
  turbopack: { root },
  generateBuildId: buildId,
  /**
   * One source of truth for the version string. The About page, the settings
   * page, the footer, /api/health and the packaged `DOR101 Setup <version>.exe`
   * filename all have to agree, and package.json is the only place the desktop
   * build reads it from anyway.
   */
  env: {
    NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION ?? packageVersion,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [360, 420, 640, 768, 1024, 1280, 1536],
    imageSizes: [16, 24, 32, 48, 64, 96, 128, 256],
    // No remote hosts: every image is either bundled in /public or drawn by the
    // OG route. `domains: ['example.com']` sat here for a reason nobody had.
    localPatterns: [{ pathname: "/**", search: "" }],
    minimumCacheTTL: 86400,
    dangerouslyAllowSVG: false,
  },
  // Tree-shake the three libraries that would otherwise ship whole icon and
  // chart families to a phone in Dorchester on a prepaid data plan.
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion", "recharts", "date-fns"],
  },
  // The xlsx reader is only used inside server API routes. Keeping it outside
  // the server bundle stops Turbopack from statically resolving unzipper's
  // lazy, optional `require('@aws-sdk/client-s3')`, which is not installed and
  // would otherwise make the market-data route fail to compile.
  serverExternalPackages: ["read-excel-file"],
  async headers() {
    return [
      { source: "/((?!embed).*)", headers: securityHeaders },
      {
        source: "/embed",
        headers: securityHeaders.filter((h) => h.key !== "X-Frame-Options"),
      },
      // Static tiles and photos are content-hashed by the build or versioned by
      // hand, so they can be held a long time.
      {
        source: "/img/(.*)",
        headers: [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=2592000" }],
      },
      {
        source: "/social/dorchester-101-:hash.jpg",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/icons/(.*)",
        headers: [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=2592000" }],
      },
      {
        source: "/_next/static/(.*)",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
      {
        source: "/manifest.json",
        headers: [{ key: "Cache-Control", value: "public, max-age=3600, stale-while-revalidate=86400" }],
      },
      {
        source: "/api/health",
        headers: [{ key: "Cache-Control", value: "no-store" }],
      },
      {
        source: "/.well-known/security.txt",
        headers: [{ key: "Content-Type", value: "text/plain; charset=utf-8" }],
      },
    ];
  },
  async redirects() {
    return [
      // Old shared-image URLs keep working for cached posts and external links.
      // Metadata itself points directly to the static JPEG (no redirect needed).
      ...["/opengraph-image", "/twitter-image", "/api/og"].map((source) => ({
        source, destination: socialImage.url, permanent: false,
      })),
      { source: "/home", destination: "/", permanent: true },
      { source: "/index.html", destination: "/", permanent: true },
      // Normalize trailing slash to avoid duplicate indexing (Google sees /food and /food/ as distinct)
      { source: "/resources/", destination: "/resources", permanent: true },
      { source: "/food/", destination: "/food", permanent: true },
      { source: "/map/", destination: "/map", permanent: true },
      { source: "/news/", destination: "/news", permanent: true },
      { source: "/about/", destination: "/about", permanent: true },
    ];
  },
};

export default nextConfig;
