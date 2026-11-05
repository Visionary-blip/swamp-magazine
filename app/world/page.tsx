import type { Metadata } from "next";

import { WorldScreen } from "@/features/world";

export const metadata: Metadata = {
  title: "WORLD — SWAMP MAGAZINE",
};

// No site-mode gate, same as the other footer pages: it leaks nothing about an
// unreleased drop.
export default function WorldPage() {
  return <WorldScreen />;
}
