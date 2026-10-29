import type { Metadata } from "next";

import { CinemaScreen } from "@/features/world";

export const metadata: Metadata = {
  title: "CINEMA — SWAMP MAGAZINE",
};

export default function CinemaPage() {
  return <CinemaScreen />;
}
