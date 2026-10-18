import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Dorchester neighborhoods: Fields Corner, Savin Hill, Codman Square & more",
  description: "Nine Dorchester neighborhoods — history, population, transit, schools and current developments — with photos credited to Wikimedia Commons.",
  alternates: { canonical: "/neighborhood" },
  openGraph: {
    title: "Dorchester neighborhoods",
    description: "Fields Corner to Lower Mills: what each part of Dorchester is like.",
    url: `${SITE_URL}/neighborhood`,
  },
};
export default function NeighborhoodLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
