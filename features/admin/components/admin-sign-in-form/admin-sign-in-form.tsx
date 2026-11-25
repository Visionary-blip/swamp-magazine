"use client";

import { useActionState } from "react";

import {
  startAdminGoogleSignIn,
  type AdminSignInFailure,
  type AdminSignInState,
} from "@/actions/admin-sign-in";

const initialState: AdminSignInState = { status: "idle" };

const failureMessages: Record<AdminSignInFailure, string> = {
  "no-allowlist": "ADMIN ACCESS ISN'T CONFIGURED YET. TELL ZACH",
  "google-unreachable": "COULDN'T REACH GOOGLE. TRY AGAIN",
};

// No success state: the action either reports why it could not start or
// throws the browser at Google, so there is nothing left to render.
export function AdminSignInForm({
  destination,
}: {
  /** Where to land after Google; the admin when left out. */
  destination?: "stork";
}) {
  const [state, formAction, isPending] = useActionState<
    AdminSignInState,
    FormData
  >(startAdminGoogleSignIn, initialState);

  return (
    <form
      action={formAction}
      className="flex w-full max-w-md flex-col gap-5 p-6 text-left sm:p-8"
    >
      {destination ? (
        <input type="hidden" name="destination" value={destination} />
      ) : null}

      {state.status === "error" ? (
        <p role="alert" className="font-body text-xs font-bold tracking-widest">
          {failureMessages[state.reason]}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className={
          destination === "stork"
            ? "px-6 py-4 text-xl disabled:opacity-40 rounded-full border border-brand-red/70 bg-ink/80 font-display leading-none tracking-[0.1em] text-brand-red transition-colors duration-200 hover:border-brand-yellow hover:text-brand-yellow focus-visible:border-brand-yellow focus-visible:text-brand-yellow focus-visible:outline-none"
            : "border-2 border-current px-6 py-3 font-display text-xl tracking-wide transition-opacity hover:opacity-70 disabled:opacity-40"
        }
      >
        {isPending ? "OPENING GOOGLE..." : "CONTINUE WITH GOOGLE"}
      </button>
    </form>
  );
}
