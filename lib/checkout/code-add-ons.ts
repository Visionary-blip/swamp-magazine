import { dials } from "@/config/dials";

// Add-ons that ship with the code instead of a products row, so selling one
// needs no migration and no database entry. The server prices them from here
// (the cart's copy is only for drawing), and with no variant row they have no
// stock to run out. A products row with the same slug wins.
export type CodeAddOn = {
  slug: string;
  name: string;
  priceCents: number;
  size: string;
  cutout: { url: string; alt: string };
};

export const CODE_ADD_ONS: CodeAddOn[] = [
  {
    slug: "lighter",
    name: "LIL LIGHTER",
    priceCents: dials.lighterPriceCents,
    size: "ONE SIZE",
    cutout: {
      url: "/add-ons/lil-lighter.webp",
      alt: "A blue hand-wrapped lighter with a face drawn on it",
    },
  },
];

export function findCodeAddOn(slug: string): CodeAddOn | undefined {
  return CODE_ADD_ONS.find((addOn) => addOn.slug === slug);
}
