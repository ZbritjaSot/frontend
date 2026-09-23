"use client";

import Link from "next/link";
import { useState } from "react";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { Spinner } from "@/components/ui/Spinner";
import { RejectBundleModal } from "@/features/admin/RejectBundleModal";
import {
  useApproveOffer,
  usePendingOffers,
  useRejectOffer,
} from "@/hooks/useAdminOffers";
import { formatDateShortSq } from "@/lib/format";
import { validationMessage } from "@/lib/api";
import type { OfferBundle } from "@/types";

export function AdminPendingOffers() {
  const { data, isLoading, isError, error, refetch, isFetching } =
    usePendingOffers();
  const approveMutation = useApproveOffer();
  const rejectMutation = useRejectOffer();
  const [actionError, setActionError] = useState<string | null>(null);
  const [toApprove, setToApprove] = useState<OfferBundle | null>(null);
  const [toReject, setToReject] = useState<OfferBundle | null>(null);

  if (isLoading) {
    return <Spinner label="Duke ngarkuar radhën" />;
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

  async function confirmApprove() {
    if (!toApprove) {
      return;
    }
    setActionError(null);
    try {
      await approveMutation.mutateAsync(toApprove.id);
      setToApprove(null);
    } catch (err) {
      setActionError(validationMessage(err, "Nuk mundëm ta aprovojmë dosjen."));
      setToApprove(null);
    }
  }

  async function confirmReject(payload: {
    reason?: string;
    item_ids: string[];
  }) {
    if (!toReject) {
      return;
    }
    setActionError(null);
    try {
      await rejectMutation.mutateAsync({
        id: toReject.id,
        reason: payload.reason,
        item_ids: payload.item_ids,
      });
      setToReject(null);
    } catch (err) {
      setActionError(validationMessage(err, "Nuk mundëm ta refuzojmë dosjen."));
      setToReject(null);
    }
  }

  return (
    <div className="biz-offers">
      {isFetching ? (
        <p className="biz-offers__hint" style={{ marginBottom: "1rem" }}>
          Duke përditësuar…
        </p>
      ) : null}

      {actionError ? (
        <p className="offer-form__error" role="alert">
          {actionError}
        </p>
      ) : null}

      {bundles.length === 0 ? (
        <p className="shell-panel__lead">Nuk ka dosje në pritje tani.</p>
      ) : (
        <ul className="biz-offer-list">
          {bundles.map((bundle) => (
            <li key={bundle.id} className="biz-offer-row">
              <Link
                href={`/admin/offers/${bundle.id}`}
                className="biz-offer-row__main biz-offer-row__main--link"
              >
                <div>
                  <p className="biz-offer-row__name">{bundle.title}</p>
                  <p className="biz-offer-row__meta">
                    {bundle.business?.name ?? "Biznes"}
                    {" · "}
                    {bundle.items_count ?? bundle.items?.length ?? 0} produkte
                    {" · "}
                    deri {formatDateShortSq(bundle.expires_at)}
                  </p>
                </div>
              </Link>

              <div className="biz-offer-row__actions">
                <Link
                  href={`/admin/offers/${bundle.id}`}
                  className="btn btn--ghost btn--sm"
                >
                  Shiko
                </Link>
                <button
                  type="button"
                  className="btn btn--primary btn--sm"
                  disabled={approveMutation.isPending || rejectMutation.isPending}
                  onClick={() => setToApprove(bundle)}
                >
                  Aprovo
                </button>
                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  disabled={approveMutation.isPending || rejectMutation.isPending}
                  onClick={() => setToReject(bundle)}
                >
                  Refuzo
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmModal
        open={toApprove !== null}
        title="Aprovo dosjen"
        message={
          toApprove
            ? `Aprovo “${toApprove.title}”? Të gjitha produktet do të shfaqen te faqja publike nëse janë brenda datave.`
            : ""
        }
        confirmLabel="Aprovo"
        cancelLabel="Anulo"
        pending={approveMutation.isPending}
        onConfirm={confirmApprove}
        onClose={() => {
          if (!approveMutation.isPending) {
            setToApprove(null);
          }
        }}
      />

      <RejectBundleModal
        bundle={toReject}
        pending={rejectMutation.isPending}
        onClose={() => {
          if (!rejectMutation.isPending) {
            setToReject(null);
          }
        }}
        onConfirm={confirmReject}
      />
    </div>
  );
}
