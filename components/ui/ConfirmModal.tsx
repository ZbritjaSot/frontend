"use client";

import { Modal } from "@/components/ui/Modal";
import { button } from "@/lib/ui";

type ConfirmModalProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Destructive styling for the confirm button (delete, etc.). */
  danger?: boolean;
  pending?: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

export function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = "Po",
  cancelLabel = "Anulo",
  danger = false,
  pending = false,
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  return (
    <Modal
      open={open}
      title={title}
      danger={danger}
      onClose={pending ? () => undefined : onClose}
      footer={
        <>
          <button
            type="button"
            className={button({ variant: "secondary" })}
            onClick={onClose}
            disabled={pending}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={danger ? button({ variant: "danger" }) : button()}
            onClick={onConfirm}
            disabled={pending}
          >
            {pending ? "Duke u kryer…" : confirmLabel}
          </button>
        </>
      }
    >
      <p className="m-0 leading-relaxed text-muted">{message}</p>
    </Modal>
  );
}
