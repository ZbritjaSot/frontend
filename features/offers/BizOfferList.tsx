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
import {
  formatDateShortSq,
  formatDiscountPercent,
  formatEur,
} from "@/lib/format";
import { validationMessage } from "@/lib/api";
import type { Offer } from "@/types";

export function BizOfferList() {
  const { data, isLoading, isError, error, refetch, isFetching } = useBizOffers();
  const submitMutation = useSubmitBizOffer();
  const deleteMutation = useDeleteBizOffer();
  const [actionError, setActionError] = useState<string | null>(null);
  const [offerToDelete, setOfferToDelete] = useState<Offer | null>(null);

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

  const offers = data?.data ?? [];

  async function onSubmit(offer: Offer) {
    setActionError(null);
    try {
      await submitMutation.mutateAsync(offer.id);
    } catch (err) {
      setActionError(
        validationMessage(err, "Nuk mundëm ta dërgojmë për aprovim."),
      );
    }
  }

  async function confirmDelete() {
    if (!offerToDelete) {
      return;
    }
    setActionError(null);
    try {
      await deleteMutation.mutateAsync(offerToDelete.id);
      setOfferToDelete(null);
    } catch (err) {
      setActionError(validationMessage(err, "Nuk mundëm ta fshijmë ofertën."));
      setOfferToDelete(null);
    }
  }

  return (
    <div className="biz-offers">
      <div className="biz-offers__toolbar">
        <Link href="/biz/offers/new" className="btn btn--primary">
          Ofertë e re
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

      {offers.length === 0 ? (
        <p className="shell-panel__lead">
          Nuk ke asnjë ofertë ende. Krijo të parën.
        </p>
      ) : (
        <ul className="biz-offer-list">
          {offers.map((offer) => (
            <li key={offer.id} className="biz-offer-row">
              <div className="biz-offer-row__main">
                <span
                  className={`biz-offer-row__status biz-offer-row__status--${offer.status}`}
                >
                  {OFFER_STATUS_LABEL[offer.status]}
                </span>
                <div>
                  <p className="biz-offer-row__name">{offer.name}</p>
                  <p className="biz-offer-row__meta">
                    {formatDiscountPercent(offer.discount_percent)} ·{" "}
                    {formatEur(offer.discounted_price)}{" "}
                    <span className="biz-offer-row__was">
                      {formatEur(offer.original_price)}
                    </span>
                    {" · "}
                    deri {formatDateShortSq(offer.expires_at)}
                    {offer.category ? ` · ${offer.category.name}` : ""}
                  </p>
                  {offer.status === "rejected" && offer.rejection_reason ? (
                    <p className="biz-offer-row__reject">
                      Arsye: {offer.rejection_reason}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="biz-offer-row__actions">
                {canEditOffer(offer.status) ? (
                  <Link
                    href={`/biz/offers/${offer.id}/edit`}
                    className="btn btn--ghost btn--sm"
                  >
                    Ndrysho
                  </Link>
                ) : null}
                {canSubmitOffer(offer.status) ? (
                  <button
                    type="button"
                    className="btn btn--primary btn--sm"
                    disabled={submitMutation.isPending}
                    onClick={() => onSubmit(offer)}
                  >
                    Dërgo
                  </button>
                ) : null}
                {canDeleteOffer(offer.status) ? (
                  <button
                    type="button"
                    className="btn btn--ghost btn--sm"
                    disabled={deleteMutation.isPending}
                    onClick={() => setOfferToDelete(offer)}
                  >
                    Fshi
                  </button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmModal
        open={offerToDelete !== null}
        title="Fshi ofertën"
        message={
          offerToDelete
            ? `Je i sigurt që do ta fshish “${offerToDelete.name}”? Ky veprim nuk kthehet mbrapsht.`
            : ""
        }
        confirmLabel="Fshi"
        cancelLabel="Anulo"
        danger
        pending={deleteMutation.isPending}
        onConfirm={confirmDelete}
        onClose={() => {
          if (!deleteMutation.isPending) {
            setOfferToDelete(null);
          }
        }}
      />
    </div>
  );
}
