"use client";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { adminInspectKey, IndicatorKey } from "@/components/ui/IndicatorKey";
import { Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/Spinner";
import { OfferBundleView } from "@/features/offers/OfferBundleView";
import {
  useAdminOfferBundle,
  useApproveOffer,
  useTakeDownOffer,
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
  const takeDownMutation = useTakeDownOffer();
  const [actionError, setActionError] = useState<string | null>(null);
  const [confirmApprove, setConfirmApprove] = useState(false);
  const [confirmTakeDown, setConfirmTakeDown] = useState(false);
  const [takeDownReason, setTakeDownReason] = useState("");

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
  const isApproved = bundle.status === "approved";
  const backHref = isApproved ? "/admin/offers?view=aktive" : "/admin/offers";
  const backLabel = isApproved ? "Aktive" : "Në pritje";

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

  function closeTakeDown() {
    if (takeDownMutation.isPending) {
      return;
    }
    setConfirmTakeDown(false);
    setTakeDownReason("");
  }

  async function onTakeDown() {
    const note = takeDownReason.trim();
    if (note === "") {
      setActionError("Shkruaj arsyen.");
      return;
    }
    setActionError(null);
    try {
      await takeDownMutation.mutateAsync({
        id: bundle!.id,
        reason: note,
      });
      setConfirmTakeDown(false);
      setTakeDownReason("");
      router.replace("/admin/offers?view=aktive");
    } catch (err) {
      setActionError(validationMessage(err, "Nuk mundëm ta heqim dosjen."));
      setConfirmTakeDown(false);
    }
  }

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <div className="grid min-w-0 grid-cols-[1.25rem_minmax(0,1fr)] items-center gap-x-1.5">
          <Link
            href={backHref}
            className="col-span-2 grid grid-cols-subgrid items-center text-sm font-semibold text-muted no-underline hover:text-ink"
          >
            <ArrowBackIcon fontSize="small" />
            <span>{backLabel}</span>
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
            <Link href={`/admin/offers/${bundle.id}/edit`} className={btnGhost}>
              Ndrysho
            </Link>
            <button
              type="button"
              className={btnPrimary}
              disabled={approveMutation.isPending}
              onClick={() => setConfirmApprove(true)}
            >
              Aprovo
            </button>
          </div>
        ) : null}
        {isApproved ? (
          <button
            type="button"
            className={btnDanger}
            disabled={takeDownMutation.isPending}
            onClick={() => {
              setActionError(null);
              setConfirmTakeDown(true);
            }}
          >
            Hiq nga faqja
          </button>
        ) : null}
      </div>

      <IndicatorKey items={adminInspectKey} />

      {actionError ? (
        <p className={fieldError} role="alert">
          {actionError}
        </p>
      ) : null}

      <OfferBundleView bundle={bundle} showHeading={false} />

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
        open={confirmTakeDown}
        title="Hiq nga faqja"
        onClose={closeTakeDown}
        footer={
          <>
            <button
              type="button"
              className={btnGhost}
              disabled={takeDownMutation.isPending}
              onClick={closeTakeDown}
            >
              Anulo
            </button>
            <button
              type="button"
              className={btnDanger}
              disabled={takeDownMutation.isPending || takeDownReason.trim() === ""}
              onClick={onTakeDown}
            >
              {takeDownMutation.isPending ? "Duke u hequr…" : "Hiq"}
            </button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <p className="m-0 text-sm leading-relaxed text-muted">
            Hiq “{bundle.title}” nga faqja publike? Biznesi merr email me
            arsyen.
          </p>
          <label className={fieldLabel}>
            <span>Arsye</span>
            <textarea
              className={`${inputClass} h-[calc(1.5em*4+1.4rem)] resize-none overflow-y-auto leading-normal`}
              rows={4}
              value={takeDownReason}
              maxLength={1000}
              disabled={takeDownMutation.isPending}
              placeholder="Pse hiqet…"
              onChange={(event) => setTakeDownReason(event.target.value)}
            />
          </label>
        </div>
      </Modal>
    </>
  );
}
