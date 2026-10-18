import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "FAQ: housing, food help, tenant rights & transit in Dorchester",
  description: "Straight answers about affordable housing waitlists, food pantries, tenant protections, SNAP/WIC and getting around Dorchester by T or bus.",
  alternates: { canonical: "/faq" },
  openGraph: {
    title: "FAQ — Dorchester 101",
    description: "Housing, food, legal and transit questions — answered.",
    url: `${SITE_URL}/faq`,
  },
};
export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
