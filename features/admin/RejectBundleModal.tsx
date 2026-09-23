"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import type { OfferBundle } from "@/types";

type RejectBundleModalProps = {
  bundle: OfferBundle | null;
  pending: boolean;
  onClose: () => void;
  onConfirm: (payload: { reason?: string; item_ids: string[] }) => void;
};

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
    <div className="reject-form">
      <p className="modal__message">
        Refuzo “{bundle.title}”. Shëno produktet që kanë problem — biznesi i sheh
        dhe i rregullon pa prekur të tjerat.
      </p>

      {items.length > 0 ? (
        <div className="reject-items">
          <div className="reject-items__toolbar">
            <span className="reject-items__label">Produktet me problem</span>
            <div className="reject-items__tools">
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                disabled={pending}
                onClick={selectAll}
              >
                Të gjitha
              </button>
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                disabled={pending}
                onClick={clearAll}
              >
                Asnjë
              </button>
            </div>
          </div>
          <ul className="reject-items__list">
            {items.map((item) => {
              const checked = selectedIds.includes(item.id);
              return (
                <li key={item.id}>
                  <label
                    className={
                      checked
                        ? "offer-form__check reject-items__check reject-items__check--selected"
                        : "offer-form__check reject-items__check"
                    }
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={pending}
                      onChange={() => toggle(item.id)}
                    />
                    <span>
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

      <label className="offer-form__field reject-form__reason">
        <span>Arsye (opsionale)</span>
        <textarea
          className="modal__textarea"
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          disabled={pending}
          maxLength={1000}
          placeholder="p.sh. mungon fotoja e produktit…"
        />
      </label>

      {localError ? (
        <p className="offer-form__error" role="alert">
          {localError}
        </p>
      ) : null}

      <div className="reject-form__actions">
        <button
          type="button"
          className="btn btn--ghost"
          disabled={pending}
          onClick={onClose}
        >
          Anulo
        </button>
        <button
          type="button"
          className="btn btn--danger"
          disabled={pending}
          onClick={handleConfirm}
        >
          {pending ? "Duke u refuzuar…" : "Refuzo"}
        </button>
      </div>
    </div>
  );
}
