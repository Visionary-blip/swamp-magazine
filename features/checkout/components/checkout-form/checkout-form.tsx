"use client";

import { useState, useTransition, type FormEvent, type ReactNode } from "react";

import {
  createCheckoutSession,
  type DeliveryMethod,
} from "@/actions/create-checkout-session";
import { dials } from "@/config/dials";
import { cn } from "@/lib/utils";

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

// The poster layout (the founder's order mockups): red Helvetica set straight
// onto the shoot, centred like the YZY store. Same flow and states as before;
// only the placement changed. This component renders no wrapper of its own --
// its pieces are grid items of ProductScreen's poster grid, and the `md:`
// placements below (delivery left, order right, name and sizes under the
// cutout) only mean something inside it. Red is the ink, yellow is "this one is
// live", and the card step sits on a solid panel because Stripe's fields need
// a flat ground.
export function CheckoutForm({
  slug,
  name,
  priceCents,
  variants,
}: CheckoutFormProps) {
  const [size, setSize] = useState<string | null>(null);
  const [delivery, setDelivery] = useState<DeliveryMethod>("pickup");
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

  const shippingCents =
    delivery === "shipping" ? dials.shippingFlatRateCents : 0;
  const totalCents = priceCents + shippingCents;
  const deliveryLabel =
    delivery === "shipping" ? orderCopy.shipping : orderCopy.pickup;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // The button is already disabled in both cases; pressing Enter inside the
    // form submits anyway, which is where a double order would come from.
    if (!size || isPending) return;
    setErrorReason(null);
    startTransition(async () => {
      const result = await createCheckoutSession({ slug, size, delivery });
      if (result.status === "success") {
        setClientSecret(result.clientSecret);
        setOrderId(result.orderId);
        return;
      }
      setErrorReason(result.reason);
      if (result.reason === "sold-out") {
        setRefusedSizes((current) => [...current, size]);
        setSize(null);
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
      <>
        {/* The sizes stay on the page when ordering is not armed yet: dropping
            them would take the row the mockups are built around off the
            product screen, so an un-keyed deploy would read as broken rather
            than as not open yet. */}
        <NameAndSizes name={name}>
          <ul className="brat flex flex-wrap justify-center gap-x-8 text-[clamp(2.5rem,5vw,3.5rem)] text-brand-red">
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
        </NameAndSizes>
        <div className="brat flex flex-col items-center gap-2 text-center text-brand-red md:col-start-3 md:row-start-2 md:items-end md:self-center md:text-right">
          <p className="text-3xl md:text-5xl">{formatUsd(priceCents)}</p>
          <p className="text-2xl md:text-3xl">
            {orderErrorLines["stripe-unconfigured"]}
          </p>
        </div>
      </>
    );
  }

  if (clientSecret) {
    return (
      <div className="relative z-10 mx-auto w-full max-w-md bg-ink/95 p-6 md:col-span-3 md:col-start-1 md:row-span-2 md:row-start-2 md:self-center">
        <PaymentStation
          clientSecret={clientSecret}
          orderId={orderId}
          name={name}
          size={size}
          priceCents={priceCents}
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
    // `contents`: the form is only the submit boundary. Its children are the
    // poster grid's items, so it must not generate a box of its own.
    <form onSubmit={handleSubmit} className="contents">
      <NameAndSizes name={name}>
        <fieldset disabled={isPending}>
          <legend className="sr-only">{orderCopy.size}</legend>
          <div className="brat flex flex-wrap justify-center gap-x-8 text-[clamp(2.5rem,5vw,3.5rem)]">
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
      </NameAndSizes>

      <fieldset
        disabled={isPending}
        className="md:col-start-1 md:row-start-2 md:self-center"
      >
        <legend className="sr-only">DELIVERY</legend>
        <div className="brat flex flex-col items-center gap-1 text-2xl md:items-start md:text-2xl lg:text-4xl">
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

      <div className="brat flex flex-col items-center gap-2 text-center text-brand-red md:col-start-3 md:row-start-2 md:items-end md:self-center md:text-right">
        <p className="text-2xl md:text-xl lg:text-3xl">
          {deliveryLabel}{" "}
          {shippingCents > 0 ? formatUsd(shippingCents) : orderCopy.free}
        </p>
        <p className="text-4xl md:text-4xl lg:text-6xl">
          {orderCopy.total} {formatUsd(totalCents)}
        </p>

        {errorLine ? (
          <p role="alert" className="text-xl md:text-2xl">
            {errorLine}
          </p>
        ) : null}

        {allGone ? (
          <p className="text-3xl md:text-5xl">{orderCopy.soldOut}</p>
        ) : (
          <>
            {!size && !errorLine ? (
              <p className="text-lg opacity-80 md:text-xl">
                {orderCopy.pickSize}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={isPending || !size}
              className="brat text-5xl transition-colors duration-200 hover:text-brand-yellow focus-visible:underline focus-visible:underline-offset-8 disabled:cursor-not-allowed disabled:opacity-40 md:text-5xl lg:text-7xl"
            >
              {isPending ? orderCopy.submitPending : orderCopy.next}
            </button>
          </>
        )}
      </div>
    </form>
  );
}

// Under the cutout, centred: the product's name, then whatever picks its size.
function NameAndSizes({
  name,
  children,
}: {
  name: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 text-center md:col-start-2 md:row-start-3">
      <h1 className="brat text-[clamp(2rem,5vw,3rem)] text-brand-red">
        {name}
      </h1>
      {children}
    </div>
  );
}
