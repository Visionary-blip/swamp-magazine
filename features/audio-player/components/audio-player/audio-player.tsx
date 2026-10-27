"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import {
  audioTracks,
  pickTrack,
  volumeLevelNames,
  volumeLevels,
  type AudioTrack,
} from "../../lib/audio-tracks";

// Same round, thin-red-ring language as the cart corner's controls.
const roundButton =
  "flex size-8 items-center justify-center rounded-full border border-brand-red/70 bg-ink/80 text-brand-red transition-colors duration-200 hover:text-brand-yellow focus-visible:text-brand-yellow focus-visible:outline-none pointer-coarse:size-11";

// A small player centred along the bottom edge, under the landing hero's FROM
// LALO FARRO line. It lives in the root layout, so a
// track keeps playing as the visitor moves between pages. Nothing plays until
// the eighth note is pressed (browsers refuse sound before a gesture anyway);
// that press opens the controls and picks a random track, and the next is picked the same way when it
// ends.
export function AudioPlayer() {
  const pathname = usePathname();
  const audio = useRef<HTMLAudioElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const current = useRef<AudioTrack | null>(null);
  const [nowPlaying, setNowPlaying] = useState<AudioTrack | null>(null);
  const [started, setStarted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [level, setLevel] = useState(volumeLevels.length - 1); // full
  // The far-left snap is silence; there is no separate mute switch.
  const muted = level === 0;
  const [menuOpen, setMenuOpen] = useState(false);
  // Only the eighth-note button is left when closed -- which is how every visit
  // begins, so the page opens quiet; the X puts it back to this state.
  const [collapsed, setCollapsed] = useState(true);

  useEffect(() => {
    if (audio.current) audio.current.volume = volumeLevels[level];
  }, [level]);

  // A press anywhere else, or Escape, closes the menu (same as the size menu).
  useEffect(() => {
    if (!menuOpen) return;
    function onPointerDown(event: PointerEvent) {
      if (!root.current?.contains(event.target as Node)) setMenuOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  // The admin is a working tool, not the storefront.
  if (audioTracks.length === 0 || pathname.startsWith("/admin")) return null;

  function playRandom() {
    const element = audio.current;
    const next = pickTrack(audioTracks, current.current);
    if (!element || !next) return;
    current.current = next;
    setNowPlaying(next);
    element.src = next.src;
    element.volume = volumeLevels[level];
    // A rejected play() (decode error, blocked) just leaves it paused.
    element.play().catch(() => setPlaying(false));
    setStarted(true);
  }

  function togglePlay() {
    const element = audio.current;
    if (!element) return;
    if (!started) {
      playRandom();
    } else if (element.paused) {
      element.play().catch(() => setPlaying(false));
    } else {
      element.pause();
    }
  }

  // Stops the music and tucks the controls away. The track and its position are
  // kept, so reopening carries on with the same song instead of choosing anew.
  function closePlayer() {
    audio.current?.pause();
    setMenuOpen(false);
    setCollapsed(true);
  }

  // The eighth note brings the player back and starts it: the song that was
  // playing when X was pressed, or a random one if there was none yet.
  function openPlayer() {
    setCollapsed(false);
    if (started && audio.current) {
      audio.current.play().catch(() => setPlaying(false));
    } else {
      playRandom();
    }
  }

  return (
    <div
      ref={root}
      role="group"
      aria-label="Music"
      className="fixed bottom-3 left-1/2 z-30 flex w-max max-w-[calc(100vw-1.5rem)] -translate-x-1/2 items-center gap-1.5 pb-[max(0px,env(safe-area-inset-bottom))]"
    >
      <audio
        ref={audio}
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={playRandom}
      />

      {collapsed ? (
        <button
          type="button"
          onClick={openPlayer}
          aria-label="Open music player"
          className={roundButton}
        >
          <svg
            aria-hidden
            viewBox="0 0 10 10"
            className="size-4"
            fill="currentColor"
          >
            {/* An eighth note: head, stem, flag. */}
            <ellipse
              cx="3.3"
              cy="7.7"
              rx="1.8"
              ry="1.3"
              transform="rotate(-20 3.3 7.7)"
            />
            <path d="M4.9 7.6V1.2h.9c.2 1.5 1.3 2.1 2.2 2.7-.9-.2-1.7-.3-2.2-.9v4.6z" />
          </svg>
        </button>
      ) : (
        <>
          <button
            type="button"
            onClick={closePlayer}
            aria-label="Close music player"
            className={roundButton}
          >
            <svg
              aria-hidden
              viewBox="0 0 10 10"
              className="size-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
            >
              <path d="M1.5 1.5l7 7M8.5 1.5l-7 7" />
            </svg>
          </button>

          <button
            type="button"
            onClick={togglePlay}
            aria-label={playing ? "Pause music" : "Play music"}
            className={roundButton}
          >
            <svg
              aria-hidden
              viewBox="0 0 10 10"
              className="size-3.5"
              fill="currentColor"
            >
              {playing ? (
                <path d="M2 1h2v8H2zM6 1h2v8H6z" />
              ) : (
                <path d="M2.5 1l6.5 4-6.5 4z" />
              )}
            </svg>
          </button>

          {started ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                aria-haspopup="dialog"
                aria-expanded={menuOpen}
                aria-label="Sound settings"
                className={roundButton}
              >
                <svg
                  aria-hidden
                  viewBox="0 0 12 12"
                  className="size-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M1.5 4.5h2l2.5-2v7l-2.5-2h-2z" fill="currentColor" />
                  {muted ? (
                    <path d="M8 4.5l3 3M11 4.5l-3 3" />
                  ) : (
                    <path d="M8 4.2a2.4 2.4 0 010 3.6" />
                  )}
                </svg>
              </button>

              {menuOpen ? (
                <div
                  role="dialog"
                  aria-label="Sound settings"
                  className="absolute bottom-full left-0 mb-1 flex min-w-36 flex-col gap-3 rounded-2xl border border-brand-red/70 bg-ink/95 p-3"
                >
                  <label className="flex flex-col gap-1.5 font-display text-xs leading-none tracking-[0.1em] text-brand-red uppercase">
                    VOLUME
                    {/* Four snap positions: step 1 means the thumb can only rest on
                    muted (far left), quiet, medium or full. */}
                    <input
                      type="range"
                      min={0}
                      max={volumeLevels.length - 1}
                      step={1}
                      value={level}
                      onChange={(event) => setLevel(Number(event.target.value))}
                      aria-valuetext={volumeLevelNames[level]}
                      className="w-full accent-brand-red pointer-coarse:h-8"
                    />
                  </label>
                </div>
              ) : null}
            </div>
          ) : null}

          {/* Skip: another random track, never the one that just played when
              there is a choice. With a single file it simply restarts it. */}
          {started ? (
            <button
              type="button"
              onClick={playRandom}
              aria-label="Next track"
              className={roundButton}
            >
              <svg
                aria-hidden
                viewBox="0 0 10 10"
                className="size-3.5"
                fill="currentColor"
              >
                <path d="M1 1.2l5.2 3.8L1 8.8zM7.4 1h1.6v8H7.4z" />
              </svg>
            </button>
          ) : null}

          {/* The credit for what is playing. Only the artist's name is a link: it
          goes yellow on hover, like the site's other text links, and opens
          their Instagram. */}
          {nowPlaying ? (
            <p className="font-display text-xs leading-none tracking-[0.1em] whitespace-nowrap text-brand-red uppercase pointer-coarse:text-sm">
              {nowPlaying.credit} -{" "}
              {nowPlaying.instagramHandle ? (
                <a
                  href={`https://instagram.com/${nowPlaying.instagramHandle}`}
                  target="_blank"
                  rel="noreferrer"
                  className="transition-colors duration-200 hover:text-brand-yellow focus-visible:text-brand-yellow focus-visible:outline-none"
                >
                  {nowPlaying.name}
                </a>
              ) : (
                nowPlaying.name
              )}
            </p>
          ) : null}
        </>
      )}
    </div>
  );
}
