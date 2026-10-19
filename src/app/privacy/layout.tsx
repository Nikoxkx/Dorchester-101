import { socialMetadata } from "@/lib/social";
import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy policy: what DOR101 collects (nothing) and what stays on your device",
  description: "DOR101 collects no personal data. Preferences stay in localStorage; no cookies, no ads, no trackers. Read exactly what is stored.",
  alternates: { canonical: "/privacy" },
  ...socialMetadata({ title: "Privacy — DOR101", description: "No accounts. No tracking. No data sold.", url: `${SITE_URL}/privacy` }),
};
export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
