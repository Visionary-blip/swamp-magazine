import { dials } from "@/config/dials";

// "B" is the Botched size: the garment in XL with the hems ripped, made to the
// customer's dimensions. It is not a variant in the database -- it is sold out of
// the XL stock (or, on a garment with no XL, its largest size), and what the founder needs to cut it (the customer's height and
// how botched they want it) rides in the order line's size text
// ("B 5'7\" (2/3)") so it shows on the order, in the admin list and in the
// emails, with no new column.

export const BOTCHED_SIZE = "B";

// Botched is a tee-shirt thing: ripped hems only make sense on a tee. Not the
// shorts, the hoodie, the longsleeve or a crop top (the founder, 2026-11-14). It
// is a storefront decision keyed by slug, like the issues, so a new tee has to be
// added here to get the B.
const BOTCHED_SLUGS: readonly string[] = [
  "vamp-tee",
  "college-arch",
  "lurker-tee",
  "fc-shirt",
  "dog-tee",
];

/** Whether a garment may be had Botched. */
export function botchedOffered(slug: string): boolean {
  return BOTCHED_SLUGS.includes(slug);
}

/** A garment's sizes as the buttons should show them: the B only where it is
 * offered, so a cart saved before the rule changed cannot still show it. */
export function offeredSizes<T extends { size: string }>(
  slug: string,
  sizes: T[],
): T[] {
  return botchedOffered(slug)
    ? sizes
    : sizes.filter((option) => option.size !== BOTCHED_SIZE);
}

/** The variant a Botched order is cut from and counted against. */
const BOTCHED_BASE_SIZE = "XL";

const LETTER_SIZES = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL"];

/** The size of a garment that a Botched one is cut from and counted against: the
 * XL, or on a garment that has none its largest size. Null when it has no size
 * to cut from, so B is not offered. */
export function botchedBaseSize(sizes: string[]): string | null {
  if (sizes.includes(BOTCHED_BASE_SIZE)) return BOTCHED_BASE_SIZE;
  let base: string | null = null;
  let baseRank = -1;
  for (const size of sizes) {
    const rank = LETTER_SIZES.indexOf(size.toUpperCase());
    if (rank > baseRank) {
      base = size;
      baseRank = rank;
    }
  }
  return base;
}

/** The three stops of "how botched", mildest first. Invented wording; the
 * founder's to review. */
export const BOTCHED_LEVEL_LABELS = ["A LITTLE", "BOTCHED", "VERY BOTCHED"];

const BOTCHED_PATTERN = /^B (\d)'(\d{1,2})" \((\d)\/3\)$/;

export type BotchedFit = { feet: number; inches: number; level: number };

/** The order-line size for a Botched garment: `B 5'7" (2/3)`. */
export function botchedSize({ feet, inches, level }: BotchedFit): string {
  return `${BOTCHED_SIZE} ${feet}'${inches}" (${level}/3)`;
}

/** The fit inside a Botched size, or null for any other size, or one outside
 * the pop-up's range (a hand-made request). */
export function parseBotchedSize(size: string): BotchedFit | null {
  const match = BOTCHED_PATTERN.exec(size);
  if (!match) return null;
  const feet = Number(match[1]);
  const inches = Number(match[2]);
  const level = Number(match[3]);
  if (feet < dials.botchedMinFeet || feet > dials.botchedMaxFeet) return null;
  if (inches > 11) return null;
  if (level < 1 || level > 3) return null;
  return { feet, inches, level };
}

/** Whether a size button (which may be "B") stands for the size an item has
 * (which, for a Botched item, is the whole `B 5'7" (2/3)` text). */
export function sizeMatches(optionSize: string, itemSize: string): boolean {
  return (
    optionSize === itemSize ||
    (optionSize === BOTCHED_SIZE && parseBotchedSize(itemSize) !== null)
  );
}
