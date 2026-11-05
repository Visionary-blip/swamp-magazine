"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { landHandoff, PHONE } from "../../lib/image-handoff";
import {
  OPEN_PRODUCT_EVENT,
  ProductOverlayProvider,
} from "./product-overlay-context";

// On a phone every product page is already on the landing, hidden: the server
// rendered them all, and they mount (images fetching) as soon as the landing is
// up, so a tap has nothing left to load. Opening one fades this layer in over
// the feed and the address bar never leaves "/". The browser's back button is
// given a history entry so it closes the page instead of leaving the shop.
// From md up the overlay never mounts anything and product links are ordinary
// navigations.
export function ProductOverlay({
  panels,
}: {
  panels: { slug: string; node: ReactNode }[];
}) {
  const [phone, setPhone] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const layer = useRef<HTMLDivElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    const query = window.matchMedia(PHONE);
    const sync = () => setPhone(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  const close = useCallback(() => {
    if (pushed.current) window.history.back();
    else setActive(null);
  }, []);

  useEffect(() => {
    function onOpen(event: Event) {
      const slug = (event as CustomEvent<string>).detail;
      if (pushed.current) return;
      // Same URL, new entry: back closes the page.
      window.history.pushState(window.history.state, "", window.location.href);
      pushed.current = true;
      setActive(slug);
    }
    function onPop() {
      if (!pushed.current) return;
      pushed.current = false;
      setActive(null);
    }
    window.addEventListener(OPEN_PRODUCT_EVENT, onOpen);
    window.addEventListener("popstate", onPop);
    return () => {
      window.removeEventListener(OPEN_PRODUCT_EVENT, onOpen);
      window.removeEventListener("popstate", onPop);
    };
  }, []);

  // The feed pager stands down while a page is open, or it would swallow the
  // page's own scrolling.
  useEffect(() => {
    if (active) document.body.setAttribute("data-product-open", "");
    else document.body.removeAttribute("data-product-open");
    return () => document.body.removeAttribute("data-product-open");
  }, [active]);

  useLayoutEffect(() => {
    if (!active || !layer.current) return;
    layer.current.scrollTop = 0;
    const target = layer.current.querySelector<HTMLElement>(
      `[data-product="${active}"] [data-handoff-target]`,
    );
    if (target) landHandoff(target);
  }, [active]);

  return (
    <div
      ref={layer}
      aria-hidden={active ? undefined : true}
      className={cn(
        "fixed inset-0 z-[90] overflow-y-auto overscroll-contain bg-ink transition-[opacity,visibility] duration-500 md:hidden",
        active ? "visible opacity-100" : "invisible opacity-0",
      )}
    >
      <ProductOverlayProvider value={{ close }}>
        {phone
          ? panels.map(({ slug, node }) => (
              <div key={slug} data-product={slug} hidden={slug !== active}>
                {node}
              </div>
            ))
          : null}
      </ProductOverlayProvider>
    </div>
  );
}
