import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

// Self-hosted faces via Fontsource. Third-party font CDNs are a tracking
// vector and a single point of failure, and this app is expected to work on a
// library machine with no outbound access, so every byte ships from here.
import "@fontsource-variable/fraunces";
import "@fontsource/public-sans/400.css";
import "@fontsource/public-sans/500.css";
import "@fontsource/public-sans/600.css";
import "@fontsource/public-sans/700.css";
// Atkinson Hyperlegible has no Vietnamese subset, so the stack behind it does.
import "@fontsource/atkinson-hyperlegible/400.css";
import "@fontsource/atkinson-hyperlegible/700.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "@fontsource/noto-sans-arabic/400.css";
import "@fontsource/noto-sans-arabic/700.css";

import ServiceWorkerRegistration from "./components/ServiceWorkerRegistration";
import { DorchesterProviders } from "@/components/providers/DorchesterProviders";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "DOR101 — Dorchester 101",
    template: "%s · DOR101",
  },
  description:
    "Your neighborhood. Your rights. Your future. Free housing, food, and community resources for Dorchester residents.",
  keywords: [
    "Dorchester", "Boston", "housing", "affordable housing", "food assistance",
    "community resources", "MBTA", "Section 8", "BHA",
  ],
  authors: [{ name: "DOR101 Community Project" }],
  creator: "DOR101",
  publisher: "DOR101",
  applicationName: "DOR101",
  category: "Community Resources",
  alternates: { canonical: "/" },
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "DOR101" },
  openGraph: {
    type: "website",
    siteName: "DOR101 — Dorchester 101",
    title: "DOR101 — Dorchester 101",
    description: "Free housing, food, and community resources for Dorchester residents, in nine languages.",
    url: "/",
    locale: "en_US",
    alternateLocale: ["es_MX", "fr_HT", "pt_BR", "vi_VN", "zh_CN", "ar"],
    images: [{ url: "/api/og", width: 1200, height: 630, alt: "DOR101 — Dorchester resource map and service directory" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "DOR101 — Dorchester 101",
    description: "Free housing, food, and community resources for Dorchester residents.",
    images: ["/api/og"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    other: [{ url: "/icons/maskable-512.png", rel: "maskable-icon", sizes: "512x512", type: "image/png" }],
  },
  other: {
    "msapplication-TileColor": "#14304F",
    "msapplication-config": "none",
    "format-detection": "telephone=no",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#14304F" },
    { media: "(prefers-color-scheme: dark)", color: "#0F1720" },
  ],
  width: "device-width",
  initialScale: 1,
  // Pinch zoom is never disabled: maximumScale=5 keeps it generous while
  // blocking the accidental double-tap zoom that breaks map interactions.
  maximumScale: 5,
  userScalable: true,
  colorScheme: "light dark",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="DOR101" />
        {/* Only same-origin data endpoints are prefetched; no third party is contacted. */}
        <link rel="prefetch" href="/api/news" />
        <link rel="prefetch" href="/api/notifications" />
        <link rel="preload" href="/img/dorchester-bay-sunset.jpg" as="image" />
        <noscript>
          <style>{`.dor101-js-only { display: none !important; } .dor101-nojs { display: block !important; }`}</style>
        </noscript>
      </head>
      <body className="antialiased">
        {/*
          The photographic backdrop is its own fixed, pointer-transparent layer.
          It must never be the <body>: a fixed body with `pointer-events: none`
          pins the whole document to the viewport (no scrolling) and swallows
          every click in the page.
        */}
        <div className="dor101-backdrop" aria-hidden="true" />
        <DorchesterProviders>{children}</DorchesterProviders>
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
