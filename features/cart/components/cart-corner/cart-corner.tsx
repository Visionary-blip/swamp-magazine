"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
// The add-ons step is a desktop page: a phone goes straight to the cart.
function sendPhoneToCart(
  event: { preventDefault: () => void },
  router: ReturnType<typeof useRouter>,
): boolean {
  if (!window.matchMedia("(max-width: 767px)").matches) return false;
  event.preventDefault();
  router.push("/checkout");
  return true;
}

export function CartCorner({ placement }: { placement: "fixed" | "inline" }) {
  const router = useRouter();
  const { items } = useCart();
  if (items.length === 0) return null;

  const fixed = placement === "fixed";
  const label = `Checkout: ${cartCount(items)} ${cartCount(items) === 1 ? "item" : "items"}, ${formatUsd(cartSubtotalCents(items))}`;

  return (
    <div
      role="group"
      aria-label="Your cart"
      className={cn(
        "relative flex max-w-[calc(100vw-1.5rem)] items-center gap-2 rounded-[2rem] p-2.5 md:flex-col md:items-end",
        fixed &&
          "fixed right-3 bottom-3 z-30 pb-[max(0.625rem,env(safe-area-inset-bottom))] md:top-6 md:right-8 md:bottom-auto md:pb-2.5",
      )}
    >
      {/* The whole area is a link to the cart page, sitting behind the garments
          so the padding around them is pressable too. It draws nothing; a
          keyboard focus ring is the only time it shows. */}
      <Link
        href="/add-ons"
        aria-label={label}
        onClick={(event) => {
          sendPhoneToCart(event, router);
        }}
        className="absolute inset-0 rounded-[2rem] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-yellow"
      />
      {/* What the cart comes to, left of the garments. Not a target of its
          own: the link behind it takes the press. */}
      <p className="pointer-events-none relative z-10 font-display text-[15px] leading-none text-brand-red md:text-[19px]">
        {formatUsd(cartSubtotalCents(items))}
      </p>
      <ul className="relative z-10 flex flex-wrap items-center justify-end gap-2 md:flex-col md:flex-nowrap md:items-end">
        {/* Add-ons are not garments: they ride in the total, not the row. */}
        {items
          .filter((item) => !item.addOn)
          .map((item) => (
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
  const router = useRouter();
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
  // On desktop the cart runs down the screen, so a garment's two controls sit to
  // its left, size above remove (there is always room: the corner hugs the right
  // edge), rather than under it, where they would cover the next garment. On a
  // phone the cart runs across, so they sit above the garment side by side. The
  // size menu opens further left either way, level with its button.
  return (
    <li ref={root} className="group relative">
      <Link
        href="/add-ons"
        aria-label={label}
        onClick={(event) => {
          // On a phone the first tap on a garment opens its controls and a
          // second goes to the cart page; with a mouse a click always goes.
          if (!tapped && window.matchMedia("(hover: none)").matches) {
            event.preventDefault();
            setTapped(true);
            return;
          }
          sendPhoneToCart(event, router);
        }}
        className={cn(
          "relative block",
          fixed
            ? "size-[70px] md:size-[120px]"
            : "size-[105px] md:size-[120px]",
        )}
      >
        {item.cutoutUrl ? (
          <Image
            src={item.cutoutUrl}
            alt={item.cutoutAlt || item.name}
            fill
            sizes="120px"
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
          "absolute bottom-full left-1/2 z-40 mb-1 flex -translate-x-1/2 flex-row items-center gap-1.5 opacity-0 md:top-1/2 md:right-full md:bottom-auto md:left-auto md:mr-1 md:mb-0 md:translate-x-0 md:-translate-y-1/2 md:flex-col transition-opacity duration-150 group-focus-within:opacity-100 group-hover:opacity-100",
          open && "opacity-100",
        )}
      >
        {/* A mouse opens the sizes by pointing at the button and closes them on
            leaving; a finger has no hover, so a tap toggles as before. The
            menu is a child of this wrapper, so moving onto it is not leaving. */}
        <div
          className="relative"
          onPointerEnter={(event) => {
            if (event.pointerType === "mouse" && canChange) setMenuOpen(true);
          }}
          onPointerLeave={(event) => {
            if (event.pointerType === "mouse") setMenuOpen(false);
          }}
        >
          <button
            type="button"
            disabled={!canChange}
            onClick={(event) => {
              // After a hover has opened it, a mouse click keeps it open
              // rather than snapping it shut under the pointer.
              const mouse =
                (event.nativeEvent as PointerEvent).pointerType === "mouse";
              setMenuOpen((current) => (mouse ? true : !current));
            }}
            aria-haspopup="listbox"
            aria-expanded={menuOpen}
            aria-label={`Size ${item.size}. ${canChange ? "Change size" : "Only size"}`}
            className="flex size-6 items-center justify-center rounded-full border border-brand-red/70 bg-ink/80 font-display text-xs leading-none text-brand-red uppercase transition-colors duration-200 hover:text-brand-yellow hover:border-brand-yellow focus-visible:text-brand-yellow focus-visible:border-brand-yellow focus-visible:outline-none disabled:cursor-default disabled:hover:text-brand-red disabled:hover:border-brand-red/70 pointer-coarse:size-10 pointer-coarse:text-sm"
          >
            {item.size}
          </button>
          {menuOpen ? (
            // The padding is the gap between the button and the row, kept
            // inside the wrapper so the pointer never crosses dead space.
            <div className="absolute top-1/2 right-full -translate-y-1/2 pr-1">
              <ul
                role="listbox"
                aria-label="Choose a size"
                className="flex flex-row overflow-hidden rounded-2xl border border-brand-red/70 bg-ink/95"
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
            </div>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => removeItem(item.slug, item.size)}
          aria-label={`Remove ${item.name}, size ${item.size}`}
          className="flex size-6 items-center justify-center rounded-full border border-brand-red/70 bg-ink/80 text-brand-red transition-colors duration-200 hover:text-brand-yellow hover:border-brand-yellow focus-visible:text-brand-yellow focus-visible:border-brand-yellow focus-visible:outline-none pointer-coarse:size-10"
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
