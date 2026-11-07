"use client";

import { useState, type ClipboardEvent, type KeyboardEvent } from "react";
import { Modal } from "@/components/ui/Modal";
import { PosMoneyField } from "@/components/ui/PosMoneyField";
import { DiscountRail } from "@/features/public/price";
import { button, input } from "@/lib/ui";
import {
  computeDiscountPercent,
  MAX_DISCOUNT_PERCENT,
  MIN_DISCOUNT_PERCENT,
  type PricingMode,
} from "@/lib/discount";

/** Keep % as integer digits only, clamped to 1–99 while typing. */
export function sanitizeDiscountPercentInput(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (!digits) {
    return "";
  }
  const n = Math.min(99, Number(digits));
  if (!Number.isFinite(n) || n < 1) {
    return digits.length > 0 && Number(digits) === 0 ? "0" : "";
  }
  return String(n);
}

function isDigitKey(key: string): boolean {
  return key >= "0" && key <= "9";
}

function onPercentKeyDown(event: KeyboardEvent<HTMLInputElement>) {
  if (event.metaKey || event.ctrlKey || event.altKey) {
    return;
  }
  if (isDigitKey(event.key) || event.key === "Backspace" || event.key === "Delete") {
    return;
  }
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

type DiscountModeFieldsProps = {
  mode: PricingMode;
  originalPriceCents: number;
  discountedPriceCents: number;
  /** Raw sanitized digits, "" when empty. */
  percentInput: string;
  onModeChange: (mode: PricingMode) => void;
  onOriginalChange: (cents: number) => void;
  onDiscountedChange: (cents: number) => void;
  onPercentChange: (raw: string) => void;
  disabled?: boolean;
  /** Used to build unique aria-labels, e.g. the product's index. */
  idPrefix: string;
};

const micro = "text-xs font-bold tracking-[0.08em] text-muted uppercase";
const modeButton = (active: boolean) =>
  `cursor-pointer rounded-full border px-3 py-1.5 text-sm font-semibold ${
    active
      ? "border-accent bg-accent/10 text-accent-fg"
      : "border-line bg-transparent text-muted hover:text-ink"
  }`;

/**
 * The per-product discount mode UI shared by the business/manager/admin offer
 * form and the admin standalone hero form: a two-way toggle between price
 * mode (both prices, percent computed and shown read-only) and percent mode
 * (percent only). Switching away from price mode while it holds real prices
 * asks for confirmation, since those prices are discarded.
 */
export function DiscountModeFields({
  mode,
  originalPriceCents,
  discountedPriceCents,
  percentInput,
  onModeChange,
  onOriginalChange,
  onDiscountedChange,
  onPercentChange,
  disabled = false,
  idPrefix,
}: DiscountModeFieldsProps) {
  const [confirmDiscardOpen, setConfirmDiscardOpen] = useState(false);

  function switchTo(next: PricingMode) {
    if (next === mode) {
      return;
    }

    if (next === "percent") {
      if (originalPriceCents > 0 || discountedPriceCents > 0) {
        setConfirmDiscardOpen(true);
        return;
      }
      onModeChange("percent");
      return;
    }

    // percent → price: nothing meaningful to lose, just clear the inert percent.
    onPercentChange("");
    onModeChange("price");
  }

  function confirmDiscard() {
    onOriginalChange(0);
    onDiscountedChange(0);
    onModeChange("percent");
    setConfirmDiscardOpen(false);
  }

  const computedPercent =
    mode === "price" ? computeDiscountPercent(originalPriceCents, discountedPriceCents) : NaN;
  const hasComputedPercent =
    originalPriceCents > 0 && discountedPriceCents > 0 && Number.isFinite(computedPercent);
  const computedPercentInRange =
    hasComputedPercent &&
    computedPercent >= MIN_DISCOUNT_PERCENT &&
    computedPercent <= MAX_DISCOUNT_PERCENT;
  const typedPercent = mode === "percent" ? Number(percentInput) : NaN;

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap gap-2" role="group" aria-label={`Lloji i zbritjes për produktin ${idPrefix}`}>
        <button
          type="button"
          aria-pressed={mode === "price"}
          disabled={disabled}
          className={modeButton(mode === "price")}
          onClick={() => switchTo("price")}
        >
          Me çmime
        </button>
        <button
          type="button"
          aria-pressed={mode === "percent"}
          disabled={disabled}
          className={modeButton(mode === "percent")}
          onClick={() => switchTo("percent")}
        >
          Vetëm përqindja
        </button>
      </div>

      {mode === "price" ? (
        <div className="grid items-end gap-3 sm:grid-cols-3">
          <label className="flex min-w-0 flex-col gap-1.5">
            <span className={micro}>Çmimi i vjetër</span>
            <PosMoneyField
              valueCents={originalPriceCents}
              onChangeCents={onOriginalChange}
              disabled={disabled}
              aria-label={`Çmimi origjinal i produktit ${idPrefix}`}
            />
          </label>
          <label className="flex min-w-0 flex-col gap-1.5">
            <span className={micro}>Zbritja % (automatike)</span>
            <input
              className={`${input()} text-right tabular-nums ${
                hasComputedPercent && !computedPercentInRange ? "text-danger" : "text-accent-fg"
              }`}
              type="text"
              readOnly
              disabled={disabled}
              tabIndex={-1}
              value={hasComputedPercent ? `${computedPercent}%` : ""}
              placeholder="—"
              aria-label={`Zbritja e llogaritur automatikisht për produktin ${idPrefix}`}
              aria-readonly="true"
            />
          </label>
          <label className="flex min-w-0 flex-col gap-1.5">
            <span className={micro}>Çmimi i ri</span>
            <PosMoneyField
              valueCents={discountedPriceCents}
              onChangeCents={onDiscountedChange}
              disabled={disabled}
              aria-label={`Çmimi me zbritje i produktit ${idPrefix}`}
            />
          </label>
        </div>
      ) : (
        <label className="flex min-w-0 max-w-[10rem] flex-col gap-1.5">
          <span className={micro}>Zbritja %</span>
          <div className="relative">
            <input
              className="w-full rounded-lg border border-line bg-elevated px-3 py-2 pr-8 text-right text-sm font-semibold tabular-nums"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              spellCheck={false}
              pattern="[0-9]*"
              maxLength={2}
              value={percentInput}
              onKeyDown={onPercentKeyDown}
              onPaste={(event: ClipboardEvent<HTMLInputElement>) => {
                event.preventDefault();
                onPercentChange(sanitizeDiscountPercentInput(event.clipboardData.getData("text")));
              }}
              onChange={(event) => onPercentChange(sanitizeDiscountPercentInput(event.target.value))}
              disabled={disabled}
              placeholder="0"
              aria-label={`Zbritja në përqindje e produktit ${idPrefix}`}
            />
            <span aria-hidden="true" className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm font-bold text-muted">
              %
            </span>
          </div>
        </label>
      )}

      {computedPercentInRange ? (
        <span className="relative inline-block h-[20px] w-28 overflow-hidden rounded-md">
          <DiscountRail percent={computedPercent} size="sm" />
        </span>
      ) : null}

      {Number.isFinite(typedPercent) && typedPercent > 0 ? (
        <span className="relative inline-block h-[20px] w-28 overflow-hidden rounded-md">
          <DiscountRail percent={typedPercent} size="sm" />
        </span>
      ) : null}

      <Modal
        open={confirmDiscardOpen}
        title="Të kalohet te vetëm përqindja?"
        danger
        onClose={() => setConfirmDiscardOpen(false)}
        footer={
          <>
            <button className={button({ variant: "secondary" })} type="button" onClick={() => setConfirmDiscardOpen(false)}>
              Anulo
            </button>
            <button className={button()} type="button" onClick={confirmDiscard}>
              Po, hiqi çmimet
            </button>
          </>
        }
      >
        <p className="m-0 text-sm leading-relaxed text-muted">
          Çmimet e vendosura për këtë produkt do të hiqen dhe do të mbetet vetëm përqindja e zbritjes.
        </p>
      </Modal>
    </div>
  );
}
