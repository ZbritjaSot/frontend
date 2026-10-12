"use client";

import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { OfferStatusFilters } from "@/components/ui/OfferStatusFilters";
import { bizOfferKey, IndicatorKey } from "@/components/ui/IndicatorKey";
import { Pagination } from "@/components/ui/Pagination";
import { Spinner } from "@/components/ui/Spinner";
import { TableSearch } from "@/components/ui/TableSearch";
import { hasRole } from "@/features/auth/api";
import { ManagerReview } from "@/features/biz/ManagerReview";
import { BIZ_OFFERS_PAGE_SIZE, type BundleCatalog } from "@/features/offers/bizApi";
import { useMe } from "@/hooks/useAuth";
import {
  bundleDisplayTitle,
  canDeleteOffer,
  canEditOffer,
  canSubmitOffer,
  OFFER_STATUS_LABEL,
} from "@/features/offers/status";
import {
  useBizOffers,
  useDeleteBizOffer,
  useSubmitBizOffer,
} from "@/hooks/useBizOffers";
import { formatDateShortSq } from "@/lib/format";
import { validationMessage } from "@/lib/api";
import {
  btnGhost,
  btnPrimary,
  fieldError,
  offerStatusClass,
  pageTitle,
  panelLead,
} from "@/lib/ui";
import type { OfferBundle } from "@/types";

const rowButton =
  "inline-flex size-9 cursor-pointer items-center justify-center rounded-lg border border-line bg-sunken text-ink no-underline hover:border-accent/60 disabled:cursor-wait disabled:opacity-65";

export function BizOfferList({ catalog = "flyers" }: { catalog?: BundleCatalog }) {
  const router = useRouter();
  const params = useSearchParams();
  const requested = params.get("status");
  const status = requested === "pending" || requested === "approved" ? requested : "";
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [q, setQ] = useState("");
  const { data: user } = useMe();
  const manager = !!user && hasRole(user, "manager");
  const basePath = catalog === "flyers" ? "/biz/flyers" : "/biz/offers";
  const isFlyer = catalog === "flyers";
  const { data, isLoading, isError, error, refetch } = useBizOffers(
    page,
    q,
    !manager,
    status,
    catalog,
  );
  const submitMutation = useSubmitBizOffer();
  const deleteMutation = useDeleteBizOffer();
  const [actionError, setActionError] = useState<string | null>(null);
  const [bundleToDelete, setBundleToDelete] = useState<OfferBundle | null>(null);

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

  if (manager) {
    return <ManagerReview catalog={catalog} />;
  }

  const bundles = data?.data ?? [];
  const lastPage = data?.meta?.last_page;
  const total = data?.meta?.total ?? bundles.length;
  if (!isLoading && lastPage !== undefined && page > lastPage) {
    setPage(lastPage);
  }

  const header = (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <h1 className={`${pageTitle} mb-0!`}>
          {isFlyer ? "Fletushkat" : "Ofertat"}
        </h1>
        <Link href={`${basePath}/new`} className={btnPrimary}>
          {isFlyer ? "Fletushkë e re" : "Oferta të reja"}
        </Link>
      </div>
      <OfferStatusFilters
        value={status}
        onChange={(value) => {
          setPage(1);
          router.replace(value === "" ? basePath : `${basePath}?status=${value}`);
        }}
      />
    </>
  );

  if (isLoading) {
    return (
      <div>
        {header}
        <IndicatorKey items={bizOfferKey} />
        <Spinner
          label={isFlyer ? "Duke ngarkuar fletushkat" : "Duke ngarkuar ofertat"}
        />
      </div>
    );
  }

  if (isError) {
    return (
      <div>
        {header}
        <IndicatorKey items={bizOfferKey} />
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
      </div>
    );
  }

  async function onSubmit(bundle: OfferBundle) {
    setActionError(null);
    try {
      await submitMutation.mutateAsync(bundle.id);
    } catch (err) {
      setActionError(
        validationMessage(err, "Nuk mundëm ta dërgojmë për aprovim."),
      );
    }
  }

  async function confirmDelete() {
    if (!bundleToDelete) {
      return;
    }
    setActionError(null);
    try {
      await deleteMutation.mutateAsync(bundleToDelete.id);
      setBundleToDelete(null);
    } catch (err) {
      setActionError(
        validationMessage(
          err,
          isFlyer ? "Nuk mundëm ta fshijmë fletushkën." : "Nuk mundëm ta fshijmë ofertën.",
        ),
      );
      setBundleToDelete(null);
    }
  }

  return (
    <div>
      {header}
      <IndicatorKey items={bizOfferKey} />

      {actionError ? (
        <p className={fieldError} role="alert">
          {actionError}
        </p>
      ) : null}

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
                ? "Nuk ke fletushka ende."
                : "Nuk ke oferta individuale ende."
              : isFlyer
                ? "Nuk u gjet asnjë fletushkë."
                : "Nuk u gjet asnjë ofertë."}
          </p>
        ) : (
          <div className="overflow-x-auto md:grid md:grid-cols-[minmax(0,1.4fr)_auto_auto_auto_auto] md:gap-x-4">
            <div className="col-span-5 hidden items-center border-b border-line bg-sunken px-4 py-3 text-xs font-bold tracking-[0.08em] text-muted uppercase md:grid md:grid-cols-subgrid">
              <span className="whitespace-nowrap">
                {isFlyer ? "Fletushka" : "Oferta"}
              </span>
              <span className="whitespace-nowrap md:pl-6">
                {isFlyer ? "Produkte" : "Artikuj"}
              </span>
              <span className="whitespace-nowrap md:pl-6">Skadon</span>
              <span className="whitespace-nowrap md:pl-6">Statusi</span>
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
                    <div className="min-w-0">
                      <Link
                        href={`${basePath}/${bundle.id}`}
                        className="truncate text-base font-semibold text-inherit no-underline hover:text-accent"
                      >
                        {bundleDisplayTitle(bundle)}
                      </Link>
                      {bundle.status === "taken_down" && bundle.rejection_reason ? (
                        <p className="m-0 truncate text-sm font-semibold text-danger">
                          {bundle.rejection_reason}
                        </p>
                      ) : null}
                    </div>
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
                    <div className="grid grid-cols-4 gap-1.5 border-l border-line pl-4">
                      <Link
                        href={`${basePath}/${bundle.id}`}
                        className={rowButton}
                        aria-label={`Shiko ${bundleDisplayTitle(bundle)}`}
                      >
                        <VisibilityOutlinedIcon fontSize="small" />
                      </Link>
                      {canEditOffer(bundle.status) ? (
                        <Link
                          href={`${basePath}/${bundle.id}/edit`}
                          className={rowButton}
                          aria-label={`Ndrysho ${bundleDisplayTitle(bundle)}`}
                        >
                          <EditOutlinedIcon fontSize="small" />
                        </Link>
                      ) : (
                        <span className="size-9" aria-hidden />
                      )}
                      {canSubmitOffer(bundle.status) ? (
                        <button
                          type="button"
                          className={rowButton}
                          aria-label={`Dërgo ${bundleDisplayTitle(bundle)}`}
                          disabled={submitMutation.isPending}
                          onClick={() => onSubmit(bundle)}
                        >
                          <SendOutlinedIcon
                            fontSize="small"
                            className="text-accent!"
                          />
                        </button>
                      ) : (
                        <span className="size-9" aria-hidden />
                      )}
                      {canDeleteOffer(bundle.status) ? (
                        <button
                          type="button"
                          className={rowButton}
                          aria-label={`Fshi ${bundleDisplayTitle(bundle)}`}
                          disabled={deleteMutation.isPending}
                          onClick={() => setBundleToDelete(bundle)}
                        >
                          <DeleteOutlinedIcon
                            fontSize="small"
                            className="text-danger!"
                          />
                        </button>
                      ) : (
                        <span className="size-9" aria-hidden />
                      )}
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
            perPage={BIZ_OFFERS_PAGE_SIZE}
            onPageChange={setPage}
          />
        ) : null}
      </div>

      <ConfirmModal
        open={bundleToDelete !== null}
        title={isFlyer ? "Fshi fletushkën" : "Fshi ofertat"}
        message={
          bundleToDelete
            ? bundleToDelete.status === "approved"
              ? `Fshi “${bundleDisplayTitle(bundleToDelete)}”? Hiqet nga faqja publike.`
              : `Fshi “${bundleDisplayTitle(bundleToDelete)}”?`
            : ""
        }
        confirmLabel="Fshi"
        cancelLabel="Anulo"
        danger
        pending={deleteMutation.isPending}
        onConfirm={confirmDelete}
        onClose={() => {
          if (!deleteMutation.isPending) {
            setBundleToDelete(null);
          }
        }}
      />
    </div>
  );
}
