"use client";

import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { ShopLogo } from "@/features/public/visuals";
import { triggerClass } from "@/lib/ui";

const optionClass =
  "flex w-full cursor-pointer appearance-none items-center gap-3 rounded-md border-0 bg-transparent px-3 py-2.5 text-left text-base font-medium text-ink hover:bg-accent/14 hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent/55";

export type SelectOption = {
  value: string;
  label: string;
  logoUrl?: string | null;
};

type SelectFieldProps = {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  /** Shows a filter box in the menu. Use it for shops, categories, and other long lists. */
  searchable?: boolean;
  disabled?: boolean;
  id?: string;
  "aria-label"?: string;
  className?: string;
};

export function SelectField({
  value,
  onChange,
  options,
  placeholder = "Zgjidh…",
  searchable = false,
  disabled = false,
  id,
  "aria-label": ariaLabel,
  className,
}: SelectFieldProps) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [menuBox, setMenuBox] = useState<{
    left: number;
    width: number;
    maxHeight: number;
    top?: number;
    bottom?: number;
  } | null>(null);

  const selected = options.find((o) => o.value === value);
  const needle = query.trim().toLocaleLowerCase("sq");
  const visible =
    needle === ""
      ? options
      : options.filter((option) =>
          option.label.toLocaleLowerCase("sq").includes(needle),
        );

  useEffect(() => {
    if (!open) {
      return;
    }

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        !rootRef.current?.contains(target) &&
        !menuRef.current?.contains(target)
      ) {
        closeMenu();
      }
    };

    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    };

    window.addEventListener("mousedown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function closeMenu() {
    setOpen(false);
    setQuery("");
  }

  useLayoutEffect(() => {
    if (open && searchable) {
      searchRef.current?.focus();
    }
  }, [open, searchable]);

  useLayoutEffect(() => {
    if (!open) {
      return;
    }

    function place() {
      const trigger = rootRef.current?.querySelector("button");
      if (!trigger) {
        return;
      }
      const rect = trigger.getBoundingClientRect();
      const gap = 6;
      const footerReserve = 72;
      const spaceBelow =
        window.innerHeight - rect.bottom - gap - footerReserve;
      const spaceAbove = rect.top - gap - 12;
      const openBelow = spaceBelow >= spaceAbove;
      const maxHeight = Math.max(
        120,
        Math.min(256, openBelow ? spaceBelow : spaceAbove),
      );
      setMenuBox(
        openBelow
          ? {
              left: rect.left,
              width: rect.width,
              maxHeight,
              top: rect.bottom + gap,
            }
          : {
              left: rect.left,
              width: rect.width,
              maxHeight,
              bottom: window.innerHeight - rect.top + gap,
            },
      );
    }

    place();
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    return () => {
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
    };
  }, [open]);

  function onTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (disabled) {
      return;
    }
    if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setOpen(true);
    }
  }

  return (
    <div className="relative w-full" ref={rootRef}>
      <button
        type="button"
        id={id}
        className={[triggerClass, className].filter(Boolean).join(" ")}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={() => {
          if (open) {
            closeMenu();
            return;
          }
          setOpen(true);
        }}
        onKeyDown={onTriggerKeyDown}
      >
        <span className="flex min-w-0 flex-1 items-center gap-3">
          {selected && "logoUrl" in selected ? (
            <ShopLogo name={selected.label} logoUrl={selected.logoUrl} size="sm" />
          ) : null}
          <span className={`min-w-0 truncate ${selected ? "" : "text-muted"}`}>
            {selected?.label ?? placeholder}
          </span>
        </span>
        <KeyboardArrowDownIcon
          fontSize="small"
          className={`shrink-0 text-muted transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && menuBox
        ? createPortal(
        <div
          ref={menuRef}
          className="fixed z-[110] flex flex-col overflow-hidden rounded-lg border border-line bg-elevated p-1.5 shadow-[0_12px_32px_var(--color-shadow)]"
          style={{
            left: menuBox.left,
            width: menuBox.width,
            maxHeight: menuBox.maxHeight,
            top: menuBox.top,
            bottom: menuBox.bottom,
          }}
        >
          {searchable ? (
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder=""
              aria-label="Kërko"
              aria-controls={listId}
              className="mb-1.5 min-h-10 w-full shrink-0 rounded-md border border-line bg-sunken px-3 text-sm font-medium text-ink outline-none placeholder:text-muted focus:border-accent/40"
            />
          ) : null}
          <ul
            id={listId}
            className="m-0 min-h-0 flex-1 list-none overflow-auto p-0"
            role="listbox"
            aria-label={ariaLabel}
          >
            {options.length === 0 ? (
              <li className="px-3 py-2.5 text-sm text-muted">Asnjë opsion</li>
            ) : visible.length === 0 ? (
              <li className="px-3 py-2.5 text-sm text-muted">Asnjë rezultat</li>
            ) : (
              visible.map((option) => {
                const isSelected = option.value === value;
                return (
                  <li key={option.value} role="presentation">
                    <button
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      className={
                        isSelected ? `${optionClass} bg-accent/14 text-accent` : optionClass
                      }
                    onClick={() => {
                      onChange(option.value);
                      closeMenu();
                    }}
                    >
                      {"logoUrl" in option ? (
                        <ShopLogo
                          name={option.label}
                          logoUrl={option.logoUrl}
                          size="sm"
                        />
                      ) : null}
                      <span className="min-w-0 truncate">{option.label}</span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>,
          document.body,
        )
        : null}
    </div>
  );
}
