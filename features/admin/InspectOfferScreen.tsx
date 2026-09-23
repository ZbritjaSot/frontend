"use client";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/Spinner";
import { OfferBundleView } from "@/features/offers/OfferBundleView";
import {
  useAdminOfferBundle,
  useApproveOffer,
  useRejectOffer,
} from "@/hooks/useAdminOffers";
import { validationMessage } from "@/lib/api";
import { formatDateShortSq } from "@/lib/format";
import { OFFER_STATUS_LABEL } from "@/features/offers/status";
import {
  btnDanger,
  btnGhost,
  btnPrimary,
  fieldError,
  fieldLabel,
  inputClass,
  offerStatusClass,
  pageTitle,
  panelLead,
} from "@/lib/ui";

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
  const [reason, setReason] = useState("");
  const [problemIds, setProblemIds] = useState<string[]>([]);

  if (isLoading) {
    return <Spinner label="Duke ngarkuar dosjen" />;
  }

  if (isError || !bundle) {
    return (
      <div className="max-w-[40rem]">
        <p className={panelLead}>
          {validationMessage(error, "Dosja nuk u gjet.")}
        </p>
        <Link href="/admin/offers" className={btnGhost}>
          <ArrowBackIcon fontSize="small" />
          Në pritje
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

  function toggleProblem(itemId: string) {
    setActionError(null);
    setProblemIds((current) =>
      current.includes(itemId)
        ? current.filter((id) => id !== itemId)
        : [...current, itemId],
    );
  }

  function openReject() {
    if (problemIds.length < 1) {
      setActionError("Zgjidh të paktën një produkt që ka problem.");
      return;
    }
    setActionError(null);
    setConfirmReject(true);
  }

  function closeReject() {
    if (rejectMutation.isPending) {
      return;
    }
    setConfirmReject(false);
    setReason("");
  }

  async function onReject() {
    setActionError(null);
    try {
      const note = reason.trim();
      await rejectMutation.mutateAsync({
        id: bundle!.id,
        item_ids: problemIds,
        ...(note ? { reason: note } : {}),
      });
      setConfirmReject(false);
      setReason("");
      router.replace("/admin/offers");
    } catch (err) {
      setActionError(validationMessage(err, "Nuk mundëm ta refuzojmë dosjen."));
      setConfirmReject(false);
    }
  }

  return (
    <>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="grid min-w-0 grid-cols-[1.25rem_minmax(0,1fr)] items-center gap-x-1.5">
          <Link
            href="/admin/offers"
            className="col-span-2 grid grid-cols-subgrid items-center text-sm font-semibold text-muted no-underline hover:text-ink"
          >
            <ArrowBackIcon fontSize="small" />
            <span>Në pritje</span>
          </Link>
          <div className="col-start-2 mt-3 flex flex-wrap items-center gap-3">
            <h1 className={`${pageTitle} mb-0!`}>{bundle.title}</h1>
            <span
              className={`${offerStatusClass(bundle.status)} mt-0! self-center!`}
            >
              {OFFER_STATUS_LABEL[bundle.status]}
            </span>
          </div>
          <p className="col-start-2 m-0 mt-2 text-sm text-muted">
            {bundle.business?.name ?? "Biznes"}
            {" · "}
            {formatDateShortSq(bundle.starts_at)} →{" "}
            {formatDateShortSq(bundle.expires_at)}
            {" · "}
            {bundle.items?.length ?? bundle.items_count ?? 0}{" "}
            {(bundle.items?.length ?? bundle.items_count ?? 0) === 1
              ? "produkt"
              : "produkte"}
          </p>
        </div>
        {isPending ? (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={btnPrimary}
              disabled={approveMutation.isPending || rejectMutation.isPending}
              onClick={() => setConfirmApprove(true)}
            >
              Aprovo
            </button>
            <button
              type="button"
              className={`${btnDanger} ${
                problemIds.length < 1 ? "disabled:cursor-not-allowed!" : ""
              }`}
              disabled={
                problemIds.length < 1 ||
                approveMutation.isPending ||
                rejectMutation.isPending
              }
              onClick={openReject}
            >
              Refuzo
            </button>
          </div>
        ) : null}
      </div>

      {actionError ? (
        <p className={fieldError} role="alert">
          {actionError}
        </p>
      ) : null}

      <OfferBundleView
        bundle={bundle}
        showHeading={false}
        selectedIds={isPending ? problemIds : undefined}
        onToggleItem={isPending ? toggleProblem : undefined}
        selectionDisabled={rejectMutation.isPending}
      />

      <ConfirmModal
        open={confirmApprove}
        title="Aprovo dosjen"
        message={`Aprovo “${bundle.title}”? Dalin në faqen publike.`}
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

      <Modal
        open={confirmReject}
        title="Refuzo dosjen"
        onClose={closeReject}
        footer={
          <>
            <button
              type="button"
              className={btnGhost}
              disabled={rejectMutation.isPending}
              onClick={closeReject}
            >
              Anulo
            </button>
            <button
              type="button"
              className={btnDanger}
              disabled={rejectMutation.isPending}
              onClick={onReject}
            >
              {rejectMutation.isPending ? "Duke u refuzuar…" : "Refuzo"}
            </button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <p className="m-0 text-sm leading-relaxed text-muted">
            Refuzo “{bundle.title}”? Produktet e shënuara kthehen për rregullim.
          </p>
          <label className={fieldLabel}>
            <span>Arsye</span>
            <textarea
              className={`${inputClass} h-[calc(1.5em*4+1.4rem)] resize-none overflow-y-auto leading-normal`}
              rows={4}
              value={reason}
              maxLength={1000}
              disabled={rejectMutation.isPending}
              placeholder="Çfarë duhet rregulluar…"
              onChange={(event) => setReason(event.target.value)}
            />
          </label>
        </div>
      </Modal>
    </>
  );
}
