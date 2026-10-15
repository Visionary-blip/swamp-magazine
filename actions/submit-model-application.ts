"use server";

import { randomUUID } from "node:crypto";

import { dials } from "@/config/dials";
import { prepareApplicationImage } from "@/lib/application-image.server";
import { modelApplicationSchema } from "@/features/model-application/lib/model-application-schema";
import { createAdminClient } from "@/lib/supabase/admin";

export type ModelApplicationFailure =
  | "invalid-name"
  | "invalid-location"
  | "invalid-gender"
  | "invalid-contact"
  | "no-selfie"
  | "selfie-too-large"
  | "selfie-not-an-image"
  | "server-error";

export type ModelApplicationState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; reason: ModelApplicationFailure };

const BUCKET = "model-selfies";
export async function submitModelApplication(
  _previous: ModelApplicationState,
  formData: FormData,
): Promise<ModelApplicationState> {
  const parsed = modelApplicationSchema.safeParse({
    name: formData.get("name"),
    location: formData.get("location"),
    gender: formData.get("gender"),
    genderOther: formData.get("genderOther") ?? undefined,
    whyMaleModels: formData.get("whyMaleModels") ?? undefined,
    contact: formData.get("contact"),
  });
  if (!parsed.success) {
    const field = parsed.error.issues[0]?.path[0];
    return {
      status: "error",
      reason:
        field === "name"
          ? "invalid-name"
          : field === "location"
            ? "invalid-location"
            : field === "gender" ||
                field === "genderOther" ||
                field === "whyMaleModels"
              ? "invalid-gender"
              : "invalid-contact",
    };
  }

  const prepared = await prepareApplicationImage(
    formData.get("selfie"),
    dials.modelSelfieMaxUploadBytes,
  );
  if (prepared.status === "error") {
    return {
      status: "error",
      reason:
        prepared.reason === "no-file"
          ? "no-selfie"
          : prepared.reason === "too-large"
            ? "selfie-too-large"
            : "selfie-not-an-image",
    };
  }
  const body = prepared.body;

  try {
    const supabase = createAdminClient();
    const selfiePath = `${randomUUID()}.webp`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(selfiePath, body, { contentType: "image/webp" });
    if (uploadError) {
      console.error("[MODEL_APPLICATION]", uploadError.message);
      return { status: "error", reason: "server-error" };
    }

    const { name, location, gender, genderOther, whyMaleModels, contact } =
      parsed.data;
    const { error } = await supabase.from("model_applications").insert({
      name,
      location,
      gender,
      // Only kept when it explains "other"; a stale box under male/female is noise.
      gender_other: gender === "other" && genderOther ? genderOther : null,
      why_male_models:
        gender === "male" && whyMaleModels ? whyMaleModels : null,
      contact,
      selfie_path: selfiePath,
    });
    if (error) {
      console.error("[MODEL_APPLICATION]", error.code, error.message);
      // Do not leave an orphaned selfie behind a row that never landed.
      await supabase.storage.from(BUCKET).remove([selfiePath]);
      return { status: "error", reason: "server-error" };
    }

    return { status: "success" };
  } catch (error) {
    console.error("[MODEL_APPLICATION]", error);
    return { status: "error", reason: "server-error" };
  }
}
