"use client";

import { useState, useTransition } from "react";

import {
  setOrderStage,
  type OrderStageFailure,
} from "@/actions/stork-stage";
import {
  nextStage,
  previousStage,
  stageLabel,
  type OrderStage,
} from "../../lib/order-stage";

const failureText: Record<OrderStageFailure, string> = {
  "not-authorized": "SIGN IN AGAIN",
  "invalid-input": "THAT DIDN'T LOOK RIGHT",
  "not-found": "ORDER IS GONE",
  "not-allowed": "NOT ALLOWED",
  stale: "IT CHANGED. REFRESH",
  "server-error": "TRY AGAIN",
};

/** The stage an order is at; a tap moves it on one, UNDO moves it back one. */
export function StageButton({
  orderId,
  stage,
  disabled,
}: {
  orderId: string;
  stage: OrderStage;
  disabled: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [failure, setFailure] = useState<OrderStageFailure | null>(null);
  const next = nextStage(stage);
  const previous = previousStage(stage);

  function move(to: OrderStage) {
    setFailure(null);
    startTransition(async () => {
      const result = await setOrderStage(orderId, stage, to);
      if (result.status === "error") setFailure(result.reason);
    });
  }

  return (
    <div className="flex w-32 shrink-0 flex-col items-stretch gap-1">
      <button
        type="button"
        disabled={disabled || pending || !next}
        onClick={() => next && move(next)}
        aria-label={
          next
            ? `${stageLabel[stage]}. Mark ${stageLabel[next]}`
            : stageLabel[stage]
        }
        className={`min-h-12 px-3 py-2 text-base rounded-full border border-brand-red/70 bg-ink/80 font-display leading-none tracking-[0.1em] text-brand-red transition-colors duration-200 hover:border-brand-yellow hover:text-brand-yellow focus-visible:border-brand-yellow focus-visible:text-brand-yellow focus-visible:outline-none ${
          next ? "disabled:opacity-40" : ""
        }`}
      >
        {pending ? "SAVING..." : stageLabel[stage]}
      </button>
      {previous && !disabled ? (
        <button
          type="button"
          disabled={pending}
          onClick={() => move(previous)}
          className="py-1 font-body text-[10px] tracking-[0.25em] text-cream/60 underline underline-offset-4 hover:text-brand-yellow"
        >
          UNDO
        </button>
      ) : null}
      {failure ? (
        <p
          role="status"
          className="text-center font-body text-[10px] font-bold tracking-widest underline"
        >
          {failureText[failure]}
        </p>
      ) : null}
    </div>
  );
}
