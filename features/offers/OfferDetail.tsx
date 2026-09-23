import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Link from "next/link";
import { OfferPlace } from "@/components/place/OfferPlace";
import {
  formatDateSq,
  formatDiscountPercent,
  formatEurFromCents,
} from "@/lib/format";
import type { PublicOffer } from "@/types";

type OfferDetailProps = {
  offer: PublicOffer;
};

export function OfferDetail({ offer }: OfferDetailProps) {
  return (
    <article className="max-w-xl pb-14">
      <p className="m-0 text-xs font-bold tracking-[0.16em] text-muted uppercase">
        {offer.business ? (
          <Link
            href={`/biznese/${offer.business.id}`}
            className="hover:text-accent"
          >
            {offer.business.name}
          </Link>
        ) : (
          "Ofertë"
        )}
        {offer.bundle?.title ? ` · ${offer.bundle.title}` : ""}
        {offer.category ? ` · ${offer.category.name}` : ""}
      </p>

      <p
        className="mt-5 inline-flex items-center rounded-[0.4rem] bg-accent px-3 py-[0.45rem] text-[clamp(1.5rem,5vw,2.25rem)] font-bold leading-none tracking-[-0.04em] text-on-accent"
        aria-label="Zbritja"
      >
        {formatDiscountPercent(offer.discount_percent)}
      </p>

      <h1 className="m-0 mt-5 text-[clamp(1.75rem,4vw,2.5rem)] font-bold leading-[1.15] tracking-[-0.03em]">
        {offer.name}
      </h1>

      <div className="mt-8 flex items-baseline gap-5">
        <span className="text-[1.75rem] font-bold text-ink dark:text-accent">
          {formatEurFromCents(offer.discounted_price)}
        </span>
        <span className="text-lg text-muted line-through">
          {formatEurFromCents(offer.original_price)}
        </span>
      </div>

      <dl className="mt-14 grid grid-cols-2 gap-5 border-t border-line pt-5">
        <div>
          <dt className="m-0 text-xs font-bold tracking-[0.12em] text-muted uppercase">
            Fillon
          </dt>
          <dd className="m-0 mt-[0.35rem] text-base font-semibold">
            {formatDateSq(offer.starts_at)}
          </dd>
        </div>
        <div>
          <dt className="m-0 text-xs font-bold tracking-[0.12em] text-muted uppercase">
            Skadon
          </dt>
          <dd className="m-0 mt-[0.35rem] text-base font-semibold">
            {formatDateSq(offer.expires_at)}
          </dd>
        </div>
      </dl>

      {offer.business ? (
        <OfferPlace
          name={offer.business.name}
          place={{
            address: offer.business.address,
            latitude: offer.business.latitude,
            longitude: offer.business.longitude,
          }}
        />
      ) : null}

      <Link
        href="/"
        className="mt-14 inline-flex items-center gap-1 text-sm font-semibold text-muted hover:text-accent"
      >
        <ArrowBackIcon fontSize="small" />
        Të gjitha ofertat
      </Link>
    </article>
  );
}
