"use client";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import { OfferBundleView } from "@/features/offers/OfferBundleView";
import { bundleDisplayTitle, publicBundlePath } from "@/features/offers/status";
import { useApproveManagerBundle, useManagerBundle } from "@/hooks/useManagerReview";
import { validationMessage } from "@/lib/api";
import { button, pageTitle, panelLead } from "@/lib/ui";

export function ManagerInspect({ id }: { id: string }) {
  const router = useRouter();
  const { data: bundle, isLoading, isError, error } = useManagerBundle(id);
  const approve = useApproveManagerBundle();
  const [confirm, setConfirm] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const { showToast } = useToast();

  if (isLoading) {
    return <Spinner label="Duke ngarkuar dosjen" />;
  }

  if (isError || !bundle) {
    return (
      <div className="max-w-[40rem]">
        <p className={panelLead}>{validationMessage(error, "Dosja nuk u gjet.")}</p>
        <Link href="/biz" className={button({ variant: "secondary" })}>
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
      const path = publicBundlePath(bundle!);
      showToast("U aprovua", {
        tone: "success",
        action: path
          ? { label: "Shiko në faqe", onClick: () => window.open(path, "_blank", "noopener,noreferrer") }
          : undefined,
      });
      router.replace("/biz");
    } catch (err) {
      const message = validationMessage(err, "Nuk mundëm ta aprovojmë dosjen.");
      setActionError(message);
      showToast(message, { tone: "error" });
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
            <Link href={`/biz/review/${bundle.id}/edit`} className={button({ variant: "secondary" })}>
              Ndrysho
            </Link>
            <button className={button()} type="button" onClick={() => setConfirm(true)}>
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
