import Image from "next/image";
import Link from "next/link";

import { SiteFooter, storefrontCopy } from "@/features/storefront";

type WorldRow = {
  label: string;
  href: string;
  /** A photograph behind the type; rows without one are type on ink until the
   * founder's pictures arrive. `position` is the CSS object-position that keeps
   * the subject in the middle of the wide, short crop. */
  photo?: { src: string; alt: string; position: string };
};

// The founder's order. Each row is a single button to its own page.
const rows: readonly WorldRow[] = [
  {
    label: "GALLERY",
    href: "/world/gallery",
    photo: {
      src: "/world/world-gallery.webp",
      alt: "A young man asleep on a floor piled with clothes, in a yellow tee",
      // His face sits about a third of the way down the portrait frame; this
      // centres it in the wide, short band.
      position: "50% 34%",
    },
  },
  {
    label: "CINEMA",
    href: "/world/cinema",
    photo: {
      src: "/world/world-cinema.webp",
      alt: "A woman leaning out of a brick building's upper window, seen from below over a man's head",
      // The woman sits about 29% down the frame; this centres her in the band.
      position: "50% 22%",
    },
  },
  { label: "RADIO", href: "/world/radio" },
  {
    label: "INVOLVE ME",
    href: "/get-involved",
    photo: {
      src: "/world/world-involve.webp",
      alt: "Two women in dark tops talking to each other on a couch in front of a hedge wall strung with lights",
      // Both faces sit about 30% down the portrait frame; this centres the pair
      // in the wide, short band (eyes a touch above the middle, mouths at it).
      position: "50% 25%",
    },
  },
];

// WORLD is four even rows, touching, each the full width of the screen and a
// quarter of the height left under the masthead. A hairline in brand red at
// low alpha is the only thing between them.
export function WorldScreen() {
  return (
    <main className="flex min-h-dvh flex-col bg-ink">
      <header className="flex h-16 shrink-0 items-center px-5 md:px-10">
        <Link
          href="/"
          className="font-display text-[15px] tracking-[0.05em] text-brand-red transition-colors duration-200 hover:text-brand-yellow focus-visible:text-brand-yellow focus-visible:outline-none md:text-[17px]"
        >
          {storefrontCopy.wordmark}
        </Link>
      </header>

      <nav
        aria-label="World"
        className="grid h-[calc(100dvh-4rem)] min-h-[32rem] w-full grid-rows-4 overflow-x-clip"
      >
        {rows.map((row, index) => (
          <Link
            key={row.href}
            href={row.href}
            // Top to bottom, a quarter second apart.
            style={{ animationDelay: `${index * 0.25}s` }}
            className="animate-fade-in relative isolate flex w-full items-center justify-center overflow-hidden border-t transition-[color,transform] duration-300 hover:z-10 hover:scale-[1.03] hover:shadow-2xl hover:shadow-ink/60 focus-visible:z-10 focus-visible:scale-[1.03] border-brand-red/40 font-display text-[16vw] leading-none tracking-[0.03em] text-brand-red last:border-b hover:text-brand-yellow focus-visible:text-brand-yellow focus-visible:outline-none md:text-[8vw]"
          >
            {row.photo ? (
              <>
                <Image
                  src={row.photo.src}
                  alt={row.photo.alt}
                  fill
                  sizes="100vw"
                  className="-z-20 object-cover"
                  style={{ objectPosition: row.photo.position }}
                />
                {/* Keeps the red type readable on the brightest bricks. */}
                <span
                  aria-hidden
                  className="absolute inset-0 -z-10 bg-ink/45"
                />
              </>
            ) : null}
            {row.label}
          </Link>
        ))}
      </nav>

      <SiteFooter />
    </main>
  );
}
