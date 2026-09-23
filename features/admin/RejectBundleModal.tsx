"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import {
  btnDanger,
  btnGhost,
  btnSm,
  checkInput,
  fieldError,
  fieldLabel,
  inputClass,
} from "@/lib/ui";
import type { OfferBundle } from "@/types";

type RejectBundleModalProps = {
  bundle: OfferBundle | null;
  pending: boolean;
  onClose: () => void;
  onConfirm: (payload: { reason?: string; item_ids: string[] }) => void;
};

const textAreaClass = `${inputClass} h-[calc(1.5em*4+1.4rem)] resize-none overflow-y-auto leading-normal`;

const toolBtnClass = `${btnGhost} ${btnSm} min-h-8! px-[0.65rem]! py-[0.3rem]! text-xs!`;

export function RejectBundleModal({
  bundle,
  pending,
  onClose,
  onConfirm,
}: RejectBundleModalProps) {
  return (
    <Modal
      open={bundle !== null}
      title="Refuzo dosjen"
      size="md"
      onClose={() => {
        if (!pending) {
          onClose();
        }
      }}
    >
      {bundle ? (
        <RejectBundleForm
          key={bundle.id}
          bundle={bundle}
          pending={pending}
          onClose={onClose}
          onConfirm={onConfirm}
        />
      ) : null}
    </Modal>
  );
}

type RejectBundleFormProps = {
  bundle: OfferBundle;
  pending: boolean;
  onClose: () => void;
  onConfirm: (payload: { reason?: string; item_ids: string[] }) => void;
};

function RejectBundleForm({
  bundle,
  pending,
  onClose,
  onConfirm,
}: RejectBundleFormProps) {
  const items = bundle.items ?? [];
  const [reason, setReason] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [localError, setLocalError] = useState<string | null>(null);

  function toggle(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function selectAll() {
    setSelectedIds(items.map((item) => item.id));
  }

  function clearAll() {
    setSelectedIds([]);
  }

  function handleConfirm() {
    if (selectedIds.length < 1) {
      setLocalError("Zgjidh të paktën një produkt që duhet rregulluar.");
      return;
    }
    setLocalError(null);
    onConfirm({
      reason: reason.trim() || undefined,
      item_ids: selectedIds,
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <p className="m-0 leading-relaxed text-muted">
        Refuzo “{bundle.title}”. Shëno produktet që kanë problem — biznesi i sheh
        dhe i rregullon pa prekur të tjerat.
      </p>

      {items.length > 0 ? (
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
            <span className="text-[0.8125rem] font-bold tracking-[0.04em] text-muted uppercase">
              Produktet me problem
            </span>
            <div className="flex gap-[0.35rem]">
              <button
                type="button"
                className={toolBtnClass}
                disabled={pending}
                onClick={selectAll}
              >
                Të gjitha
              </button>
              <button
                type="button"
                className={toolBtnClass}
                disabled={pending}
                onClick={clearAll}
              >
                Asnjë
              </button>
            </div>
          </div>
          <ul className="m-0 flex max-h-56 list-none flex-col gap-[0.35rem] overflow-auto rounded-lg border border-line bg-canvas p-[0.35rem]">
            {items.map((item) => {
              const checked = selectedIds.includes(item.id);
              return (
                <li key={item.id} className="m-0">
                  <label
                    className={`m-0 flex w-full cursor-pointer flex-row items-start gap-3 rounded-[0.4rem] border bg-elevated px-3 py-[0.7rem] font-medium text-ink transition-[border-color,background-color] duration-[0.12s] select-none ${
                      checked
                        ? "border-accent/55 bg-[color-mix(in_srgb,var(--color-accent)_10%,var(--color-bg-elevated))]"
                        : "border-transparent hover:border-slate/35"
                    }`}
                  >
                    <input
                      className={checkInput}
                      type="checkbox"
                      checked={checked}
                      disabled={pending}
                      onChange={() => toggle(item.id)}
                    />
                    <span className="min-w-0 flex-1 pt-px leading-[1.4]">
                      {item.name}
                      {item.category ? ` · ${item.category.name}` : ""}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      <label className={fieldLabel}>
        <span>Arsye (opsionale)</span>
        <textarea
          className={textAreaClass}
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          disabled={pending}
          maxLength={1000}
          placeholder="p.sh. mungon fotoja e produktit…"
        />
      </label>

      {localError ? (
        <p className={fieldError} role="alert">
          {localError}
        </p>
      ) : null}

      <div className="mt-8 flex flex-wrap justify-end gap-3 border-t border-line pt-5">
        <button
          type="button"
          className={btnGhost}
          disabled={pending}
          onClick={onClose}
        >
          Anulo
        </button>
        <button
          type="button"
          className={btnDanger}
          disabled={pending}
          onClick={handleConfirm}
        >
          {pending ? "Duke u refuzuar…" : "Refuzo"}
        </button>
      </div>
    </div>
  );
}
