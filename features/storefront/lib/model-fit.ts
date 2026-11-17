export type ModelFit = {
  /** Shown first, so two models in one shoot can be told apart; optional. */
  name?: string;
  /** How tall they are, as written: `6'1"`. */
  height: string;
  /** The size they wear in this piece: `M`, `L`. */
  size: string;
};

// The founder is supplying the real heights and sizes one at a time. Until a slug
// has an entry below it shows these bracketed stand-ins, so nothing here can be
// mistaken for a real measurement. To set one up, add the slug with one entry per
// model in the shoot (made-up numbers, an example of the format only):
//
//   "lurker-longsleeve": [
//     { name: "YLVA", height: `5'8"`, size: "M" },
//     { name: "Z", height: `6'1"`, size: "L" },
//   ],
const MODEL_FIT: Record<string, ModelFit[]> = {
  // Joe Vargas, per the founder.
  "lurker-tee": [{ name: "JOE", height: `5'7"`, size: "M" }],
  "star-shorts": [
    { name: "MIA", height: `5'5"`, size: "S" },
    { name: "DAVID", height: `6'3"`, size: "M" },
  ],
  "college-arch": [
    { name: "ANANYA", height: `5'7"`, size: "L" },
    { name: "JESSICA", height: `5'6"`, size: "M" },
  ],
  "fc-hoodie": [
    { name: "CALDER", height: `5'5"`, size: "L" },
    { name: "NIKITA", height: `6'0"`, size: "XL" },
  ],
  // Garrett's height, and Adeline's height and size, are still to come from the
  // founder (a name with no entry shows the bracketed stand-ins).
  "fc-shirt": [{ name: "GARRETT", height: "[HEIGHT]", size: "L" }],
  // Fabi's and Adeline's heights are still to come from the founder.
  "croc-crop": [
    { name: "FABI", height: "[HEIGHT]", size: "XS" },
    { name: "ADELINE", height: "[HEIGHT]", size: "S" },
  ],
  // Brianna's and Connor's heights and sizes are still to come from the founder.
  "sleep-shirt": [
    { name: "BRIANNA", height: "[HEIGHT]", size: "[SIZE]" },
    { name: "CONNOR", height: "[HEIGHT]", size: "[SIZE]" },
  ],
  "lurker-longsleeve": [
    { name: "YLVA", height: `5'5"`, size: "L" },
    { name: "Z", height: `6'2"`, size: "L" },
  ],
};

// The SIZING button is half as wide as the credits above it, so a short credit
// makes a narrow button. A product listed here keeps the width its credits had
// before they were shortened (Joe's was "JOE (BEHIND)", 177px). Literal class
// names, so Tailwind can see them.
const CREDITS_MIN_WIDTH: Record<string, string> = {
  "lurker-tee": "md:min-w-[177px]",
};

export function getCreditsMinWidth(slug: string): string {
  return CREDITS_MIN_WIDTH[slug] ?? "";
}

// A model's fit by the name as written in the credit line ("JESSICA" for
// "JESSICA (R)"). A model with no entry yet gets the bracketed stand-ins under
// their own name, so nothing is mistaken for a real measurement.
export function getModelFit(slug: string, name: string): ModelFit {
  const wanted = name.toUpperCase();
  return (
    MODEL_FIT[slug]?.find((model) => model.name?.toUpperCase() === wanted) ?? {
      name: wanted,
      height: "[HEIGHT]",
      size: "[SIZE]",
    }
  );
}
