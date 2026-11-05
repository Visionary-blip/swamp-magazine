import type { Metadata } from "next";

import { RadioScreen } from "@/features/world";

export const metadata: Metadata = {
  title: "RADIO — SWAMP MAGAZINE",
};

export default function RadioPage() {
  return <RadioScreen />;
}
