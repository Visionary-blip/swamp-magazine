"use client";

import { useRouter } from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
  useTransition,
  type FormEvent,
  type ReactNode,
} from "react";

import { createCheckoutSession } from "@/actions/create-checkout-session";
import { dials } from "@/config/dials";
import { BotchedDialog, useCart, type CartItem } from "@/features/cart";
import { useProductOverlay } from "@/features/transition";
import {
  botchedBaseSize,
  botchedOffered,
  BOTCHED_SIZE,
  BOTCHED_LEVEL_LABELS,
  botchedSize,
  type BotchedFit,
  parseBotchedSize,
} from "@/lib/checkout/botched";
import {
  designQuantity,
  designsFor,
  pairDesign,
  withDesign,
} from "@/lib/checkout/designs";
import { lineTotalCents } from "@/lib/checkout/packs";
import { cn } from "@/lib/utils";

import type { LedgerLine } from "../order-ledger/order-ledger";
import { PaymentStation } from "../payment-station/payment-station";
import {
  formatUsd,
  orderCopy,
  orderErrorLines,
  soldOutLine,
  type OrderErrorReason,
} from "../../lib/order-copy";
import { deliveryOptions } from "../../lib/delivery-options";
import { ExModelDialog } from "../ex-model-dialog/ex-model-dialog";
import { markExModelUsed, useExModelUsed } from "../../lib/ex-model-used";
import { useSetPairView } from "../pair-view/pair-view";
import { scrollIntoViewOnMount } from "../../lib/scroll";
import { stripePromise } from "../../lib/stripe-client";

/** Structurally the storefront's `ProductVariant`, declared here so the order
 * form doesn't depend on the catalog lane's file. */
export type CheckoutVariant = { size: string; soldOut: boolean };

export type CheckoutFormProps = {
  slug: string;
  name: string;
  priceCents: number;
  variants: CheckoutVariant[];
  /** The garment's cutout, kept in the cart so its corner thumbnail can draw. */
  cutout: { url: string; alt: string } | null;
  /** Drawn between the title and the size bars (the page's "more below" arrow). */
  scrollCue?: ReactNode;
};

// The poster's bottom block (the founder's order mockups): red Anton set
// straight onto the shoot, centred like the YZY store, reading top to bottom as
// size, delivery, then "+" (put it in the cart and go back to the grid) and
// place order. PLACE ORDER pays for the whole cart plus whatever size is picked
// on this page. Every line is the same size -- `brat` owns it. Red is the ink,
// yellow is "this one is live", and the card step sits on a solid panel because
// Stripe's fields need a flat ground.
export function CheckoutForm({
  slug,
  name,
  priceCents,
  variants,
  cutout,
  scrollCue,
}: CheckoutFormProps) {
  const router = useRouter();
  const overlay = useProductOverlay();
  const cart = useCart();
  // Delivery is one choice for the whole order, so it lives with the cart and
  // follows the customer from product page to product page.
  const { delivery, setDelivery } = cart;
  const [size, setSize] = useState<string | null>(null);
  // What a Botched garment is cut to (height and how botched); null until the
  // pop-up has been answered.
  const [fit, setFit] = useState<BotchedFit | null>(null);
  // Which design, on a garment that has them (EX-MODEL, SWEET DREAMS, BOTH).
  const designs = designsFor(slug);
  // One design, or BOTH: two shirts shown, each with a design of its own.
  const [mode, setMode] = useState<string | null>(null);
  const [pairPicks, setPairPicks] = useState<[string | null, string | null]>([
    null,
    null,
  ]);
  const setPairView = useSetPairView();
  const design =
    mode === "BOTH"
      ? pairPicks[0] && pairPicks[1]
        ? pairDesign(pairPicks[0], pairPicks[1])
        : null
      : mode;
  // "WHY NOT?" fades in and out when BOTH is picked.
  const [whyNot, setWhyNot] = useState(false);
  const whyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (whyTimer.current) clearTimeout(whyTimer.current);
      // Leaving the page puts the one big picture back.
      setPairView(false);
    },
    [setPairView],
  );
  const [botchedOpen, setBotchedOpen] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [errorReason, setErrorReason] = useState<OrderErrorReason | null>(null);
  // Sizes the server refused after this page rendered. Stock is the DB's word,
  // never the client's, so a "sold-out" answer has to beat the snapshot this
  // component was handed.
  const [refusedSizes, setRefusedSizes] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  // Names the garment a sold-out refusal was about ("STAR SHORTS S IS GONE").
  const [goneLine, setGoneLine] = useState<string | null>(null);
  // The form reveals itself one step at a time: size, then delivery, then the
  // buttons. A cart already carries a delivery choice (made on the cart page);
  // otherwise it counts only once it has been picked on this page, because the
  // cart's default is not a choice the customer made.
  const [deliveryPicked, setDeliveryPicked] = useState(false);
  const [exModelOpen, setExModelOpen] = useState(false);
  const [exModelPlaced, setExModelPlaced] = useState(false);
  const exModelUsed = useExModelUsed();

  const plainSizes = variants.map((variant) => ({
    size: variant.size,
    soldOut: variant.soldOut || refusedSizes.includes(variant.size),
  }));
  // B (Botched) is the XL with ripped hems (the largest size where there is no
  // XL), offered on the tees only, and sold out when that size is.
  const baseSizeName = botchedOffered(slug)
    ? botchedBaseSize(plainSizes.map((option) => option.size))
    : null;
  const baseSize = plainSizes.find((option) => option.size === baseSizeName);
  const sizes = baseSize
    ? [...plainSizes, { size: BOTCHED_SIZE, soldOut: baseSize.soldOut }]
    : plainSizes;
  // The size that goes on the order line: a Botched one carries the fit, and
  // there is none until the pop-up has been answered.
  const pickedSize =
    size === BOTCHED_SIZE ? (fit ? botchedSize(fit) : null) : size;
  // A garment with designs needs one chosen before it can be ordered.
  const orderSize =
    pickedSize && designs.length > 0
      ? design
        ? withDesign(pickedSize, design)
        : null
      : pickedSize;
  const deliveryChosen = cart.items.length > 0 || deliveryPicked;
  const allGone =
    plainSizes.length === 0 || plainSizes.every((option) => option.soldOut);

  // What would be ordered right now: the cart, plus the size picked here.
  const selected: CartItem | null = orderSize
    ? {
        slug,
        size: orderSize,
        // B stays on the list, so the cart can switch to it and back. A design
        // is part of the size text, so those lines are changed by re-adding.
        sizes: designs.length > 0 ? [] : sizes,
        quantity: design ? designQuantity(design) : 1,
        name,
        priceCents,
        cutoutUrl: cutout?.url ?? null,
        cutoutAlt: cutout?.alt ?? "",
      }
    : null;
  const orderItems = mergeItems(
    selected ? [...cart.items, selected] : cart.items,
  );

  const subtotalCents = orderItems.reduce(
    (sum, item) =>
      sum + lineTotalCents(item.slug, item.priceCents, item.quantity),
    0,
  );
  const shippingCents =
    delivery === "shipping" && orderItems.length > 0
      ? dials.shippingFlatRateCents
      : 0;
  const totalCents = subtotalCents + shippingCents;
  const deliveryLabel =
    delivery === "shipping" ? orderCopy.shipping : orderCopy.pickup;
  const ledgerLines: LedgerLine[] = orderItems.map((item) => ({
    label: `${item.name.toUpperCase()}${item.addOn ? "" : ` ${item.size}`}${item.quantity > 1 ? ` ×${item.quantity}` : ""}`,
    amountCents: lineTotalCents(item.slug, item.priceCents, item.quantity),
  }));

  // The button states the whole charge as one number: the order plus shipping
  // if that is the choice. Nobody should learn it inside the card fields.
  // "TOTAL" only says something once the number adds several garments up.
  const buyLabel = `${orderCopy.next} ${formatUsd(totalCents)}${
    orderItems.reduce((sum, item) => sum + item.quantity, 0) > 1
      ? ` ${orderCopy.total}`
      : ""
  }`;

  // "+": the garment goes in the cart and the customer goes back to the grid to
  // pick the next one. The size resets so coming back later starts fresh.
  function handleAdd() {
    if (!selected || isPending) return;
    cart.addItem(selected);
    setSize(null);
    setFit(null);
    setMode(null);
    setPairView(false);
    setPairPicks([null, null]);
    // In the landing's overlay "back to the grid" is closing the overlay.
    if (overlay) overlay.close();
    else router.push("/#products");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isPending) return;
    if (!selected || !deliveryChosen) return;
    setErrorReason(null);
    setGoneLine(null);
    startTransition(async () => {
      const result = await createCheckoutSession({
        items: orderItems.map((item) => ({
          slug: item.slug,
          size: item.size,
          quantity: item.quantity,
        })),
        delivery,
      });
      if (result.status === "success") {
        setClientSecret(result.clientSecret);
        setOrderId(result.orderId);
        return;
      }
      setErrorReason(result.reason);
      if (result.reason === "sold-out") {
        const gone = result.item;
        if (gone && gone.slug === slug) {
          // A Botched line is cut from the XL, so it is the XL that ran out.
          const goneVariant = parseBotchedSize(gone.size)
            ? (baseSizeName ?? gone.size)
            : gone.size;
          setRefusedSizes((current) => [...current, goneVariant]);
          if (orderSize === gone.size || size === goneVariant) setSize(null);
        }
        // Whatever ran out, it cannot stay in the cart: leaving it would fail
        // the next attempt the same way.
        if (gone) {
          const goneName =
            gone.slug === slug
              ? name
              : (cart.items.find((item) => item.slug === gone.slug)?.name ??
                "THAT ONE");
          setGoneLine(soldOutLine(goneName, gone.size));
          cart.removeItem(gone.slug, gone.size);
        }
      }
    });
  }

  // Dropping the secret is all it takes to get back to the size row: nothing is
  // charged until confirm, so the abandoned session and its pending order are
  // exactly what closing the tab would have left behind. The alternative -- no
  // way back at all -- made a mis-picked size a page reload.
  function handleChangeSize() {
    setClientSecret(null);
    setOrderId(null);
    setErrorReason(null);
    setGoneLine(null);
  }

  if (!stripePromise || errorReason === "stripe-unconfigured") {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        {/* The sizes stay on the page when ordering is not armed yet: dropping
            them would take the row the mockups are built around off the
            product screen, so an un-keyed deploy would read as broken rather
            than as not open yet. */}
        <h1 className="brat text-brand-red">{name}</h1>
        <ul className="brat flex flex-wrap justify-center gap-x-8 text-brand-red">
          {plainSizes.map((option) => (
            <li
              key={option.size}
              className={option.soldOut ? "line-through opacity-40" : ""}
            >
              {option.size}
              {option.soldOut ? (
                <span className="sr-only"> sold out</span>
              ) : null}
            </li>
          ))}
        </ul>
        <p className="brat text-brand-red">{formatUsd(priceCents)}</p>
        <p className="brat text-brand-red">
          {orderErrorLines["stripe-unconfigured"]}
        </p>
      </div>
    );
  }

  if (clientSecret) {
    return (
      <div
        ref={scrollIntoViewOnMount}
        className="mx-auto w-full max-w-md bg-ink/95 p-6"
      >
        <PaymentStation
          clientSecret={clientSecret}
          orderId={orderId}
          lines={ledgerLines}
          delivery={delivery}
          deliveryLabel={deliveryLabel}
          shippingCents={shippingCents}
          totalCents={totalCents}
          onChangeSize={handleChangeSize}
          topSlot={
            <>
              {/* For former models: the order goes through without a charge,
                  once, and the button is gone afterwards. */}
              {exModelUsed ? null : (
                <button
                  type="button"
                  onClick={() => setExModelOpen(true)}
                  className="brat cursor-pointer px-1 py-2 text-brand-red transition-colors duration-200 hover:text-brand-yellow focus-visible:underline focus-visible:underline-offset-8"
                >
                  I&apos;M AN EX-MODEL
                </button>
              )}
              {exModelOpen ? (
                <ExModelDialog
                  items={orderItems.map((item) => ({
                    slug: item.slug,
                    size: item.size,
                    quantity: item.quantity,
                  }))}
                  delivery={delivery}
                  onClose={() => {
                    setExModelOpen(false);
                    // The order is made, so the card step has nothing left to do.
                    if (exModelPlaced) {
                      setExModelPlaced(false);
                      handleChangeSize();
                    }
                  }}
                  onPlaced={() => {
                    markExModelUsed();
                    cart.clear();
                    setSize(null);
                    setExModelPlaced(true);
                  }}
                />
              ) : null}
            </>
          }
        />
      </div>
    );
  }

  // `stripe-unconfigured` already returned above, so every reason that reaches
  // here is one the buyer can act on.
  const errorLine =
    goneLine ?? (errorReason ? orderErrorLines[errorReason] : null);

  return (
    <form
      onSubmit={handleSubmit}
      // On a phone the steps are full-bleed bars that touch (like the WORLD page's
      // rows): the form pulls out of the poster's side padding and each step's
      // buttons share the screen's width equally.
      className="flex flex-col items-center gap-3 text-center max-md:-mx-5 max-md:gap-0"
    >
      <h1 className="brat text-brand-red max-md:mb-4">{name}</h1>
      {scrollCue}

      {/* Which design: one of the two, or BOTH (a pair, at the two-pack price). */}
      {designs.length > 0 ? (
        <fieldset disabled={isPending} className="max-md:w-full">
          <legend className="sr-only">DESIGN</legend>
          <div className="brat flex flex-wrap justify-center gap-x-6 max-md:flex-nowrap max-md:gap-x-0 max-md:divide-x max-md:divide-brand-red/40 max-md:border-y max-md:border-brand-red/40 max-md:bg-ink/55">
            {(mode === "BOTH" ? ["BOTH"] : [...designs, "BOTH"]).map(
              (option) => (
                <label
                  key={option}
                  className={cn(
                    "cursor-pointer px-1 py-2 transition-colors duration-200 max-md:flex max-md:min-h-16 max-md:flex-1 max-md:items-center max-md:justify-center",
                    mode === option
                      ? "text-brand-yellow"
                      : "text-brand-red hover:text-brand-yellow",
                  )}
                >
                  <input
                    type="radio"
                    name="design"
                    value={option}
                    checked={mode === option}
                    onChange={() => {
                      setMode(option);
                      setPairView(option === "BOTH");
                      if (option === "BOTH") {
                        setWhyNot(true);
                        if (whyTimer.current) clearTimeout(whyTimer.current);
                        whyTimer.current = setTimeout(
                          () => setWhyNot(false),
                          500,
                        );
                      }
                    }}
                    className="peer sr-only"
                  />
                  <span className="peer-focus-visible:underline peer-focus-visible:underline-offset-8">
                    {option}
                  </span>
                </label>
              ),
            )}
            {/* With BOTH picked the row is just BOTH and the way back to one. */}
            {mode === "BOTH" ? (
              <button
                type="button"
                onClick={() => {
                  setMode(null);
                  setPairView(false);
                  setPairPicks([null, null]);
                }}
                className="cursor-pointer px-1 py-2 text-brand-red transition-colors duration-200 hover:text-brand-yellow focus-visible:underline focus-visible:underline-offset-8 max-md:flex max-md:min-h-16 max-md:flex-1 max-md:items-center max-md:justify-center"
              >
                JUST ONE
              </button>
            ) : null}
          </div>
        </fieldset>
      ) : null}

      {/* BOTH: two shirts side by side, each with its design to pick, stacked. */}
      {mode === "BOTH" ? (
        <div className="flex justify-center gap-10 max-md:gap-6">
          {[0, 1].map((index) => (
            <fieldset
              key={index}
              disabled={isPending}
              className="flex flex-col items-center gap-1"
            >
              <legend className="sr-only">SHIRT {index + 1} DESIGN</legend>
              {designs.map((option) => (
                <label
                  key={option}
                  className={cn(
                    "brat cursor-pointer px-1 py-1 transition-colors duration-200",
                    pairPicks[index] === option
                      ? "text-brand-yellow"
                      : "text-brand-red hover:text-brand-yellow",
                  )}
                >
                  <input
                    type="radio"
                    name={`pair-${index}`}
                    value={option}
                    checked={pairPicks[index] === option}
                    onChange={() =>
                      setPairPicks((current) =>
                        index === 0
                          ? [option, current[1]]
                          : [current[0], option],
                      )
                    }
                    className="peer sr-only"
                  />
                  <span className="peer-focus-visible:underline peer-focus-visible:underline-offset-8">
                    {option}
                  </span>
                </label>
              ))}
            </fieldset>
          ))}
        </div>
      ) : null}
      {/* On a garment with designs, the design comes first and the sizes only
          show once it is chosen. */}
      {designs.length === 0 || design ? (
        <fieldset disabled={isPending} className="max-md:w-full">
          <legend className="sr-only">{orderCopy.size}</legend>
          <div className="brat flex flex-wrap justify-center gap-x-6 max-md:flex-nowrap max-md:gap-x-0 max-md:divide-x max-md:divide-brand-red/40 max-md:border-y max-md:border-brand-red/40 max-md:bg-ink/55">
            {sizes.map((option) => (
              <label
                key={option.size}
                className={cn(
                  "cursor-pointer px-1 py-2 transition-colors duration-200 max-md:flex max-md:min-h-16 max-md:flex-1 max-md:items-center max-md:justify-center",
                  option.soldOut
                    ? "cursor-not-allowed text-brand-red line-through opacity-40"
                    : size === option.size
                      ? "text-brand-yellow"
                      : "text-brand-red hover:text-brand-yellow",
                )}
              >
                <input
                  type="radio"
                  name="size"
                  value={option.size}
                  checked={size === option.size}
                  disabled={option.soldOut}
                  onChange={() => {
                    setSize(option.size);
                    // B opens its pop-up (what it means, and the height wheels).
                    if (option.size === BOTCHED_SIZE) setBotchedOpen(true);
                  }}
                  // A radio cannot be unchecked by clicking it (no change event
                  // fires), so the size picked is toggled off here instead; Space
                  // does the same from the keyboard.
                  onClick={() => {
                    if (size === option.size) setSize(null);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === " " && size === option.size) {
                      event.preventDefault();
                      setSize(null);
                    }
                  }}
                  className="peer sr-only"
                />
                <span className="peer-focus-visible:underline peer-focus-visible:underline-offset-8">
                  {option.size}
                  {/* The strike-through is the sighted cue; disabled alone does
                    not say why, so screen readers get the reason. */}
                  {option.soldOut ? (
                    <span className="sr-only"> sold out</span>
                  ) : null}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      ) : null}

      <p
        aria-hidden={!whyNot}
        className={cn(
          "pointer-events-none fixed inset-x-0 top-1/2 z-50 -translate-y-1/2 text-center font-display text-[26vw] leading-none whitespace-nowrap text-brand-yellow uppercase transition-opacity duration-500 ease-in-out",
          whyNot ? "opacity-75" : "opacity-0",
        )}
      >
        WHY NOT?
      </p>

      {size === BOTCHED_SIZE ? (
        <>
          {/* Once the height is in, it stays on show and reopens the pop-up. */}
          {orderSize && fit ? (
            <button
              type="button"
              onClick={() => setBotchedOpen(true)}
              disabled={isPending}
              className="brat cursor-pointer px-1 py-2 text-brand-red transition-colors duration-200 hover:text-brand-yellow focus-visible:underline focus-visible:underline-offset-8 disabled:cursor-not-allowed disabled:opacity-40 max-md:w-full max-md:border-y max-md:border-brand-red/40 max-md:bg-ink/55 max-md:py-4"
            >
              {fit.feet} FT {fit.inches} IN ·{" "}
              {BOTCHED_LEVEL_LABELS[fit.level - 1]}
            </button>
          ) : null}
          {botchedOpen ? (
            <BotchedDialog
              initial={fit}
              onDone={(picked) => {
                setFit(picked);
                setBotchedOpen(false);
              }}
              onCancel={() => {
                setBotchedOpen(false);
                // No height given, so B comes back off.
                if (!orderSize) setSize(null);
              }}
            />
          ) : null}
        </>
      ) : null}

      {/* With a cart, delivery is one choice for the whole order and is made on
          the cart page; asking again on every garment's page is a step the
          customer has already taken. The price terms below still show shipping
          when that is what they picked. */}
      {selected && cart.items.length === 0 ? (
        <fieldset disabled={isPending} className="max-md:w-full">
          <legend className="sr-only">DELIVERY</legend>
          <div className="brat flex flex-wrap justify-center gap-x-8 max-md:flex-nowrap max-md:gap-x-0 max-md:divide-x max-md:divide-brand-red/40 max-md:border-y max-md:border-brand-red/40 max-md:bg-ink/55">
            {deliveryOptions.map((option) => (
              <label
                key={option.value}
                className={cn(
                  "cursor-pointer px-1 py-2 transition-colors duration-200 max-md:flex max-md:min-h-16 max-md:flex-1 max-md:items-center max-md:justify-center",
                  deliveryPicked && delivery === option.value
                    ? "text-brand-yellow"
                    : "text-brand-red opacity-40 hover:text-brand-yellow hover:opacity-100",
                )}
              >
                <input
                  type="radio"
                  name="delivery"
                  value={option.value}
                  checked={deliveryPicked && delivery === option.value}
                  onChange={() => {
                    setDelivery(option.value);
                    setDeliveryPicked(true);
                  }}
                  className="peer sr-only"
                />
                <span className="peer-focus-visible:underline peer-focus-visible:underline-offset-8">
                  {option.label} {option.price}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      ) : null}

      {errorLine ? (
        <p role="alert" className="brat text-brand-red max-md:px-5 max-md:py-3">
          {errorLine}
        </p>
      ) : null}

      {allGone ? (
        <p className="brat text-brand-red max-md:px-5 max-md:py-3">
          {orderCopy.soldOut}
        </p>
      ) : selected && deliveryChosen ? (
        <>
          {/* The garment goes in the cart and the customer is sent back to the
              grid for the next one. */}
          {/* Side by side like the delivery choices above. */}
          <div className="brat flex flex-wrap justify-center gap-x-8 max-md:w-full max-md:flex-nowrap max-md:gap-x-0 max-md:divide-x max-md:divide-brand-red/40 max-md:border-y max-md:border-brand-red/40 max-md:bg-ink/55">
            <button
              type="button"
              onClick={handleAdd}
              disabled={isPending}
              aria-label={orderCopy.addToCart}
              className="cursor-pointer px-1 py-2 text-brand-red max-md:flex max-md:min-h-16 max-md:flex-1 max-md:items-center max-md:justify-center transition-colors duration-200 hover:text-brand-yellow focus-visible:underline focus-visible:underline-offset-8 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {/* The first garment starts the cart; after that it is added to it. */}
              {cart.items.length === 0
                ? orderCopy.makeCart
                : orderCopy.addToCartLabel}
            </button>
            {/* The total rides the button: nobody should learn the real charge
              inside the card fields. It covers everything in the cart. */}
            <button
              type="submit"
              disabled={isPending}
              className="cursor-pointer px-1 py-2 text-brand-red max-md:flex max-md:min-h-16 max-md:flex-1 max-md:items-center max-md:justify-center transition-colors duration-200 hover:text-brand-yellow focus-visible:underline focus-visible:underline-offset-8 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isPending ? orderCopy.submitPending : buyLabel}
            </button>
          </div>
        </>
      ) : null}
    </form>
  );
}

// The same garment in the same size is one line of two, so the ledger and the
// request both read the cart the way the server will.
function mergeItems(items: CartItem[]): CartItem[] {
  const merged: CartItem[] = [];
  for (const item of items) {
    const existing = merged.find(
      (line) => line.slug === item.slug && line.size === item.size,
    );
    if (existing) {
      existing.quantity += item.quantity;
    } else {
      merged.push({ ...item });
    }
  }
  return merged;
}
