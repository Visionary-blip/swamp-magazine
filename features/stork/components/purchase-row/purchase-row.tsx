import { deliveryLabel, statusLabel } from "@/features/admin/lib/order-status";
import { formatUsd } from "@/lib/money";

import { stageOf } from "../../lib/order-stage";
import type { Purchase } from "../../lib/purchases";
import { StageButton } from "../stage-button/stage-button";

/** One bar of the log: who bought what, and how far along it is. */
export function PurchaseRow({
  purchase,
  stagesReady,
}: {
  purchase: Purchase;
  stagesReady: boolean;
}) {
  const stage = stageOf(purchase.status, purchase.productionStage);

  return (
    <li className="flex items-start gap-3 rounded-2xl border border-brand-red/70 p-4">
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="font-display text-2xl leading-none tracking-[0.03em] break-words">
          {purchase.customerName?.toUpperCase() ?? "NO NAME"}
        </p>
        {purchase.items.map((item) => (
          <p key={item.id} className="font-body text-sm text-cream">
            {item.quantity} &times; {item.name} ({item.size})
          </p>
        ))}
        <p className="font-body text-[10px] tracking-widest text-cream/60">
          {purchase.createdAt.slice(0, 10)} &middot;{" "}
          {deliveryLabel[purchase.deliveryMethod]} &middot;{" "}
          {purchase.amountCents === null
            ? "—"
            : formatUsd(purchase.amountCents)}
        </p>
        {purchase.customerEmail ? (
          <a
            href={`mailto:${purchase.customerEmail}`}
            className="font-body text-xs break-all text-cream/80 underline underline-offset-2"
          >
            {purchase.customerEmail}
          </a>
        ) : null}
        {purchase.shipTo ? (
          <p className="font-body text-xs text-cream/80">{purchase.shipTo}</p>
        ) : null}
      </div>
      {stage ? (
        <StageButton
          orderId={purchase.id}
          stage={stage}
          disabled={!stagesReady}
        />
      ) : (
        <p className="rounded-full border border-brand-red/40 px-3 py-2 font-display text-xs leading-none tracking-[0.1em] text-brand-red/70">
          {statusLabel[purchase.status]}
        </p>
      )}
    </li>
  );
}
