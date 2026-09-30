"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { browsePath, type CatalogSort, type Katalog } from "@/lib/browse";

const SORTS: Array<{ id: CatalogSort; label: string }> = [
  { id: "newest", label: "Më të rejat" },
  { id: "oldest", label: "Më të vjetrat" },
];

type CatalogFiltersProps = {
  basePath?: string;
  q?: string;
  category?: string;
  katalog?: Katalog;
  city?: string;
  sort?: CatalogSort;
  cities?: string[];
  showSort?: boolean;
};

const sortLink =
  "inline-flex h-7 shrink-0 items-center rounded-full px-3 text-xs whitespace-nowrap transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

export function CatalogFilters({
  basePath = "/",
  q = "",
  category,
  katalog,
  city,
  sort = "newest",
  cities = [],
  showSort = true,
}: CatalogFiltersProps) {
  const router = useRouter();

  if (!showSort && cities.length === 0) {
    return null;
  }

  return (
    <div className={showSort ? "flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between" : "flex"}>
      {cities.length > 0 ? (
        <CityMenu
          city={city}
          cities={cities}
          onChange={(next) => {
            router.push(
              browsePath(basePath, {
                q,
                category,
                katalog,
                sort,
                city: next,
              }),
            );
          }}
        />
      ) : null}
      {showSort ? (
      <div className="flex min-w-0 items-center gap-2">
        <span className="shrink-0 text-xs font-medium text-muted">Rendit</span>
        <div className="min-w-0 flex-1 overflow-x-auto [scrollbar-width:none] max-sm:[mask-image:linear-gradient(to_right,black_calc(100%-1.5rem),transparent)] sm:flex-none [&::-webkit-scrollbar]:hidden">
          <nav
            className="inline-flex gap-0.5 rounded-full bg-sunken p-0.5 dark:bg-white/[0.06]"
            aria-label="Renditja"
          >
            {SORTS.map((item) => {
              const active = item.id === sort;
              return (
                <Link
                  key={item.id}
                  href={browsePath(basePath, {
                    q,
                    category,
                    katalog,
                    city,
                    sort: item.id,
                  })}
                  aria-current={active ? "true" : undefined}
                  className={
                    active
                      ? `${sortLink} bg-elevated font-semibold text-ink shadow-[0_1px_2px_rgba(24,32,24,0.08)] dark:bg-[#243028]`
                      : `${sortLink} font-medium text-muted hover:text-ink`
                  }
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
      ) : null}
    </div>
  );
}

function CityMenu({
  city,
  cities,
  onChange,
}: {
  city?: string;
  cities: string[];
  onChange: (city: string | null) => void;
}) {
  const labelId = useId();
  const valueId = useId();
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const optionsRef = useRef<Array<HTMLButtonElement | null>>([]);
  const [open, setOpen] = useState(false);
  const options = [
    { value: "", label: "Të gjitha" },
    ...cities.map((name) => ({ value: name, label: name })),
  ];
  const current = options.find((option) => option.value === (city ?? ""))?.label ?? "Të gjitha";
  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.value === (city ?? "")),
  );

  useEffect(() => {
    if (!open) {
      return;
    }
    optionsRef.current[selectedIndex]?.focus();
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener("mousedown", onPointerDown);
    return () => window.removeEventListener("mousedown", onPointerDown);
  }, [open, selectedIndex]);

  function close(focusTrigger = false) {
    setOpen(false);
    if (focusTrigger) {
      buttonRef.current?.focus();
    }
  }

  function choose(value: string) {
    onChange(value === "" ? null : value);
    close(true);
  }

  function move(index: number) {
    const next = (index + options.length) % options.length;
    optionsRef.current[next]?.focus();
  }

  function onOptionKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      move(index + 1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      move(index - 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      move(0);
    } else if (event.key === "End") {
      event.preventDefault();
      move(options.length - 1);
    } else if (event.key === "Escape") {
      event.preventDefault();
      close(true);
    } else if (event.key === "Tab") {
      close();
    }
  }

  return (
    <div ref={rootRef} className="relative flex w-fit shrink-0 items-center gap-1.5">
      <span id={labelId} className="text-xs font-medium text-muted">
        Qyteti
      </span>
      <button
        ref={buttonRef}
        type="button"
        className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full border border-line bg-transparent pr-2.5 pl-3 text-xs font-semibold text-ink transition-colors duration-150 hover:bg-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent dark:border-white/10"
        aria-labelledby={`${labelId} ${valueId}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((value) => !value)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setOpen(true);
          }
        }}
      >
        <span id={valueId}>{current}</span>
        <svg
          viewBox="0 0 20 20"
          aria-hidden="true"
          className={`size-3.5 text-muted transition-transform duration-150 ${open ? "rotate-180" : ""}`}
          fill="none"
        >
          <path
            d="M5 7.5 10 12.5 15 7.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {open ? (
        <ul
          id={listId}
          role="listbox"
          aria-labelledby={labelId}
          className="absolute top-[calc(100%+6px)] left-0 z-30 m-0 max-h-64 min-w-40 list-none overflow-auto rounded-2xl border border-line bg-elevated p-1 shadow-[0_10px_28px_var(--color-shadow)] starting:-translate-y-1 starting:opacity-0 transition duration-150 ease-out sm:right-0 sm:left-auto dark:border-white/10"
        >
          {options.map((option, index) => {
            const selected = option.value === (city ?? "");
            return (
              <li key={option.label} role="presentation">
                <button
                  ref={(node) => {
                    optionsRef.current[index] = node;
                  }}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  className={
                    selected
                      ? "flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl border-0 bg-accent px-3 py-2 text-left text-xs font-semibold text-charcoal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                      : "flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl border-0 bg-transparent px-3 py-2 text-left text-xs font-medium text-ink transition-colors duration-150 hover:bg-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  }
                  onClick={() => choose(option.value)}
                  onKeyDown={(event) => onOptionKeyDown(event, index)}
                >
                  {option.label}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
