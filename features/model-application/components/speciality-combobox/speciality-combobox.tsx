"use client";

import { useEffect, useId, useRef, useState } from "react";

import { cn } from "@/lib/utils";

import {
  creativeSpecialities,
  involvementInputClasses as inputClasses,
} from "../../lib/involvement-copy";

// The speciality field: a text input that suggests from the founder's list as
// they type, in a menu drawn in the site's own language (the cart corner's size
// menu: rounded, thin red ring, Anton caps, yellow on hover) instead of the
// browser's native datalist popup, which no stylesheet can reach. Anything typed
// is still accepted -- the list is a suggestion, not a gate.
export function SpecialityCombobox() {
  const listId = useId();
  const root = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);

  const query = value.trim().toUpperCase();
  const matches = creativeSpecialities.filter((option) =>
    option.includes(query),
  );
  const showing = open && matches.length > 0;

  // A press anywhere else closes the menu, like the cart's size menu.
  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  function choose(option: string) {
    setValue(option);
    setOpen(false);
    setActive(-1);
  }

  return (
    <div ref={root} className="relative flex flex-col gap-1">
      <label
        htmlFor={`${listId}-input`}
        className="font-body text-xs tracking-widest"
      >
        YOUR SPECIALITY
      </label>
      <input
        id={`${listId}-input`}
        className={inputClasses}
        type="text"
        name="speciality"
        required
        maxLength={60}
        autoComplete="off"
        placeholder="START TYPING"
        value={value}
        role="combobox"
        aria-expanded={showing}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={
          showing && active >= 0 ? `${listId}-${active}` : undefined
        }
        onChange={(event) => {
          setValue(event.target.value);
          setOpen(true);
          setActive(-1);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setOpen(true);
            setActive((index) => (index + 1) % Math.max(matches.length, 1));
          } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setOpen(true);
            setActive(
              (index) =>
                (index - 1 + matches.length) % Math.max(matches.length, 1),
            );
          } else if (event.key === "Enter" && showing && active >= 0) {
            // Picks the highlighted suggestion instead of submitting the form.
            event.preventDefault();
            choose(matches[active]);
          } else if (event.key === "Escape") {
            setOpen(false);
          }
        }}
      />
      {showing ? (
        <ul
          id={listId}
          role="listbox"
          aria-label="Specialities"
          className="absolute top-full right-0 left-0 z-20 mt-1 flex flex-col overflow-hidden rounded-2xl border border-brand-red/70 bg-ink/95"
        >
          {matches.map((option, index) => (
            <li
              key={option}
              id={`${listId}-${index}`}
              role="option"
              aria-selected={index === active}
              // mousedown, not click: the input would blur first and the
              // outside-press handler could close the menu before the choice.
              onMouseDown={(event) => {
                event.preventDefault();
                choose(option);
              }}
              onMouseEnter={() => setActive(index)}
              className={cn(
                "cursor-pointer px-4 py-2.5 font-display text-sm leading-none tracking-[0.1em] uppercase transition-colors duration-150 pointer-coarse:py-3.5",
                index === active ? "text-brand-yellow" : "text-brand-red",
              )}
            >
              {option}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
