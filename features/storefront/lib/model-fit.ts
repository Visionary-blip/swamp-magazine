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
  "college-arch": [
    { name: "ANANYA", height: `5'7"`, size: "L" },
    { name: "JESSICA", height: `5'6"`, size: "M" },
  ],
  // Z's size in this piece is still to come; the bracket shows until it is given.
  "lurker-longsleeve": [
    { name: "YLVA", height: `5'5"`, size: "L" },
    { name: "Z", height: `6'2"`, size: "[SIZE]" },
  ],
};

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
