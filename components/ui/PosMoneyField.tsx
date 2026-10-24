"use client";

import { useId, type ChangeEvent, type ClipboardEvent, type KeyboardEvent } from "react";
import { inputClass } from "@/lib/ui";

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

function centsFromDigits(raw: string, maxCents: number): number {
  const digits = raw.replace(/\D/g, "");
  return Math.min(Number(digits || 0), maxCents);
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

  function commit(raw: string) {
    if (disabled) {
      return;
    }
    onChangeCents(centsFromDigits(raw, maxCents));
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.metaKey || event.ctrlKey || event.altKey) {
      return;
    }

    if (event.key === "Delete") {
      event.preventDefault();
      if (!disabled) {
        onChangeCents(0);
      }
      return;
    }

    if (event.key.length === 1 && (event.key < "0" || event.key > "9")) {
      event.preventDefault();
    }
  }

  function onPaste(event: ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();
    commit(event.clipboardData.getData("text"));
  }

  function onChange(event: ChangeEvent<HTMLInputElement>) {
    commit(event.target.value);
  }

  return (
    <input
      id={fieldId}
      className={`${inputClass} text-right tabular-nums tracking-wide`}
      type="text"
      inputMode="numeric"
      autoComplete="off"
      spellCheck={false}
      disabled={disabled}
      aria-label={ariaLabel}
      value={display}
      onKeyDown={onKeyDown}
      onPaste={onPaste}
      onChange={onChange}
    />
  );
}
