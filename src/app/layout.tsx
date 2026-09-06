import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import ServiceWorkerRegistration from "./components/ServiceWorkerRegistration";

export const metadata: Metadata = {
  title: "DOR101 — Dorchester 101",
  description: "Your neighborhood. Your rights. Your future. Free housing, food, and community resources for Dorchester residents.",
  keywords: ["Dorchester", "Boston", "housing", "affordable housing", "food assistance", "community resources", "MBTA", "Section 8", "BHA"],
  authors: [{ name: "DOR101 Community Project" }],
  creator: "DOR101",
  publisher: "DOR101",
  applicationName: "DOR101",
  category: "Community Resources",

  // PWA manifest
  manifest: "/manifest.json",

  // Apple/iOS PWA support
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "DOR101",
  },

  // Open Graph (for sharing)
  openGraph: {
    type: "website",
    siteName: "DOR101 — Dorchester 101",
    title: "DOR101 — Dorchester 101",
    description: "Free housing, food, and community resources for Dorchester residents.",
    locale: "en_US",
  },

  // Robots
  robots: {
    index: true,
    follow: true,
  },

  // Icons
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/icon.svg" },
    ],
  },

  // Other meta
  other: {
    // Windows tile color
    "msapplication-TileColor": "#1B3A6B",
    "msapplication-config": "none",
    // Disable phone number detection (we handle our own tel: links)
    "format-detection": "telephone=no",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#1B3A6B" },
    { media: "(prefers-color-scheme: dark)", color: "#111110" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  colorScheme: "light dark",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* Windows-specific PWA integrations */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="DOR101" />

        {/* Prefetch API routes for faster first load */}
        <link rel="prefetch" href="/api/news" />
        <link rel="prefetch" href="/api/notifications" />
      </head>
      <body className="antialiased">
        {children}
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
