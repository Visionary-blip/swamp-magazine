"use client";

import { useActionState } from "react";

import {
  submitCreativeApplication,
  type InvolvementState,
} from "@/actions/submit-involvement";

import { FileDrop } from "../file-drop/file-drop";
import { SpecialityCombobox } from "../speciality-combobox/speciality-combobox";
import {
  involvementFailureMessages,
  involvementInputClasses as inputClasses,
} from "../../lib/involvement-copy";

const initialState: InvolvementState = { status: "idle" };

export function CreativeForm() {
  const [state, formAction, isPending] = useActionState(
    submitCreativeApplication,
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
        WHERE ARE YOU
        <input
          className={inputClasses}
          type="text"
          name="location"
          required
          maxLength={100}
          autoComplete="address-level2"
          placeholder="CITY, SCHOOL"
        />
      </label>

      <SpecialityCombobox />

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

      <FileDrop name="work" prompt="YOUR WORK" />

      {state.status === "error" ? (
        <p role="alert" className="font-body text-xs font-bold tracking-widest">
          {involvementFailureMessages[state.reason]}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="mt-auto border-2 border-brand-red px-6 py-2 font-display text-xl tracking-wide transition-opacity hover:opacity-70 disabled:opacity-40"
      >
        {isPending ? "SENDING..." : "SUBMIT"}
      </button>
    </form>
  );
}
