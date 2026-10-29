"use client";

import { useEffect, useRef, useState } from "react";

import { volumeLevelNames, volumeLevels } from "@/features/audio-player";
import { cn } from "@/lib/utils";

// The music player's round, thin-red-ring buttons, so the film's controls read
// as the same family.
const roundButton =
  "animate-blink-yellow flex size-8 items-center justify-center rounded-full border border-brand-red/70 bg-ink/80 text-brand-red transition-colors duration-200 hover:text-brand-yellow focus-visible:text-brand-yellow focus-visible:outline-none pointer-coarse:size-11";

// The film with only what the founder asked for: play/pause and a volume
// button laid out exactly as the music player's (four snap positions, the far
// left being silence). The browser's own bar -- full screen, the three-dot menu,
// the clock -- is off. It starts by itself (see the effect below).
export function CinemaPlayer({
  src,
  poster,
  className,
}: {
  src: string;
  poster: string;
  className?: string;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [level, setLevel] = useState(volumeLevels.length - 1); // full
  const muted = level === 0;
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (video.current) video.current.volume = volumeLevels[level];
  }, [level]);

  // Starts on arrival. Browsers only allow sound once the visitor has interacted
  // with the site, which arriving through the WORLD page's links normally
  // counts as; when it is refused (a direct load, a strict browser) the film
  // starts silent instead and the volume button shows it as muted, so a press
  // there brings the sound up.
  useEffect(() => {
    const element = video.current;
    if (!element) return;
    element.play().catch(() => {
      setLevel(0);
      element.muted = true;
      element.play().catch(() => setPlaying(false));
    });
  }, []);

  // A press anywhere else, or Escape, closes the menu (same as the music player).
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

  function togglePlay() {
    const element = video.current;
    if (!element) return;
    // A rejected play() (blocked, decode error) just leaves it paused.
    if (element.paused) element.play().catch(() => setPlaying(false));
    else element.pause();
  }

  return (
    <div ref={root} className={cn("group/film relative", className)}>
      <video
        ref={video}
        playsInline
        preload="metadata"
        poster={poster}
        muted={muted}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        className="aspect-video w-full bg-ink"
      >
        <source src={src} type="video/mp4" />
      </video>

      <div
        role="group"
        aria-label="Film controls"
        className={cn(
          // Over the foot of the film. They show for the blinks, then fade away
          // and come back whenever the film is hovered or a control has focus.
          "animate-linger absolute inset-x-0 bottom-3 flex items-center justify-center gap-1.5 opacity-0 transition-opacity duration-300 group-hover/film:opacity-100 focus-within:opacity-100",
          menuOpen && "opacity-100",
        )}
      >
        <button
          type="button"
          onClick={togglePlay}
          aria-label={playing ? "Pause film" : "Play film"}
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
      </div>
    </div>
  );
}
