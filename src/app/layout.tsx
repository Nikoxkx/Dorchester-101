import { socialMetadata, SOCIAL_DESCRIPTION } from "@/lib/social";
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
import { AUTHOR_NAME, AUTHOR_URL, SITE_URL } from "@/lib/site";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    // The name a resident types into a search bar is "dorchester 101", so
    // that phrase leads, followed by a short description of what is inside.
    default: "Dorchester 101 — Housing, food & everyday help",
    template: "%s · Dorchester 101",
  },
  description: SOCIAL_DESCRIPTION,
  keywords: [
    "Dorchester 101", "DOR101", "Dorchester", "Dorchester Boston", "Boston",
    "affordable housing Dorchester", "free food Dorchester", "food pantry Dorchester",
    "MBTA Dorchester", "Red Line Dorchester", "live bus tracker Boston",
    "Dorchester Boston weather", "Boston weather warnings",
    "free winter coats Boston", "free winter clothing Dorchester",
    "community resources", "Section 8", "BHA", "tenant rights Massachusetts",
  ],
  authors: [{ name: AUTHOR_NAME, url: AUTHOR_URL }],
  creator: "DOR101",
  publisher: "DOR101",
  applicationName: "DOR101",
  category: "Community Resources",
  alternates: { canonical: "/" },
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "DOR101" },
  ...socialMetadata(),
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-256.png", sizes: "256x256", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    other: [{ url: "/icons/maskable-512.png", rel: "maskable-icon", sizes: "512x512", type: "image/png" }],
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
    other: {
      ...(process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION
        ? { "msvalidate.01": process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION }
        : {}),
    },
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
  viewportFit: "cover",
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
        {/* Address-bar search: browsers register Dorchester 101 as a search engine. */}
        <link rel="search" type="application/opensearchdescription+xml" title="Dorchester 101" href="/opensearch.xml" />
        <link rel="prefetch" href="/api/news" />
        <link rel="prefetch" href="/api/notifications" />
        {/* The storm-warning banner renders on every page; warming its feed
            means a live warning is already on screen when the page settles. */}
        <link rel="prefetch" href="/api/weather" />
        <link rel="preload" href="/img/dorchester-bay-sunset.jpg" as="image" />
        <noscript>
          <style>{`.dor101-js-only { display: none !important; } .dor101-nojs { display: block !important; }`}</style>
        </noscript>
      </head>
      <body className="antialiased">
        {/* Structured data for search engines: a WebSite (with sitelinks search) and
            the Organization behind it. Kept in the root layout so every page carries it. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                name: "Dorchester 101",
                alternateName: ["DOR101", "Dorchester101", "DOR 101", "Dorchester 101 Boston"],
                url: SITE_URL,
                description: "Free housing, food, transit and legal help for Dorchester residents, in nine languages.",
                inLanguage: ["en", "es", "ht", "pt", "vi", "zh", "ar", "so", "kea"],
                potentialAction: {
                  "@type": "SearchAction",
                  target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/resources?q={search_term_string}` },
                  "query-input": "required name=search_term_string",
                },
                publisher: { "@id": `${SITE_URL}/#org` },
              },
              {
                "@context": "https://schema.org",
                "@type": "Organization",
                "@id": `${SITE_URL}/#org`,
                name: AUTHOR_NAME,
                url: SITE_URL,
                founder: { "@type": "Person", name: AUTHOR_NAME, url: AUTHOR_URL },
                logo: `${SITE_URL}/icons/logo-1024.png`,
                image: `${SITE_URL}/opengraph-image`,
                sameAs: ["https://github.com/Nikoxkx/Dorchester-101"],
                areaServed: { "@type": "Place", name: "Dorchester, Boston, Massachusetts" },
              },
              {
                "@context": "https://schema.org",
                "@type": "WebApplication",
                name: "Dorchester 101",
                alternateName: "DOR101",
                url: SITE_URL,
                applicationCategory: "UtilitiesApplication",
                operatingSystem: "Web, Android, iOS, Windows",
                offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
                inLanguage: ["en", "es", "ht", "pt", "vi", "zh", "ar", "so", "kea"],
                featureList: [
                  "Affordable housing and tenant rights for Dorchester, Boston",
                  "Food pantries and free meals with live open-now status",
                  "Live MBTA map with real-time buses, trains and service alerts",
                  "Live Boston weather, storm warnings and what-to-wear advice",
                  "Free winter coats and clothing directory",
                ].join("; "),
                publisher: { "@id": `${SITE_URL}/#org` },
              },
              {
                // The sections a search result should offer as sitelinks.
                // Names carry the phrases residents actually type.
                "@context": "https://schema.org",
                "@type": "ItemList",
                name: "Dorchester 101 — main sections",
                itemListElement: [
                  { "@type": "SiteNavigationElement", position: 1, name: "Affordable housing in Dorchester", url: `${SITE_URL}/affordable-housing` },
                  { "@type": "SiteNavigationElement", position: 2, name: "Food pantries open now", url: `${SITE_URL}/food` },
                  { "@type": "SiteNavigationElement", position: 3, name: "Live MBTA map — buses & trains", url: `${SITE_URL}/map` },
                  { "@type": "SiteNavigationElement", position: 4, name: "Boston weather & what to wear", url: `${SITE_URL}/weather` },
                  { "@type": "SiteNavigationElement", position: 5, name: "Free winter coats & clothing", url: `${SITE_URL}/winter-clothing` },
                  { "@type": "SiteNavigationElement", position: 6, name: "Directory of local help", url: `${SITE_URL}/directory` },
                  { "@type": "SiteNavigationElement", position: 7, name: "Dorchester news", url: `${SITE_URL}/news` },
                  { "@type": "SiteNavigationElement", position: 8, name: "Common questions (FAQ)", url: `${SITE_URL}/faq` },
                ],
              },
            ]),
          }}
        />
        {/*
          The photographic backdrop is its own fixed, pointer-transparent layer.
          It must never be the <body>: a fixed body with `pointer-events: none`
          pins the whole document to the viewport (no scrolling) and swallows
          every click in the page.
        */}
        <div className="dor101-backdrop" aria-hidden="true" />
        <DorchesterProviders>{children}</DorchesterProviders>
        <ServiceWorkerRegistration />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
