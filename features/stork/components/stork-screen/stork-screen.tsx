import { signOutStork } from "@/actions/stork-sign-out";
import { AdminSignInForm, resolveAdminAccess } from "@/features/admin";

import { getPurchaseLog } from "../../lib/purchases";
import { PurchaseRow } from "../purchase-row/purchase-row";
import { RefreshOnReturn } from "../refresh-on-return/refresh-on-return";

// Stork is one page: signed out it is the sign-in button, signed in it is the
// log. The same Google accounts as the admin get in.
export async function StorkScreen() {
  const access = await resolveAdminAccess();

  if (access.status !== "ok") {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-8 bg-ink px-4 py-16 text-brand-red">
        <h1 className="font-display text-[clamp(3rem,16vw,6rem)] leading-[0.95] tracking-[0.03em]">
          STORK
        </h1>
        {access.reason === "signed-out" ? null : (
          <p role="alert" className="font-body text-xs tracking-widest text-cream">
            THAT GOOGLE ACCOUNT CAN&apos;T OPEN STORK.
          </p>
        )}
        <AdminSignInForm destination="stork" />
      </main>
    );
  }

  // Read only after the check above: the log is every buyer's name and address.
  const log = await getPurchaseLog();

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col gap-4 bg-ink px-4 py-6 pb-16 text-brand-red">
      <RefreshOnReturn />
      <header className="flex items-center justify-between gap-4">
        <h1 className="font-display text-5xl leading-none tracking-[0.03em]">STORK</h1>
        <form action={signOutStork}>
          <button
            type="submit"
            className="h-8 px-4 text-sm rounded-full border border-brand-red/70 bg-ink/80 font-display leading-none tracking-[0.1em] text-brand-red transition-colors duration-200 hover:border-brand-yellow hover:text-brand-yellow focus-visible:border-brand-yellow focus-visible:text-brand-yellow focus-visible:outline-none"
          >
            SIGN OUT
          </button>
        </form>
      </header>

      {!log ? (
        <p role="alert" className="font-body text-xs tracking-widest">
          THE LOG COULDN&apos;T BE READ. TRY AGAIN.
        </p>
      ) : (
        <>
          {log.stagesReady ? null : (
            <p role="alert" className="font-body text-xs tracking-widest underline">
              STAGE BUTTONS ARE OFF UNTIL THE PRODUCTION STAGE MIGRATION IS RUN.
            </p>
          )}
          {log.purchases.length === 0 ? (
            <p className="font-body text-xs tracking-widest">NO PURCHASES YET.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {log.purchases.map((purchase) => (
                <PurchaseRow
                  key={purchase.id}
                  purchase={purchase}
                  stagesReady={log.stagesReady}
                />
              ))}
            </ul>
          )}
        </>
      )}
    </main>
  );
}
