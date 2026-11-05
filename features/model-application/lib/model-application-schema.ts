import { z } from "zod";

// Same loose phone shape as the subscribe form: campus numbers arrive in every
// format and nothing here dials them.
const PHONE_PATTERN = /^\+?[0-9().\s-]{7,20}$/;
// Instagram handles: letters, digits, dots, underscores, up to 30, "@" optional.
const HANDLE_PATTERN = /^@?[A-Za-z0-9._]{1,30}$/;

export function isValidContact(value: string): boolean {
  return (
    z.email().safeParse(value).success ||
    PHONE_PATTERN.test(value) ||
    HANDLE_PATTERN.test(value)
  );
}

export const modelApplicationSchema = z.object({
  name: z.string().trim().min(1).max(100),
  location: z.string().trim().min(1).max(100),
  gender: z.enum(["male", "female", "other"]),
  genderOther: z.string().trim().max(60).optional(),
  whyMaleModels: z.string().trim().max(300).optional(),
  contact: z.string().trim().min(1).max(120).refine(isValidContact),
});

export type ModelApplicationInput = z.output<typeof modelApplicationSchema>;

export const creativeApplicationSchema = z.object({
  name: z.string().trim().min(1).max(100),
  location: z.string().trim().min(1).max(100),
  speciality: z.string().trim().min(1).max(60),
  contact: z.string().trim().min(1).max(120).refine(isValidContact),
});

export const ideaSubmissionSchema = z.object({
  name: z.string().trim().min(1).max(100),
  contact: z.string().trim().min(1).max(120).refine(isValidContact),
  idea: z.string().trim().min(1).max(2000),
});
