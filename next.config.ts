import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const root = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  turbopack: {
    root,
  },
  // Disable caching to ensure latest version is always shown
  httpAgentOptions: {
    keepAlive: false,
  },
  // Ensure fresh builds are used
  poweredByHeader: false,
  // Compress responses
  compress: true,
  // Generate unique build ID for cache busting
  generateBuildId: () => `dor101-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
};

export default nextConfig;
