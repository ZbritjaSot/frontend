"use client";

import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Spinner } from "@/components/ui/Spinner";
import { DragList } from "@/features/admin/DragList";
import {
  fetchAdminSections,
  saveAdminSections,
  type AdminHomeSection,
} from "@/features/admin/homeCurationApi";
import { validationMessage } from "@/lib/api";
import { EXCLUSIVE_LABEL } from "@/lib/exclusive";
import { fieldError, inputClass } from "@/lib/ui";

const sectionKey = ["admin", "sections"] as const;

const hints: Record<string, string> = {
  exclusive: `${EXCLUSIVE_LABEL} në kryefaqe`,
  spotlight: "Zbritjet e forta",
  flyers: "Fletushkat",
  inbox: "Email-i",
  fresh: "Të rejat",
  ending: "Afatshkurtra",
  shops: "Partnerët",
};

export function AdminSections() {
  const queryClient = useQueryClient();
  const sections = useQuery({
    queryKey: sectionKey,
    queryFn: fetchAdminSections,
  });
  const [draft, setDraft] = useState<AdminHomeSection[] | null>(null);
  const rows = (draft ?? sections.data ?? [])
    .filter((section) => section.key !== "categories")
    .map((section) => ({
      ...section,
      id: section.key,
    }));

  const save = useMutation({
    mutationFn: (next: AdminHomeSection[]) => saveAdminSections(next),
    onSuccess: (saved) => {
      queryClient.setQueryData(sectionKey, saved);
      setDraft(null);
    },
    onError: () => {
      setDraft(null);
    },
  });

  function persist(next: AdminHomeSection[]) {
    setDraft(next);
    save.mutate(next);
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-line">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-line px-4 py-4">
        <div>
          <h2 className="m-0 text-xl font-bold tracking-[-0.03em]">Seksionet</h2>
          <p className="m-0 mt-1 max-w-xl text-sm leading-relaxed text-muted">
            Ndrysho titullin, ndize ose fike, dhe tërhiq për ta renditur. Ndryshimet
            ruhen menjëherë.
          </p>
        </div>
        <p className="m-0 text-xs font-bold tracking-[0.08em] text-muted uppercase" aria-live="polite">
          {save.isPending ? "Duke u ruajtur…" : "Ruhet vetë"}
        </p>
      </div>
      {sections.isLoading ? (
        <div className="px-4 py-6">
          <Spinner label="Duke ngarkuar seksionet" />
        </div>
      ) : sections.isError ? (
        <p className="m-0 px-4 py-6 text-sm text-muted">
          {validationMessage(sections.error, "Nuk mundëm t’i ngarkojmë seksionet.")}
        </p>
      ) : (
        <>
          {save.isError ? (
            <p className={`${fieldError} px-4 pt-3`} role="alert">
              {validationMessage(save.error, "Nuk mundëm t’i ruajmë seksionet.")}
            </p>
          ) : null}
          <ul className="m-0 list-none border-b border-line p-0">
          </ul>
          <DragList
            items={rows}
            pending={save.isPending}
            label={(row) => hints[row.key] ?? row.title}
            onReorder={(ids) =>
              persist(
                ids
                  .map((id) => rows.find((row) => row.id === id))
                  .filter((row): row is (typeof rows)[number] => row !== undefined)
                  .map(({ key, title, is_visible }) => ({ key, title, is_visible })),
              )
            }
            trailing={(row) => (
              <button
                type="button"
                role="switch"
                aria-checked={row.is_visible}
                aria-label={
                  row.is_visible
                    ? `Fike ${hints[row.key] ?? row.key}`
                    : `Ndize ${hints[row.key] ?? row.key}`
                }
                disabled={row.can_enable === false}
                title={
                  row.can_enable === false
                    ? "Ky seksion nuk mund të ndizet tani."
                    : row.is_visible
                      ? "Fike"
                      : "Ndize"
                }
                className={`inline-flex items-center gap-2 border-0 bg-transparent p-0 ${
                  row.can_enable === false ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                }`}
                onClick={() => {
                  if (row.can_enable === false) {
                    return;
                  }
                  persist(
                    rows.map(({ key, title, is_visible }) => ({
                      key,
                      title,
                      is_visible: key === row.key ? !is_visible : is_visible,
                    })),
                  );
                }}
              >
                <span
                  className={`relative h-7 w-12 shrink-0 rounded-full motion-safe:transition-colors motion-safe:duration-200 motion-safe:ease-out ${
                    row.is_visible ? "bg-accent" : "bg-line"
                  }`}
                >
                  <span
                    aria-hidden
                    className={`absolute top-0.5 left-0.5 size-6 rounded-full bg-charcoal motion-safe:transition-transform motion-safe:duration-200 motion-safe:ease-out ${
                      row.is_visible ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </span>
              </button>
            )}
          >
            {(row) => (
              <label className="grid gap-1">
                <span className="text-xs font-bold tracking-[0.08em] text-muted uppercase">
                  {hints[row.key] ?? row.key}
                </span>
                <input
                  className={inputClass}
                  value={row.title}
                  maxLength={80}
                  aria-label={`Titulli i ${hints[row.key] ?? row.key}`}
                  onChange={(event) => {
                    const title = event.target.value;
                    setDraft(
                      rows.map(({ key, title: current, is_visible }) => ({
                        key,
                        title: key === row.key ? title : current,
                        is_visible,
                      })),
                    );
                  }}
                  onBlur={() => {
                    const title = row.title.trim();
                    if (title === "") {
                      setDraft(null);
                      return;
                    }
                    const saved = sections.data?.find((section) => section.key === row.key);
                    if (saved?.title === title) {
                      setDraft(null);
                      return;
                    }
                    persist(
                      rows.map(({ key, title: current, is_visible }) => ({
                        key,
                        title: key === row.key ? title : current,
                        is_visible,
                      })),
                    );
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.currentTarget.blur();
                    }
                  }}
                />
              </label>
            )}
          </DragList>
        </>
      )}
    </section>
  );
}
