"use client";

import { useState } from "react";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { Modal } from "@/components/ui/Modal";
import {
  useApproveOffer,
  usePendingOffers,
  useRejectOffer,
} from "@/hooks/useAdminOffers";
import {
  formatDateShortSq,
  formatDiscountPercent,
  formatEur,
} from "@/lib/format";
import { validationMessage } from "@/lib/api";
import type { Offer } from "@/types";

export function AdminPendingOffers() {
  const { data, isLoading, isError, error, refetch, isFetching } =
    usePendingOffers();
  const approveMutation = useApproveOffer();
  const rejectMutation = useRejectOffer();
  const [actionError, setActionError] = useState<string | null>(null);
  const [toApprove, setToApprove] = useState<Offer | null>(null);
  const [toReject, setToReject] = useState<Offer | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  if (isLoading) {
    return <p className="shell-panel__lead">Duke ngarkuar radhën…</p>;
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

  async function confirmApprove() {
    if (!toApprove) {
      return;
    }
    setActionError(null);
    try {
      await approveMutation.mutateAsync(toApprove.id);
      setToApprove(null);
    } catch (err) {
      setActionError(validationMessage(err, "Nuk mundëm ta aprovojmë ofertën."));
      setToApprove(null);
    }
  }

  async function confirmReject() {
    if (!toReject) {
      return;
    }
    setActionError(null);
    try {
      await rejectMutation.mutateAsync({
        id: toReject.id,
        reason: rejectReason.trim() || undefined,
      });
      setToReject(null);
      setRejectReason("");
    } catch (err) {
      setActionError(validationMessage(err, "Nuk mundëm ta refuzojmë ofertën."));
      setToReject(null);
      setRejectReason("");
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

      {offers.length === 0 ? (
        <p className="shell-panel__lead">Nuk ka oferta në pritje tani.</p>
      ) : (
        <ul className="biz-offer-list">
          {offers.map((offer) => (
            <li key={offer.id} className="biz-offer-row">
              <div className="biz-offer-row__main">
                <div>
                  <p className="biz-offer-row__name">{offer.name}</p>
                  <p className="biz-offer-row__meta">
                    {offer.business?.name ?? "Biznes"}
                    {offer.category ? ` · ${offer.category.name}` : ""}
                    {" · "}
                    {formatDiscountPercent(offer.discount_percent)} ·{" "}
                    {formatEur(offer.discounted_price)}{" "}
                    <span className="biz-offer-row__was">
                      {formatEur(offer.original_price)}
                    </span>
                    {" · "}
                    deri {formatDateShortSq(offer.expires_at)}
                  </p>
                </div>
              </div>

              <div className="biz-offer-row__actions">
                <button
                  type="button"
                  className="btn btn--primary btn--sm"
                  disabled={approveMutation.isPending || rejectMutation.isPending}
                  onClick={() => setToApprove(offer)}
                >
                  Aprovo
                </button>
                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  disabled={approveMutation.isPending || rejectMutation.isPending}
                  onClick={() => {
                    setRejectReason("");
                    setToReject(offer);
                  }}
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
        title="Aprovo ofertën"
        message={
          toApprove
            ? `Aprovo “${toApprove.name}”? Do të shfaqet te faqja publike nëse është brenda datave.`
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

      <Modal
        open={toReject !== null}
        title="Refuzo ofertën"
        onClose={() => {
          if (!rejectMutation.isPending) {
            setToReject(null);
            setRejectReason("");
          }
        }}
        footer={
          <>
            <button
              type="button"
              className="btn btn--ghost"
              disabled={rejectMutation.isPending}
              onClick={() => {
                setToReject(null);
                setRejectReason("");
              }}
            >
              Anulo
            </button>
            <button
              type="button"
              className="btn btn--danger"
              disabled={rejectMutation.isPending}
              onClick={confirmReject}
            >
              {rejectMutation.isPending ? "Duke u refuzuar…" : "Refuzo"}
            </button>
          </>
        }
      >
        <p className="modal__message">
          {toReject
            ? `Refuzo “${toReject.name}”. Arsyeja është opsionale.`
            : ""}
        </p>
        <label className="offer-form__field" style={{ marginTop: "1rem" }}>
          <span>Arsye (opsionale)</span>
          <textarea
            className="modal__textarea"
            rows={3}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            disabled={rejectMutation.isPending}
            maxLength={1000}
            placeholder="p.sh. mungon informacioni…"
          />
        </label>
      </Modal>
    </div>
  );
}
