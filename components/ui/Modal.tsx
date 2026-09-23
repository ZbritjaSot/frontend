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
  size?: "sm" | "md";
};

export function Modal({
  open,
  title,
  onClose,
  children,
  footer,
  size = "sm",
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
        className={`flex max-h-[min(90dvh,40rem)] w-full flex-col overflow-hidden rounded-lg border border-line bg-elevated shadow-[0_24px_64px_var(--color-shadow)] outline-none ${
          size === "md" ? "max-w-lg" : "max-w-sm"
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <div className="flex shrink-0 items-start justify-between gap-5 bg-elevated px-5 pt-5">
          <h2
            id={titleId}
            className="m-0 text-lg font-bold tracking-[-0.02em]"
          >
            {title}
          </h2>
          <button
            type="button"
            className="-mt-1 -mr-1 inline-flex cursor-pointer border-0 bg-transparent p-0 text-muted hover:text-ink"
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
          <div className="relative z-2 flex shrink-0 flex-wrap justify-end gap-2.5 border-t border-line bg-elevated px-5 pt-3.5 pb-5">
            {footer}
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
