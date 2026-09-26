"use client";

import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import Link from "next/link";
import { useState } from "react";
import { Pagination } from "@/components/ui/Pagination";
import { Spinner } from "@/components/ui/Spinner";
import { useManagerReview } from "@/hooks/useManagerReview";
import { validationMessage } from "@/lib/api";
import { formatDateShortSq } from "@/lib/format";
import { btnGhost, btnPrimary, pageTitle, panelLead } from "@/lib/ui";

const rowButton =
  "inline-flex size-9 cursor-pointer items-center justify-center rounded-lg border border-line bg-sunken text-ink no-underline hover:border-accent/60";

export function ManagerReview() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error, refetch } = useManagerReview(page);

  if (isLoading) {
    return <Spinner label="Duke ngarkuar listën" />;
  }

  if (isError) {
    return (
      <div className="max-w-[40rem]">
        <p className={panelLead}>
          {validationMessage(error, "Nuk mundëm t’i ngarkojmë fletushkat.")}
        </p>
        <button className={btnGhost} type="button" onClick={() => refetch()}>
          Provo përsëri
        </button>
      </div>
    );
  }

  const bundles = data?.data ?? [];
  const lastPage = data?.meta?.last_page ?? 1;
  const total = data?.meta?.total ?? bundles.length;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <h1 className={`${pageTitle} mb-0!`}>Në pritje</h1>
        <Link href="/biz/review/new" className={btnPrimary}>
          Dosje e re
        </Link>
      </div>
      <p className={panelLead}>
        Fletushkat e dyqaneve që ke në ngarkim. Vetëm ti i sheh këtu, derisa t’i aprovosh.
      </p>
      {bundles.length === 0 ? (
        <p className={panelLead}>Nuk ka fletushka në pritje.</p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line">
          <ul className="m-0 list-none p-0">
            {bundles.map((bundle) => (
              <li
                key={bundle.id}
                className="flex items-center justify-between gap-3 border-b border-line px-4 py-3 last:border-b-0"
              >
                <span className="min-w-0">
                  <Link
                    href={`/biz/review/${bundle.id}`}
                    className="block truncate text-base font-semibold text-inherit no-underline hover:text-accent"
                  >
                    {bundle.title}
                  </Link>
                  <span className="block truncate text-sm text-muted">
                    {bundle.business?.name ?? "Dyqan"}
                    {" · "}
                    {formatDateShortSq(bundle.expires_at)}
                  </span>
                </span>
                <Link
                  href={`/biz/review/${bundle.id}`}
                  className={rowButton}
                  aria-label={`Shiko ${bundle.title}`}
                >
                  <VisibilityOutlinedIcon fontSize="small" />
                </Link>
              </li>
            ))}
          </ul>
          <Pagination
            page={page}
            lastPage={lastPage}
            total={total}
            perPage={15}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
}
