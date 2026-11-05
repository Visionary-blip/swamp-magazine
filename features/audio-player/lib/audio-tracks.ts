export type AudioTrack = {
  /** Public URL of the audio file. */
  src: string;
  /** Credit shown before the artist's name, e.g. their initials. */
  credit: string;
  /** The artist's name, which links to their Instagram. */
  name: string;
  /** Instagram handle, without the "@". Without one the name is plain text. */
  instagramHandle?: string;
};

// The files the corner player draws from. It picks one at random on play and
// again when a track ends. Drop an audio file into public/audio/ and add it here -- a
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
  {
    // No Instagram handle on file for Vega yet, so the name is not a link.
    src: "/audio/lullaby-vega-farro.m4a",
    credit: "LULLABY",
    name: "Vega Farro",
  },
];

/** Snap positions for the volume slider, left to right. The first is mute. */
export const volumeLevels = [0, 0.2, 0.55, 1] as const;

/** What each snap position is called, for assistive tech. */
export const volumeLevelNames = ["muted", "quiet", "medium", "full"] as const;

/** A random track that is not the one just played, when there is a choice. */
export function pickTrack(
  tracks: readonly AudioTrack[],
  previous: AudioTrack | null,
  random: () => number = Math.random,
): AudioTrack | null {
  const pool =
    tracks.length > 1 ? tracks.filter((t) => t !== previous) : tracks;
  if (pool.length === 0) return null;
  return pool[Math.floor(random() * pool.length)] ?? null;
}
