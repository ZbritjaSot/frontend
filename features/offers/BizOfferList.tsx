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
import type { OfferBundle } from "@/types";

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
      <div className="shell-panel">
        <p className="shell-panel__lead">
          {validationMessage(error, "Nuk mundëm t’i ngarkojmë ofertat.")}
        </p>
        <button className="btn btn--ghost" type="button" onClick={() => refetch()}>
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
    <div className="biz-offers">
      <div className="biz-offers__toolbar">
        <Link href="/biz/offers/new" className="btn btn--primary">
          Dosje e re
        </Link>
        {isFetching ? (
          <span className="biz-offers__hint">Duke përditësuar…</span>
        ) : null}
      </div>

      {actionError ? (
        <p className="offer-form__error" role="alert">
          {actionError}
        </p>
      ) : null}

      {bundles.length === 0 ? (
        <p className="shell-panel__lead">
          Nuk ke asnjë dosje ofertash ende. Krijo të parën (edhe me një produkt).
        </p>
      ) : (
        <ul className="biz-offer-list">
          {bundles.map((bundle) => {
            const count = bundle.items_count ?? bundle.items?.length ?? 0;
            return (
              <li key={bundle.id} className="biz-offer-row">
                <Link
                  href={`/biz/offers/${bundle.id}`}
                  className="biz-offer-row__main biz-offer-row__main--link"
                >
                  <span
                    className={`biz-offer-row__status biz-offer-row__status--${bundle.status}`}
                  >
                    {OFFER_STATUS_LABEL[bundle.status]}
                  </span>
                  <div>
                    <p className="biz-offer-row__name">{bundle.title}</p>
                    <p className="biz-offer-row__meta">
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
                      <p className="biz-offer-row__reject">
                        Arsye: {bundle.rejection_reason}
                      </p>
                    ) : null}
                  </div>
                </Link>

                <div className="biz-offer-row__actions">
                  <Link
                    href={`/biz/offers/${bundle.id}`}
                    className="btn btn--ghost btn--sm"
                  >
                    Shiko
                  </Link>
                  {canEditOffer(bundle.status) ? (
                    <Link
                      href={`/biz/offers/${bundle.id}/edit`}
                      className="btn btn--ghost btn--sm"
                    >
                      Ndrysho
                    </Link>
                  ) : null}
                  {canSubmitOffer(bundle.status) ? (
                    <button
                      type="button"
                      className="btn btn--primary btn--sm"
                      disabled={submitMutation.isPending}
                      onClick={() => onSubmit(bundle)}
                    >
                      Dërgo
                    </button>
                  ) : null}
                  {canDeleteOffer(bundle.status) ? (
                    <button
                      type="button"
                      className="btn btn--ghost btn--sm"
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
