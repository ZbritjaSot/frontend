"use client";

import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

type CategoryChipsProps = {
  /** Category ids in the order the business chose — index 0 is the primary category. */
  categoryIds: string[];
  labelFor: (id: string) => string;
  onReorder: (nextIds: string[]) => void;
  onRemove: (id: string) => void;
  disabled?: boolean;
  /** Used to build unique aria-labels, e.g. the product's index. */
  idPrefix: string;
};

const moveButton =
  "inline-flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted hover:text-ink disabled:cursor-not-allowed disabled:opacity-30";

function reordered(ids: string[], from: number, to: number): string[] {
  const next = [...ids];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

/**
 * Reorderable category chips: index 0 is the primary category, which is what
 * `categoryCrumb()` (`features/public/Breadcrumbs.tsx`) picks for the public
 * breadcrumb. Reordering here writes the same `category_offer.position` the
 * backend already stores and sorts by — no new field.
 */
export function CategoryChips({
  categoryIds,
  labelFor,
  onReorder,
  onRemove,
  disabled = false,
  idPrefix,
}: CategoryChipsProps) {
  if (categoryIds.length === 0) {
    return null;
  }

  function moveLeft(index: number) {
    if (index <= 0) {
      return;
    }
    onReorder(reordered(categoryIds, index, index - 1));
  }

  function moveRight(index: number) {
    if (index >= categoryIds.length - 1) {
      return;
    }
    onReorder(reordered(categoryIds, index, index + 1));
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex flex-wrap gap-1.5">
        {categoryIds.map((id, index) => {
          const isPrimary = index === 0;
          const label = labelFor(id);
          return (
            <span
              key={id}
              className={`inline-flex items-center gap-0.5 rounded-full border py-1 pl-1 pr-2 text-sm font-semibold text-ink ${
                isPrimary ? "border-accent bg-accent/10" : "border-line bg-elevated"
              }`}
            >
              <button
                type="button"
                className={moveButton}
                disabled={disabled || index === 0}
                aria-label={`Zhvendos "${label}" më parë`}
                onClick={() => moveLeft(index)}
              >
                <ChevronLeftIcon fontSize="inherit" />
              </button>
              {isPrimary ? (
                <span className="rounded-full bg-accent px-1.5 py-0.5 text-[0.6875rem] leading-none font-extrabold tracking-wide text-on-accent uppercase">
                  Kryesore
                </span>
              ) : null}
              <span className="px-0.5">{label}</span>
              <button
                type="button"
                className={moveButton}
                disabled={disabled || index === categoryIds.length - 1}
                aria-label={`Zhvendos "${label}" më vonë`}
                onClick={() => moveRight(index)}
              >
                <ChevronRightIcon fontSize="inherit" />
              </button>
              <button
                type="button"
                className="ml-0.5 cursor-pointer text-muted hover:text-ink disabled:cursor-not-allowed disabled:opacity-30"
                disabled={disabled}
                aria-label={`Hiq kategorinë "${label}"`}
                onClick={() => onRemove(id)}
              >
                <span aria-hidden>×</span>
              </button>
            </span>
          );
        })}
      </div>
      <p className="m-0 text-xs font-medium text-muted" id={`category-hint-${idPrefix}`}>
        Kategoria e parë përdoret si kategoria kryesore në shtegun e produktit (breadcrumb).
      </p>
    </div>
  );
}
