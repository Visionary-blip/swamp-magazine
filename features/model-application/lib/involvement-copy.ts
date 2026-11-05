import type { InvolvementFailure } from "@/actions/submit-involvement";

// INVENTED copy in the subscribe form's voice -- for the founder's review.
export const involvementFailureMessages: Record<InvolvementFailure, string> = {
  "invalid-name": "WE NEED YOUR NAME",
  "invalid-location": "TELL US WHERE YOU ARE",
  "invalid-speciality": "WHAT DO YOU DO?",
  "invalid-contact": "THAT PHONE, EMAIL OR INSTAGRAM DOESN'T LOOK RIGHT",
  "invalid-idea": "WRITE US YOUR IDEA",
  "no-work": "ADD A PIECE OF YOUR WORK",
  "work-too-large": "THAT FILE IS TOO BIG. TRY A SMALLER ONE",
  "work-not-an-image": "THAT FILE ISN'T A PHOTO",
  "server-error": "SOMETHING BROKE. TRY AGAIN",
};

// The suggestions in the creative form's dropdown (founder's list). The field
// still takes anything typed, so a videographer is not turned away.
export const creativeSpecialities = [
  "DIRECTOR",
  "PHOTOGRAPHER",
  "SCREEN PRINTER",
  "DESIGNER",
  "MUSICIAN",
  "PRODUCER/EDITOR",
] as const;

export const involvementInputClasses =
  "border-b-2 border-cream/60 bg-transparent py-1 font-body text-base tracking-wide text-cream outline-none placeholder:text-cream placeholder:opacity-40 focus:border-brand-red";
