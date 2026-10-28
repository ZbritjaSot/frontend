"use client";

import CheckOutlinedIcon from "@mui/icons-material/CheckOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import Link from "next/link";
import { Fragment, useState } from "react";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { Pagination } from "@/components/ui/Pagination";
import { Spinner } from "@/components/ui/Spinner";
import { TableSearch } from "@/components/ui/TableSearch";
import { PENDING_OFFERS_PAGE_SIZE } from "@/features/admin/offersApi";
import { bundleDisplayTitle, OFFER_STATUS_LABEL } from "@/features/offers/status";
import { useApproveOffer, usePendingOffers } from "@/hooks/useAdminOffers";
import { formatDateShortSq } from "@/lib/format";
import { validationMessage } from "@/lib/api";
import { btnGhost, offerStatusClass, panelLead } from "@/lib/ui";
import type { OfferBundle } from "@/types";

const rowButton =
  "inline-flex size-9 cursor-pointer items-center justify-center rounded-lg border border-line bg-sunken text-ink no-underline hover:border-accent/60 disabled:cursor-wait disabled:opacity-65";

function PendingRow({
  bundle,
  pending,
  onApprove,
}: {
  bundle: OfferBundle;
  pending: boolean;
  onApprove: (bundle: OfferBundle) => void;
}) {
  const count = bundle.items_count ?? bundle.items?.length ?? 0;

  return (
    <li className="col-span-6 grid items-center gap-3 border-b border-line px-4 py-3 last:border-b-0 md:grid-cols-subgrid md:gap-x-4">
      <Link
        href={`/admin/offers/${bundle.id}`}
        className="truncate text-base font-semibold text-inherit no-underline hover:text-accent"
      >
        {bundleDisplayTitle(bundle)}
      </Link>
      <p className="m-0 truncate text-sm font-semibold">
        {bundle.business?.name ?? "Biznes"}
      </p>
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
        <Link
          href={`/admin/offers/${bundle.id}`}
          className={rowButton}
          aria-label={`Shiko ${bundleDisplayTitle(bundle)}`}
        >
          <VisibilityOutlinedIcon fontSize="small" />
        </Link>
        <button
          type="button"
          className={rowButton}
          aria-label={`Aprovo ${bundleDisplayTitle(bundle)}`}
          disabled={pending}
          onClick={() => onApprove(bundle)}
        >
          <CheckOutlinedIcon fontSize="small" className="text-accent!" />
        </button>
      </div>
    </li>
  );
}

export function AdminPendingOffers({
  query,
  onQueryChange,
  q = "",
  page,
  onPageChange,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  q?: string;
  page: number;
  onPageChange: (page: number) => void;
}) {
  const { data, isLoading, isError, error, refetch } = usePendingOffers(page, q);
  const approve = useApproveOffer();
  const [confirm, setConfirm] = useState<OfferBundle | null>(null);

  if (isLoading) {
    return <Spinner label="Duke ngarkuar listën" />;
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
    onPageChange(lastPage);
  }

  const direct = bundles.filter((bundle) => bundle.awaits_manager !== true);
  const managed = bundles.filter((bundle) => bundle.awaits_manager === true);

  return (
    <div className="overflow-hidden rounded-2xl border border-line">
      <TableSearch
        value={query}
        onChange={onQueryChange}
        label="Kërko dyqanin ose titullin"
      />
      {bundles.length === 0 ? (
        <p className="m-0 px-4 py-6 text-sm leading-relaxed text-muted">
          {q === "" ? "Nuk ka oferta në pritje." : "Nuk u gjet asnjë ofertë."}
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
              {direct.length > 0 ? (
                <li className="col-span-6 border-b border-line bg-sunken/60 px-4 py-2.5 text-xs font-bold tracking-[0.08em] text-muted uppercase">
                  Nga dyqani
                  <span className="ml-2 tabular-nums font-semibold normal-case tracking-normal">
                    {direct.length}
                  </span>
                </li>
              ) : null}
              {direct.map((bundle) => (
                <PendingRow
                  key={bundle.id}
                  bundle={bundle}
                  pending={approve.isPending}
                  onApprove={setConfirm}
                />
              ))}
              {managed.length > 0 ? (
                <Fragment>
                  <li className="col-span-6 border-b border-line bg-sunken/60 px-4 py-2.5 text-xs font-bold tracking-[0.08em] text-muted uppercase">
                    Nga menaxheri
                    <span className="ml-2 font-semibold normal-case tracking-normal text-muted">
                      (aprovim rezervë)
                    </span>
                    <span className="ml-2 tabular-nums font-semibold normal-case tracking-normal">
                      {managed.length}
                    </span>
                  </li>
                  {managed.map((bundle) => (
                    <PendingRow
                      key={bundle.id}
                      bundle={bundle}
                      pending={approve.isPending}
                      onApprove={setConfirm}
                    />
                  ))}
                </Fragment>
              ) : null}
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
      <ConfirmModal
        open={confirm !== null}
        title="Aprovo dosjen"
        message={
          approve.isError
            ? validationMessage(approve.error, "Nuk mundëm ta aprovojmë.")
            : confirm
              ? `Aprovo “${bundleDisplayTitle(confirm)}”? Dalin në faqen publike.`
              : ""
        }
        confirmLabel="Aprovo"
        pending={approve.isPending}
        onClose={() => {
          if (!approve.isPending) {
            approve.reset();
            setConfirm(null);
          }
        }}
        onConfirm={() => {
          if (!confirm) {
            return;
          }
          approve.mutate(confirm.id, {
            onSuccess: () => {
              setConfirm(null);
            },
          });
        }}
      />
    </div>
  );
}
