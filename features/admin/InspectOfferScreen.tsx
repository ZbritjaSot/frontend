"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { Spinner } from "@/components/ui/Spinner";
import { RejectBundleModal } from "@/features/admin/RejectBundleModal";
import { OfferBundleView } from "@/features/offers/OfferBundleView";
import {
  useAdminOfferBundle,
  useApproveOffer,
  useRejectOffer,
} from "@/hooks/useAdminOffers";
import { validationMessage } from "@/lib/api";

type InspectOfferScreenProps = {
  id: string;
};

export function InspectOfferScreen({ id }: InspectOfferScreenProps) {
  const router = useRouter();
  const { data: bundle, isLoading, isError, error } = useAdminOfferBundle(id);
  const approveMutation = useApproveOffer();
  const rejectMutation = useRejectOffer();
  const [actionError, setActionError] = useState<string | null>(null);
  const [confirmApprove, setConfirmApprove] = useState(false);
  const [confirmReject, setConfirmReject] = useState(false);

  if (isLoading) {
    return <Spinner label="Duke ngarkuar dosjen" />;
  }

  if (isError || !bundle) {
    return (
      <div className="shell-panel">
        <p className="shell-panel__lead">
          {validationMessage(error, "Dosja nuk u gjet.")}
        </p>
        <Link href="/admin/offers" className="btn btn--ghost">
          ← Radha
        </Link>
      </div>
    );
  }

  const isPending = bundle.status === "pending";

  async function onApprove() {
    setActionError(null);
    try {
      await approveMutation.mutateAsync(bundle!.id);
      setConfirmApprove(false);
      router.replace("/admin/offers");
    } catch (err) {
      setActionError(validationMessage(err, "Nuk mundëm ta aprovojmë dosjen."));
      setConfirmApprove(false);
    }
  }

  async function onReject(payload: { reason?: string; item_ids: string[] }) {
    setActionError(null);
    try {
      await rejectMutation.mutateAsync({
        id: bundle!.id,
        reason: payload.reason,
        item_ids: payload.item_ids,
      });
      setConfirmReject(false);
      router.replace("/admin/offers");
    } catch (err) {
      setActionError(validationMessage(err, "Nuk mundëm ta refuzojmë dosjen."));
      setConfirmReject(false);
    }
  }

  return (
    <>
      <div className="bundle-view__toolbar">
        <Link href="/admin/offers" className="btn btn--ghost btn--sm">
          ← Radha
        </Link>
        {isPending ? (
          <div className="bundle-view__toolbar-actions">
            <button
              type="button"
              className="btn btn--primary btn--sm"
              disabled={approveMutation.isPending || rejectMutation.isPending}
              onClick={() => setConfirmApprove(true)}
            >
              Aprovo
            </button>
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              disabled={approveMutation.isPending || rejectMutation.isPending}
              onClick={() => setConfirmReject(true)}
            >
              Refuzo
            </button>
          </div>
        ) : null}
      </div>

      {actionError ? (
        <p className="offer-form__error" role="alert">
          {actionError}
        </p>
      ) : null}

      <OfferBundleView bundle={bundle} showBusiness />

      <ConfirmModal
        open={confirmApprove}
        title="Aprovo dosjen"
        message={`Aprovo “${bundle.title}”? Të gjitha produktet do të shfaqen te faqja publike nëse janë brenda datave.`}
        confirmLabel="Aprovo"
        cancelLabel="Anulo"
        pending={approveMutation.isPending}
        onConfirm={onApprove}
        onClose={() => {
          if (!approveMutation.isPending) {
            setConfirmApprove(false);
          }
        }}
      />

      <RejectBundleModal
        bundle={confirmReject ? bundle : null}
        pending={rejectMutation.isPending}
        onClose={() => {
          if (!rejectMutation.isPending) {
            setConfirmReject(false);
          }
        }}
        onConfirm={onReject}
      />
    </>
  );
}
