import "server-only";

import sharp from "sharp";

import { dials } from "@/config/dials";

// Enough for a face or a piece of work to be judged, small enough that a phone
// master is not stored at full weight.
const MAX_EDGE_PX = 1600;

export type PreparedImage =
  | { status: "ok"; body: Buffer }
  | { status: "error"; reason: "no-file" | "too-large" | "not-an-image" };

// Shared by the /get-involved forms that take a photo. Re-encoding is the real
// image check (sharp throws on anything it cannot decode) and drops EXIF,
// including GPS, from a stranger's phone photo.
export async function prepareApplicationImage(
  file: FormDataEntryValue | null,
  maxBytes: number,
): Promise<PreparedImage> {
  if (!(file instanceof File) || file.size === 0) {
    return { status: "error", reason: "no-file" };
  }
  if (file.size > maxBytes) return { status: "error", reason: "too-large" };

  try {
    const body = await sharp(Buffer.from(await file.arrayBuffer()))
      .rotate()
      .resize({
        width: MAX_EDGE_PX,
        height: MAX_EDGE_PX,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: dials.slotImageWebpQuality })
      .toBuffer();
    return { status: "ok", body };
  } catch {
    return { status: "error", reason: "not-an-image" };
  }
}
