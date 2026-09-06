import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import ServiceWorkerRegistration from "./components/ServiceWorkerRegistration";

/**
 * System font stack — SF Pro on Apple devices, Inter/Segoe/Roboto fallbacks
 * elsewhere. No webfont download: faster first paint, and one less
 * third-party request for a privacy-first app.
 */

export const metadata: Metadata = {
  title: {
    default: "DOR101 — Dorchester resources, live",
    template: "%s · DOR101",
  },
  description:
    "Housing, food, transit, and rights for Dorchester, Boston. Real numbers with sources and as-of dates. No account. No tracking. Works offline.",
  keywords: [
    "Dorchester",
    "Boston",
    "affordable housing",
    "SNAP",
    "MBTA",
    "Section 8",
    "BHA",
    "BPDA",
    "Fields Corner",
    "Codman Square",
    "Ashmont",
  ],
  authors: [{ name: "DOR101 Community Project" }],
  applicationName: "DOR101",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "DOR101",
  },
  openGraph: {
    type: "website",
    siteName: "DOR101",
    title: "DOR101 — Dorchester resources, live",
    description:
      "Housing, food, transit, and rights for the Dot. Sourced, dated, and free.",
    locale: "en_US",
  },
  robots: { index: true, follow: true },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png" }],
  },
  other: {
    "format-detection": "telephone=no",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
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
      <body className="antialiased">
        <a href="#main" className="skip-link no-print">
          Skip to content
        </a>
        {children}
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
