"use client";

import { useEffect, useState, useTransition, type FormEvent } from "react";
import { createPortal } from "react-dom";

import {
  createExModelOrder,
  type CreateExModelOrderResult,
} from "@/actions/create-ex-model-order";
import type { DeliveryChoice } from "@/features/cart";

type Reason = Extract<CreateExModelOrderResult, { status: "error" }>["reason"];

// INVENTED wording, in the order block's register; the founder's to review.
const errorLines: Record<Reason, string> = {
  "invalid-input": "CHECK YOUR NAME AND EMAIL",
  "wrong-password": "THAT'S NOT THE PASSWORD",
  "not-configured": "NOT OPEN YET",
  "not-found": "CAN'T FIND THAT ONE ANYMORE",
  "sold-out": "THAT SIZE IS GONE. PICK ANOTHER",
  "at-capacity": "WE'VE REACHED ORDER CAPACITY FOR RIGHT NOW",
  "server-error": "SOMETHING BROKE. TRY AGAIN",
};

const fieldClass =
  "w-full border-b border-brand-red/70 bg-transparent py-2 text-center font-display text-base tracking-[0.1em] text-brand-red uppercase placeholder:text-brand-red/50 focus:border-brand-yellow focus:outline-none";

const buttonClass =
  "cursor-pointer whitespace-nowrap px-1 py-2 text-brand-red transition-colors duration-200 hover:text-brand-yellow focus-visible:text-brand-yellow focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40";

// EX-MODEL: a pop-up asking for the password (and a name and email so the order
// has someone on it). A right password places the order for nothing and says it
// is being made; the password is checked on the server, never here.
export function ExModelDialog({
  items,
  delivery,
  onClose,
  onPlaced,
}: {
  items: { slug: string; size: string; quantity: number }[];
  delivery: DeliveryChoice;
  onClose: () => void;
  /** Called once the order is in, so the cart can be emptied. */
  onPlaced: () => void;
}) {
  const [reason, setReason] = useState<Reason | null>(null);
  const [placed, setPlaced] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // Events bubble through a portal to the order form it was opened from, whose
    // own submit would start a card checkout.
    event.stopPropagation();
    if (isPending) return;
    const form = new FormData(event.currentTarget);
    setReason(null);
    startTransition(async () => {
      const result = await createExModelOrder({
        items,
        delivery,
        name: String(form.get("name") ?? ""),
        email: String(form.get("email") ?? ""),
        password: String(form.get("password") ?? ""),
      });
      if (result.status === "success") {
        setPlaced(true);
        onPlaced();
        return;
      }
      setReason(result.reason);
    });
  }

  // Portalled to the body: the order form it is opened from is itself a <form>,
  // and forms do not nest.
  return createPortal(
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-ink/80 px-5">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="EX-MODEL"
        className="brat flex w-full max-w-sm flex-col items-center gap-5 rounded-2xl border border-brand-red/70 bg-ink/95 p-6 text-center text-brand-red"
      >
        <h2>EX-MODEL</h2>
        {placed ? (
          <>
            <p>YOUR ORDER IS BEING MADE. THANK YOU FOR WORKING WITH US</p>
            <button type="button" onClick={onClose} className={buttonClass}>
              CLOSE
            </button>
          </>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex w-full flex-col items-center gap-5"
          >
            <p className="font-display text-base tracking-[0.1em] uppercase">
              WE OWE YOU A SHIRT
            </p>
            <p className="font-display text-base tracking-[0.1em] uppercase">
              THANK YOU FOR YOUR TIME WITH US
            </p>
            <input
              name="password"
              type="password"
              required
              autoFocus
              autoComplete="off"
              placeholder="PASSWORD"
              aria-label="Password"
              className={fieldClass}
            />
            <input
              name="name"
              type="text"
              required
              autoComplete="name"
              placeholder="NAME"
              aria-label="Name"
              className={fieldClass}
            />
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="EMAIL"
              aria-label="Email"
              className={fieldClass}
            />
            {reason ? <p role="alert">{errorLines[reason]}</p> : null}
            <div className="flex gap-8">
              <button type="button" onClick={onClose} className={buttonClass}>
                CANCEL
              </button>
              <button
                type="submit"
                disabled={isPending}
                className={buttonClass}
              >
                {isPending ? "..." : "PLACE ORDER"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body,
  );
}
