import { socialMetadata } from "@/lib/social";
import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Housing market trends: rents, incomes & Fair Market Rents in Boston",
  description: "Census ACS rents and incomes for Boston (Suffolk County), HUD Fair Market Rents and income limits — each with table ID, vintage and source link.",
  alternates: { canonical: "/market-trends" },
  ...socialMetadata({
    title: "Housing market trends — Boston",
    description: "Rents and incomes from Census + HUD, charted with citations.",
    url: `${SITE_URL}/market-trends`,
  }),
};
export default function MarketTrendsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
