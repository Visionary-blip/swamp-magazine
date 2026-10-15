"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { formatUsd } from "@/lib/money";
import { cn } from "@/lib/utils";

import {
  cartCount,
  cartSubtotalCents,
  sortSizes,
  type CartItem,
} from "../../lib/cart";
import { useCart } from "../cart-provider/cart-provider";

// The cart, drawn as what is in it: a small cutout per garment, in the order
// they were added. Pressing them -- or the padding around them, which is an
// invisible hit area the size of a bubble -- opens the cart page, so there is
// no separate button to read and nothing drawn around the garments.
//
// Phones: on the landing page it floats at the bottom right, where a thumb
// reaches and where it covers little; on a product page it sits in the page's
// own top row. The first tap on a garment opens its two controls (size menu,
// remove), since there is no hover on a phone; a second tap goes to the cart
// page.
// Desktop: a floating corner top right. Hovering a garment shows the same two
// controls, and clicking anywhere on the bubble opens the cart page.
//
// Renders nothing while the cart is empty, so a first-time visitor never sees an
// empty widget.
export function CartCorner({ placement }: { placement: "fixed" | "inline" }) {
  const { items } = useCart();
  if (items.length === 0) return null;

  const fixed = placement === "fixed";
  const label = `Checkout: ${cartCount(items)} ${cartCount(items) === 1 ? "item" : "items"}, ${formatUsd(cartSubtotalCents(items))}`;

  return (
    <div
      role="group"
      aria-label="Your cart"
      className={cn(
        "relative flex max-w-[calc(100vw-1.5rem)] flex-wrap items-center justify-end gap-2 rounded-[2rem] p-2.5",
        fixed &&
          "fixed right-3 bottom-3 z-30 pb-[max(0.625rem,env(safe-area-inset-bottom))] md:top-6 md:right-8 md:bottom-auto md:pb-2.5",
      )}
    >
      {/* The whole area is a link to the cart page, sitting behind the garments
          so the padding around them is pressable too. It draws nothing; a
          keyboard focus ring is the only time it shows. */}
      <Link
        href="/checkout"
        aria-label={label}
        className="absolute inset-0 rounded-[2rem] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-yellow"
      />
      <ul className="relative z-10 flex flex-wrap justify-end gap-2">
        {items.map((item) => (
          <CartThumb
            key={`${item.slug}:${item.size}`}
            item={item}
            fixed={fixed}
          />
        ))}
      </ul>
    </div>
  );
}

function CartThumb({ item, fixed }: { item: CartItem; fixed: boolean }) {
  const { removeItem, changeSize } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  // Touch only: a tap opens the controls. On a pointer that can hover they show
  // on hover or focus instead, and a click goes to the cart page.
  const [tapped, setTapped] = useState(false);
  const root = useRef<HTMLLIElement>(null);

  // A tap anywhere else, or Escape, closes the menu and the controls.
  const open = menuOpen || tapped;
  useEffect(() => {
    if (!open) return;
    function close() {
      setMenuOpen(false);
      setTapped(false);
    }
    function onPointerDown(event: PointerEvent) {
      if (!root.current?.contains(event.target as Node)) close();
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") close();
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const sizes = sortSizes(item.sizes);
  // A garment saved with no size list (or only the one size) has nothing to
  // change to, so its size is shown but is not a button.
  const canChange = sizes.length > 1;
  const label = `${item.name}, size ${item.size}${item.quantity > 1 ? `, quantity ${item.quantity}` : ""}`;
  // On the bottom bar the controls and the menu open upward, so they never run
  // off the bottom of a phone screen; from md up (a floating corner) they open
  // downward as before.
  const up = fixed
    ? "bottom-full mb-1 md:top-full md:bottom-auto md:mt-1 md:mb-0"
    : "top-full mt-1";
  const menuUp = fixed
    ? "bottom-full mb-1 md:top-full md:bottom-auto md:mt-1 md:mb-0"
    : "top-full mt-1";

  return (
    <li ref={root} className="group relative">
      <Link
        href="/checkout"
        aria-label={label}
        onClick={(event) => {
          // On a phone the first tap on a garment opens its controls and a
          // second goes to the cart page; with a mouse a click always goes.
          if (!tapped && window.matchMedia("(hover: none)").matches) {
            event.preventDefault();
            setTapped(true);
          }
        }}
        className={cn(
          "relative block",
          fixed ? "size-14 md:size-24" : "size-[84px] md:size-24",
        )}
      >
        {item.cutoutUrl ? (
          <Image
            src={item.cutoutUrl}
            alt={item.cutoutAlt || item.name}
            fill
            sizes="96px"
            className="object-contain drop-shadow-lg"
          />
        ) : (
          <span className="brat flex size-full items-center justify-center text-brand-red">
            {item.name.slice(0, 1)}
          </span>
        )}
        {item.quantity > 1 ? (
          <span className="absolute -top-1 -right-1 font-display text-xs leading-none text-brand-yellow">
            ×{item.quantity}
          </span>
        ) : null}
      </Link>

      <div
        className={cn(
          "absolute left-1/2 z-40 flex -translate-x-1/2 items-start gap-1.5 opacity-0 transition-opacity duration-150 group-focus-within:opacity-100 group-hover:opacity-100",
          up,
          open && "opacity-100",
        )}
      >
        <div className="relative">
          <button
            type="button"
            disabled={!canChange}
            onClick={() => setMenuOpen((current) => !current)}
            aria-haspopup="listbox"
            aria-expanded={menuOpen}
            aria-label={`Size ${item.size}. ${canChange ? "Change size" : "Only size"}`}
            className="flex size-6 items-center justify-center rounded-full border border-brand-red/70 bg-ink/80 font-display text-xs leading-none text-brand-red uppercase transition-colors duration-200 hover:text-brand-yellow focus-visible:text-brand-yellow focus-visible:outline-none disabled:cursor-default disabled:hover:text-brand-red pointer-coarse:size-10 pointer-coarse:text-sm"
          >
            {item.size}
          </button>
          {menuOpen ? (
            <ul
              role="listbox"
              aria-label="Choose a size"
              className={cn(
                "absolute left-1/2 flex -translate-x-1/2 flex-col overflow-hidden rounded-2xl border border-brand-red/70 bg-ink/95",
                menuUp,
              )}
            >
              {sizes.map((option) => (
                <li
                  key={option.size}
                  role="option"
                  aria-selected={option.size === item.size}
                >
                  <button
                    type="button"
                    disabled={option.soldOut && option.size !== item.size}
                    onClick={() => {
                      changeSize(item.slug, item.size, option.size);
                      setMenuOpen(false);
                    }}
                    className={cn(
                      "block w-full px-3 py-1 text-center font-display text-xs leading-none uppercase transition-colors duration-200 hover:text-brand-yellow focus-visible:text-brand-yellow focus-visible:outline-none pointer-coarse:min-w-11 pointer-coarse:py-3 pointer-coarse:text-sm",
                      option.size === item.size
                        ? "text-brand-yellow"
                        : "text-brand-red",
                      option.soldOut &&
                        option.size !== item.size &&
                        "cursor-not-allowed line-through opacity-40 hover:text-brand-red",
                    )}
                  >
                    {option.size}
                    {option.soldOut && option.size !== item.size ? (
                      <span className="sr-only"> sold out</span>
                    ) : null}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => removeItem(item.slug, item.size)}
          aria-label={`Remove ${item.name}, size ${item.size}`}
          className="flex size-6 items-center justify-center rounded-full border border-brand-red/70 bg-ink/80 text-brand-red transition-colors duration-200 hover:text-brand-yellow focus-visible:text-brand-yellow focus-visible:outline-none pointer-coarse:size-10"
        >
          {/* A drawn X rather than the font's multiplication sign: Anton's is a
              speck at any size. Only the mark is sized; the round button around
              it keeps its own size. */}
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
      </div>
    </li>
  );
}
