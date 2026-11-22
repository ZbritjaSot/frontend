"use client";

import { VisibilityOutlinedIcon } from "@/components/ui/icons";
import Link from "next/link";
import { Pagination } from "@/components/ui/Pagination";
import { Spinner } from "@/components/ui/Spinner";
import { TableSearch } from "@/components/ui/TableSearch";
import { PENDING_OFFERS_PAGE_SIZE } from "@/features/admin/offersApi";
import { bundleDisplayTitle, OFFER_STATUS_LABEL, OFFER_STATUS_HINT } from "@/features/offers/status";
import { useApprovedOffers } from "@/hooks/useAdminOffers";
import { formatDateShortSq } from "@/lib/format";
import { validationMessage } from "@/lib/api";
import { button, iconButton, offerStatusClass, panelLead } from "@/lib/ui";
import { Tooltip } from "@/components/ui/Tooltip";
import { CellLabel, dataCell, dataRowCard } from "@/components/ui/DataRow";

export function AdminLiveOffers({
  query,
  onQueryChange,
  q = "",
  page,
  onPageChange,
  scope = "approved",
}: {
  query: string;
  onQueryChange: (value: string) => void;
  q?: string;
  page: number;
  onPageChange: (page: number) => void;
  scope?: "approved" | "all";
}) {
  const { data, isLoading, isError, error, refetch } = useApprovedOffers(
    page,
    q,
    scope,
  );

  if (isLoading) {
    return (
      <Spinner
        label={
          scope === "all"
            ? "Duke ngarkuar ofertat"
            : "Duke ngarkuar ofertat aktive"
        }
      />
    );
  }

  if (isError) {
    return (
      <div className="max-w-[40rem]">
        <p className={panelLead}>
          {validationMessage(error, "Nuk mundëm t’i ngarkojmë ofertat.")}
        </p>
        <button className={button({ variant: "secondary" })} type="button" onClick={() => refetch()}>
          Provo përsëri
        </button>
      </div>
    );
  }

  const bundles = data?.data ?? [];
  const lastPage = data?.meta?.last_page;
  const total = data?.meta?.total ?? bundles.length;
  if (lastPage !== undefined && page > lastPage) {
    onPageChange(lastPage);
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-line">
      <TableSearch
        value={query}
        onChange={onQueryChange}
        label="Kërko dyqanin ose titullin"
      />
      {bundles.length === 0 ? (
        <p className="m-0 px-4 py-6 text-sm leading-relaxed text-muted">
          {q === ""
            ? scope === "all"
              ? "Nuk ka oferta."
              : "Nuk ka oferta aktive."
            : "Nuk u gjet asnjë ofertë."}
        </p>
      ) : (
        <div>
          <div className="overflow-x-auto md:grid md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_auto_auto_auto_auto] md:gap-x-4">
            <div className="col-span-6 hidden items-center border-b border-line bg-sunken px-4 py-3 text-xs font-bold tracking-[0.08em] text-muted uppercase md:grid md:grid-cols-subgrid">
              <span className="whitespace-nowrap">Oferta</span>
              <span className="whitespace-nowrap">Biznesi</span>
              <span className="whitespace-nowrap md:pl-6">Produkte</span>
              <span className="whitespace-nowrap md:pl-6">Skadon</span>
              <span className="whitespace-nowrap md:pl-6">Statusi</span>
              <span className="border-l border-line pl-4 whitespace-nowrap">
                Veprimet
              </span>
            </div>
            <ul className="col-span-6 m-0 list-none p-0 md:grid md:grid-cols-subgrid">
              {bundles.map((bundle) => {
                const count = bundle.items_count ?? bundle.items?.length ?? 0;
                return (
                  <li
                    key={bundle.id}
                    className={`col-span-6 grid items-center gap-3 border-b border-line px-4 py-3 last:border-b-0 md:grid-cols-subgrid md:gap-x-4 ${dataRowCard}`}
                  >
                    <Link
                      href={`/admin/offers/${bundle.id}`}
                      className={`truncate text-base font-semibold text-inherit no-underline hover:text-accent-fg ${dataCell.title} ${dataCell.titleText}`}
                    >
                      {bundleDisplayTitle(bundle)}
                    </Link>
                    <p className={`m-0 truncate text-sm font-semibold ${dataCell.meta}`}>
                      <CellLabel>Biznesi</CellLabel>
                      {bundle.business?.name ?? "Biznes"}
                    </p>
                    <p className={`m-0 text-sm font-semibold tabular-nums md:pl-6 ${dataCell.metaNowrap}`}>
                      <CellLabel>Produkte</CellLabel>
                      {count}
                    </p>
                    <p className={`m-0 text-sm font-semibold whitespace-nowrap tabular-nums md:pl-6 ${dataCell.metaNowrap}`}>
                      <CellLabel>Skadon</CellLabel>
                      {formatDateShortSq(bundle.expires_at)}
                    </p>
                    <Tooltip content={OFFER_STATUS_HINT[bundle.status]} className={`w-fit self-center md:ml-6 ${dataCell.status}`}>
                      <span
                        className={`${offerStatusClass(bundle.status)} mt-0!`}
                      >
                        {OFFER_STATUS_LABEL[bundle.status]}
                      </span>
                    </Tooltip>
                    <div className={`flex items-center gap-1.5 border-l border-line pl-4 ${dataCell.actions}`}>
                      <Tooltip content="Shiko">
                        <Link
                          href={`/admin/offers/${bundle.id}`}
                          className={iconButton}
                          aria-label={`Shiko ${bundleDisplayTitle(bundle)}`}
                        >
                          <VisibilityOutlinedIcon fontSize="small" />
                        </Link>
                      </Tooltip>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
          <Pagination
            page={page}
            lastPage={lastPage ?? 1}
            total={total}
            perPage={PENDING_OFFERS_PAGE_SIZE}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
}
