"use client";

import { useEffect, useRef, useState } from "react";

import { glideToAnchor } from "../../lib/glide-to-anchor";
import type { ModelFit } from "../../lib/model-fit";

// A small bar reading SIZING under the model credits (desktop only). It opens one
// panel saying how tall each model is and what size they are wearing, in the same
// thin-red-ring language as the music and cart controls.
export function ModelFitButton({
  models,
  note,
  noteHref,
  className,
}: {
  models: ModelFit[];
  /** A closing line under the models (the page's pointer to its photographs). */
  note?: string;
  /** Makes the note a link that glides to this in-page anchor. */
  noteHref?: string;
  className?: string;
}) {
  const root = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  // A press anywhere else, or Escape, closes it (same as the other menus).
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
    <div ref={root} className={`relative ${className ?? ""}`}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="Model height and size"
        className="flex h-8 w-full items-center justify-center rounded-full border font-display text-sm leading-none tracking-[0.1em] border-brand-red/70 bg-ink/80 text-brand-red transition-colors duration-200 hover:text-brand-yellow hover:border-brand-yellow focus-visible:text-brand-yellow focus-visible:border-brand-yellow focus-visible:outline-none"
      >
        SIZING
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label="Model height and size"
          className="absolute top-full right-0 z-10 mt-1 w-max max-w-64 flex flex-col gap-2 rounded-2xl border border-brand-red/70 bg-ink/95 p-3 text-right font-display text-xs leading-snug tracking-[0.1em] text-brand-red uppercase"
        >
          {models.map((model) => (
            <p key={model.name ?? model.height}>
              {model.name ?? "THIS MODEL"} IS {model.height} TALL AND IS WEARING
              SIZE {model.size}
            </p>
          ))}
          {note && noteHref ? (
            <a
              href={noteHref}
              onClick={(event) => {
                glideToAnchor(event, noteHref);
                setOpen(false);
              }}
              className="text-brand-red/70 transition-colors duration-200 hover:text-brand-yellow focus-visible:text-brand-yellow focus-visible:outline-none"
            >
              {note}
            </a>
          ) : note ? (
            <p className="text-brand-red/70">{note}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
