"use client";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { Spinner } from "@/components/ui/Spinner";
import { OfferBundleView } from "@/features/offers/OfferBundleView";
import { bundleDisplayTitle } from "@/features/offers/status";
import { useApproveManagerBundle, useManagerBundle } from "@/hooks/useManagerReview";
import { validationMessage } from "@/lib/api";
import { btnGhost, btnPrimary, pageTitle, panelLead } from "@/lib/ui";

export function ManagerInspect({ id }: { id: string }) {
  const router = useRouter();
  const { data: bundle, isLoading, isError, error } = useManagerBundle(id);
  const approve = useApproveManagerBundle();
  const [confirm, setConfirm] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  if (isLoading) {
    return <Spinner label="Duke ngarkuar dosjen" />;
  }

  if (isError || !bundle) {
    return (
      <div className="max-w-[40rem]">
        <p className={panelLead}>{validationMessage(error, "Dosja nuk u gjet.")}</p>
        <Link href="/biz" className={btnGhost}>
          <ArrowBackIcon fontSize="small" />
          Në pritje
        </Link>
      </div>
    );
  }

  const pending = bundle.status === "pending";

  async function onApprove() {
    setActionError(null);
    try {
      await approve.mutateAsync(bundle!.id);
      setConfirm(false);
      router.replace("/biz");
    } catch (err) {
      setActionError(validationMessage(err, "Nuk mundëm ta aprovojmë dosjen."));
      setConfirm(false);
    }
  }

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            href="/biz"
            className="inline-flex items-center gap-1 text-sm font-semibold text-muted no-underline hover:text-ink"
          >
            <ArrowBackIcon fontSize="small" />
            Në pritje
          </Link>
          <h1 className={`${pageTitle} mt-3 mb-0!`}>
            {bundleDisplayTitle(bundle)}
          </h1>
          <p className="m-0 mt-1 text-sm text-muted">{bundle.business?.name}</p>
        </div>
        {pending ? (
          <div className="flex gap-2">
            <Link href={`/biz/review/${bundle.id}/edit`} className={btnGhost}>
              Ndrysho
            </Link>
            <button className={btnPrimary} type="button" onClick={() => setConfirm(true)}>
              Aprovo
            </button>
          </div>
        ) : null}
      </div>
      {actionError ? <p className={`${panelLead} text-danger`}>{actionError}</p> : null}
      <OfferBundleView bundle={bundle} showBusiness showHeading={false} />
      <ConfirmModal
        open={confirm}
        title="Aprovo dosjen"
        message={`Aprovo “${bundleDisplayTitle(bundle)}”? Del në faqen publike.`}
        confirmLabel="Aprovo"
        pending={approve.isPending}
        onConfirm={() => {
          void onApprove();
        }}
        onClose={() => {
          if (!approve.isPending) {
            setConfirm(false);
          }
        }}
      />
    </>
  );
}
