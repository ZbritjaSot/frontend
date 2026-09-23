import {
  formatDateSq,
  formatDiscountPercent,
  formatEurFromCents,
} from "@/lib/format";
import { OFFER_STATUS_LABEL } from "@/features/offers/status";
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
    <article className="bundle-view">
      <header className="bundle-view__header">
        <span
          className={`biz-offer-row__status biz-offer-row__status--${bundle.status}`}
        >
          {OFFER_STATUS_LABEL[bundle.status]}
        </span>
        <h1 className="bundle-view__title">{bundle.title}</h1>
        <p className="bundle-view__meta">
          {showBusiness && bundle.business
            ? `${bundle.business.name} · `
            : null}
          {items.length} {items.length === 1 ? "produkt" : "produkte"}
          {flaggedCount > 0
            ? ` · ${flaggedCount} për rregullim`
            : null}
        </p>
      </header>

      <dl className="bundle-view__facts">
        <div>
          <dt>Fillon</dt>
          <dd>{formatDateSq(bundle.starts_at)}</dd>
        </div>
        <div>
          <dt>Skadon</dt>
          <dd>{formatDateSq(bundle.expires_at)}</dd>
        </div>
      </dl>

      {bundle.status === "rejected" && bundle.rejection_reason ? (
        <p className="bundle-view__reject" role="status">
          Arsye refuzimi: {bundle.rejection_reason}
        </p>
      ) : null}

      <h2 className="bundle-view__section-title">Produktet</h2>
      {items.length === 0 ? (
        <p className="shell-panel__lead">Nuk ka produkte në këtë dosje.</p>
      ) : (
        <ul className="bundle-view__items">
          {items.map((item) => {
            const flagged = Boolean(item.rejection_note);
            return (
              <li
                key={item.id}
                className={
                  flagged
                    ? "bundle-view__item bundle-view__item--flagged"
                    : "bundle-view__item"
                }
              >
                <div className="bundle-view__item-main">
                  <span className="bundle-view__discount" aria-hidden>
                    {formatDiscountPercent(item.discount_percent)}
                  </span>
                  <div>
                    <p className="bundle-view__item-name">
                      {item.name}
                      {flagged ? (
                        <span className="bundle-view__flag"> Duhet rregulluar</span>
                      ) : null}
                    </p>
                    <p className="bundle-view__item-meta">
                      {item.category?.name ?? "Kategori"}
                    </p>
                    {flagged && item.rejection_note ? (
                      <p className="bundle-view__item-note">
                        {item.rejection_note}
                      </p>
                    ) : null}
                  </div>
                </div>
                <div className="bundle-view__item-prices">
                  <span className="bundle-view__now">
                    {formatEurFromCents(item.discounted_price)}
                  </span>
                  <span className="bundle-view__was">
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
