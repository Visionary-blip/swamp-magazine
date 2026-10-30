import type { Metadata } from "next";
import Link from "next/link";

import { ModelApplicationForm } from "@/features/model-application";
import { PlaceholderScreen } from "@/features/storefront";

export const metadata: Metadata = {
  title: "MODEL — SWAMP MAGAZINE",
};

export default function GetInvolvedModelPage() {
  return (
    <PlaceholderScreen title="MODEL" pending={false} backToWorld>
      <div className="flex w-full max-w-md flex-col gap-6">
        <ModelApplicationForm />
        <Link
          href="/get-involved"
          className="font-body text-xs tracking-widest text-brand-red transition-colors duration-200 hover:text-brand-yellow focus-visible:text-brand-yellow focus-visible:outline-none"
        >
          BACK
        </Link>
      </div>
    </PlaceholderScreen>
  );
}
