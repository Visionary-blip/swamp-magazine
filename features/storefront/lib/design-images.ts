// A garment sold in more than one design has a picture per design. Bundled files,
// like the galleries, keyed by the design names in lib/checkout/designs.ts. A slug
// with no entry just uses its one cutout. The sage stand-in for SWEET DREAMS
// stays until the real shirt is photographed.
const DESIGN_IMAGES: Record<string, Record<string, string>> = {
  "sleep-shirt": {
    "EX-MODEL": "/designs/sleep-shirt-ex-model.webp",
    "SWEET DREAMS": "/designs/sleep-shirt-sweet-dreams.webp",
  },
};

export function getDesignImages(slug: string): Record<string, string> {
  return DESIGN_IMAGES[slug] ?? {};
}
