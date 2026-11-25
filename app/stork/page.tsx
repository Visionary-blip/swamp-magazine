import type { Metadata } from "next";

import { StorkScreen } from "@/features/stork";

export const dynamic = "force-dynamic";

// Named for the phone's home screen, and kept out of search results.
export const metadata: Metadata = {
  title: "Stork",
  applicationName: "Stork",
  appleWebApp: { title: "Stork" },
  robots: { index: false, follow: false },
};

export default function StorkPage() {
  return <StorkScreen />;
}
