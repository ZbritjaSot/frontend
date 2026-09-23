import {
  formatDateSq,
  formatDiscountPercent,
  formatEurFromCents,
} from "@/lib/format";
import { OFFER_STATUS_LABEL } from "@/features/offers/status";
import { offerStatusClass, panelLead } from "@/lib/ui";
import type { OfferBundle } from "@/types";

type OfferBundleViewProps = {
  bundle: OfferBundle;
  /** Show business name (admin). */
  showBusiness?: boolean;
};

export function OfferBundleView({
  bundle,
  showBusiness = false,
}: OfferBundleViewProps) {
  const items = bundle.items ?? [];
  const flaggedCount = items.filter((item) => item.rejection_note).length;

  return (
    <article className="max-w-[40rem]">
      <header className="mb-8 flex flex-col items-start gap-3">
        <span className={offerStatusClass(bundle.status)}>
          {OFFER_STATUS_LABEL[bundle.status]}
        </span>
        <h1 className="m-0 text-[clamp(1.5rem,3vw,2rem)] leading-[1.15] font-bold tracking-[-0.03em]">
          {bundle.title}
        </h1>
        <p className="m-0 text-[0.9375rem] text-muted">
          {showBusiness && bundle.business
            ? `${bundle.business.name} · `
            : null}
          {items.length} {items.length === 1 ? "produkt" : "produkte"}
          {flaggedCount > 0
            ? ` · ${flaggedCount} për rregullim`
            : null}
        </p>
      </header>

      <dl className="m-0 mb-8 grid grid-cols-2 gap-5 border-y border-line py-5">
        <div>
          <dt className="m-0 text-xs font-bold tracking-[0.12em] text-muted uppercase">
            Fillon
          </dt>
          <dd className="m-0 mt-[0.35rem] text-base font-semibold">
            {formatDateSq(bundle.starts_at)}
          </dd>
        </div>
        <div>
          <dt className="m-0 text-xs font-bold tracking-[0.12em] text-muted uppercase">
            Skadon
          </dt>
          <dd className="m-0 mt-[0.35rem] text-base font-semibold">
            {formatDateSq(bundle.expires_at)}
          </dd>
        </div>
      </dl>

      {bundle.status === "rejected" && bundle.rejection_reason ? (
        <p className="m-0 mb-8 text-[0.9375rem] text-danger" role="status">
          Arsye refuzimi: {bundle.rejection_reason}
        </p>
      ) : null}

      <h2 className="m-0 mb-5 text-base font-bold">Produktet</h2>
      {items.length === 0 ? (
        <p className={panelLead}>Nuk ka produkte në këtë dosje.</p>
      ) : (
        <ul className="m-0 list-none border-t border-line p-0">
          {items.map((item) => {
            const flagged = Boolean(item.rejection_note);
            return (
              <li
                key={item.id}
                className={
                  flagged
                    ? "flex flex-col gap-3 border-b border-l-[3px] border-line border-l-danger py-5 pl-3 min-[640px]:flex-row min-[640px]:items-center min-[640px]:justify-between min-[640px]:gap-8"
                    : "flex flex-col gap-3 border-b border-line py-5 min-[640px]:flex-row min-[640px]:items-center min-[640px]:justify-between min-[640px]:gap-8"
                }
              >
                <div className="flex min-w-0 items-start gap-5">
                  <span
                    className="inline-flex min-w-[3.25rem] shrink-0 items-center justify-center rounded-[0.35rem] bg-accent px-2 py-1.5 text-[0.9375rem] leading-none font-bold text-on-accent"
                    aria-hidden
                  >
                    {formatDiscountPercent(item.discount_percent)}
                  </span>
                  <div>
                    <p className="m-0 text-[1.0625rem] font-semibold">
                      {item.name}
                      {flagged ? (
                        <span className="text-[0.8125rem] font-bold text-danger"> Duhet rregulluar</span>
                      ) : null}
                    </p>
                    <p className="m-0 mt-1 text-sm text-muted">
                      {item.category?.name ?? "Kategori"}
                    </p>
                    {flagged && item.rejection_note ? (
                      <p className="m-0 mt-[0.35rem] text-[0.8125rem] text-danger">
                        {item.rejection_note}
                      </p>
                    ) : null}
                  </div>
                </div>
                <div className="flex flex-col items-start gap-[0.15rem] min-[640px]:items-end min-[640px]:text-right">
                  <span className="text-[1.0625rem] font-bold">
                    {formatEurFromCents(item.discounted_price)}
                  </span>
                  <span className="text-sm text-muted line-through">
                    {formatEurFromCents(item.original_price)}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </article>
  );
}
