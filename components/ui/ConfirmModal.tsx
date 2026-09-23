"use client";

import { Modal } from "@/components/ui/Modal";
import { btnDanger, btnGhost, btnPrimary } from "@/lib/ui";

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
      onClose={pending ? () => undefined : onClose}
      footer={
        <>
          <button
            type="button"
            className={btnGhost}
            onClick={onClose}
            disabled={pending}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={danger ? btnDanger : btnPrimary}
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
