"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
  type MouseEvent,
} from "react";
import { CloseIcon, WarningAmberOutlinedIcon } from "@/components/ui/icons";
import { createPortal } from "react-dom";

type ModalProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children?: ReactNode;
  /** Optional footer actions (buttons). */
  footer?: ReactNode;
  /** Wider dialog for forms. */
  size?: "sm" | "md" | "lg";
  /** Warning icon beside the title. The dialog surface stays neutral. */
  danger?: boolean;
};

/**
 * Same enter motion as the city menu in CatalogFilters
 * (`transition duration-150 ease-out`).
 */
const MOTION_MS = 150;

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(", ");

function focusableElements(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (element) => element.tabIndex >= 0 && !element.hasAttribute("disabled"),
  );
}

function trapTab(event: KeyboardEvent, dialog: HTMLElement | null) {
  if (event.key !== "Tab" || event.defaultPrevented || !dialog) {
    return;
  }
  const items = focusableElements(dialog);
  if (items.length === 0) {
    event.preventDefault();
    dialog.focus();
    return;
  }
  const first = items[0];
  const last = items[items.length - 1];
  const active = document.activeElement;
  const inside = active instanceof Node && dialog.contains(active);

  if (event.shiftKey) {
    if (!inside || active === first || active === dialog) {
      event.preventDefault();
      last.focus();
    }
    return;
  }
  if (!inside || active === last) {
    event.preventDefault();
    first.focus();
  }
}

function motionMs(): number {
  if (typeof window.matchMedia !== "function") {
    return MOTION_MS;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : MOTION_MS;
}

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
  const restoreRef = useRef<HTMLElement | null>(null);
  const focusedForOpenRef = useRef(false);
  const [present, setPresent] = useState(open);

  if (open && !present) {
    setPresent(true);
  }

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (open || !present) {
      return;
    }
    const timer = window.setTimeout(() => setPresent(false), motionMs());
    return () => window.clearTimeout(timer);
  }, [open, present]);

  useEffect(() => {
    if (!present) {
      return;
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [present]);

  useEffect(() => {
    if (!open) {
      const target = restoreRef.current;
      restoreRef.current = null;
      focusedForOpenRef.current = false;
      if (target?.isConnected) {
        target.focus();
      }
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      trapTab(event, dialogRef.current);
    };

    window.addEventListener("keydown", onKeyDown);

    // Focus the dialog only when it opens — not on every parent re-render
    // (that would steal focus from inputs like the reject reason textarea).
    if (!focusedForOpenRef.current) {
      const active = document.activeElement;
      if (
        active instanceof HTMLElement &&
        active !== dialogRef.current &&
        !dialogRef.current?.contains(active)
      ) {
        restoreRef.current = active;
      }
      focusedForOpenRef.current = true;
      dialogRef.current?.focus();
    }

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (!present || typeof document === "undefined") {
    return null;
  }

  function onBackdropClick(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }

  const width =
    size === "lg" ? "max-h-[min(92dvh,52rem)] max-w-2xl" : size === "md" ? "max-h-[min(90dvh,40rem)] max-w-lg" : "max-h-[min(90dvh,40rem)] max-w-sm";

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-5 sm:p-8">
      <div
        className={`absolute inset-0 bg-charcoal/45 backdrop-blur-[4px] transition-opacity duration-150 ease-out starting:opacity-0 motion-reduce:transition-none ${
          open ? "opacity-100" : "opacity-0"
        }`}
        onClick={onBackdropClick}
      />
      <div
        ref={dialogRef}
        className={`relative flex w-full flex-col overflow-hidden rounded-2xl border border-line bg-elevated shadow-[0_24px_64px_var(--color-shadow)] transition duration-150 ease-out outline-none starting:scale-[0.98] starting:opacity-0 motion-reduce:transition-none ${width} ${
          open ? "scale-100 opacity-100" : "scale-[0.98] opacity-0"
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        inert={open ? undefined : true}
      >
        <div className="flex shrink-0 items-start justify-between gap-5 bg-elevated px-5 pt-5">
          <h2 id={titleId} className="m-0 flex min-w-0 items-center gap-2 text-lg font-bold tracking-[-0.02em]">
            {danger ? (
              <WarningAmberOutlinedIcon
                fontSize="small"
                className="shrink-0 text-danger"
                aria-hidden
              />
            ) : null}
            <span className="min-w-0">{title}</span>
          </h2>
          <button
            type="button"
            className="-mt-1 -mr-1 inline-flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-lg border-0 bg-transparent text-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
            onClick={onClose}
            aria-label="Mbyll"
          >
            <CloseIcon />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto p-5">{children}</div>
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
