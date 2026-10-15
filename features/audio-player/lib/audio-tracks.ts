export type AudioTrack = {
  /** Public URL of the .wav. */
  src: string;
  /** Credit shown before the artist's name, e.g. their initials. */
  credit: string;
  /** The artist's name, which links to their Instagram. */
  name: string;
  /** Instagram handle, without the "@". */
  instagramHandle: string;
};

// The files the corner player draws from. It picks one at random on play and
// again when a track ends. Drop a .wav into public/audio/ and add it here -- a
// bundled list rather than a directory scan, because a deployed function cannot
// list the public folder. While the list is empty the player does not render.
export const audioTracks: readonly AudioTrack[] = [
  {
    src: "/audio/mwl-chainmail-river.wav",
    credit: "MWL",
    name: "Chainmail River",
    instagramHandle: "chainmailriver",
  },
  {
    src: "/audio/may-16th-chainmail-river.wav",
    credit: "MAY 16TH",
    name: "Chainmail River",
    instagramHandle: "chainmailriver",
  },
];

/** Three snap positions for the volume slider, quiet to full. */
export const volumeLevels = [0.2, 0.55, 1] as const;

/** A random track that is not the one just played, when there is a choice. */
export function pickTrack(
  tracks: readonly AudioTrack[],
  previous: AudioTrack | null,
  random: () => number = Math.random,
): AudioTrack | null {
  const pool = tracks.length > 1 ? tracks.filter((t) => t !== previous) : tracks;
  if (pool.length === 0) return null;
  return pool[Math.floor(random() * pool.length)] ?? null;
}
