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
import { triggerClass } from "@/lib/ui";

const optionClass =
  "w-full cursor-pointer appearance-none rounded-md border-0 bg-transparent px-3 py-2.5 text-left text-base font-medium text-ink hover:bg-accent/14 hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent/55";

export type SelectOption = {
  value: string;
  label: string;
};

type SelectFieldProps = {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
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
  disabled = false,
  id,
  "aria-label": ariaLabel,
  className,
}: SelectFieldProps) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState(false);
  const [menuBox, setMenuBox] = useState<{
    left: number;
    width: number;
    maxHeight: number;
    top?: number;
    bottom?: number;
  } | null>(null);

  const selected = options.find((o) => o.value === value);

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
        setOpen(false);
      }
    };

    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("mousedown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

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
        onClick={() => setOpen((v) => !v)}
        onKeyDown={onTriggerKeyDown}
      >
        <span className={selected ? undefined : "text-muted"}>
          {selected?.label ?? placeholder}
        </span>
        <KeyboardArrowDownIcon
          fontSize="small"
          className={`shrink-0 text-muted transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && menuBox
        ? createPortal(
        <ul
          ref={menuRef}
          id={listId}
          className="fixed z-[100] m-0 list-none overflow-auto rounded-lg border border-line bg-elevated p-1.5 shadow-[0_12px_32px_var(--color-shadow)]"
          style={{
            left: menuBox.left,
            width: menuBox.width,
            maxHeight: menuBox.maxHeight,
            top: menuBox.top,
            bottom: menuBox.bottom,
          }}
          role="listbox"
          aria-label={ariaLabel}
        >
          {options.length === 0 ? (
            <li className="px-3 py-2.5 text-sm text-muted">Asnjë opsion</li>
          ) : (
            options.map((option) => {
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
                      setOpen(false);
                    }}
                  >
                    {option.label}
                  </button>
                </li>
              );
            })
          )}
        </ul>,
          document.body,
        )
        : null}
    </div>
  );
}
