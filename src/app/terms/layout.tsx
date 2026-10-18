import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of use for DOR101 — Dorchester community resources",
  description: "Terms for using the DOR101 directory: no cost, informational purpose, verification promise and limits of responsibility.",
  alternates: { canonical: "/terms" },
  openGraph: { title: "Terms — DOR101", description: "How to use the directory responsibly.", url: `${SITE_URL}/terms` },
};
export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
