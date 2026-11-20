// The models' Instagram handles, keyed by the name as it is written in
// `products.model_credits` ("ANANYA (L), JESSICA (R)"). The credit string stays
// the founder's free text in the admin; this only decides which names in it are
// links. A name with no entry here renders as plain text, so a credit the
// founder adds before a handle is supplied never breaks the page.
//
// Handles supplied by the founder; add a line here to link a new name.
const INSTAGRAM_HANDLES: Record<string, string> = {
  JOE: "jvvargas_23",
  ANANYA: "ananya.gomatam",
  JESSICA: "jess.lain",
  YLVA: "ylvaoppold",
  Z: "zahir.griffith",
  DAVID: "davidlseekford",
  MIA: "ch3ekychu",
  CALDER: "calderburkhart",
  NIKITA: "Nikibort",
  FABI: "fabimaicorso",
  ADELINE: "adelinesajko",
  GARRETT: "garrettrobertsonn",
  BRIANNA: "briannaimartin",
  CONNOR: "conner.bensn",
};

export type ModelCredit = { text: string; href: string | null };

/**
 * Splits a credit string into one entry per person, each with the Instagram URL
 * for the name at its start ("JOE (BEHIND)" -> JOE). A trailing "(L)" or "(R)"
 * is dropped from the shown text. Commas and line breaks both
 * separate people, so either way the admin's field was filled in works.
 */
export function parseModelCredits(raw: string): ModelCredit[] {
  return raw
    .split(/[,\n]/)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((entry) => {
      const name = entry.split("(")[0].trim().toUpperCase();
      const handle = INSTAGRAM_HANDLES[name];
      return {
        // Which side of the photograph someone stood on is a note for the admin
        // field; the page shows the name alone.
        text: entry.replace(/\s*\((?:L|R)\)\s*$/i, ""),
        href: handle ? `https://www.instagram.com/${handle}/` : null,
      };
    });
}
