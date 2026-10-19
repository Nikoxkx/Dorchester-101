import { socialMetadata } from "@/lib/social";
import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Directory: every Dorchester service with hours, phone & accessibility",
  description: "Searchable, printable list of every food, housing, health and transit resource DOR101 tracks — with hours, phone, language and verification date.",
  alternates: { canonical: "/directory" },
  ...socialMetadata({ title: "Dorchester services directory", description: "The full DOR101 list, filterable.", url: `${SITE_URL}/directory` }),
};
export default function DirectoryLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
