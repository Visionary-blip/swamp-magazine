import type { PolicySection } from "../../lib/shipping-returns-copy";
import { MastheadLink } from "../masthead-link/masthead-link";
import { SiteFooter } from "../site-footer/site-footer";

// A page of plain written terms (shipping & returns; terms and privacy can use it
// when they are written): the masthead, a title, then headed sections in a
// narrow column of cream type on ink.
export function PolicyScreen({
  title,
  sections,
  email,
}: {
  title: string;
  sections: PolicySection[];
  /** Where questions go; shown at the foot as a mail link. */
  email: string;
}) {
  return (
    <main className="flex min-h-dvh flex-col bg-ink">
      <header className="flex h-16 shrink-0 items-center px-5 md:px-10">
        <MastheadLink />
      </header>

      <article className="mx-auto w-full max-w-2xl grow px-5 pt-8 pb-24 md:pt-16">
        <h1 className="mb-12 text-center font-display text-[11vw] leading-none tracking-[0.03em] text-cream uppercase sm:text-[56px]">
          {title}
        </h1>

        {sections.map((section) => (
          <section key={section.heading} className="mb-10">
            <h2 className="mb-4 font-display text-2xl leading-none tracking-[0.05em] text-brand-red uppercase">
              {section.heading}
            </h2>
            {section.facts ? (
              <dl className="mb-6 grid grid-cols-2 gap-x-6 gap-y-6">
                {section.facts.map((fact) => (
                  <div key={fact.label}>
                    <dt className="font-display text-5xl leading-none tracking-[0.02em] text-brand-red md:text-6xl">
                      {fact.value}
                    </dt>
                    <dd className="mt-2 font-body text-sm tracking-[0.08em] text-cream/70 uppercase">
                      {fact.label}
                    </dd>
                  </div>
                ))}
              </dl>
            ) : null}
            {section.bullets ? (
              <ul className="flex list-disc flex-col gap-2 pl-5 font-body text-base leading-relaxed text-cream/85 marker:text-brand-red">
                {section.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}

        <p className="font-body text-base text-cream/85">
          Questions? Email{" "}
          <a
            href={`mailto:${email}`}
            className="text-brand-red transition-colors duration-200 hover:text-brand-yellow focus-visible:text-brand-yellow focus-visible:outline-none"
          >
            {email}
          </a>
          .
        </p>
      </article>

      <SiteFooter />
    </main>
  );
}
