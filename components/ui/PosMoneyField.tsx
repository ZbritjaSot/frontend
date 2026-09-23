"use client";

import { useId, type ClipboardEvent, type KeyboardEvent } from "react";

type PosMoneyFieldProps = {
  valueCents: number;
  onChangeCents: (cents: number) => void;
  disabled?: boolean;
  "aria-label"?: string;
  id?: string;
  /** Soft cap in cents (default €1_000_000.00). */
  maxCents?: number;
};

/** Display integer cents as POS amount, e.g. `1` → `00,01`, `1000` → `10,00`. */
export function formatPosCents(cents: number): string {
  const safe = Math.max(0, Math.floor(Number.isFinite(cents) ? cents : 0));
  const whole = Math.floor(safe / 100);
  const frac = safe % 100;
  return `${String(whole).padStart(2, "0")},${String(frac).padStart(2, "0")}`;
}

/**
 * POS-style money input: digits only, decimal fixed at 2 places.
 * Typing `1` → 00,01; typing `0` → 00,10; … → 10,00.
 */
export function PosMoneyField({
  valueCents,
  onChangeCents,
  disabled = false,
  "aria-label": ariaLabel,
  id,
  maxCents = 100_000_000,
}: PosMoneyFieldProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const display = formatPosCents(valueCents);

  function pushDigit(digit: number) {
    if (disabled) {
      return;
    }
    const next = valueCents * 10 + digit;
    onChangeCents(Math.min(next, maxCents));
  }

  function backspace() {
    if (disabled) {
      return;
    }
    onChangeCents(Math.floor(valueCents / 10));
  }

  function clear() {
    if (disabled) {
      return;
    }
    onChangeCents(0);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.metaKey || event.ctrlKey || event.altKey) {
      return;
    }

    if (event.key >= "0" && event.key <= "9") {
      event.preventDefault();
      pushDigit(Number(event.key));
      return;
    }

    if (event.key === "Backspace") {
      event.preventDefault();
      backspace();
      return;
    }

    if (event.key === "Delete") {
      event.preventDefault();
      clear();
      return;
    }

    // Allow navigation / focus keys; block letters, symbols, separators.
    const allowed = [
      "Tab",
      "Escape",
      "Enter",
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
      "Home",
      "End",
    ];
    if (!allowed.includes(event.key)) {
      event.preventDefault();
    }
  }

  function onPaste(event: ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();
    if (disabled) {
      return;
    }
    const raw = event.clipboardData.getData("text").replace(/\D/g, "");
    if (!raw) {
      return;
    }
    onChangeCents(Math.min(Number(raw), maxCents));
  }

  return (
    <input
      id={fieldId}
      className="pos-money"
      type="text"
      inputMode="numeric"
      autoComplete="off"
      spellCheck={false}
      disabled={disabled}
      aria-label={ariaLabel}
      value={display}
      readOnly
      onKeyDown={onKeyDown}
      onPaste={onPaste}
      onChange={() => {
        /* controlled via keydown — readOnly suppresses native edits */
      }}
    />
  );
}
