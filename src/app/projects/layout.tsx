import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Dorchester development projects: what’s being built & when it opens",
  description: "BPDA-docketed projects in Dorchester with unit counts, affordable bands, status and links to the official filing — checked 4 Oct 2026.",
  alternates: { canonical: "/projects" },
  openGraph: {
    title: "Dorchester development projects",
    description: "Unit counts and approvals from BPDA dockets, not estimates.",
    url: `${SITE_URL}/projects`,
  },
};
export default function ProjectsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
