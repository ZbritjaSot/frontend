"use client";

import { DeleteOutlinedIcon, EditOutlinedIcon, VisibilityOutlinedIcon } from "@/components/ui/icons";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { OfferStatusFilters } from "@/components/ui/OfferStatusFilters";
import { Pagination } from "@/components/ui/Pagination";
import { Spinner } from "@/components/ui/Spinner";
import { TableSearch } from "@/components/ui/TableSearch";
import { useToast } from "@/components/ui/Toast";
import { hasRole } from "@/features/auth/api";
import { ManagerReview } from "@/features/biz/ManagerReview";
import { BIZ_OFFERS_PAGE_SIZE, type BundleCatalog } from "@/features/offers/bizApi";
import { useMe } from "@/hooks/useAuth";
import { bundleDisplayTitle, canDeleteOffer, canEditOffer, canSubmitOffer, OFFER_STATUS_LABEL, OFFER_STATUS_HINT } from "@/features/offers/status";
import {
  useBizOffers,
  useDeleteBizOffer,
  useSubmitBizOffer,
} from "@/hooks/useBizOffers";
import { formatDateShortSq } from "@/lib/format";
import { validationMessage } from "@/lib/api";
import { button, fieldError, iconButton, offerStatusClass, pageTitle, panelLead } from "@/lib/ui";
import type { OfferBundle } from "@/types";
import { Tooltip } from "@/components/ui/Tooltip";

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
  const { showToast } = useToast();

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

  useEffect(() => {
    if (manager || isLoading || lastPage === undefined || page <= lastPage) {
      return;
    }
    // Persist the clamp so the query key matches the pager. Stops once page <= lastPage.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(lastPage);
  }, [manager, isLoading, lastPage, page]);

  if (manager) {
    return <ManagerReview catalog={catalog} />;
  }

  const header = (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <h1 className={`${pageTitle} mb-0!`}>
          {isFlyer ? "Fletushkat" : "Ofertat"}
        </h1>
        <Link href={`${basePath}/new`} className={button()}>
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
        <div className="max-w-[40rem]">
          <p className={panelLead}>
            {validationMessage(
              error,
              isFlyer
                ? "Nuk mundëm t’i ngarkojmë fletushkat."
                : "Nuk mundëm t’i ngarkojmë ofertat.",
            )}
          </p>
          <button className={button({ variant: "secondary" })} type="button" onClick={() => refetch()}>
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
      showToast("U dërgua për aprovim", { tone: "success" });
    } catch (err) {
      const message = validationMessage(err, "Nuk mundëm ta dërgojmë për aprovim.");
      setActionError(message);
      showToast(message, { tone: "error" });
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
      // No backend soft-delete for offer bundles (hard DELETE, confirmed in
      // OfferBundleController@destroy) — this is a confirmation toast only,
      // no "Undo" action, since there is nothing left server-side to restore.
      showToast("U fshi", { tone: "success" });
    } catch (err) {
      const message = validationMessage(
        err,
        isFlyer ? "Nuk mundëm ta fshijmë fletushkën." : "Nuk mundëm ta fshijmë ofertën.",
      );
      setActionError(message);
      showToast(message, { tone: "error" });
      setBundleToDelete(null);
    }
  }

  return (
    <div>
      {header}

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
                        className="truncate text-base font-semibold text-inherit no-underline hover:text-accent-fg"
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
                    <Tooltip content={OFFER_STATUS_HINT[bundle.status]} className="w-fit self-center md:ml-6">
                      <span
                        className={`${offerStatusClass(bundle.status)} mt-0!`}
                      >
                        {OFFER_STATUS_LABEL[bundle.status]}
                      </span>
                    </Tooltip>
                    <div className="flex flex-wrap items-center gap-1.5 border-l border-line pl-4">
                      <Tooltip content="Shiko">
                        <Link
                          href={`${basePath}/${bundle.id}`}
                          className={iconButton}
                          aria-label={`Shiko ${bundleDisplayTitle(bundle)}`}
                        >
                          <VisibilityOutlinedIcon fontSize="small" />
                        </Link>
                      </Tooltip>
                      {canEditOffer(bundle.status) ? (
                        <Tooltip content="Ndrysho">
                          <Link
                            href={`${basePath}/${bundle.id}/edit`}
                            className={iconButton}
                            aria-label={`Ndrysho ${bundleDisplayTitle(bundle)}`}
                          >
                            <EditOutlinedIcon fontSize="small" />
                          </Link>
                        </Tooltip>
                      ) : null}
                      {canSubmitOffer(bundle.status) ? (
                        <Tooltip content="Dërgo për aprovim">
                          <button
                            type="button"
                            className={button({ size: "sm" })}
                            aria-label={`Dërgo ${bundleDisplayTitle(bundle)}`}
                            aria-busy={submitMutation.isPending}
                            disabled={submitMutation.isPending}
                            onClick={() => onSubmit(bundle)}
                          >
                            Dërgo
                          </button>
                        </Tooltip>
                      ) : null}
                      {canDeleteOffer(bundle.status) ? (
                        <Tooltip content="Fshi">
                          <button
                            type="button"
                            className={iconButton}
                            aria-label={`Fshi ${bundleDisplayTitle(bundle)}`}
                            disabled={deleteMutation.isPending}
                            onClick={() => setBundleToDelete(bundle)}
                          >
                            <DeleteOutlinedIcon
                              fontSize="small"
                              className="text-danger!"
                            />
                          </button>
                        </Tooltip>
                      ) : null}
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
