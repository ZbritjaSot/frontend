"use client";

import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardKpi } from "@/components/ui/DashboardKpi";
import { adminOfferKey, IndicatorKey } from "@/components/ui/IndicatorKey";
import {
  OfferStatusFilters,
  type OfferListStatus,
} from "@/components/ui/OfferStatusFilters";
import { Pagination } from "@/components/ui/Pagination";
import { Spinner } from "@/components/ui/Spinner";
import { TableSearch } from "@/components/ui/TableSearch";
import { fetchBizShops } from "@/features/branches/api";
import { bundleDisplayTitle, OFFER_STATUS_LABEL } from "@/features/offers/status";
import { useManagerReview } from "@/hooks/useManagerReview";
import { validationMessage } from "@/lib/api";
import { formatDateShortSq } from "@/lib/format";
import type { BundleCatalog } from "@/features/offers/bizApi";
import { btnGhost, btnPrimary, offerStatusClass, pageTitle, panelLead } from "@/lib/ui";

const rowButton =
  "inline-flex size-9 cursor-pointer items-center justify-center rounded-lg border border-line bg-sunken text-ink no-underline hover:border-accent/60";

export function ManagerReview({ catalog }: { catalog?: BundleCatalog } = {}) {
  const router = useRouter();
  const params = useSearchParams();
  const requested = params.get("status");
  const kindParam = params.get("kind");
  const resolvedCatalog: BundleCatalog | undefined =
    catalog ??
    (kindParam === "offers" || kindParam === "flyers" ? kindParam : undefined);
  const filter: OfferListStatus =
    requested === "all" ? "" : requested === "approved" ? "approved" : "pending";
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [q, setQ] = useState("");
  const listStatus = filter === "" ? "all" : filter;
  const { data, isLoading, isError, error, refetch } = useManagerReview(
    page,
    true,
    listStatus,
    q,
    resolvedCatalog,
  );
  const waiting = useManagerReview(1, true, "pending", "", resolvedCatalog);
  const shops = useQuery({ queryKey: ["biz", "shops"], queryFn: fetchBizShops });
  const isFlyer = resolvedCatalog !== "offers";
  const createHref =
    resolvedCatalog === "offers" ? "/biz/review/new?kind=offers" : "/biz/review/new";
  const basePath =
    resolvedCatalog === "flyers"
      ? "/biz/flyers"
      : resolvedCatalog === "offers"
        ? "/biz/offers"
        : "/biz";

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
  const lastPage = data?.meta?.last_page ?? 1;
  const total = data?.meta?.total ?? bundles.length;
  const waitingTotal = waiting.data?.meta?.total ?? 0;
  if (!isLoading && data?.meta?.last_page !== undefined && page > data.meta.last_page) {
    setPage(data.meta.last_page);
  }

  const header = (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <h1 className={`${pageTitle} mb-0!`}>
          {resolvedCatalog === "flyers"
            ? "Fletushkat"
            : resolvedCatalog === "offers"
              ? "Ofertat"
              : "Në pritje"}
        </h1>
        <div className="flex flex-wrap gap-2">
          {resolvedCatalog ? (
            <Link href={createHref} className={btnPrimary}>
              {isFlyer ? "Fletushkë e re" : "Oferta të reja"}
            </Link>
          ) : (
            <>
              <Link href="/biz/review/new" className={btnPrimary}>
                Fletushkë e re
              </Link>
              <Link href="/biz/review/new?kind=offers" className={btnGhost}>
                Oferta të reja
              </Link>
            </>
          )}
        </div>
      </div>
      <OfferStatusFilters
        value={filter}
        onChange={(value) => {
          setPage(1);
          const kindQuery =
            resolvedCatalog && basePath === "/biz"
              ? `kind=${resolvedCatalog}&`
              : "";
          router.replace(
            value === ""
              ? `${basePath}?${kindQuery}status=all`.replace("?&", "?")
              : value === "approved"
                ? `${basePath}?${kindQuery}status=approved`.replace("?&", "?")
                : basePath === "/biz" && resolvedCatalog
                  ? `${basePath}?kind=${resolvedCatalog}`
                  : basePath,
          );
        }}
      />
      <div className="mb-6 flex flex-wrap gap-x-8 gap-y-4">
        <DashboardKpi
          href={basePath}
          label="Në pritje"
          value={waitingTotal}
          detail={
            resolvedCatalog === "offers"
              ? "Oferta që presin aprovimin"
              : "Fletushka që presin aprovimin"
          }
          tone={waitingTotal > 0 ? "pending" : "ink"}
        />
        <DashboardKpi href="/biz/shops" label="Biznese" value={(shops.data ?? []).filter((shop) => !shop.parent_id).length} detail="Kompani në ngarkim" />
        <DashboardKpi href="/biz/shops" label="Degë" value={(shops.data ?? []).filter((shop) => shop.parent_id).length} detail="Lokacione shtesë" />
      </div>
    </>
  );

  return (
    <div>
      {header}
      <IndicatorKey items={adminOfferKey} />
      {isLoading ? (
        <Spinner label="Duke ngarkuar listën" />
      ) : isError ? (
        <div className="max-w-[40rem]">
          <p className={panelLead}>
            {validationMessage(error, "Nuk mundëm t’i ngarkojmë fletushkat.")}
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
            label="Kërko dyqanin ose titullin"
          />
          {bundles.length === 0 ? (
            <p className="m-0 px-4 py-6 text-sm leading-relaxed text-muted">
              {q === ""
                ? filter === "approved"
                  ? "Nuk ka oferta aktive."
                  : filter === ""
                    ? "Nuk ka oferta."
                    : "Nuk ka fletushka në pritje."
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
                        className="col-span-6 grid items-center gap-3 border-b border-line px-4 py-3 last:border-b-0 md:grid-cols-subgrid md:gap-x-4"
                      >
                        <Link
                          href={`/biz/review/${bundle.id}`}
                          className="truncate text-base font-semibold text-inherit no-underline hover:text-accent"
                        >
                          {bundleDisplayTitle(bundle)}
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
                        <span
                          className={`${offerStatusClass(bundle.status)} mt-0! w-fit self-center! md:ml-6`}
                        >
                          {OFFER_STATUS_LABEL[bundle.status]}
                        </span>
                        <div className="flex items-center gap-1.5 border-l border-line pl-4">
                          <Link
                            href={`/biz/review/${bundle.id}`}
                            className={rowButton}
                            aria-label={`Shiko ${bundleDisplayTitle(bundle)}`}
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
                lastPage={lastPage}
                total={total}
                perPage={15}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
