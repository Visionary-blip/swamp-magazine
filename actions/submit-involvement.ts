"use server";

import { randomUUID } from "node:crypto";

import { dials } from "@/config/dials";
import { prepareApplicationImage } from "@/lib/application-image.server";
import {
  creativeApplicationSchema,
  ideaSubmissionSchema,
} from "@/features/model-application/lib/model-application-schema";
import { createAdminClient } from "@/lib/supabase/admin";

// The creative and general-idea halves of /get-involved. The model form has its
// own action because it carries a file; these two are plain text.

export type InvolvementFailure =
  | "invalid-name"
  | "invalid-location"
  | "invalid-speciality"
  | "invalid-contact"
  | "invalid-idea"
  | "no-work"
  | "work-too-large"
  | "work-not-an-image"
  | "server-error";

export type InvolvementState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; reason: InvolvementFailure };

export async function submitCreativeApplication(
  _previous: InvolvementState,
  formData: FormData,
): Promise<InvolvementState> {
  const parsed = creativeApplicationSchema.safeParse({
    name: formData.get("name"),
    location: formData.get("location"),
    speciality: formData.get("speciality"),
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
            : field === "speciality"
              ? "invalid-speciality"
              : "invalid-contact",
    };
  }

  const prepared = await prepareApplicationImage(
    formData.get("work"),
    dials.creativeWorkMaxUploadBytes,
  );
  if (prepared.status === "error") {
    return {
      status: "error",
      reason:
        prepared.reason === "no-file"
          ? "no-work"
          : prepared.reason === "too-large"
            ? "work-too-large"
            : "work-not-an-image",
    };
  }

  // The file goes up first so the row never points at nothing; a row that then
  // fails to land takes its file back out.
  const supabase = createAdminClient();
  const workPath = `${randomUUID()}.webp`;
  const { error: uploadError } = await supabase.storage
    .from("creative-work")
    .upload(workPath, prepared.body, { contentType: "image/webp" });
  if (uploadError) {
    console.error("[INVOLVEMENT]", "creative-work", uploadError.message);
    return { status: "error", reason: "server-error" };
  }

  const result = await insert("creative_applications", {
    ...parsed.data,
    work_path: workPath,
  });
  if (result.status === "error") {
    await supabase.storage.from("creative-work").remove([workPath]);
  }
  return result;
}

export async function submitIdea(
  _previous: InvolvementState,
  formData: FormData,
): Promise<InvolvementState> {
  const parsed = ideaSubmissionSchema.safeParse({
    name: formData.get("name"),
    contact: formData.get("contact"),
    idea: formData.get("idea"),
  });
  if (!parsed.success) {
    const field = parsed.error.issues[0]?.path[0];
    return {
      status: "error",
      reason:
        field === "name"
          ? "invalid-name"
          : field === "idea"
            ? "invalid-idea"
            : "invalid-contact",
    };
  }
  return insert("idea_submissions", parsed.data);
}

async function insert(
  table: "creative_applications" | "idea_submissions",
  row: Record<string, string>,
): Promise<InvolvementState> {
  try {
    const { error } = await createAdminClient().from(table).insert(row);
    if (error) {
      console.error("[INVOLVEMENT]", table, error.code, error.message);
      return { status: "error", reason: "server-error" };
    }
    return { status: "success" };
  } catch (error) {
    console.error("[INVOLVEMENT]", table, error);
    return { status: "error", reason: "server-error" };
  }
}
