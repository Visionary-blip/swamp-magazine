"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { dials } from "@/config/dials";
import { BOTCHED_LEVEL_LABELS, type BotchedFit } from "@/lib/checkout/botched";
import { cn } from "@/lib/utils";

const ROW = 28;
const VISIBLE_ROWS = 5;
const PAD = ROW * Math.floor(VISIBLE_ROWS / 2);

const feetValues = Array.from(
  { length: dials.botchedMaxFeet - dials.botchedMinFeet + 1 },
  (_, index) => dials.botchedMinFeet + index,
);
const inchValues = Array.from({ length: 12 }, (_, index) => index);

const buttonClass =
  "cursor-pointer whitespace-nowrap px-1 py-2 text-brand-red transition-colors duration-200 hover:text-brand-yellow focus-visible:text-brand-yellow focus-visible:outline-none";

// One column of a timer-style picker: the numbers scroll under a fixed band in
// the middle and snap, and whichever sits in the band is the value. Scrolling
// (wheel, drag, swipe), arrow keys, pressing a number and typing digits all move
// it; Enter from the keyboard is DONE.
function Wheel({
  values,
  value,
  onChange,
  label,
  unit,
  autoFocus,
  onEnter,
}: {
  values: number[];
  value: number;
  onChange: (value: number) => void;
  label: string;
  unit: string;
  autoFocus?: boolean;
  onEnter: () => void;
}) {
  const list = useRef<HTMLDivElement>(null);
  // The digits typed in the last moment, so "1" then "1" is 11 (not 1, then 1).
  const typed = useRef({ digits: "", timer: 0 });
  const index = values.indexOf(value);

  // Open with the current value in the band; later moves come from the scroll
  // itself, so this only has to catch the first paint.
  useEffect(() => {
    if (list.current) list.current.scrollTop = index * ROW;
    if (autoFocus) list.current?.focus({ preventScroll: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function typeDigit(digit: string) {
    window.clearTimeout(typed.current.timer);
    let digits = typed.current.digits + digit;
    // A number that is not on the dial starts over from this digit.
    if (!values.includes(Number(digits))) digits = digit;
    typed.current.digits = digits;
    typed.current.timer = window.setTimeout(() => {
      typed.current.digits = "";
    }, 900);
    const target = values.indexOf(Number(digits));
    if (target !== -1) {
      list.current?.scrollTo({ top: target * ROW, behavior: "auto" });
    }
  }

  function goTo(next: number) {
    const clamped = Math.min(values.length - 1, Math.max(0, next));
    list.current?.scrollTo({ top: clamped * ROW, behavior: "smooth" });
  }

  return (
    <div className="flex items-center gap-2">
      <div
        className="relative"
        style={{ height: ROW * VISIBLE_ROWS, width: "2.75rem" }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 rounded-xl bg-brand-red/15"
          style={{ top: PAD, height: ROW }}
        />
        <div
          ref={list}
          role="listbox"
          aria-label={label}
          tabIndex={0}
          onScroll={(event) => {
            const next = Math.round(event.currentTarget.scrollTop / ROW);
            const picked =
              values[Math.min(values.length - 1, Math.max(0, next))];
            if (picked !== value) onChange(picked);
          }}
          onKeyDown={(event) => {
            if (/^\d$/.test(event.key)) {
              event.preventDefault();
              typeDigit(event.key);
            } else if (event.key === "Enter") {
              event.preventDefault();
              onEnter();
            } else if (event.key === "ArrowDown") {
              event.preventDefault();
              goTo(index + 1);
            } else if (event.key === "ArrowUp") {
              event.preventDefault();
              goTo(index - 1);
            }
          }}
          className="relative h-full snap-y snap-mandatory overflow-y-auto [mask-image:linear-gradient(to_bottom,transparent,black_30%,black_70%,transparent)] [scrollbar-width:none] focus-visible:outline-none [&::-webkit-scrollbar]:hidden"
        >
          <div style={{ paddingTop: PAD, paddingBottom: PAD }}>
            {values.map((item, position) => (
              <div
                key={item}
                role="option"
                aria-selected={item === value}
                onClick={() => goTo(position)}
                className={cn(
                  "flex cursor-pointer snap-center items-center justify-center font-display text-lg leading-none transition-colors duration-150",
                  item === value ? "text-brand-yellow" : "text-brand-red/40",
                )}
                style={{ height: ROW }}
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
      <span className="font-display text-xs tracking-[0.1em] text-brand-red">
        {unit}
      </span>
    </div>
  );
}

// "How botched": a three-stop slider that snaps to its stops. The native range
// input does the snapping (and the keyboard and touch behaviour); the labels sit
// under the stops it lands on, so a stop can also be pressed by name.
function LevelSlider({
  level,
  onChange,
}: {
  level: number;
  onChange: (level: number) => void;
}) {
  const stops = BOTCHED_LEVEL_LABELS.length;
  // The same native slider as the music player's volume, whose thumb is about
  // 16px wide and travels between 8px and 100% - 8px, so the labels are placed
  // on those same centres.
  const labelLeft = (index: number) =>
    `calc(8px + (100% - 16px) * ${index / (stops - 1)})`;
  return (
    <div className="flex w-full flex-col gap-3 px-8">
      <input
        type="range"
        min={1}
        max={stops}
        step={1}
        value={level}
        onChange={(event) => onChange(Number(event.target.value))}
        aria-label="How botched"
        aria-valuetext={BOTCHED_LEVEL_LABELS[level - 1]}
        className="w-full cursor-pointer accent-brand-red pointer-coarse:h-8"
      />
      <div className="relative h-5">
        {BOTCHED_LEVEL_LABELS.map((label, index) => (
          <button
            key={label}
            type="button"
            onClick={() => onChange(index + 1)}
            style={{ left: labelLeft(index) }}
            className={cn(
              "absolute top-0 -translate-x-1/2 cursor-pointer font-display text-sm leading-none tracking-[0.1em] whitespace-nowrap transition-colors duration-200 hover:text-brand-yellow focus-visible:outline-none",
              index + 1 === level ? "text-brand-yellow" : "text-brand-red",
            )}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

// The pop-up for the B (Botched) size: what B means, the customer's height on
// two timer-style wheels so the founder has an idea what to cut it to, and how
// botched they want it. DONE hands the fit back; CANCEL (or Escape, or the
// backdrop) closes without one. Portalled to the body: it is opened from inside
// the order form and from the cart corner.
export function BotchedDialog({
  initial,
  onDone,
  onCancel,
}: {
  initial: BotchedFit | null;
  onDone: (fit: BotchedFit) => void;
  onCancel: () => void;
}) {
  const [feet, setFeet] = useState(initial?.feet ?? 5);
  const [inches, setInches] = useState(initial?.inches ?? 6);
  const [level, setLevel] = useState(initial?.level ?? 2);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onCancel();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onCancel]);

  return createPortal(
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-ink/80 px-5"
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Botched"
        onClick={(event) => event.stopPropagation()}
        className="brat flex w-full max-w-xl flex-col items-center gap-8 rounded-3xl border border-brand-red/70 bg-ink/95 p-9 text-center text-brand-red"
      >
        {/* INVENTED wording, close to the founder's own; his to review. */}
        <p className="font-display text-lg leading-snug tracking-[0.1em] uppercase">
          IF YOU WANT SOMETHING &quot;BOTCHED,&quot; YOU WANT IT XL WITH RIPPED
          HEMS TO YOUR DIMENSIONS
        </p>
        <p className="font-display text-lg tracking-[0.1em] uppercase">
          YOUR HEIGHT
        </p>
        <div className="flex items-center justify-center gap-6">
          <Wheel
            values={feetValues}
            value={feet}
            onChange={setFeet}
            label="Feet"
            unit="FT"
            autoFocus
            onEnter={() => onDone({ feet, inches, level })}
          />
          <Wheel
            values={inchValues}
            value={inches}
            onChange={setInches}
            label="Inches"
            unit="IN"
            onEnter={() => onDone({ feet, inches, level })}
          />
        </div>
        <p className="font-display text-lg tracking-[0.1em] uppercase">
          HOW BOTCHED?
        </p>
        <LevelSlider level={level} onChange={setLevel} />
        <div className="flex gap-10">
          <button type="button" onClick={onCancel} className={buttonClass}>
            CANCEL
          </button>
          <button
            type="button"
            onClick={() => onDone({ feet, inches, level })}
            className={buttonClass}
          >
            DONE
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
