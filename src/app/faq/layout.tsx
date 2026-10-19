import { socialMetadata } from "@/lib/social";
import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";
import { faqJsonLd } from "@/lib/jsonLd";
import { FAQ_JSONLD } from "./faqData";

export const metadata: Metadata = {
  title: "FAQ: housing, food help, tenant rights & transit in Dorchester",
  description: "Straight answers about affordable housing waitlists, food pantries, tenant protections, SNAP/WIC and getting around Dorchester by T or bus.",
  alternates: { canonical: "/faq" },
  ...socialMetadata({
    title: "FAQ — Dorchester 101",
    description: "Housing, food, legal and transit questions — answered.",
    url: `${SITE_URL}/faq`,
  }),
};
export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* FAQ rich-result data: the same answers the page itself shows. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd([...FAQ_JSONLD])) }}
      />
      {children}
    </>
  );
}
