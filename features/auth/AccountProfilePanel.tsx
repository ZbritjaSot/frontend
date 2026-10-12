"use client";

import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Link from "next/link";
import { Spinner } from "@/components/ui/Spinner";
import { useMe } from "@/hooks/useAuth";

const micro = "text-xs font-bold tracking-[0.08em] text-muted uppercase";

type AccountProfilePanelProps = {
  passwordHref: string;
  roleLabel?: string;
};

/** Name, email, and password link — admin / manager / biz “Llogaria”. */
export function AccountProfilePanel({
  passwordHref,
  roleLabel,
}: AccountProfilePanelProps) {
  const { data: user, isLoading, isError, refetch } = useMe();

  if (isLoading) {
    return <Spinner label="Duke ngarkuar profilin" />;
  }

  if (isError || !user) {
    return (
      <div>
        <p className="m-0 text-sm text-muted">Nuk mundëm ta ngarkojmë profilin.</p>
        <button
          type="button"
          className="mt-3 cursor-pointer border-0 bg-transparent p-0 text-sm font-semibold text-accent"
          onClick={() => refetch()}
        >
          Provo përsëri
        </button>
      </div>
    );
  }

  return (
    <section>
      <div className="p-5">
        <p className={`m-0 ${micro}`}>Llogaria</p>
        <h2 className="m-0 mt-1 text-xl font-bold tracking-[-0.02em] text-ink">
          {user.name || "—"}
        </h2>
        <p className="m-0 mt-1 text-sm text-muted">{user.email}</p>
        {roleLabel ? (
          <p className="m-0 mt-3 text-sm font-semibold text-ink">{roleLabel}</p>
        ) : null}
      </div>
      <Link
        href={passwordHref}
        className="flex items-center justify-between gap-4 border-t border-line px-5 py-4 text-inherit no-underline hover:bg-sunken"
      >
        <span className="font-bold">Ndrysho fjalëkalimin</span>
        <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-line bg-sunken text-ink">
          <LockOutlinedIcon fontSize="small" />
        </span>
      </Link>
    </section>
  );
}
