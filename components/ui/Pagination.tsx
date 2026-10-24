"use client";

import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { SelectField } from "@/components/ui/SelectField";

const pageButton =
  "inline-flex size-10 cursor-pointer items-center justify-center rounded-lg border border-line bg-sunken text-ink hover:border-accent/60 disabled:cursor-not-allowed disabled:opacity-40";

type PaginationProps = {
  page: number;
  lastPage: number;
  total: number;
  perPage: number;
  onPageChange: (page: number) => void;
  pageSizes?: readonly number[];
  onPerPageChange?: (perPage: number) => void;
};

export function Pagination({
  page,
  lastPage,
  total,
  perPage,
  onPageChange,
  pageSizes,
  onPerPageChange,
}: PaginationProps) {
  const from = total === 0 ? 0 : (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, total);

  return (
    <nav
      className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-3"
      aria-label="Faqet"
    >
      <div className="flex flex-wrap items-center gap-3">
        <p className="m-0 text-sm font-semibold text-muted">
          {from}–{to} nga {total}
        </p>
        {pageSizes && onPerPageChange ? (
          <label className="flex items-center gap-2 text-sm font-semibold text-muted">
            <span>Për faqe</span>
            <span className="block w-32">
              <SelectField
                value={String(perPage)}
                aria-label="Artikuj për faqe"
                className="whitespace-nowrap"
                options={pageSizes.map((size) => ({
                  value: String(size),
                  label: String(size),
                }))}
                onChange={(next) => onPerPageChange(Number(next))}
              />
            </span>
          </label>
        ) : null}
      </div>
      <div className="flex items-center gap-2">
        <button
          className={pageButton}
          type="button"
          aria-label="Faqja e mëparshme"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeftIcon fontSize="small" />
        </button>
        <span className="min-w-24 text-center text-sm font-semibold text-ink">
          Faqja {page} nga {lastPage}
        </span>
        <button
          className={pageButton}
          type="button"
          aria-label="Faqja tjetër"
          disabled={page >= lastPage}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRightIcon fontSize="small" />
        </button>
      </div>
    </nav>
  );
}
