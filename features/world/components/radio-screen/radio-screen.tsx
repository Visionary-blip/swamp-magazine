import Image from "next/image";

import { PlaceholderScreen } from "@/features/storefront";

import { radioPlaylists } from "../../lib/radio-playlists";

// One rounded photograph square per playlist with its name right beneath,
// opening Spotify in a new tab. The whole card is the link, so the label goes
// yellow on hover.
export function RadioScreen() {
  return (
    <PlaceholderScreen title="RADIO" pending={false}>
      <ul className="flex w-full max-w-2xl flex-col items-center justify-center gap-10 sm:flex-row sm:items-start">
        {radioPlaylists.map((playlist) => (
          <li key={playlist.href} className="w-full max-w-64 sm:w-1/2">
            <a
              href={playlist.href}
              target="_blank"
              rel="noreferrer"
              className="group flex flex-col gap-3 text-center font-display text-3xl leading-tight tracking-[0.03em] text-brand-red transition-colors duration-200 hover:text-brand-yellow focus-visible:text-brand-yellow focus-visible:outline-none"
            >
              <span className="relative block aspect-square w-full overflow-hidden rounded-3xl">
                <Image
                  src={playlist.image}
                  alt={playlist.alt}
                  fill
                  sizes="(min-width: 640px) 256px, 100vw"
                  className="object-cover"
                  style={{ objectPosition: playlist.position }}
                />
              </span>
              {playlist.label}
            </a>
          </li>
        ))}
      </ul>
    </PlaceholderScreen>
  );
}
