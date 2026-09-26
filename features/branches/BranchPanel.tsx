"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import {
  createAdminBranch,
  createBizBranch,
  fetchAdminBranches,
  fetchBizBranches,
} from "@/features/branches/api";
import { accountEmailMessage } from "@/lib/api";
import { btnPrimary, fieldError, fieldLabel, inputClass } from "@/lib/ui";
import type { Business } from "@/types";

type BranchPanelProps = {
  mode: "admin" | "biz";
  business: Business;
};

export function BranchPanel({ mode, business }: BranchPanelProps) {
  const queryClient = useQueryClient();
  const queryKey = ["branches", mode, business.id] as const;
  const branches = useQuery({
    queryKey,
    queryFn: () =>
      mode === "admin" ? fetchAdminBranches(business.id) : fetchBizBranches(),
  });
  const [name, setName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const canCreate = !business.parent_id;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const trimmed = name.trim();
    if (!trimmed || !email.trim()) {
      setError("Shkruaj emrin e degës dhe emailin.");
      return;
    }

    setPending(true);
    try {
      const input = {
        name: trimmed,
        owner_name: ownerName.trim() || undefined,
        owner_email: email.trim(),
      };
      if (mode === "admin") {
        await createAdminBranch(business.id, input);
      } else {
        await createBizBranch(input);
      }
      setName("");
      setOwnerName("");
      setEmail("");
      await queryClient.invalidateQueries({ queryKey });
    } catch (err) {
      setError(accountEmailMessage(err, "Nuk mundëm ta shtojmë degën."));
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="rounded-2xl border border-line p-5 lg:col-span-2">
      <p className="m-0 text-xs font-bold tracking-[0.08em] text-muted uppercase">
        Degët
      </p>
      {business.parent ? (
        <p className="m-0 mt-2 text-sm text-muted">
          Kjo është degë e{" "}
          {mode === "admin" ? (
            <Link
              href={`/admin/businesses/${business.parent.id}`}
              className="font-semibold text-ink underline-offset-4 hover:underline"
            >
              {business.parent.name}
            </Link>
          ) : (
            <span className="font-semibold text-ink">{business.parent.name}</span>
          )}
          .
        </p>
      ) : (
        <p className="m-0 mt-2 text-sm leading-relaxed text-muted">
          Dyqani kryesor. Çdo degë ka adresën, emailin dhe hyrjen e vet.
        </p>
      )}

      {branches.data && branches.data.some((branch) => branch.id !== business.id) ? (
        <ul className="m-0 mt-4 list-none p-0">
          {branches.data.filter((branch) => branch.id !== business.id).map((branch) => (
            <li
              key={branch.id}
              className="flex items-center justify-between gap-3 border-t border-line py-3"
            >
              <span className="min-w-0">
                {mode === "admin" ? (
                  <Link
                    href={`/admin/businesses/${branch.id}`}
                    className="font-semibold text-ink underline-offset-4 hover:underline"
                  >
                    {branch.name}
                  </Link>
                ) : (
                  <span className="font-semibold text-ink">{branch.name}</span>
                )}
                <span className="mt-0.5 block truncate text-sm text-muted">
                  {branch.owner?.email}
                  {branch.city ? ` · ${branch.city}` : ""}
                </span>
              </span>
              <span className="shrink-0 text-sm text-muted">
                {branch.is_active ? "Aktive" : "Joaktive"}
              </span>
            </li>
          ))}
        </ul>
      ) : canCreate ? (
        <p className="m-0 mt-4 text-sm text-muted">Ende pa degë.</p>
      ) : null}

      {canCreate ? (
        <form className="mt-5 grid gap-4 border-t border-line pt-5" onSubmit={onSubmit}>
          <p className="m-0 text-sm font-semibold">Shto degë</p>
          <div className="grid gap-4 md:grid-cols-3">
            <label className={fieldLabel}>
              <span>Emri</span>
              <input
                className={inputClass}
                value={name}
                onChange={(event) => setName(event.target.value)}
                disabled={pending}
                required
              />
            </label>
            <label className={fieldLabel}>
              <span>Emri i llogarisë</span>
              <input
                className={inputClass}
                value={ownerName}
                onChange={(event) => setOwnerName(event.target.value)}
                disabled={pending}
              />
            </label>
            <label className={fieldLabel}>
              <span>Email</span>
              <input
                className={inputClass}
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={pending}
                required
              />
            </label>
          </div>
          {error ? (
            <p className={fieldError} role="alert">
              {error}
            </p>
          ) : null}
          <div>
            <button className={btnPrimary} type="submit" disabled={pending}>
              {pending ? "Duke shtuar" : "Shto degën"}
            </button>
          </div>
        </form>
      ) : null}
    </section>
  );
}
