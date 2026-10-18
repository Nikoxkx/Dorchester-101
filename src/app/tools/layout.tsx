import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Calculators: rent burden, AMI, move-in costs & benefits screening",
  description: "Six tools that run in your browser: rent burden vs income, AMI eligibility, move-in costs, benefits screener, eviction timeline and what-to-bring checklist.",
  alternates: { canonical: "/tools" },
  openGraph: {
    title: "Housing & benefits tools",
    description: "Rent, AMI and cost calculators — nothing you type is stored.",
    url: `${SITE_URL}/tools`,
  },
};
export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
