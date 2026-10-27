import type { Metadata } from "next";

import { PlaceholderScreen } from "@/features/storefront";

export const metadata: Metadata = {
  title: "CINEMA — SWAMP MAGAZINE",
};

// The founder has not supplied anything for this page yet, so it is the shared
// holding screen rather than invented copy.
export default function CinemaPage() {
  return <PlaceholderScreen title="CINEMA" />;
}
