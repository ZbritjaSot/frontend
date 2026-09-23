"use client";

import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import Link from "next/link";
import { useState } from "react";
import { Pagination } from "@/components/ui/Pagination";
import { Spinner } from "@/components/ui/Spinner";
import { PENDING_OFFERS_PAGE_SIZE } from "@/features/admin/offersApi";
import { usePendingOffers } from "@/hooks/useAdminOffers";
import { formatDateShortSq } from "@/lib/format";
import { validationMessage } from "@/lib/api";
import { btnGhost, panelLead } from "@/lib/ui";

const rowButton =
  "inline-flex size-10 cursor-pointer items-center justify-center rounded-lg border border-line bg-sunken text-ink no-underline hover:border-accent/60 disabled:cursor-wait disabled:opacity-65";

export function AdminPendingOffers() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error, refetch } = usePendingOffers(page);

  if (isLoading) {
    return <Spinner label="Duke ngarkuar radhën" />;
  }

  if (isError) {
    return (
      <div className="max-w-[40rem]">
        <p className={panelLead}>
          {validationMessage(error, "Nuk mundëm t’i ngarkojmë ofertat.")}
        </p>
        <button className={btnGhost} type="button" onClick={() => refetch()}>
          Provo përsëri
        </button>
      </div>
    );
  }

  const bundles = data?.data ?? [];
  const lastPage = data?.meta?.last_page;
  const total = data?.meta?.total ?? bundles.length;
  if (lastPage !== undefined && page > lastPage) {
    setPage(lastPage);
  }

  return (
    <div>
      {bundles.length === 0 ? (
        <p className={panelLead}>Nuk ka oferta në pritje.</p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line">
          <div className="overflow-x-auto md:grid md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_auto_auto_auto] md:gap-x-4">
            <div className="col-span-5 hidden items-center border-b border-line bg-sunken px-4 py-3 text-xs font-bold tracking-[0.08em] text-muted uppercase md:grid md:grid-cols-subgrid">
              <span className="whitespace-nowrap">Oferta</span>
              <span className="whitespace-nowrap">Biznesi</span>
              <span className="whitespace-nowrap md:pl-6">Produkte</span>
              <span className="whitespace-nowrap md:pl-6">Skadon</span>
              <span className="border-l border-line pl-4 whitespace-nowrap">
                Veprimet
              </span>
            </div>
            <ul className="col-span-5 m-0 list-none p-0 md:grid md:grid-cols-subgrid">
              {bundles.map((bundle) => {
                const count = bundle.items_count ?? bundle.items?.length ?? 0;
                return (
                  <li
                    key={bundle.id}
                    className="col-span-5 grid items-center gap-3 border-b border-line px-4 py-3 last:border-b-0 md:grid-cols-subgrid md:gap-x-4"
                  >
                    <Link
                      href={`/admin/offers/${bundle.id}`}
                      className="truncate text-base font-semibold text-inherit no-underline hover:text-accent"
                    >
                      {bundle.title}
                    </Link>
                    <p className="m-0 truncate text-sm font-semibold">
                      {bundle.business?.name ?? "Biznes"}
                    </p>
                    <p className="m-0 text-sm font-semibold tabular-nums md:pl-6">
                      {count}
                    </p>
                    <p className="m-0 text-sm font-semibold whitespace-nowrap tabular-nums md:pl-6">
                      {formatDateShortSq(bundle.expires_at)}
                    </p>
                    <div className="flex items-center gap-2 border-l border-line pl-4">
                      <Link
                        href={`/admin/offers/${bundle.id}`}
                        className={rowButton}
                        aria-label={`Shiko ${bundle.title}`}
                      >
                        <VisibilityOutlinedIcon fontSize="small" />
                      </Link>
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
            onPageChange={setPage}
          />
        </div>
      )}

    </div>
  );
}
