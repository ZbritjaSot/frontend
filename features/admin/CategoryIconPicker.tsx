"use client";

import { useMemo, useState } from "react";
import { CategoryGlyph, categoryIcons, type CategoryIconId } from "@/lib/categoryIcons";
import { fieldLabel, inputClass } from "@/lib/ui";

export function CategoryIconPicker({
  value,
  onChange,
}: {
  value: CategoryIconId | null;
  onChange: (icon: CategoryIconId) => void;
}) {
  const [query, setQuery] = useState("");
  const selected = categoryIcons.find((icon) => icon.id === value) ?? null;
  const visible = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("sq");
    if (needle === "") {
      return categoryIcons;
    }
    return categoryIcons.filter((icon) =>
      `${icon.label} ${icon.id}`.toLocaleLowerCase("sq").includes(needle),
    );
  }, [query]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <span className="inline-flex size-12 items-center justify-center rounded-xl bg-sunken text-accent">
          <CategoryGlyph name={value} active size={30} />
        </span>
        <div className="min-w-0">
          <p className="m-0 text-sm font-bold">{selected?.label ?? "Pa ikonë"}</p>
          <p className="m-0 truncate text-xs text-muted">
            {selected?.id ?? "Vizitorët shohin ikonën e paracaktuar"}
          </p>
        </div>
      </div>
      <label className={fieldLabel}>
        <span>Ikona</span>
        <input
          className={inputClass}
          value={query}
          placeholder="Kërko ikonën"
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>
      <div className="grid max-h-52 grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-4">
        {visible.map((icon) => {
          const active = icon.id === value;
          return (
            <button
              key={icon.id}
              type="button"
              aria-pressed={active}
              className={`flex min-h-16 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border px-1 py-2 ${
                active
                  ? "border-accent bg-accent/15 text-accent"
                  : "border-line bg-elevated text-muted hover:text-ink"
              }`}
              onClick={() => onChange(icon.id)}
            >
              <CategoryGlyph name={icon.id} active={active} size={26} />
              <span className="line-clamp-1 text-center text-[0.7rem] leading-tight font-semibold">
                {icon.label}
              </span>
            </button>
          );
        })}
      </div>
      {visible.length === 0 ? (
        <p className="m-0 text-sm text-muted">Asnjë ikonë nuk përputhet.</p>
      ) : null}
    </div>
  );
}
