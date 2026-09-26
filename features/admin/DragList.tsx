"use client";

import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { useState, type ReactNode } from "react";

export function DragList<T extends { id: string }>({
  items,
  pending = false,
  label,
  onReorder,
  trailing,
  children,
}: {
  items: T[];
  pending?: boolean;
  label: (item: T) => string;
  onReorder: (ids: string[]) => void;
  trailing?: (item: T) => ReactNode;
  children: (item: T) => ReactNode;
}) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

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
    <ul className="m-0 list-none p-0">
      {items.map((item) => (
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
          {trailing ? trailing(item) : <span />}
        </li>
      ))}
    </ul>
  );
}
