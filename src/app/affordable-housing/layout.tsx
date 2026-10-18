import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Affordable housing lotteries & waitlists in Dorchester, Boston",
  description: "All current Metrolist and Housing Navigator listings for Dorchester, Boston: eligibility, AMI limits, and the two official sites where you apply — no invented rents.",
  alternates: { canonical: "/affordable-housing" },
  openGraph: {
    title: "Affordable housing in Dorchester",
    description: "Official lotteries, eligibility tools, and links to the agencies that run them.",
    url: `${SITE_URL}/affordable-housing`,
  },
};
export default function AffordableLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
