import { Frame, SeeAll, SectionHeading } from "@/features/public/Frame";
import { ProductGrid } from "@/features/public/ProductPoster";
import type { PublicOffer } from "@/types";

/** Admin-curated spotlight first, then random fill (homepage featured rail). */
export function SpotlightSection({
  offers,
  title = "Zbritje të forta",
}: {
  offers: PublicOffer[];
  title?: string;
}) {
  if (offers.length === 0) {
    return null;
  }

  return (
    <Frame className="pt-10 sm:pt-12">
      <SectionHeading
        kicker="Përzgjedhje"
        title={title}
        action={<SeeAll href="/oferta">Shiko të gjitha</SeeAll>}
      />
      <ProductGrid offers={offers} eager />
    </Frame>
  );
}
