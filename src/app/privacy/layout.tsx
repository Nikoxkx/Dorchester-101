import { socialMetadata } from "@/lib/social";
import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy policy and data practices",
  description: "Information about device preferences, search, location and analytics. The policy is being reviewed.",
  alternates: { canonical: "/privacy" },
  ...socialMetadata({ title: "Privacy — DOR101", description: "Information about settings, search, location and analytics. The policy needs review.", url: `${SITE_URL}/privacy` }),
};
export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
