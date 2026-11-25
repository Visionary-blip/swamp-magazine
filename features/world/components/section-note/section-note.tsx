"use client";

import { useEffect, useId, useRef, useState } from "react";

// A tiny "?" beside a gallery heading that opens a few lines about the shoot
// under it, in the same thin-red-ring language as the other small controls. A
// press anywhere else, or Escape, closes it.
export function SectionNote({
  title,
  children,
}: {
  /** What the "?" is about, for the accessible name. */
  title: string;
  children: string;
}) {
  const root = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={root}>
      {/* The panel positions against the heading row (the nearest relative
          ancestor), not the button, so it stays centred and on screen when a
          long heading wraps and pushes the "?" to the edge. The button is a comfortable target; the ring inside it is the tiny
          part. */}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={`About ${title}`}
        className="group flex size-9 items-center justify-center focus-visible:outline-none"
      >
        <span className="flex size-5 items-center justify-center rounded-full border border-brand-red/70 font-display text-xs leading-none text-brand-red transition-colors duration-200 group-hover:border-brand-yellow group-hover:text-brand-yellow group-focus-visible:border-brand-yellow group-focus-visible:text-brand-yellow">
          ?
        </span>
      </button>

      {open ? (
        <p
          id={panelId}
          className="absolute top-full left-1/2 z-20 mt-1 w-[min(88vw,30rem)] -translate-x-1/2 rounded-2xl border border-brand-red/70 bg-ink/95 p-4 text-center font-body text-sm leading-relaxed text-cream"
        >
          {children}
        </p>
      ) : null}
    </div>
  );
}
