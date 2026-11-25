"use client";

import { useState, useTransition } from "react";

import {
  setOrderStage,
  type OrderStageFailure,
} from "@/actions/stork-stage";
import { cn } from "@/lib/utils";

import {
  nextStage,
  ORDER_STAGES,
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

// "to_do" is the state before any step, so it has no pill of its own.
const STEPS = ORDER_STAGES.filter((stage) => stage !== "to_do");

/**
 * The three steps of a purchase, all in view. The one it is on is solid green,
 * those behind it faded green, those ahead faded red. A tap on the next step
 * moves there; UNDO moves back one.
 */
export function StageSteps({
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
  const reached = ORDER_STAGES.indexOf(stage);

  function move(to: OrderStage) {
    setFailure(null);
    startTransition(async () => {
      const result = await setOrderStage(orderId, stage, to);
      if (result.status === "error") setFailure(result.reason);
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <ol className={cn("grid grid-cols-3 gap-2", pending && "opacity-50")}>
        {STEPS.map((step) => {
          const index = ORDER_STAGES.indexOf(step);
          return (
            <li key={step} className="flex">
              <button
                type="button"
                disabled={disabled || pending || step !== next}
                onClick={() => move(step)}
                aria-current={step === stage ? "step" : undefined}
                className={cn(
                  "min-h-12 w-full rounded-full border px-2 py-2 font-display text-sm leading-tight tracking-[0.08em] focus-visible:border-brand-yellow focus-visible:outline-none",
                  index === reached &&
                    "border-brand-green bg-brand-green text-ink",
                  index < reached && "border-brand-green/35 text-brand-green/50",
                  index > reached && "border-brand-red/35 text-brand-red/50",
                )}
              >
                {stageLabel[step]}
              </button>
            </li>
          );
        })}
      </ol>
      {previous && !disabled ? (
        <button
          type="button"
          disabled={pending}
          onClick={() => move(previous)}
          className="self-end py-1 font-body text-[10px] tracking-[0.25em] text-cream/60 underline underline-offset-4 hover:text-brand-yellow"
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
