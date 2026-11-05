import { SiteFooter } from "../site-footer/site-footer";
import { StarMark } from "../star-mark/star-mark";

// INVENTED copy -- the founder asked for "we have reached order capacity for
// right now"; the rest is for his review. Shown in place of the landing page
// once dials.orderCapacity paid orders exist.
export function CapacityScreen() {
  return (
    <main className="flex min-h-dvh flex-col bg-ink">
      <section className="flex grow flex-col items-center justify-center gap-7 px-5 py-24 text-center">
        <StarMark className="w-[32px] text-brand-red" />
        <h1 className="font-display text-[13vw] leading-none tracking-[0.03em] text-cream uppercase sm:text-[64px]">
          SWAMP MAGAZINE
        </h1>
        <p className="font-body text-[11px] font-medium tracking-[0.3em] text-cream/70">
          WE HAVE REACHED ORDER CAPACITY FOR RIGHT NOW
        </p>
      </section>
      <SiteFooter />
    </main>
  );
}
