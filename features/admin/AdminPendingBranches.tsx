"use client";

import CheckOutlinedIcon from "@mui/icons-material/CheckOutlined";
import Link from "next/link";
import { Spinner } from "@/components/ui/Spinner";
import { useApproveBranch, usePendingBranches } from "@/hooks/useAdminBusinesses";
import { validationMessage } from "@/lib/api";
import { btnGhost, offerStatusClass, panelLead } from "@/lib/ui";

const rowButton =
  "inline-flex size-9 cursor-pointer items-center justify-center rounded-lg border border-line bg-sunken text-ink no-underline hover:border-accent/60 disabled:cursor-wait disabled:opacity-65";

export function AdminPendingBranches() {
  const { data, isLoading, isError, error, refetch } = usePendingBranches(1, 8);
  const approve = useApproveBranch();
  const branches = data?.data ?? [];
  const total = data?.meta?.total ?? branches.length;

  if (isLoading) {
    return <Spinner label="Duke ngarkuar degët" />;
  }

  if (isError) {
    return (
      <div className="max-w-[40rem]">
        <p className={panelLead}>
          {validationMessage(error, "Nuk mundëm t’i ngarkojmë degët.")}
        </p>
        <button className={btnGhost} type="button" onClick={() => refetch()}>
          Provo përsëri
        </button>
      </div>
    );
  }

  if (branches.length === 0) {
    return null;
  }

  return (
    <section className="mt-8">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="m-0 text-xs font-bold tracking-[0.08em] text-muted uppercase">
            Degë në pritje
          </p>
          <h2 className="m-0 mt-1 text-xl font-bold tracking-[-0.03em]">
            Aprovo lokacionet e reja
          </h2>
        </div>
        <Link
          href="/admin/businesses?scope=branches"
          className="text-sm font-semibold text-muted no-underline hover:text-ink"
        >
          Shiko të gjitha ({total})
        </Link>
      </div>
      <div className="overflow-hidden rounded-2xl border border-line">
        <ul className="m-0 list-none p-0">
          {branches.map((branch) => (
            <li
              key={branch.id}
              className="flex flex-wrap items-center gap-3 border-b border-line px-4 py-3 last:border-b-0"
            >
              <div className="min-w-0 flex-1">
                <p className="m-0 truncate font-semibold">{branch.name}</p>
                <p className="m-0 truncate text-sm text-muted">
                  {[branch.parent?.name, branch.city, branch.street]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
              <span className={`${offerStatusClass("pending")} mt-0!`}>
                Pret aprovim
              </span>
              <button
                type="button"
                className={rowButton}
                aria-label={`Aprovo degën ${branch.name}`}
                disabled={approve.isPending}
                onClick={() => approve.mutate(branch.id)}
              >
                <CheckOutlinedIcon fontSize="small" className="text-accent!" />
              </button>
              <Link
                href={`/admin/businesses/${branch.parent_id ?? branch.id}`}
                className="text-sm font-semibold text-muted no-underline hover:text-ink"
              >
                Profili
              </Link>
            </li>
          ))}
        </ul>
      </div>
      {approve.isError ? (
        <p className="mt-2 text-sm text-danger" role="alert">
          {validationMessage(approve.error, "Nuk mundëm ta aprovojmë degën.")}
        </p>
      ) : null}
    </section>
  );
}
