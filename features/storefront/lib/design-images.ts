import { designImagesFor } from "@/lib/checkout/designs";

// A garment sold in more than one design has a picture per design. Bundled files,
// keyed by the design names in lib/checkout/designs.ts (the map lives there, so
// the cart corner can draw the same pictures). A slug with no entry just uses its
// one cutout.
export function getDesignImages(slug: string): Record<string, string> {
  return designImagesFor(slug);
}
