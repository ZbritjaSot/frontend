"use client";

import { CheckCircleOutlinedIcon, ErrorOutlineOutlinedIcon } from "@/components/ui/icons";
import { Spinner } from "@/components/ui/Spinner";
import type { UploadItem, UploadSummary } from "@/features/gallery/useBulkUpload";
import { button } from "@/lib/ui";

export function BulkUploadStatus<T>({
  items,
  summary,
  busy,
  onRetry,
}: {
  items: UploadItem<T>[];
  summary: UploadSummary;
  busy: boolean;
  onRetry: () => void;
}) {
  if (items.length === 0) {
    return null;
  }

  const settled = summary.pending === 0;

  return (
    <div className="grid gap-2">
      {settled ? (
        <p className="m-0 text-sm font-semibold text-ink">
          {summary.failed === 0
            ? `${summary.success} nga ${summary.total} foto u ngarkuan.`
            : `${summary.success} nga ${summary.total} foto u ngarkuan. ${summary.failed} dështuan.`}
        </p>
      ) : null}
      <ul className="m-0 max-h-72 w-full min-w-0 list-none overflow-y-auto overscroll-contain rounded-2xl border border-line p-0">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex min-w-0 items-center gap-2.5 border-b border-line px-2 py-2 last:border-b-0"
          >
            <span className="grid size-6 shrink-0 place-items-center">
              {item.status === "success" ? (
                <CheckCircleOutlinedIcon
                  sx={{ fontSize: 18 }}
                  className="text-forest dark:text-accent"
                />
              ) : item.status === "failed" ? (
                <ErrorOutlineOutlinedIcon
                  sx={{ fontSize: 18 }}
                  className="text-danger"
                />
              ) : item.status === "uploading" ? (
                <Spinner size="sm" block={false} />
              ) : (
                <span className="size-2 rounded-full bg-muted" />
              )}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-ink">
                {item.title.trim() || item.file.name}
              </span>
              {item.status === "failed" && item.error ? (
                <span className="block truncate text-xs text-danger">
                  {item.error}
                </span>
              ) : null}
            </span>
          </li>
        ))}
      </ul>
      {summary.failed > 0 ? (
        <button
          type="button"
          className={button({ variant: "secondary", size: "sm" })}
          disabled={busy}
          aria-busy={busy}
          onClick={onRetry}
        >
          Provo përsëri ({summary.failed})
        </button>
      ) : null}
    </div>
  );
}
