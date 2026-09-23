import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import EventBusyIcon from "@mui/icons-material/EventBusy";
import StorefrontIcon from "@mui/icons-material/Storefront";
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
    <article className="pb-10">
      <Link
        href="/"
        className="mb-5 inline-flex items-center gap-1 text-sm font-semibold text-muted hover:text-accent"
      >
        <ArrowBackIcon fontSize="small" />
        Të gjitha ofertat
      </Link>

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <section className="rounded-2xl border border-line bg-elevated p-5 sm:p-7">
          <div className="flex flex-wrap items-center gap-2">
            {offer.business ? (
              <Link
                href={`/biznese/${offer.business.id}`}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink hover:text-accent"
              >
                <StorefrontIcon fontSize="small" className="text-muted" />
                {offer.business.name}
              </Link>
            ) : (
              <span className="text-sm font-semibold text-muted">Ofertë</span>
            )}
            {offer.category ? (
              <span className="rounded-full bg-sunken px-2.5 py-1 text-xs font-semibold text-muted">
                {offer.category.name}
              </span>
            ) : null}
          </div>

          <p
            className="mt-5 inline-flex items-center rounded-xl bg-accent px-3 py-2 text-[clamp(1.35rem,4vw,1.75rem)] leading-none font-extrabold tracking-[-0.03em] text-charcoal"
            aria-label="Zbritja"
          >
            {formatDiscountPercent(offer.discount_percent)}
          </p>

          <h1 className="m-0 mt-4 text-[clamp(1.75rem,4vw,2.35rem)] leading-[1.15] font-bold tracking-[-0.03em]">
            {offer.name}
          </h1>

          <div className="mt-5 flex items-baseline gap-3">
            <span className="text-[1.75rem] font-bold text-ink dark:text-accent">
              {formatEurFromCents(offer.discounted_price)}
            </span>
            <span className="text-lg text-muted line-through">
              {formatEurFromCents(offer.original_price)}
            </span>
          </div>

          <dl className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-sunken px-4 py-3">
              <dt className="m-0 flex items-center gap-1.5 text-xs font-bold tracking-[0.12em] text-muted uppercase">
                <CalendarTodayIcon className="text-[15px]!" fontSize="inherit" />
                Fillon
              </dt>
              <dd className="m-0 mt-1.5 text-base font-semibold">
                {formatDateSq(offer.starts_at)}
              </dd>
            </div>
            <div className="rounded-xl bg-sunken px-4 py-3">
              <dt className="m-0 flex items-center gap-1.5 text-xs font-bold tracking-[0.12em] text-muted uppercase">
                <EventBusyIcon className="text-[15px]!" fontSize="inherit" />
                Skadon
              </dt>
              <dd className="m-0 mt-1.5 text-base font-semibold">
                {formatDateSq(offer.expires_at)}
              </dd>
            </div>
          </dl>
        </section>

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
      </div>
    </article>
  );
}
