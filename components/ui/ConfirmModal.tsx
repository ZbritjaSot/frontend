"use client";

import { Modal } from "@/components/ui/Modal";
import { btn, btnGhost, btnPrimary } from "@/lib/ui";

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
            className={
              danger
                ? `${btn} border border-white/45 bg-transparent text-white hover:bg-white/10`
                : btnGhost
            }
            onClick={onClose}
            disabled={pending}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={
              danger
                ? `${btn} bg-[#ff5252] text-white hover:brightness-110`
                : btnPrimary
            }
            onClick={onConfirm}
            disabled={pending}
          >
            {pending ? "Duke u kryer…" : confirmLabel}
          </button>
        </>
      }
    >
      <p className={`m-0 leading-relaxed ${danger ? "text-white" : "text-muted"}`}>
        {message}
      </p>
    </Modal>
  );
}
