"use client";

import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { mailResendKey, IndicatorKey } from "@/components/ui/IndicatorKey";
import {
  fetchMailResends,
  resendBusinessMail,
  resendOfferMail,
  type MailResend,
  type MailTemplate,
} from "@/features/admin/mailResendApi";
import { validationMessage } from "@/lib/api";
import { formatDateTimeShortSq } from "@/lib/format";
import { fieldError, iconButton } from "@/lib/ui";

const copy: Record<
  MailTemplate,
  { label: string; title: string; message: string; danger?: boolean }
> = {
  welcome: {
    label: "Mirëseardhja",
    title: "Ridërgo mirëseardhjen?",
    message:
      "Dyqani merr një fjalëkalim të ri. I vjetri ndalon së punuari, dhe e ndërron në hyrjen tjetër.",
    danger: true,
  },
  password_changed: {
    label: "Fjalëkalimi u ndryshua",
    title: "Ridërgo njoftimin?",
    message: "Dyqani merr përsëri emailin që fjalëkalimi u ndryshua. Fjalëkalimi nuk ndërrohet.",
  },
  password_reset: {
    label: "Rivendosja",
    title: "Ridërgo lidhjen e rivendosjes?",
    message: "Dyqani merr një lidhje të re. E vjetra nuk ruhet këtu.",
  },
  subscription_recorded: {
    label: "Abonimi",
    title: "Ridërgo abonimin?",
    message: "Dyqani merr datat e abonimit të fundit. Shënimi i pagesës nuk dërgohet.",
  },
  approved: {
    label: "Aprovimi",
    title: "Ridërgo aprovimin?",
    message: "Dyqani merr përsëri emailin që fletushka u aprovua.",
  },
  taken_down: {
    label: "Heqja",
    title: "Ridërgo heqjen?",
    message: "Dyqani merr përsëri arsyen me të cilën fletushka u hoq.",
  },
};

type MailResendsProps = {
  businessId?: string;
  offerBundleId?: string;
  templates: MailTemplate[];
};

export function MailResends({ businessId, offerBundleId, templates }: MailResendsProps) {
  const queryClient = useQueryClient();
  const [pendingTemplate, setPendingTemplate] = useState<MailTemplate | null>(null);
  const [error, setError] = useState<string | null>(null);
  const queryKey = ["admin", "mail-resends", businessId ?? "", offerBundleId ?? ""] as const;
  const rows = useQuery({
    queryKey,
    queryFn: () => fetchMailResends({ businessId, offerBundleId }),
  });

  const send = useMutation({
    mutationFn: (template: MailTemplate) =>
      offerBundleId
        ? resendOfferMail(offerBundleId, template)
        : resendBusinessMail(businessId ?? "", template),
    onSuccess: async () => {
      setPendingTemplate(null);
      setError(null);
      await queryClient.invalidateQueries({ queryKey });
    },
    onError: (caught) => {
      setError(validationMessage(caught, "Emaili nuk u dërgua."));
    },
  });

  const pendingCopy = pendingTemplate ? copy[pendingTemplate] : null;
  const history = rows.data?.data ?? [];

  return (
    <section className="grid gap-4">
      <div>
        <p className="m-0 text-xs font-bold tracking-[0.08em] text-muted uppercase">Emailet</p>
        <div className="mt-3">
          <IndicatorKey items={mailResendKey} />
        </div>
      </div>
      {error ? (
        <p className={fieldError} role="alert">
          {error}
        </p>
      ) : null}
      <ul className="m-0 list-none p-0">
        {templates.map((template) => (
          <li
            key={template}
            className="flex items-center justify-between gap-3 border-t border-line py-3"
          >
            <span className="font-semibold">{copy[template].label}</span>
            <button
              type="button"
              className={iconButton}
              aria-label={`Ridërgo ${copy[template].label}`}
              disabled={send.isPending}
              onClick={() => {
                setError(null);
                setPendingTemplate(template);
              }}
            >
              <SendOutlinedIcon fontSize="small" className="text-accent!" />
            </button>
          </li>
        ))}
      </ul>
      {history.length > 0 ? (
        <ul className="m-0 list-none p-0">
          {history.map((row) => (
            <ResendRow key={row.id} row={row} />
          ))}
        </ul>
      ) : null}
      <ConfirmModal
        open={pendingCopy !== null}
        title={pendingCopy?.title ?? ""}
        message={pendingCopy?.message ?? ""}
        confirmLabel="Ridërgo"
        danger={pendingCopy?.danger ?? false}
        pending={send.isPending}
        onConfirm={() => {
          if (pendingTemplate) {
            send.mutate(pendingTemplate);
          }
        }}
        onClose={() => {
          if (!send.isPending) {
            setPendingTemplate(null);
          }
        }}
      />
    </section>
  );
}

function ResendRow({ row }: { row: MailResend }) {
  return (
    <li className="border-t border-line py-2 text-sm text-muted">
      <span className="font-semibold text-ink">{copy[row.template].label}</span>
      {" · "}
      {row.email}
      {" · "}
      {row.admin_name || "Administrata"}
      {" · "}
      {formatDateTimeShortSq(row.created_at)}
    </li>
  );
}
