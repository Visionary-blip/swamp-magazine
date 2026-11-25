"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

// A phone keeps the page open in the background for days. Re-reading when it
// comes back to the front is how a new sale shows up without a manual reload.
export function RefreshOnReturn() {
  const router = useRouter();
  useEffect(() => {
    function onVisibility() {
      if (document.visibilityState === "visible") router.refresh();
    }
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [router]);
  return null;
}
