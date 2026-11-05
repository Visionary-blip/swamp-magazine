"use client";

import { useActionState } from "react";

import {
  submitIdea,
  type InvolvementState,
} from "@/actions/submit-involvement";

import {
  involvementFailureMessages,
  involvementInputClasses as inputClasses,
} from "../../lib/involvement-copy";

const initialState: InvolvementState = { status: "idle" };

export function IdeaForm() {
  const [state, formAction, isPending] = useActionState(
    submitIdea,
    initialState,
  );

  if (state.status === "success") {
    return (
      <div className="flex w-full flex-col gap-3 border-2 border-brand-red p-8 text-center text-brand-red">
        <p className="font-display text-4xl">THANK YOU</p>
        <p className="font-body text-sm tracking-widest">
          WE&apos;LL BE IN TOUCH
        </p>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className="flex w-full grow flex-col gap-5 border-2 border-brand-red p-6 text-left text-brand-red sm:p-8"
    >
      <label className="flex flex-col gap-1 font-body text-xs tracking-widest">
        NAME
        <input
          className={inputClasses}
          type="text"
          name="name"
          required
          maxLength={100}
          autoComplete="name"
        />
      </label>

      <label className="flex flex-col gap-1 font-body text-xs tracking-widest">
        PHONE, EMAIL OR INSTAGRAM
        <input
          className={inputClasses}
          type="text"
          name="contact"
          required
          maxLength={120}
          autoComplete="off"
          placeholder="ONE IS PLENTY"
        />
      </label>

      <label className="flex grow flex-col gap-1 font-body text-xs tracking-widest">
        YOUR IDEA
        <textarea
          className={`${inputClasses} min-h-48 grow resize-y border-2 p-3`}
          name="idea"
          required
          maxLength={2000}
          placeholder="TELL US EVERYTHING"
        />
      </label>

      {state.status === "error" ? (
        <p role="alert" className="font-body text-xs font-bold tracking-widest">
          {involvementFailureMessages[state.reason]}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="border-2 border-brand-red mt-auto px-6 py-2 font-display text-xl tracking-wide transition-opacity hover:opacity-70 disabled:opacity-40"
      >
        {isPending ? "SENDING..." : "SUBMIT"}
      </button>
    </form>
  );
}
