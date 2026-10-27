"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useTransition, type FormEvent } from "react";

import { createCheckoutSession } from "@/actions/create-checkout-session";
import { dials } from "@/config/dials";
import {
  cartSubtotalCents,
  sortSizes,
  useCart,
  type CartItem,
} from "@/features/cart";
import type { AddOn } from "@/features/storefront";
import { cn } from "@/lib/utils";

import {
  formatUsd,
  orderCopy,
  orderErrorLines,
  soldOutLine,
  type OrderErrorReason,
} from "../../lib/order-copy";
import { deliveryOptions } from "../../lib/delivery-options";
import { scrollIntoViewOnMount } from "../../lib/scroll";
import { stripePromise } from "../../lib/stripe-client";
import type { LedgerLine } from "../order-ledger/order-ledger";
import { PaymentStation } from "../payment-station/payment-station";

// The cart's own page: every garment in the cart in one centred row, then the
// delivery choice and PLACE ORDER, which pays for all of it. It is the same
// order the product page builds, laid out for looking at the whole thing at
// once; nothing here is priced by the browser (the server reads every price).
export function CartCheckout({ addOns }: { addOns: AddOn[] }) {
  const cart = useCart();
  const { items, delivery, setDelivery } = cart;
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [errorReason, setErrorReason] = useState<OrderErrorReason | null>(null);
  const [goneLine, setGoneLine] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const subtotalCents = cartSubtotalCents(items);
  const shippingCents =
    delivery === "shipping" && items.length > 0
      ? dials.shippingFlatRateCents
      : 0;
  const totalCents = subtotalCents + shippingCents;
  const deliveryLabel =
    delivery === "shipping" ? orderCopy.shipping : orderCopy.pickup;
  const ledgerLines: LedgerLine[] = items.map((item) => ({
    label: `${item.name.toUpperCase()}${item.addOn ? "" : ` ${item.size}`}${item.quantity > 1 ? ` ×${item.quantity}` : ""}`,
    amountCents: item.priceCents * item.quantity,
  }));

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (items.length === 0 || isPending) return;
    setErrorReason(null);
    setGoneLine(null);
    startTransition(async () => {
      const result = await createCheckoutSession({
        items: items.map((item) => ({
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
      // Whatever ran out cannot stay in the cart: leaving it would fail the
      // next attempt the same way.
      if (result.reason === "sold-out" && result.item) {
        const gone = result.item;
        const goneName =
          items.find((item) => item.slug === gone.slug)?.name ?? "THAT ONE";
        setGoneLine(soldOutLine(goneName, gone.size));
        cart.removeItem(gone.slug, gone.size);
      }
    });
  }

  // Nothing is charged until confirm, so dropping the secret is all it takes to
  // get back to the row.
  function handleBack() {
    setClientSecret(null);
    setOrderId(null);
    setErrorReason(null);
    setGoneLine(null);
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <p className="brat text-brand-red">{orderCopy.cartEmpty}</p>
        <Link
          href="/#products"
          className="brat text-brand-red transition-colors duration-200 hover:text-brand-yellow focus-visible:text-brand-yellow focus-visible:outline-none"
        >
          {orderCopy.shopTheGrid}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col items-center gap-12">
      {/* One tile per unit, so two of the same garment are two garments side
          by side, each with its own size. "+" copies a garment to its right (same
          size to start); "−" takes that copy out; a copy's size changes on its
          own without touching its twin. */}
      <ul className="flex w-full flex-wrap justify-center gap-x-8 gap-y-10">
        {items
          .filter((item) => !item.addOn)
          .flatMap((item) =>
            Array.from({ length: item.quantity }, (_, copy) => (
              <li
                key={`${item.slug}:${item.size}:${copy}`}
                className="flex w-36 flex-col items-center gap-3 text-center md:w-52"
              >
                <Link
                  href={`/product/${item.slug}`}
                  className="relative block aspect-square w-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-red"
                >
                  {item.cutoutUrl ? (
                    <Image
                      src={item.cutoutUrl}
                      alt={item.cutoutAlt || item.name}
                      fill
                      sizes="(min-width: 768px) 208px, 144px"
                      className="object-contain drop-shadow-lg"
                    />
                  ) : null}
                </Link>
                <span className="brat text-brand-red">{item.name}</span>
                {item.sizes.length > 1 ? (
                  <div
                    role="group"
                    aria-label={`Size for ${item.name}`}
                    className="brat flex flex-wrap justify-center gap-x-4"
                  >
                    {sortSizes(item.sizes).map((option) => {
                      const current = option.size === item.size;
                      return (
                        <button
                          key={option.size}
                          type="button"
                          aria-pressed={current}
                          disabled={isPending || (option.soldOut && !current)}
                          onClick={() =>
                            cart.moveOneToSize(
                              item.slug,
                              item.size,
                              option.size,
                            )
                          }
                          className={cn(
                            "px-0.5 py-1 transition-colors duration-200 focus-visible:underline focus-visible:underline-offset-8 focus-visible:outline-none",
                            current
                              ? "text-brand-yellow"
                              : "text-brand-red hover:text-brand-yellow",
                            option.soldOut &&
                              !current &&
                              "cursor-not-allowed line-through opacity-40 hover:text-brand-red",
                          )}
                        >
                          {option.size}
                          {option.soldOut && !current ? (
                            <span className="sr-only"> sold out</span>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <span className="brat text-brand-red">{item.size}</span>
                )}
                <span className="brat text-brand-red">
                  {formatUsd(item.priceCents)}
                </span>
                <div className="flex items-center gap-3">
                  <QuantityButton
                    label={`Remove one ${item.name} ${item.size}`}
                    onClick={() => cart.adjust(item.slug, item.size, -1)}
                  >
                    −
                  </QuantityButton>
                  <QuantityButton
                    label={`Add another ${item.name}, starting at size ${item.size}`}
                    onClick={() => cart.adjust(item.slug, item.size, 1)}
                  >
                    +
                  </QuantityButton>
                </div>
              </li>
            )),
          )}
      </ul>

      {/* The gum at the register: small extras, sold only with the order above
          (the server refuses an order of add-ons alone, and the cart drops them
          when the last garment goes). Hidden at the card step and when none
          exist. */}
      {addOns.length > 0 && !clientSecret ? (
        <section
          aria-labelledby="add-ons-heading"
          className="flex w-full flex-col items-center gap-4"
        >
          <h2 id="add-ons-heading" className="brat text-brand-red">
            ADD-ONS
          </h2>
          <ul className="flex w-full flex-wrap justify-center gap-x-8 gap-y-6">
            {addOns.map((addOn) => {
              const inCart = items.find((item) => item.slug === addOn.slug);
              const quantity = inCart?.quantity ?? 0;
              const line: CartItem = {
                slug: addOn.slug,
                size: addOn.size,
                sizes: [],
                quantity: 1,
                name: addOn.name,
                priceCents: addOn.priceCents,
                cutoutUrl: addOn.cutout?.url ?? null,
                cutoutAlt: addOn.cutout?.alt ?? "",
                addOn: true,
              };
              return (
                <li
                  key={addOn.slug}
                  className="flex w-24 flex-col items-center gap-2 text-center md:w-32"
                >
                  <div className="relative aspect-square w-full">
                    {addOn.cutout ? (
                      <Image
                        src={addOn.cutout.url}
                        alt={addOn.cutout.alt || addOn.name}
                        fill
                        sizes="128px"
                        className="object-contain drop-shadow-lg"
                      />
                    ) : null}
                  </div>
                  <span className="brat text-brand-red">{addOn.name}</span>
                  <span className="brat text-brand-red">
                    {formatUsd(addOn.priceCents)}
                  </span>
                  {addOn.soldOut && quantity === 0 ? (
                    <span className="brat text-brand-red line-through opacity-40">
                      <span className="sr-only">Sold out</span>
                      ADD
                    </span>
                  ) : quantity === 0 ? (
                    <QuantityButton
                      label={`Add ${addOn.name} to the order`}
                      onClick={() => cart.addItem(line)}
                    >
                      +
                    </QuantityButton>
                  ) : (
                    <div className="flex items-center gap-3">
                      <QuantityButton
                        label={`Fewer ${addOn.name}`}
                        onClick={() => cart.adjust(addOn.slug, addOn.size, -1)}
                      >
                        −
                      </QuantityButton>
                      <span className="brat min-w-6 text-brand-red">
                        {quantity}
                      </span>
                      <QuantityButton
                        label={`More ${addOn.name}`}
                        onClick={() => cart.adjust(addOn.slug, addOn.size, 1)}
                      >
                        +
                      </QuantityButton>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {!stripePromise || errorReason === "stripe-unconfigured" ? (
        <p className="brat text-center text-brand-red">
          {orderErrorLines["stripe-unconfigured"]}
        </p>
      ) : clientSecret ? (
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
            onChangeSize={handleBack}
          />
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col items-center gap-3 text-center"
        >
          <fieldset disabled={isPending}>
            <legend className="sr-only">DELIVERY</legend>
            <div className="brat flex flex-wrap justify-center gap-x-8">
              {deliveryOptions.map((option) => (
                <label
                  key={option.value}
                  className={cn(
                    "cursor-pointer px-1 py-2 transition-colors duration-200",
                    delivery === option.value
                      ? "text-brand-yellow"
                      : "text-brand-red opacity-40 hover:text-brand-yellow hover:opacity-100",
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

          {errorReason ? (
            <p role="alert" className="brat text-brand-red">
              {goneLine ?? orderErrorLines[errorReason]}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isPending}
            className="brat text-brand-red transition-colors duration-200 hover:text-brand-yellow focus-visible:underline focus-visible:underline-offset-8 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isPending
              ? orderCopy.submitPending
              : `${orderCopy.next} ${formatUsd(totalCents)}`}
          </button>
        </form>
      )}
    </div>
  );
}

function QuantityButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex size-11 items-center justify-center rounded-full border border-brand-red/70 bg-ink/70 font-display text-2xl leading-none text-brand-red transition-colors duration-200 hover:text-brand-yellow focus-visible:text-brand-yellow focus-visible:outline-none"
    >
      {children}
    </button>
  );
}
