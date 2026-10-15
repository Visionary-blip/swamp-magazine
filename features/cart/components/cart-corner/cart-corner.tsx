"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

import { sortSizes, type CartItem } from "../../lib/cart";
import { useCart } from "../cart-provider/cart-provider";

// The cart, drawn as what is in it: a small cutout per garment, in the order
// they were added, in the top-right corner. There is no cart page -- tapping a
// thumbnail goes to that product, and two tiny controls appear under it on
// hover: the size picked (opens a thin menu of every size to change to) and an
// x that takes the garment out. Renders nothing while the cart is empty, so a
// first-time visitor never sees an empty widget.
//
// `fixed` floats it over the landing page; `inline` sits it in the product
// page's own top row, above the model credits, so the two never overlap.
export function CartCorner({ placement }: { placement: "fixed" | "inline" }) {
  const { items } = useCart();
  if (items.length === 0) return null;

  return (
    <ul
      aria-label="Your cart"
      className={cn(
        "flex flex-wrap justify-end gap-3",
        placement === "fixed" &&
          "fixed top-4 right-4 z-30 max-w-[60vw] md:top-6 md:right-8",
      )}
    >
      {items.map((item) => (
        <CartThumb key={`${item.slug}:${item.size}`} item={item} />
      ))}
    </ul>
  );
}

function CartThumb({ item }: { item: CartItem }) {
  const { removeItem, changeSize } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const root = useRef<HTMLLIElement>(null);

  // The menu is a popup: a tap anywhere else, or Escape, closes it.
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

  const sizes = sortSizes(item.sizes);
  // A garment saved with no size list (or only the one size) has nothing to
  // change to, so its size is shown but is not a button.
  const canChange = sizes.length > 1;
  const label = `${item.name}, size ${item.size}${item.quantity > 1 ? `, quantity ${item.quantity}` : ""}`;

  return (
    <li ref={root} className="group relative">
      <Link
        href={`/product/${item.slug}`}
        aria-label={label}
        className="relative block size-14 md:size-16"
      >
        {item.cutoutUrl ? (
          <Image
            src={item.cutoutUrl}
            alt={item.cutoutAlt || item.name}
            fill
            sizes="64px"
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

      {/* Hidden until the thumbnail is hovered or focused (and always shown on
          touch screens, where there is no hover); held open while the menu is. */}
      <div
        className={cn(
          "absolute top-full left-1/2 z-40 mt-1 flex -translate-x-1/2 items-start gap-1 opacity-0 transition-opacity duration-150 group-focus-within:opacity-100 group-hover:opacity-100 pointer-coarse:opacity-100",
          menuOpen && "opacity-100",
        )}
      >
        <div className="relative">
          <button
            type="button"
            disabled={!canChange}
            onClick={() => setMenuOpen((open) => !open)}
            aria-haspopup="listbox"
            aria-expanded={menuOpen}
            aria-label={`Size ${item.size}. ${canChange ? "Change size" : "Only size"}`}
            className="min-w-6 rounded-sm border border-brand-red/70 bg-ink/80 px-1.5 py-1 font-display text-xs leading-none text-brand-red uppercase transition-colors duration-200 hover:text-brand-yellow focus-visible:text-brand-yellow focus-visible:outline-none disabled:cursor-default disabled:hover:text-brand-red"
          >
            {item.size}
          </button>
          {menuOpen ? (
            <ul
              role="listbox"
              aria-label="Choose a size"
              className="absolute top-full left-1/2 mt-1 flex -translate-x-1/2 flex-col border border-brand-red/70 bg-ink/95"
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
                      "block w-full px-2.5 py-1 text-center font-display text-xs leading-none uppercase transition-colors duration-200 hover:text-brand-yellow focus-visible:text-brand-yellow focus-visible:outline-none",
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
          className="min-w-6 rounded-sm border border-brand-red/70 bg-ink/80 px-1.5 py-1 font-display text-xs leading-none text-brand-red transition-colors duration-200 hover:text-brand-yellow focus-visible:text-brand-yellow focus-visible:outline-none"
        >
          ×
        </button>
      </div>
    </li>
  );
}
