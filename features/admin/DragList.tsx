"use client";

import { DragIndicatorIcon, ExpandMoreIcon } from "@/components/ui/icons";
import { iconButton } from "@/lib/ui";
import { useEffect, useRef, useState, type ReactNode } from "react";

type MoveDirection = "up" | "down";

type PendingMove = {
  id: string;
  from: number;
  to: number;
  direction: MoveDirection;
  before: string[];
  after: string[];
  announced: boolean;
  startedAt: number;
};

/** A click is ignored while a move awaits its result, but never for longer than this. */
const PENDING_BLOCK_MS = 3000;
/** A return to the pre-move order counts as a rollback only this soon after the move. */
const ROLLBACK_WINDOW_MS = 10000;

function sameOrder(a: string[], b: string[]) {
  return a.length === b.length && a.every((id, index) => id === b[index]);
}

/**
 * Keyboard/touch alternative to drag-and-drop: move one item up or down,
 * announce the new position politely, and keep focus on the moved item's
 * button once the (possibly asynchronous) reorder has been applied.
 */
export function useStepReorder<T extends { id: string }>({
  items,
  getLabel,
  onReorder,
  disabled = false,
}: {
  items: T[];
  getLabel: (item: T) => string;
  onReorder: (ids: string[]) => void;
  disabled?: boolean;
}) {
  const [announcement, setAnnouncement] = useState("");
  const buttons = useRef(new Map<string, HTMLButtonElement>());
  const pendingMove = useRef<PendingMove | null>(null);
  const wasDisabled = useRef(disabled);
  const announceTimer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(announceTimer.current), []);

  // Clear first, then set on a later tick, so identical text is announced again.
  function announce(text: string) {
    window.clearTimeout(announceTimer.current);
    setAnnouncement("");
    announceTimer.current = window.setTimeout(() => setAnnouncement(text), 50);
  }

  useEffect(() => {
    const move = pendingMove.current;
    const settled = wasDisabled.current && !disabled;
    wasDisabled.current = disabled;
    if (!move) {
      return;
    }
    const ids = items.map((item) => item.id);
    const label = (id: string, index: number) => {
      const item = items[index];
      return item && item.id === id ? getLabel(item) : null;
    };
    if (sameOrder(ids, move.after)) {
      if (!move.announced) {
        move.announced = true;
        const name = label(move.id, move.to);
        if (name !== null) {
          announce(`${name} u zhvendos në pozicionin ${move.to + 1} nga ${items.length}`);
        }
        // At the list ends the pressed button becomes disabled, so fall back to its sibling.
        const preferred = buttons.current.get(`${move.id}:${move.direction}`);
        const fallback = buttons.current.get(`${move.id}:${move.direction === "up" ? "down" : "up"}`);
        (preferred && !preferred.disabled ? preferred : fallback)?.focus();
      }
      return;
    }
    if (sameOrder(ids, move.before)) {
      // Optimistic update rolled back, or the save failed without any change.
      if (move.announced || settled) {
        pendingMove.current = null;
        if (Date.now() - move.startedAt < ROLLBACK_WINDOW_MS) {
          const name = label(move.id, move.from);
          if (name !== null) {
            announce(`Renditja nuk u ruajt; ${name} mbeti në pozicionin ${move.from + 1}`);
          }
        }
      }
      return;
    }
    // Neither the old nor the expected order: an unrelated change, drop the move.
    pendingMove.current = null;
  }, [items, disabled, getLabel]);

  function moveItem(id: string, direction: MoveDirection) {
    if (disabled) {
      return;
    }
    const current = pendingMove.current;
    if (current && !current.announced && Date.now() - current.startedAt < PENDING_BLOCK_MS) {
      return;
    }
    const from = items.findIndex((item) => item.id === id);
    const to = direction === "up" ? from - 1 : from + 1;
    if (from < 0 || to < 0 || to >= items.length) {
      pendingMove.current = null;
      return;
    }
    const next = [...items];
    const [moved] = next.splice(from, 1);
    if (!moved) {
      pendingMove.current = null;
      return;
    }
    next.splice(to, 0, moved);
    const after = next.map((item) => item.id);
    pendingMove.current = {
      id,
      from,
      to,
      direction,
      before: items.map((item) => item.id),
      after,
      announced: false,
      startedAt: Date.now(),
    };
    onReorder(after);
  }

  const liveRegion = (
    <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
      {announcement}
    </div>
  );

  function moveButtons(item: T, index: number) {
    const label = getLabel(item);
    const common = `${iconButton}`;
    return (
      <>
        <button
          ref={(node) => {
            if (node) buttons.current.set(`${item.id}:up`, node);
            else buttons.current.delete(`${item.id}:up`);
          }}
          type="button"
          className={common}
          aria-label={`Zhvendos lart: ${label}`}
          disabled={index === 0}
          aria-busy={disabled || undefined}
          onClick={() => moveItem(item.id, "up")}
        >
          <ExpandMoreIcon fontSize="small" className="rotate-180" />
        </button>
        <button
          ref={(node) => {
            if (node) buttons.current.set(`${item.id}:down`, node);
            else buttons.current.delete(`${item.id}:down`);
          }}
          type="button"
          className={common}
          aria-label={`Zhvendos poshtë: ${label}`}
          disabled={index === items.length - 1}
          aria-busy={disabled || undefined}
          onClick={() => moveItem(item.id, "down")}
        >
          <ExpandMoreIcon fontSize="small" />
        </button>
      </>
    );
  }

  return { liveRegion, moveButtons };
}

export function DragList<T extends { id: string }>({
  items,
  pending = false,
  label,
  onReorder,
  trailing,
  getItemLabel,
  children,
}: {
  items: T[];
  pending?: boolean;
  label: (item: T) => string;
  onReorder: (ids: string[]) => void;
  trailing?: (item: T) => ReactNode;
  /** Name used in move-button labels and announcements; defaults to `label`. */
  getItemLabel?: (item: T) => string;
  children: (item: T) => ReactNode;
}) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const { liveRegion, moveButtons } = useStepReorder({
    items,
    getLabel: getItemLabel ?? label,
    onReorder,
    disabled: pending,
  });

  function dropOn(targetId: string) {
    if (!draggingId || draggingId === targetId) {
      setDraggingId(null);
      setOverId(null);
      return;
    }

    const from = items.findIndex((item) => item.id === draggingId);
    const to = items.findIndex((item) => item.id === targetId);
    if (from < 0 || to < 0) {
      setDraggingId(null);
      setOverId(null);
      return;
    }

    const next = [...items];
    const [moved] = next.splice(from, 1);
    if (moved) {
      next.splice(to, 0, moved);
      onReorder(next.map((item) => item.id));
    }
    setDraggingId(null);
    setOverId(null);
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <>
    <ul className="m-0 list-none p-0">
      {items.map((item, index) => (
        <li
          key={item.id}
          className={`grid grid-cols-[2.25rem_minmax(0,1fr)_auto] items-center gap-3 border-b border-line px-4 py-3 last:border-b-0${
            draggingId === item.id ? " opacity-45" : ""
          }${
            overId === item.id
              ? " outline outline-1 outline-dashed outline-accent outline-offset-[-2px]"
              : ""
          }`}
          onDragOver={(event) => {
            event.preventDefault();
            setOverId(item.id);
          }}
          onDragLeave={() => {
            setOverId((current) => (current === item.id ? null : current));
          }}
          onDrop={() => dropOn(item.id)}
        >
          <button
            type="button"
            className="inline-flex size-9 cursor-grab items-center justify-center rounded-lg text-muted hover:bg-sunken hover:text-ink active:cursor-grabbing"
            aria-label={`Rendit ${label(item)}`}
            draggable={!pending}
            onDragStart={(event) => {
              event.dataTransfer.effectAllowed = "move";
              event.dataTransfer.setData("text/plain", item.id);
              setDraggingId(item.id);
            }}
            onDragEnd={() => {
              setDraggingId(null);
              setOverId(null);
            }}
          >
            <DragIndicatorIcon fontSize="small" />
          </button>
          <div className="min-w-0">{children(item)}</div>
          <div className="flex items-center gap-1.5">
            {moveButtons(item, index)}
            {trailing ? trailing(item) : null}
          </div>
        </li>
      ))}
    </ul>
    {liveRegion}
    </>
  );
}
