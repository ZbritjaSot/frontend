import {
  formatDateSq,
  formatDiscountPercent,
  formatEurFromCents,
} from "@/lib/format";
import { OFFER_STATUS_LABEL } from "@/features/offers/status";
import { checkInput, offerStatusClass, panelLead } from "@/lib/ui";
import type { OfferBundle } from "@/types";

type OfferBundleViewProps = {
  bundle: OfferBundle;
  /** Show business name (admin). */
  showBusiness?: boolean;
  /** Hide the title block when the screen already shows it. */
  showHeading?: boolean;
  /** Product ids marked as having a problem. */
  selectedIds?: string[];
  onToggleItem?: (id: string) => void;
  selectionDisabled?: boolean;
};

export function OfferBundleView({
  bundle,
  showBusiness = false,
  showHeading = true,
  selectedIds = [],
  onToggleItem,
  selectionDisabled = false,
}: OfferBundleViewProps) {
  const items = bundle.items ?? [];
  const selectable = onToggleItem !== undefined;
  const columnClass = selectable
    ? "md:grid-cols-[2.25rem_minmax(0,1.4fr)_minmax(0,0.8fr)_auto_auto]"
    : "md:grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)_auto_auto]";
  const spanClass = selectable ? "col-span-5" : "col-span-4";
  const flaggedCount = items.filter((item) => item.rejection_note).length;

  return (
    <article>
      {showHeading ? (
        <>
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
              {flaggedCount > 0 ? ` · ${flaggedCount} për rregullim` : null}
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
        </>
      ) : null}

      {bundle.status === "taken_down" && bundle.rejection_reason ? (
        <p className="m-0 mb-8 text-[0.9375rem] text-danger" role="status">
          Arsyeja: {bundle.rejection_reason}
        </p>
      ) : null}

      <h2 className="sr-only">Produktet</h2>
      {items.length === 0 ? (
        <p className={panelLead}>Nuk ka produkte në këtë dosje.</p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line">
          <div className={`overflow-x-auto md:grid ${columnClass} md:gap-x-4`}>
            <div className={`${spanClass} hidden items-center border-b border-line bg-sunken px-4 py-3 text-xs font-bold tracking-[0.08em] text-muted uppercase md:grid md:grid-cols-subgrid`}>
              {selectable ? (
                <span aria-hidden className="size-9" />
              ) : null}
              <span className="whitespace-nowrap">Produkti</span>
              <span className="whitespace-nowrap">Kategoria</span>
              <span className="whitespace-nowrap md:pl-6">Zbritja</span>
              <span className="whitespace-nowrap md:pl-6">Çmimi</span>
            </div>
            <ul className={`${spanClass} m-0 list-none p-0 md:grid md:grid-cols-subgrid`}>
              {items.map((item) => {
                const flagged = Boolean(item.rejection_note);
                const checked = selectedIds.includes(item.id);
                return (
                  <li
                    key={item.id}
                    className={`${spanClass} grid items-center gap-3 border-b border-line px-4 py-3 last:border-b-0 md:grid-cols-subgrid md:gap-x-4${
                      flagged || checked
                        ? " shadow-[inset_3px_0_0_var(--color-danger)]"
                        : ""
                    }`}
                  >
                    {selectable ? (
                      <label className="m-0 flex size-9 cursor-pointer items-center justify-center">
                        <input
                          className={checkInput}
                          type="checkbox"
                          checked={checked}
                          disabled={selectionDisabled}
                          aria-label={`Problem te ${item.name}`}
                          onChange={() => onToggleItem(item.id)}
                        />
                      </label>
                    ) : null}
                    <div className="min-w-0">
                      <p className="m-0 truncate text-base font-semibold">
                        {item.name}
                      </p>
                      {flagged && item.rejection_note ? (
                        <p className="m-0 truncate text-sm font-semibold text-danger">
                          {item.rejection_note}
                        </p>
                      ) : null}
                    </div>
                    <p className="m-0 truncate text-sm font-semibold">
                      {item.category?.name ?? "Kategori"}
                    </p>
                    {item.discount_percent != null ? (
                      <span className="inline-flex w-fit items-center justify-center rounded-md bg-accent px-2 py-1 text-sm leading-none font-bold text-on-accent md:ml-6">
                        {formatDiscountPercent(item.discount_percent)}
                      </span>
                    ) : (
                      <span className="text-sm text-muted md:ml-6">—</span>
                    )}
                    <div className="md:pl-6">
                      {item.discounted_price != null ? (
                        <>
                          <p className="m-0 text-sm font-bold tabular-nums">
                            {formatEurFromCents(item.discounted_price)}
                          </p>
                          {item.original_price != null ? (
                            <p className="m-0 text-sm text-muted line-through tabular-nums">
                              {formatEurFromCents(item.original_price)}
                            </p>
                          ) : null}
                        </>
                      ) : (
                        <p className="m-0 text-sm text-muted">—</p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </article>
  );
}
