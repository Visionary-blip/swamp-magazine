"use client";

import { useActionState, useState, type ReactNode } from "react";

import {
  submitModelApplication,
  type ModelApplicationFailure,
  type ModelApplicationState,
} from "@/actions/submit-model-application";

import { FileDrop } from "../file-drop/file-drop";

const initialState: ModelApplicationState = { status: "idle" };

// INVENTED copy in the subscribe form's voice -- for the founder's review.
const failureMessages: Record<ModelApplicationFailure, string> = {
  "invalid-name": "WE NEED YOUR NAME",
  "invalid-location": "TELL US WHERE YOU ARE",
  "invalid-gender": "PICK ONE",
  "invalid-contact": "THAT PHONE, EMAIL OR INSTAGRAM DOESN'T LOOK RIGHT",
  "no-selfie": "ADD A SELFIE",
  "selfie-too-large": "THAT PHOTO IS TOO BIG. TRY A SMALLER ONE",
  "selfie-not-an-image": "THAT FILE ISN'T A PHOTO",
  "server-error": "SOMETHING BROKE. TRY AGAIN",
};

type Gender = "male" | "female" | "other";

// Plain strokes in currentColor so the icons take the form's red, and the
// yellow of the selected state. Mars, Venus, and the intersex symbol (a plain ring) for other.
const genderIcons: Record<Gender, ReactNode> = {
  male: (
    <>
      <circle cx="10" cy="14" r="6" />
      <path d="M14.5 9.5 21 3m0 0h-5.5M21 3v5.5" />
    </>
  ),
  female: (
    <>
      <circle cx="12" cy="9" r="6" />
      <path d="M12 15v8m-4-4h8" />
    </>
  ),
  other: (
    <>
      <circle cx="12" cy="12" r="7" strokeWidth="3" />
    </>
  ),
};

const genderOptions: { value: Gender; label: string }[] = [
  { value: "male", label: "MALE" },
  { value: "female", label: "FEMALE" },
  { value: "other", label: "OTHER" },
];

const inputClasses =
  "border-b-2 border-cream/60 bg-transparent py-1 font-body text-base tracking-wide text-cream outline-none placeholder:text-cream placeholder:opacity-40 focus:border-brand-red";

export function ModelApplicationForm() {
  const [state, formAction, isPending] = useActionState(
    submitModelApplication,
    initialState,
  );
  const [gender, setGender] = useState<Gender | null>(null);

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

      <fieldset className="flex flex-col gap-2 font-body text-xs tracking-widest">
        <legend className="mb-2">GENDER</legend>
        <div className="flex gap-3">
          {genderOptions.map((option) => (
            <label
              key={option.value}
              className={`flex flex-1 cursor-pointer flex-col items-center gap-1 border-2 px-2 py-3 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand-yellow ${
                gender === option.value
                  ? "border-brand-yellow text-brand-yellow"
                  : "border-brand-red hover:border-brand-yellow"
              }`}
            >
              <input
                className="sr-only"
                type="radio"
                name="gender"
                value={option.value}
                required
                checked={gender === option.value}
                onChange={() => setGender(option.value)}
              />
              <svg
                viewBox="0 0 24 24"
                className="size-7"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                {genderIcons[option.value]}
              </svg>
              {option.label}
            </label>
          ))}
        </div>
        {gender === "male" ? (
          // INVENTED -- the founder's joke; optional so it never blocks a
          // sincere application.
          <input
            className={inputClasses}
            type="text"
            name="whyMaleModels"
            maxLength={300}
            autoComplete="off"
            placeholder="BUT WHY MALE MODELS?"
            aria-label="But why male models?"
          />
        ) : null}
        {gender === "other" ? (
          <input
            className={inputClasses}
            type="text"
            name="genderOther"
            maxLength={60}
            autoComplete="off"
            placeholder="TYPE HERE"
            aria-label="Other, in your own words"
          />
        ) : null}
      </fieldset>

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

      <FileDrop name="selfie" prompt="WHAT DO YOU LOOK LIKE?" />

      {state.status === "error" ? (
        <p role="alert" className="font-body text-xs font-bold tracking-widest">
          {failureMessages[state.reason]}
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
