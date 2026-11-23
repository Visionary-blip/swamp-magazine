// The lines under a product's model sizing in its SPECS panel: what it is made
// of, then how it was printed. The wording is the founder's.
const HANDPRINTED = "Handprinted by one guy in a bed room";

// The cloth, by slug. Anything not listed is a cotton shirt. A product listed as
// null has no fabric line (the founder has not given one), only the printing.
const FABRIC: Record<string, string | null> = {
  "fc-hoodie": "80/20% Cotton/Polyester blend for structure",
  "croc-crop": "90/10% Cotton/Polyester blend for stretch",
  "star-shorts": null,
};
const COTTON = "100% Cotton";

export function getProductSpecs(slug: string): string[] {
  const fabric = slug in FABRIC ? FABRIC[slug] : COTTON;
  return fabric ? [fabric, HANDPRINTED] : [HANDPRINTED];
}
