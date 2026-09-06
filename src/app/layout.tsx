import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
// Self-hosted fonts (@fontsource) — no runtime Google Fonts dependency.
import "@fontsource/archivo/400.css";
import "@fontsource/archivo/500.css";
import "@fontsource/archivo/600.css";
import "@fontsource/archivo/700.css";
import "@fontsource/archivo/800.css";
import "@fontsource/archivo/900.css";
import "@fontsource/atkinson-hyperlegible/400.css";
import "@fontsource/atkinson-hyperlegible/700.css";
import "./globals.css";
import ServiceWorkerRegistration from "./components/ServiceWorkerRegistration";

export const metadata: Metadata = {
  title: "DOR101 — The Dot desk",
  description:
    "The free neighborhood desk for Dorchester, Boston: income-restricted housing, food pantries, rent help, transit, and tenant rights. Real phone numbers, dated sources, no account, no tracking.",
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
    title: "DOR101 — The Dot desk",
    description: "Housing, food, transit, and rights for Dorchester — the Dot, decoded.",
    locale: "en_US",
  },
  robots: { index: true, follow: true },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icon.svg" }],
  },
  other: {
    "msapplication-TileColor": "#0f2820",
    "format-detection": "telephone=no",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#d7261e" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1713" },
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
