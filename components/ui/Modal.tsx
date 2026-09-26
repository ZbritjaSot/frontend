"use client";

import {
  useEffect,
  useId,
  useRef,
  type ReactNode,
  type MouseEvent,
} from "react";
import CloseIcon from "@mui/icons-material/Close";
import { createPortal } from "react-dom";

type ModalProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  /** Optional footer actions (buttons). */
  footer?: ReactNode;
  /** Wider dialog for forms. */
  size?: "sm" | "md" | "lg";
  /** Red shell for a change that is hard to undo. */
  danger?: boolean;
};

export function Modal({
  open,
  title,
  onClose,
  children,
  footer,
  size = "sm",
  danger = false,
}: ModalProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  const wasOpenRef = useRef(false);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) {
      wasOpenRef.current = false;
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCloseRef.current();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    // Focus the dialog only when it opens — not on every parent re-render
    // (that would steal focus from inputs like the reject reason textarea).
    if (!wasOpenRef.current) {
      dialogRef.current?.focus();
      wasOpenRef.current = true;
    }

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (!open || typeof document === "undefined") {
    return null;
  }

  function onBackdropClick(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-charcoal/45 p-5 backdrop-blur-[4px] sm:p-8"
      role="presentation"
      onClick={onBackdropClick}
    >
      <div
        ref={dialogRef}
        className={`flex w-full flex-col overflow-hidden rounded-lg border shadow-[0_24px_64px_var(--color-shadow)] outline-none ${
          size === "lg"
            ? "max-h-[min(92dvh,52rem)] max-w-2xl"
            : size === "md"
              ? "max-h-[min(90dvh,40rem)] max-w-lg"
              : "max-h-[min(90dvh,40rem)] max-w-sm"
        } ${
          danger
            ? "border-2 border-[#e53935] bg-[#4a1212] text-white"
            : "border-line bg-elevated"
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <div
          className={`flex shrink-0 items-start justify-between gap-5 px-5 pt-5 ${
            danger ? "bg-[#c62828] text-white" : "bg-elevated"
          }`}
        >
          <h2
            id={titleId}
            className="m-0 text-lg font-bold tracking-[-0.02em]"
          >
            {title}
          </h2>
          <button
            type="button"
            className={`-mt-1 -mr-1 inline-flex cursor-pointer border-0 bg-transparent p-0 ${
              danger ? "text-white/80 hover:text-white" : "text-muted hover:text-ink"
            }`}
            onClick={onClose}
            aria-label="Mbyll"
          >
            <CloseIcon />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto p-5">
          {children}
        </div>
        {footer ? (
          <div
            className={`relative z-2 flex shrink-0 flex-wrap justify-end gap-2.5 border-t px-5 pt-3.5 pb-5 ${
              danger
                ? "border-[#e53935]/50 bg-[#3a0d0d]"
                : "border-line bg-elevated"
            }`}
          >
            {footer}
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
