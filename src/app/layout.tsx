import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Atkinson_Hyperlegible, Newsreader } from "next/font/google";
import "./globals.css";
import ServiceWorkerRegistration from "./components/ServiceWorkerRegistration";

const atkinson = Atkinson_Hyperlegible({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "700"],
  variable: "--font-atkinson",
  display: "swap",
});

const newsreader = Newsreader({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-newsreader",
  display: "swap",
});

export const metadata: Metadata = {
  title: "DOR101 — Dorchester desk",
  description:
    "Housing, food, transit, and rights for Dorchester. Phone numbers, waitlist status, and calculators. No account. No tracking.",
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
    title: "DOR101 — Dorchester desk",
    description: "Housing, food, transit, and rights for the Dot.",
    locale: "en_US",
  },
  robots: { index: true, follow: true },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icon.svg" }],
  },
  other: {
    "msapplication-TileColor": "#c8102e",
    "format-detection": "telephone=no",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#c8102e" },
    { media: "(prefers-color-scheme: dark)", color: "#121311" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  colorScheme: "light dark",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${atkinson.variable} ${newsreader.variable}`} suppressHydrationWarning>
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
