"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { DateTimeField } from "@/components/ui/DateTimeField";
import { Pagination } from "@/components/ui/Pagination";
import { Spinner } from "@/components/ui/Spinner";
import {
  fetchAuditLogs,
  type AuditAction,
  type AuditImportance,
  type AuditLog,
} from "@/features/admin/auditApi";
import { validationMessage } from "@/lib/api";
import { localCalendarDayKey } from "@/lib/datetime";
import { formatDateTimeShortSq } from "@/lib/format";
import { btnGhost, btnSm, pageTitle, panelLead, statusBadge } from "@/lib/ui";

const actionCopy: Record<AuditAction, string> = {
  business_created: "Krijoi dyqanin",
  business_deleted: "Fshiu degën",
  email_changed: "Ndërroi emailin e hyrjes",
  password_set: "Vendosi një fjalëkalim",
  welcome_resent: "Dërgoi një fjalëkalim të ri",
  subscription_recorded: "Regjistroi abonimin",
  subscription_updated: "Ndryshoi abonimin",
  branch_approved: "Aprovoi degën",
  branch_made_main: "Bëri degën kryesore",
  offer_approved: "Aprovoi fletushkën",
  offer_taken_down: "Hoqi fletushkën",
  exclusive_on: "Bëri dyqanin ekskluziv",
  exclusive_off: "Hoqi ekskluzivitetin",
  manager_assigned: "Caktoi menaxherin",
  manager_removed: "Hoqi menaxherin",
  newsletter_sent: "Dërgoi buletinin",
  home_hero_ordered: "Renditi pjesën e parë",
  home_shops_ordered: "Renditi dyqanet",
  home_flyers_ordered: "Renditi fletushkat",
  home_recommended_ordered: "Renditi të rekomanduarat",
  placement_ordered: "Renditi Ekskluziven",
  category_renamed: "Ndryshoi kategorinë",
  section_titles: "Ndryshoi titujt e seksioneve",
};

const importanceCopy: Record<AuditImportance, string> = {
  high: "Lartë",
  medium: "Mesatare",
  low: "Ulët",
};

const importanceClass: Record<AuditImportance, string> = {
  high: "bg-danger-soft",
  medium: "bg-pending",
  low: "bg-sunken text-ink",
};

const importanceFilters: { id: "" | AuditImportance; label: string }[] = [
  { id: "", label: "Të gjitha" },
  { id: "high", label: "Lartë" },
  { id: "medium", label: "Mesatare" },
  { id: "low", label: "Ulët" },
];

const chipOn =
  "inline-flex min-h-10 cursor-pointer items-center rounded-full border border-accent bg-accent px-4 text-sm font-bold text-charcoal";
const chipOff =
  "inline-flex min-h-10 cursor-pointer items-center rounded-full border border-line bg-transparent px-4 text-sm font-bold text-muted hover:text-ink";

function clampToMax(value: string, max: string): string {
  if (!value) {
    return value;
  }
  return value > max ? max : value;
}

function clampRange(
  from: string,
  to: string,
  which: "from" | "to",
  next: string,
  max: string,
): { from: string; to: string } {
  const day = clampToMax(next, max);
  if (which === "from") {
    if (day && to && day > to) {
      return { from: day, to: day };
    }
    return { from: day, to };
  }
  if (day && from && day < from) {
    return { from: day, to: day };
  }
  return { from, to: day };
}

export function AdminAudit() {
  const [importance, setImportance] = useState<"" | AuditImportance>("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const today = localCalendarDayKey();
  const hasRange = Boolean(from || to);
  const rangeValid =
    (!from || from <= today) && (!to || to <= today) && (!from || !to || from <= to);
  const logs = useQuery({
    queryKey: ["admin", "audit-logs", importance, from, to, page],
    queryFn: () =>
      fetchAuditLogs({
        importance,
        from: from || undefined,
        to: to || undefined,
        page,
      }),
    enabled: rangeValid,
  });

  return (
    <div className="grid gap-6">
      <div>
        <h1 className={pageTitle}>Historiku</h1>
        <p className={panelLead}>Kush e bëri, çfarë ndryshoi, dhe kur.</p>
      </div>
      <div className="grid gap-3">
        <div className="grid gap-2">
          <div className="grid items-stretch gap-2 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
            <DateTimeField
              variant="card"
              dateOnly
              maxDate={today}
              caption="Nga"
              value={from}
              onChange={(value) => {
                const next = clampRange(from, to, "from", value, today);
                setFrom(next.from);
                setTo(next.to);
                setPage(1);
              }}
            />
            <span className="hidden self-center px-1 text-lg text-muted sm:block" aria-hidden>
              →
            </span>
            <DateTimeField
              variant="card"
              dateOnly
              maxDate={today}
              caption="Deri"
              value={to}
              onChange={(value) => {
                const next = clampRange(from, to, "to", value, today);
                setFrom(next.from);
                setTo(next.to);
                setPage(1);
              }}
            />
          </div>
          {hasRange ? (
            <button
              type="button"
              className={`${btnGhost} ${btnSm} w-fit`}
              onClick={() => {
                setFrom("");
                setTo("");
                setPage(1);
              }}
            >
              Pastro datat
            </button>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Rëndësia">
          {importanceFilters.map((filter) => (
            <button
              key={filter.id || "all-importance"}
              type="button"
              className={importance === filter.id ? chipOn : chipOff}
              onClick={() => {
                setImportance(filter.id);
                setPage(1);
              }}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>
      {logs.isLoading ? (
        <Spinner label="Duke ngarkuar historikun" />
      ) : logs.isError ? (
        <div>
          <p className={panelLead}>
            {validationMessage(logs.error, "Historiku nuk u ngarkua.")}
          </p>
          <button className={btnGhost} type="button" onClick={() => logs.refetch()}>
            Provo përsëri
          </button>
        </div>
      ) : (logs.data?.data.length ?? 0) === 0 ? (
        <p className={panelLead}>Ende pa veprime për këtë filtër.</p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line">
          <ul className="m-0 list-none p-0">
            {logs.data?.data.map((row) => (
              <LogRow key={row.id} row={row} />
            ))}
          </ul>
          <Pagination
            page={logs.data?.meta?.current_page ?? page}
            lastPage={logs.data?.meta?.last_page ?? 1}
            total={logs.data?.meta?.total ?? 0}
            perPage={logs.data?.meta?.per_page ?? 30}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
}

function LogRow({ row }: { row: AuditLog }) {
  return (
    <li className="grid gap-2 border-t border-line px-4 py-3 first:border-t-0 sm:grid-cols-[5.5rem_minmax(0,1fr)_auto] sm:items-center">
      <span className={`${statusBadge} mt-0 w-fit ${importanceClass[row.importance]}`}>
        {importanceCopy[row.importance]}
      </span>
      <span className="min-w-0">
        <span className="block font-semibold">{actionCopy[row.action]}</span>
        {row.subject ? <span className="block truncate text-sm text-muted">{row.subject}</span> : null}
      </span>
      <span className="text-sm text-muted">
        {row.actor_name || "Administrata"}
        {" · "}
        {formatDateTimeShortSq(row.created_at)}
      </span>
    </li>
  );
}
