import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
// Self-hosted fonts (@fontsource) — no runtime Google Fonts dependency.
import "@fontsource/barlow-condensed/500.css";
import "@fontsource/barlow-condensed/600.css";
import "@fontsource/barlow-condensed/700.css";
import "@fontsource/barlow-condensed/800.css";
import "@fontsource/ibm-plex-sans/400.css";
import "@fontsource/ibm-plex-sans/500.css";
import "@fontsource/ibm-plex-sans/600.css";
import "@fontsource/ibm-plex-sans/700.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "@fontsource/ibm-plex-mono/600.css";
import "./globals.css";
import ServiceWorkerRegistration from "./components/ServiceWorkerRegistration";

export const metadata: Metadata = {
  title: "DOR101 · Dorchester, Boston — neighborhood resources",
  description:
    "Income-restricted housing, food programs, rent help, transit, and tenant rights in Dorchester, Boston. Real phone numbers, dated sources, nine languages, no account, no tracking.",
  keywords: [
    "Dorchester",
    "Boston",
    "housing",
    "SNAP",
    "MBTA",
    "Section 8",
    "BHA",
    "Fields Corner",
    "Codman Square",
    "Ashmont",
    "tenant rights",
    "food pantry",
    "RAFT",
    "Fair Market Rent",
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
    title: "DOR101 · Dorchester, Boston",
    description: "Housing, food, transit, and rights for Dorchester — one neighborhood, every program that touches it.",
    locale: "en_US",
  },
  robots: { index: true, follow: true },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icon.svg" }],
  },
  other: {
    "msapplication-TileColor": "#111a2c",
    "format-detection": "telephone=no",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#1748e2" },
    { media: "(prefers-color-scheme: dark)", color: "#0d1420" },
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
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        {children}
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
