"use client";

import Link from "next/link";
import { useState } from "react";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { Spinner } from "@/components/ui/Spinner";
import {
  useBizOffers,
  useDeleteBizOffer,
  useSubmitBizOffer,
} from "@/hooks/useBizOffers";
import {
  canDeleteOffer,
  canEditOffer,
  canSubmitOffer,
  OFFER_STATUS_LABEL,
} from "@/features/offers/status";
import { formatDateShortSq } from "@/lib/format";
import { validationMessage } from "@/lib/api";
import {
  btnGhost,
  btnPrimary,
  btnSm,
  fieldError,
  offerStatusClass,
  panelLead,
} from "@/lib/ui";
import type { OfferBundle } from "@/types";

const rowAction = `${btnSm} min-w-[5.5rem] flex-1 min-[800px]:flex-none`;

export function BizOfferList() {
  const { data, isLoading, isError, error, refetch, isFetching } = useBizOffers();
  const submitMutation = useSubmitBizOffer();
  const deleteMutation = useDeleteBizOffer();
  const [actionError, setActionError] = useState<string | null>(null);
  const [bundleToDelete, setBundleToDelete] = useState<OfferBundle | null>(null);

  if (isLoading) {
    return <Spinner label="Duke ngarkuar ofertat" />;
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
      setActionError(validationMessage(err, "Nuk mundëm ta fshijmë ofertën."));
      setBundleToDelete(null);
    }
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center gap-5">
        <Link href="/biz/offers/new" className={btnPrimary}>
          Dosje e re
        </Link>
        {isFetching ? (
          <span className="text-[0.8125rem] text-muted">Duke përditësuar…</span>
        ) : null}
      </div>

      {actionError ? (
        <p className={fieldError} role="alert">
          {actionError}
        </p>
      ) : null}

      {bundles.length === 0 ? (
        <p className={panelLead}>
          Nuk ke asnjë dosje ofertash ende. Krijo të parën (edhe me një produkt).
        </p>
      ) : (
        <ul className="m-0 list-none border-t border-line p-0">
          {bundles.map((bundle) => {
            const count = bundle.items_count ?? bundle.items?.length ?? 0;
            return (
              <li
                key={bundle.id}
                className="flex flex-col gap-5 border-b border-line py-5 min-[800px]:flex-row min-[800px]:items-center min-[800px]:justify-between"
              >
                <Link
                  href={`/biz/offers/${bundle.id}`}
                  className="group flex min-w-0 flex-1 gap-5 rounded-lg text-inherit no-underline"
                >
                  <span className={offerStatusClass(bundle.status)}>
                    {OFFER_STATUS_LABEL[bundle.status]}
                  </span>
                  <div>
                    <p className="m-0 text-[1.0625rem] font-semibold group-hover:underline group-hover:decoration-accent group-hover:underline-offset-[0.15em]">
                      {bundle.title}
                    </p>
                    <p className="m-0 mt-1 text-sm leading-snug text-muted">
                      {count} {count === 1 ? "produkt" : "produkte"}
                      {" · "}
                      deri {formatDateShortSq(bundle.expires_at)}
                      {bundle.status === "rejected" &&
                      (bundle.items?.filter((i) => i.rejection_note).length ??
                        0) > 0
                        ? ` · ${bundle.items!.filter((i) => i.rejection_note).length} për rregullim`
                        : null}
                    </p>
                    {bundle.status === "rejected" && bundle.rejection_reason ? (
                      <p className="m-0 mt-[0.35rem] text-[0.8125rem] text-danger">
                        Arsye: {bundle.rejection_reason}
                      </p>
                    ) : null}
                  </div>
                </Link>

                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/biz/offers/${bundle.id}`}
                    className={`${btnGhost} ${rowAction}`}
                  >
                    Shiko
                  </Link>
                  {canEditOffer(bundle.status) ? (
                    <Link
                      href={`/biz/offers/${bundle.id}/edit`}
                      className={`${btnGhost} ${rowAction}`}
                    >
                      Ndrysho
                    </Link>
                  ) : null}
                  {canSubmitOffer(bundle.status) ? (
                    <button
                      type="button"
                      className={`${btnPrimary} ${rowAction}`}
                      disabled={submitMutation.isPending}
                      onClick={() => onSubmit(bundle)}
                    >
                      Dërgo
                    </button>
                  ) : null}
                  {canDeleteOffer(bundle.status) ? (
                    <button
                      type="button"
                      className={`${btnGhost} ${rowAction}`}
                      disabled={deleteMutation.isPending}
                      onClick={() => setBundleToDelete(bundle)}
                    >
                      Fshi
                    </button>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <ConfirmModal
        open={bundleToDelete !== null}
        title="Fshi dosjen"
        message={
          bundleToDelete
            ? `Je i sigurt që do ta fshish “${bundleToDelete.title}”? Të gjitha produktet në dosje fshihen. Ky veprim nuk kthehet mbrapsht.`
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
