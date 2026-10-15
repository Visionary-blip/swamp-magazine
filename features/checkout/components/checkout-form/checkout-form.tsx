"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";

import {
  createCheckoutSession,
  type DeliveryMethod,
} from "@/actions/create-checkout-session";
import { dials } from "@/config/dials";
import { useCart, type CartItem } from "@/features/cart";
import { cn } from "@/lib/utils";

import type { LedgerLine } from "../order-ledger/order-ledger";
import { PaymentStation } from "../payment-station/payment-station";
import {
  formatUsd,
  orderCopy,
  orderErrorLines,
  type OrderErrorReason,
} from "../../lib/order-copy";
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
};

const deliveryOptions: {
  value: DeliveryMethod;
  label: string;
  price: string;
}[] = [
  { value: "pickup", label: orderCopy.pickup, price: orderCopy.free },
  {
    value: "shipping",
    label: orderCopy.shipping,
    // The rate is the dial's, never a literal -- change it in config/dials.ts
    // and this line and the Stripe shipping option move together.
    price: formatUsd(dials.shippingFlatRateCents),
  },
];

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
}: CheckoutFormProps) {
  const router = useRouter();
  const cart = useCart();
  // Delivery is one choice for the whole order, so it lives with the cart and
  // follows the customer from product page to product page.
  const { delivery, setDelivery } = cart;
  const [size, setSize] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [errorReason, setErrorReason] = useState<OrderErrorReason | null>(null);
  // Sizes the server refused after this page rendered. Stock is the DB's word,
  // never the client's, so a "sold-out" answer has to beat the snapshot this
  // component was handed.
  const [refusedSizes, setRefusedSizes] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  const sizes = variants.map((variant) => ({
    size: variant.size,
    soldOut: variant.soldOut || refusedSizes.includes(variant.size),
  }));
  const allGone = sizes.length === 0 || sizes.every((option) => option.soldOut);

  // What would be ordered right now: the cart, plus the size picked here.
  const selected: CartItem | null = size
    ? {
        slug,
        size,
        sizes,
        quantity: 1,
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
    (sum, item) => sum + item.priceCents * item.quantity,
    0,
  );
  const shippingCents =
    delivery === "shipping" && orderItems.length > 0
      ? dials.shippingFlatRateCents
      : 0;
  const totalCents = subtotalCents + shippingCents;
  // Before anything is picked the button still quotes this garment, as it did
  // when the page sold one thing; a "$0" order would read as broken.
  const quotedCents =
    orderItems.length > 0
      ? totalCents
      : priceCents +
        (delivery === "shipping" ? dials.shippingFlatRateCents : 0);
  const deliveryLabel =
    delivery === "shipping" ? orderCopy.shipping : orderCopy.pickup;
  const ledgerLines: LedgerLine[] = orderItems.map((item) => ({
    label: `${item.name.toUpperCase()} ${item.size}${item.quantity > 1 ? ` ×${item.quantity}` : ""}`,
    amountCents: item.priceCents * item.quantity,
  }));

  // "+": the garment goes in the cart and the customer goes back to the grid to
  // pick the next one. The size resets so coming back later starts fresh.
  function handleAdd() {
    if (!selected || isPending) return;
    cart.addItem(selected);
    setSize(null);
    router.push("/#products");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // The button is already disabled in both cases; pressing Enter inside the
    // form submits anyway, which is where a double order would come from.
    if (orderItems.length === 0 || isPending) return;
    setErrorReason(null);
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
          setRefusedSizes((current) => [...current, gone.size]);
          if (size === gone.size) setSize(null);
        }
        // Whatever ran out, it cannot stay in the cart: leaving it would fail
        // the next attempt the same way.
        if (gone) cart.removeItem(gone.slug, gone.size);
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
          {sizes.map((option) => (
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
      <div className="mx-auto w-full max-w-md bg-ink/95 p-6">
        <PaymentStation
          clientSecret={clientSecret}
          orderId={orderId}
          lines={ledgerLines}
          delivery={delivery}
          deliveryLabel={deliveryLabel}
          shippingCents={shippingCents}
          totalCents={totalCents}
          onChangeSize={handleChangeSize}
        />
      </div>
    );
  }

  // `stripe-unconfigured` already returned above, so every reason that reaches
  // here is one the buyer can act on.
  const errorLine = errorReason ? orderErrorLines[errorReason] : null;

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col items-center gap-3 text-center"
    >
      <h1 className="brat text-brand-red">{name}</h1>

      <fieldset disabled={isPending}>
        <legend className="sr-only">{orderCopy.size}</legend>
        <div className="brat flex flex-wrap justify-center gap-x-8">
          {sizes.map((option) => (
            <label
              key={option.size}
              className={cn(
                "cursor-pointer transition-colors duration-200",
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
                onChange={() => setSize(option.size)}
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

      <fieldset disabled={isPending}>
        <legend className="sr-only">DELIVERY</legend>
        <div className="brat flex flex-wrap justify-center gap-x-8">
          {deliveryOptions.map((option) => (
            <label
              key={option.value}
              className={cn(
                "cursor-pointer transition-colors duration-200",
                delivery === option.value
                  ? "text-brand-yellow"
                  : "text-brand-red hover:text-brand-yellow",
              )}
            >
              <input
                type="radio"
                name="delivery"
                value={option.value}
                checked={delivery === option.value}
                onChange={() => setDelivery(option.value)}
                className="peer sr-only"
              />
              <span className="peer-focus-visible:underline peer-focus-visible:underline-offset-8">
                {option.label} {option.price}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {errorLine ? (
        <p role="alert" className="brat text-brand-red">
          {errorLine}
        </p>
      ) : null}

      {allGone && orderItems.length === 0 ? (
        <p className="brat text-brand-red">{orderCopy.soldOut}</p>
      ) : (
        <>
          {/* Offered once a size is picked: the garment goes in the cart and the
              customer is sent back to the grid for the next one. */}
          {selected ? (
            <button
              type="button"
              onClick={handleAdd}
              disabled={isPending}
              aria-label={orderCopy.addToCart}
              className="brat text-brand-red transition-colors duration-200 hover:text-brand-yellow focus-visible:underline focus-visible:underline-offset-8 disabled:cursor-not-allowed disabled:opacity-40"
            >
              +
            </button>
          ) : null}
          {/* The total rides the button: the ledger that used to state it is
              gone from this step, and nobody should learn the real charge
              inside the card fields. It covers everything in the cart. */}
          <button
            type="submit"
            disabled={isPending || orderItems.length === 0}
            className="brat text-brand-red transition-colors duration-200 hover:text-brand-yellow focus-visible:underline focus-visible:underline-offset-8 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isPending
              ? orderCopy.submitPending
              : `${orderCopy.next} ${formatUsd(quotedCents)}`}
          </button>
        </>
      )}
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
