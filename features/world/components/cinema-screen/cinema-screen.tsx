import { MastheadLink, SiteFooter } from "@/features/storefront";

import { CinemaPlayer } from "./cinema-player";

// The founder's films, 1080p H.264 with their own sound (the final cut compressed
// from the 226 MB master, which stays with the founder), side by side behind left
// and right arrows. See CinemaPlayer for the controls.
const FILMS = [
  {
    src: "/world/cinema-final-cut.mp4",
    poster: "/world/cinema-final-cut-poster.webp",
    title: "final cut",
  },
  // 4:5 portrait, 16 s; the founder's file, copied as it was (a .mov, H.264/AAC).
  { src: "/world/cinema-tv-vignette.mp4", title: "TV vignette" },
] as const;

export function CinemaScreen() {
  return (
    <main className="flex min-h-dvh flex-col bg-ink">
      <header className="flex min-h-16 shrink-0 items-center px-5 py-2 md:px-10">
        <MastheadLink backToWorld />
      </header>

      <section className="flex flex-1 flex-col items-center justify-center pb-16 max-md:justify-start max-md:pb-8">
        <h1 className="mb-8 px-5 text-center font-display text-6xl leading-none max-md:mb-4 max-md:text-3xl tracking-[0.03em] text-cream uppercase">
          CINEMA
        </h1>
        <CinemaPlayer
          films={FILMS}
          // Edge to edge on a phone, 16:9 kept by the player.
          className="w-full md:w-4/5"
        />
      </section>

      {/* No footer on a phone: the film has the whole screen. */}
      <div className="max-md:hidden">
        <SiteFooter />
      </div>
    </main>
  );
}
