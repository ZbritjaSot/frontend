"use client";

const FILTERS = [
  ["", "Të gjitha"],
  ["pending", "Në pritje"],
  ["approved", "Aktive"],
] as const;

export type OfferListStatus = "" | "pending" | "approved";

export function OfferStatusFilters<T extends string = OfferListStatus>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (value: T) => void;
  options?: readonly (readonly [T, string])[];
}) {
  const items =
    options ??
    (FILTERS as unknown as readonly (readonly [T, string])[]);

  return (
    <div className="mb-4 flex flex-wrap gap-2">
      {items.map(([id, label]) => (
        <button
          key={id || "all"}
          type="button"
          className={`min-h-9 cursor-pointer rounded-lg border-0 px-3 text-sm font-bold ${
            value === id
              ? "bg-accent text-charcoal"
              : "bg-transparent text-muted hover:text-ink"
          }`}
          onClick={() => onChange(id)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
