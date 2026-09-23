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
import { btnGhost, btnPrimary, btnSm, fieldError, panelLead } from "@/lib/ui";
import type { OfferBundle } from "@/types";

const rowClass =
  "flex flex-col gap-5 border-b border-line py-5 min-[800px]:flex-row min-[800px]:items-center min-[800px]:justify-between";

const rowActionClass = `${btnGhost} ${btnSm} min-w-[5.5rem] flex-auto min-[800px]:flex-none`;

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
    <div>
      {isFetching ? (
        <p className="mb-4 text-[0.8125rem] text-muted">Duke përditësuar…</p>
      ) : null}

      {actionError ? (
        <p className={fieldError} role="alert">
          {actionError}
        </p>
      ) : null}

      {bundles.length === 0 ? (
        <p className={panelLead}>Nuk ka dosje në pritje tani.</p>
      ) : (
        <ul className="m-0 list-none border-t border-line p-0">
          {bundles.map((bundle) => (
            <li key={bundle.id} className={rowClass}>
              <Link
                href={`/admin/offers/${bundle.id}`}
                className="group flex min-w-0 flex-1 gap-5 rounded-lg text-inherit no-underline"
              >
                <div>
                  <p className="m-0 text-[1.0625rem] font-semibold group-hover:underline group-hover:decoration-accent group-hover:underline-offset-[0.15em]">
                    {bundle.title}
                  </p>
                  <p className="mt-[0.3rem] text-sm leading-[1.45] text-muted">
                    {bundle.business?.name ?? "Biznes"}
                    {" · "}
                    {bundle.items_count ?? bundle.items?.length ?? 0} produkte
                    {" · "}
                    deri {formatDateShortSq(bundle.expires_at)}
                  </p>
                </div>
              </Link>

              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/admin/offers/${bundle.id}`}
                  className={rowActionClass}
                >
                  Shiko
                </Link>
                <button
                  type="button"
                  className={`${btnPrimary} ${btnSm} min-w-[5.5rem] flex-auto min-[800px]:flex-none`}
                  disabled={approveMutation.isPending || rejectMutation.isPending}
                  onClick={() => setToApprove(bundle)}
                >
                  Aprovo
                </button>
                <button
                  type="button"
                  className={rowActionClass}
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
