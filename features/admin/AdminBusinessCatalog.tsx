"use client";

import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import Link from "next/link";
import { useEffect, useState } from "react";
import { adminBusinessCatalogKey, IndicatorKey } from "@/components/ui/IndicatorKey";
import { OfferStatusFilters } from "@/components/ui/OfferStatusFilters";
import { Pagination } from "@/components/ui/Pagination";
import { Spinner } from "@/components/ui/Spinner";
import { TableSearch } from "@/components/ui/TableSearch";
import { PENDING_OFFERS_PAGE_SIZE } from "@/features/admin/offersApi";
import type { BundleCatalog } from "@/features/offers/bizApi";
import { bundleDisplayTitle, OFFER_STATUS_LABEL } from "@/features/offers/status";
import { useAdminBusinessBundles } from "@/hooks/useAdminOffers";
import { validationMessage } from "@/lib/api";
import { formatDateShortSq } from "@/lib/format";
import { btnGhost, btnPrimary, offerStatusClass, panelLead } from "@/lib/ui";

const STATUS_OPTIONS = [
  ["", "Të gjitha"],
  ["draft", "Draft"],
  ["pending", "Në pritje"],
  ["approved", "Aprovuar"],
  ["taken_down", "Hequr"],
  ["expired", "Skaduar"],
] as const;

type CatalogStatus = (typeof STATUS_OPTIONS)[number][0];

const rowButton =
  "inline-flex size-9 cursor-pointer items-center justify-center rounded-lg border border-line bg-sunken text-ink no-underline hover:border-accent/60";

export function AdminBusinessCatalog({
  businessId,
  catalog,
}: {
  businessId: string;
  catalog: BundleCatalog;
}) {
  const isFlyer = catalog === "flyers";
  const section = isFlyer ? "fletushkat" : "ofertat";
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<CatalogStatus>("");
  const { data, isLoading, isError, error, refetch } = useAdminBusinessBundles(
    businessId,
    page,
    q,
    status,
    catalog,
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const next = query.trim();
      setQ((current) => {
        if (current !== next) {
          setPage(1);
        }
        return next;
      });
    }, 300);
    return () => window.clearTimeout(timer);
  }, [query]);

  const bundles = data?.data ?? [];
  const lastPage = data?.meta?.last_page;
  const total = data?.meta?.total ?? bundles.length;
  if (!isLoading && lastPage !== undefined && page > lastPage) {
    setPage(lastPage);
  }

  const back = `/admin/businesses/${businessId}?section=${section}`;
  const createHref = `/admin/businesses/${businessId}/${isFlyer ? "flyers" : "offers"}/new`;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <p className="m-0 text-sm leading-relaxed text-muted">
          {isFlyer
            ? "Fletushkat e këtij dyqani, me statusin e tyre."
            : "Ofertat individuale të këtij dyqani, me statusin e tyre."}
        </p>
        <Link href={createHref} className={btnPrimary}>
          {isFlyer ? "Fletushkë e re" : "Oferta të reja"}
        </Link>
      </div>
      <OfferStatusFilters
        value={status}
        options={STATUS_OPTIONS}
        onChange={(value) => {
          setPage(1);
          setStatus(value);
        }}
      />
      <IndicatorKey items={adminBusinessCatalogKey} />

      {isLoading ? (
        <Spinner label={isFlyer ? "Duke ngarkuar fletushkat" : "Duke ngarkuar ofertat"} />
      ) : isError ? (
        <div className="max-w-[40rem]">
          <p className={panelLead}>
            {validationMessage(
              error,
              isFlyer
                ? "Nuk mundëm t’i ngarkojmë fletushkat."
                : "Nuk mundëm t’i ngarkojmë ofertat.",
            )}
          </p>
          <button className={btnGhost} type="button" onClick={() => refetch()}>
            Provo përsëri
          </button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line">
          <TableSearch
            value={query}
            onChange={setQuery}
            label={isFlyer ? "Kërko fletushkën" : "Kërko ofertën"}
          />
          {bundles.length === 0 ? (
            <p className="m-0 px-4 py-6 text-sm leading-relaxed text-muted">
              {q === ""
                ? isFlyer
                  ? "Ky dyqan nuk ka fletushka ende."
                  : "Ky dyqan nuk ka oferta individuale ende."
                : isFlyer
                  ? "Nuk u gjet asnjë fletushkë."
                  : "Nuk u gjet asnjë ofertë."}
            </p>
          ) : (
            <div className="overflow-x-auto md:grid md:grid-cols-[minmax(0,1.4fr)_auto_auto_auto_auto] md:gap-x-4">
              <div className="col-span-5 hidden items-center border-b border-line bg-sunken px-4 py-3 text-xs font-bold tracking-[0.08em] text-muted uppercase md:grid md:grid-cols-subgrid">
                <span>{isFlyer ? "Fletushka" : "Oferta"}</span>
                <span className="whitespace-nowrap md:pl-6">
                  {isFlyer ? "Produkte" : "Artikuj"}
                </span>
                <span className="whitespace-nowrap md:pl-6">Skadon</span>
                <span className="whitespace-nowrap md:pl-6">Statusi</span>
                <span className="border-l border-line pl-4 whitespace-nowrap">Veprimet</span>
              </div>
              <ul className="col-span-5 m-0 list-none p-0 md:grid md:grid-cols-subgrid">
                {bundles.map((bundle) => {
                  const count = bundle.items_count ?? bundle.items?.length ?? 0;
                  const title = bundleDisplayTitle(bundle);
                  const viewHref = `/admin/offers/${bundle.id}?back=${encodeURIComponent(back)}`;
                  const editHref = `/admin/offers/${bundle.id}/edit?back=${encodeURIComponent(back)}`;
                  return (
                    <li
                      key={bundle.id}
                      className="col-span-5 grid items-center gap-3 border-b border-line px-4 py-3 last:border-b-0 md:grid-cols-subgrid md:gap-x-4"
                    >
                      <div className="min-w-0">
                        <Link
                          href={viewHref}
                          className="truncate text-base font-semibold text-inherit no-underline hover:text-accent"
                        >
                          {title}
                        </Link>
                        {bundle.status === "taken_down" && bundle.rejection_reason ? (
                          <p className="m-0 truncate text-sm font-semibold text-danger">
                            {bundle.rejection_reason}
                          </p>
                        ) : null}
                      </div>
                      <p className="m-0 text-sm font-semibold tabular-nums md:pl-6">{count}</p>
                      <p className="m-0 text-sm font-semibold whitespace-nowrap tabular-nums md:pl-6">
                        {formatDateShortSq(bundle.expires_at)}
                      </p>
                      <span
                        className={`${offerStatusClass(bundle.status)} mt-0! w-fit self-center! md:ml-6`}
                      >
                        {OFFER_STATUS_LABEL[bundle.status]}
                      </span>
                      <div className="flex items-center gap-1.5 border-l border-line pl-4">
                        <Link href={viewHref} className={rowButton} aria-label={`Shiko ${title}`}>
                          <VisibilityOutlinedIcon fontSize="small" />
                        </Link>
                        <Link href={editHref} className={rowButton} aria-label={`Ndrysho ${title}`}>
                          <EditOutlinedIcon fontSize="small" />
                        </Link>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
          {bundles.length > 0 ? (
            <Pagination
              page={page}
              lastPage={lastPage ?? 1}
              total={total}
              perPage={PENDING_OFFERS_PAGE_SIZE}
              onPageChange={setPage}
            />
          ) : null}
        </div>
      )}
    </div>
  );
}
