"use client";

import { useRef, useState, type KeyboardEvent, type ReactNode } from "react";

export type TabItem<Id extends string> = {
  id: Id;
  label: ReactNode;
};

type TabsVariant = "underline" | "pill";

const focusRing = "focus-visible:outline-2 focus-visible:outline-focus";

const variants: Record<
  TabsVariant,
  { list: string; tab: string; active: string; idle: string }
> = {
  // Underline tabs scroll horizontally on narrow screens; the ring is drawn
  // inside the button so the scroll container does not clip it.
  underline: {
    list: "flex gap-x-5 overflow-x-auto border-b border-line [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
    tab: `shrink-0 cursor-pointer border-0 border-b-2 bg-transparent px-0 py-3 text-sm font-bold whitespace-nowrap ${focusRing} focus-visible:-outline-offset-2`,
    active: "border-accent text-ink",
    idle: "border-transparent text-muted",
  },
  pill: {
    list: "flex flex-wrap gap-1.5",
    tab: `inline-flex h-9 cursor-pointer items-center gap-2 rounded-full border px-3 text-sm font-semibold ${focusRing} focus-visible:outline-offset-2`,
    active: "border-accent bg-accent/15 text-ink",
    idle: "border-line bg-transparent text-muted hover:text-ink",
  },
};

export function tabId(idPrefix: string, id: string) {
  return `${idPrefix}-tab-${id}`;
}

export function panelId(idPrefix: string, id: string) {
  return `${idPrefix}-panel-${id}`;
}

/**
 * Controlled tablist. It never touches the URL: the consumer owns `value`
 * (local state or a `?tab=` param) and reacts to `onChange`.
 *
 * `activation="automatic"` selects a tab as soon as it receives arrow-key
 * focus; `"manual"` only moves focus and selects on Enter/Space (use it when
 * selecting has a cost, e.g. a router navigation or a data fetch per tab).
 */
export function Tabs<Id extends string>({
  tabs,
  value,
  onChange,
  idPrefix,
  label,
  variant = "underline",
  activation = "automatic",
  className = "",
}: {
  tabs: readonly TabItem<Id>[];
  value: Id;
  onChange: (id: Id) => void;
  idPrefix: string;
  label: string;
  variant?: TabsVariant;
  activation?: "automatic" | "manual";
  className?: string;
}) {
  const styles = variants[variant];
  const refs = useRef(new Map<Id, HTMLButtonElement>());
  const [focusedId, setFocusedId] = useState<Id | null>(null);
  const tabbableId =
    focusedId !== null && tabs.some((tab) => tab.id === focusedId)
      ? focusedId
      : tabs.some((tab) => tab.id === value)
        ? value
        : tabs[0]?.id;

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next: number;
    if (event.key === "ArrowRight") {
      next = (index + 1) % tabs.length;
    } else if (event.key === "ArrowLeft") {
      next = (index - 1 + tabs.length) % tabs.length;
    } else if (event.key === "Home") {
      next = 0;
    } else if (event.key === "End") {
      next = tabs.length - 1;
    } else {
      return;
    }
    event.preventDefault();
    const target = tabs[next];
    if (!target) {
      return;
    }
    refs.current.get(target.id)?.focus();
    if (activation === "automatic" && target.id !== value) {
      onChange(target.id);
    }
  }

  return (
    <div
      role="tablist"
      aria-label={label}
      className={`${styles.list} ${className}`.trim()}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setFocusedId(null);
        }
      }}
    >
      {tabs.map((tab, index) => {
        const selected = tab.id === value;
        return (
          <button
            key={tab.id}
            ref={(node) => {
              if (node) {
                refs.current.set(tab.id, node);
              } else {
                refs.current.delete(tab.id);
              }
            }}
            type="button"
            role="tab"
            id={tabId(idPrefix, tab.id)}
            aria-selected={selected}
            aria-controls={selected ? panelId(idPrefix, tab.id) : undefined}
            tabIndex={tab.id === tabbableId ? 0 : -1}
            className={`${styles.tab} ${selected ? styles.active : styles.idle}`}
            onFocus={() => setFocusedId(tab.id)}
            onClick={() => onChange(tab.id)}
            onKeyDown={(event) => onKeyDown(event, index)}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

/** Panel for the currently selected tab; render it only for the active `id`. */
export function TabPanel({
  idPrefix,
  id,
  children,
}: {
  idPrefix: string;
  id: string;
  children: ReactNode;
}) {
  return (
    <div role="tabpanel" id={panelId(idPrefix, id)} aria-labelledby={tabId(idPrefix, id)}>
      {children}
    </div>
  );
}
