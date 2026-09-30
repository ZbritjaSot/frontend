import { NewsletterSignup } from "@/features/public/NewsletterSignup";
import { Frame } from "@/features/public/Frame";
import { formatDiscountPercent } from "@/lib/format";
import type { PublicHome } from "@/features/offers/api";

type Preview = {
  kind: string;
  title: string;
  meta?: string;
};

function previewsFrom(home: PublicHome): Preview[] {
  const offer = home.featured[0] ?? home.fresh[0] ?? home.ending_soon[0] ?? null;
  const flyer = home.flyers[0] ?? null;
  const shop = home.shops[0] ?? null;

  return [
    {
      kind: "Ofertë",
      title: offer?.name ?? "Ofertë",
      meta:
        offer?.discount_percent != null && offer.discount_percent > 0
          ? formatDiscountPercent(offer.discount_percent)
          : offer?.business?.name,
    },
    {
      kind: "Fletushkë",
      title: flyer?.title ?? "Fletushkë",
      meta: flyer?.business?.name ?? undefined,
    },
    {
      kind: "Dyqan",
      title: shop?.name ?? "Dyqan",
      meta: shop?.city ?? shop?.village ?? undefined,
    },
  ];
}

export function InboxBand({
  home,
  title = "Mos i humb zbritjet më të mira.",
}: {
  home: PublicHome;
  title?: string;
}) {
  const previews = previewsFrom(home);

  return (
    <section className="relative overflow-hidden bg-forest text-ivory">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(246,243,234,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(246,243,234,0.06) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 right-[-8%] size-72 rounded-full bg-accent/15 blur-3xl"
      />
      <Frame className="relative py-14 sm:py-16 lg:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(16rem,0.85fr)] lg:gap-16">
          <div className="min-w-0 max-w-xl">
            <p className="m-0 text-[0.68rem] font-bold tracking-[0.2em] text-accent uppercase">
              ZbritjaSot në inbox
            </p>
            <h2 className="m-0 mt-3 max-w-lg text-[clamp(2rem,4vw,3.25rem)] leading-[0.94] font-extrabold tracking-[-0.045em]">
              {title}
            </h2>
            <p className="mt-4 mb-6 max-w-md text-base leading-relaxed text-ivory/75 dark:text-muted">
              Merr oferta, ulje dhe zbulime të reja direkt në email.
            </p>
            <NewsletterSignup variant="home" />
            <ul className="mt-5 mb-0 flex list-none flex-wrap gap-x-4 gap-y-2 p-0 text-sm text-ivory/70 dark:text-muted">
              {["Oferta të reja", "Zbritje të zgjedhura", "Pa spam"].map((item) => (
                <li key={item} className="inline-flex items-center gap-1.5">
                  <span className="text-accent" aria-hidden>
                    ✓
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <ul className="m-0 grid list-none grid-cols-3 gap-2 p-0 sm:gap-3 lg:grid-cols-1 lg:justify-items-end">
            {previews.map((preview, index) => (
              <li
                key={preview.kind}
                className={`w-full max-w-64 rounded-2xl border border-ivory/15 bg-[#1b2820]/80 px-3 py-3 backdrop-blur-sm sm:px-4 dark:border-white/10 dark:bg-white/[0.04] ${
                  index === 1 ? "lg:mr-8" : index === 2 ? "lg:mr-2" : ""
                }`}
              >
                <p className="m-0 text-[0.65rem] font-bold tracking-[0.16em] text-accent uppercase">
                  {preview.kind}
                </p>
                {preview.title !== preview.kind ? (
                  <p className="m-0 mt-1 truncate text-sm font-extrabold tracking-tight sm:text-base">
                    {preview.title}
                  </p>
                ) : null}
                {preview.meta && preview.meta !== preview.title ? (
                  <p className="m-0 mt-0.5 truncate text-xs text-ivory/60 dark:text-muted">
                    {preview.meta}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      </Frame>
    </section>
  );
}
