import type { Metadata } from "next";

import { GalleryScreen } from "@/features/world";

export const metadata: Metadata = {
  title: "GALLERY — SWAMP MAGAZINE",
};

export default function GalleryPage() {
  return <GalleryScreen />;
}
