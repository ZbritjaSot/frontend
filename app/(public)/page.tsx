import type { Metadata } from "next";
import { formatDiscountPercent, formatEur } from "@/lib/format";
import { SITE_TAGLINE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Ofertat",
};

export default function HomePage() {
  // B1 shell only — sample EUR formatting, no API yet (B2).
  const samplePrice = formatEur(1.4);
  const sampleDiscount = formatDiscountPercent(30);

  return (
    <>
      <section className="public-hero">
        <p className="public-hero__eyebrow">Kosovë · EUR</p>
        <h1 className="public-hero__title">Ofertat e sotme</h1>
        <p className="public-hero__lead">{SITE_TAGLINE}</p>
      </section>

      <section className="public-empty" aria-label="Lista e ofertave">
        <h2 className="public-empty__title">Lista është gati për t’u lidhur</h2>
        <p className="public-empty__copy">
          Këtu do të shfaqen zbritjet aktive nga dyqanet. Lidhja me API-në vjen
          në hapin tjetër (B2).
        </p>
        <p className="public-empty__sample">
          Shembull formati: <strong>{sampleDiscount}</strong> ·{" "}
          <strong>{samplePrice}</strong>
        </p>
      </section>
    </>
  );
}
