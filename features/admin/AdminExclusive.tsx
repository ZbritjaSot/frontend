"use client";

import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { DashboardKpi } from "@/components/ui/DashboardKpi";
import { adminCurationKey, IndicatorKey } from "@/components/ui/IndicatorKey";
import { Spinner } from "@/components/ui/Spinner";
import { AdminHome } from "@/features/admin/AdminHome";
import { DragList } from "@/features/admin/DragList";
import {
  fetchAdminPlacement,
  placementKey,
  saveAdminPlacement,
  type PlacementCandidate,
  type PlacementPick,
  type PlacementRef,
} from "@/features/admin/placementApi";
import { validationMessage } from "@/lib/api";
import { EXCLUSIVE_LABEL } from "@/lib/exclusive";
import { btnGhost, btnPrimary, btnSm, fieldError, iconButton, pageTitle, panelLead } from "@/lib/ui";

const queryKey = ["admin", "placement"] as const;

function placementError(error: unknown): string {
  const message = validationMessage(error, "Nuk mundëm ta ruajmë renditjen.");
  if (message === "Choose an approved offer from a shop marked for extra placement.") {
    return "Zgjidh një produkt të aprovuar nga një dyqan me shfaqje shtesë.";
  }
  if (message === "Choose an approved flyer from a shop marked for extra placement.") {
    return "Zgjidh një fletushkë të aprovuar nga një dyqan me shfaqje shtesë.";
  }
  return message;
}

function kindLabel(kind: PlacementRef["kind"]): string {
  return kind === "flyer" ? "Fletushkë" : "Produkt";
}

function placeLine(item: {
  city?: string | null;
  street?: string | null;
  branch?: boolean;
}): string {
  const place = [item.street, item.city].filter(Boolean).join(", ");
  return [item.branch ? "Degë" : null, place || null].filter(Boolean).join(" · ");
}

export function AdminExclusive() {
  const queryClient = useQueryClient();
  const placement = useQuery({
    queryKey,
    queryFn: fetchAdminPlacement,
  });
  const picks = placement.data?.picks ?? [];
  const picked = new Set(picks.map((pick) => placementKey(pick)));
  const candidates = (placement.data?.candidates ?? []).filter(
    (item) => !picked.has(placementKey(item)),
  );
  const products = candidates.filter((item) => item.kind === "offer");
  const flyers = candidates.filter((item) => item.kind === "flyer");
  const rows = picks.map((pick) => ({ ...pick, id: placementKey(pick), entityId: pick.id }));
  const [tab, setTab] = useState<"list" | "home">("list");

  const save = useMutation({
    mutationFn: (items: PlacementRef[]) => saveAdminPlacement(items),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey });
    },
  });

  function persist(next: PlacementRef[]) {
    save.mutate(next.map((item) => ({ kind: item.kind, id: item.id })));
  }

  return (
    <div>
      <h1 className={pageTitle}>{EXCLUSIVE_LABEL}</h1>
      <p className={`${panelLead} max-w-2xl`}>
        Dy punë të ndara. Lista është përmbajtja e {EXCLUSIVE_LABEL}. Kryefaqja
        vendos seksionet, heron, dyqanet dhe fletushkat. Tërhiqi për t’i renditur.
      </p>
      <IndicatorKey items={adminCurationKey} />
      <div className="mt-5 flex flex-wrap gap-x-8 gap-y-4">
        <DashboardKpi label="Në faqe" value={picks.length} detail="Të zgjedhura, më së shumti 40" />
        <DashboardKpi
          label="Publike"
          value={picks.filter((item) => item.public).length}
          detail="Dukshme për vizitorët"
          tone="accent"
        />
        <DashboardKpi
          label="Biznese"
          value={new Set(picks.map((item) => item.business_name).filter(Boolean)).size}
          detail="Dyqane në këtë listë"
        />
        <DashboardKpi label="Gati" value={candidates.length} detail="Produkte dhe fletushka të lira" />
      </div>
      <div className="mt-6 flex gap-2">
        <button
          type="button"
          className={tab === "list" ? `${btnPrimary} ${btnSm}` : `${btnGhost} ${btnSm}`}
          onClick={() => setTab("list")}
        >
          Lista
        </button>
        <button
          type="button"
          className={tab === "home" ? `${btnPrimary} ${btnSm}` : `${btnGhost} ${btnSm}`}
          onClick={() => setTab("home")}
        >
          Kryefaqja
        </button>
      </div>

      {tab === "home" ? (
        <AdminHome />
      ) : placement.isLoading ? (
        <div className="mt-6">
          <Spinner label="Duke ngarkuar listën" />
        </div>
      ) : placement.isError ? (
        <p className={`${panelLead} mt-6`}>
          {validationMessage(placement.error, "Nuk mundëm ta ngarkojmë listën.")}
        </p>
      ) : (
        <div className="mt-6 grid gap-6">
          <section className="overflow-hidden rounded-2xl border border-line">
            <div className="border-b border-line px-4 py-3">
              <h2 className="m-0 text-sm font-bold tracking-[0.08em] text-muted uppercase">
                Në faqe
              </h2>
            </div>
            {save.isError ? (
              <p className={`${fieldError} px-4 pt-3`} role="alert">
                {placementError(save.error)}
              </p>
            ) : null}
            {rows.length === 0 ? (
              <p className="m-0 px-4 py-6 text-sm leading-relaxed text-muted">
                Asgjë e zgjedhur.
              </p>
            ) : (
              <DragList
                items={rows}
                pending={save.isPending}
                label={(row) => row.name}
                onReorder={(ids) =>
                  persist(
                    ids.map((dragId) => {
                      const row = rows.find((item) => item.id === dragId);
                      return { kind: row?.kind ?? "offer", id: row?.entityId ?? dragId };
                    }),
                  )
                }
                trailing={(row) => (
                  <button
                    className={iconButton}
                    type="button"
                    aria-label={`Hiq ${row.name}`}
                    disabled={save.isPending}
                    onClick={() =>
                      persist(
                        picks.filter((item) => placementKey(item) !== row.id),
                      )
                    }
                  >
                    <DeleteOutlinedIcon fontSize="small" className="text-danger!" />
                  </button>
                )}
              >
                {(row) => (
                  <>
                    <p className="m-0 truncate font-semibold">{row.name}</p>
                    <p className="m-0 truncate text-sm text-muted">
                      {kindLabel(row.kind)}
                      {row.bundle_title ? ` · ${row.bundle_title}` : ""}
                      {row.business_name ? ` · ${row.business_name}` : ""}
                      {placeLine(row) ? ` · ${placeLine(row)}` : ""}
                      {row.public ? "" : " · nuk shfaqet ende"}
                    </p>
                  </>
                )}
              </DragList>
            )}
          </section>

          <div className="grid gap-4 lg:grid-cols-2">
            <CandidateGroup
              title="Fletushka"
              empty="Nuk ka fletushkë për të shtuar."
              items={flyers}
              pending={save.isPending}
              onAdd={(item) => persist([...picks, item])}
            />
            <CandidateGroup
              title="Produkte"
              empty="Nuk ka produkt për të shtuar."
              items={products}
              pending={save.isPending}
              onAdd={(item) => persist([...picks, item])}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function CandidateGroup({
  title,
  empty,
  items,
  pending,
  onAdd,
}: {
  title: string;
  empty: string;
  items: PlacementCandidate[];
  pending: boolean;
  onAdd: (item: PlacementPick) => void;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-line">
      <h3 className="m-0 border-b border-line px-4 py-3 text-sm font-bold tracking-[0.08em] text-muted uppercase">
        {title}
      </h3>
      {items.length === 0 ? (
        <p className="m-0 px-4 py-6 text-sm leading-relaxed text-muted">{empty}</p>
      ) : (
      <ul className="m-0 list-none p-0">
        {items.map((item) => (
          <li
            key={placementKey(item)}
            className="flex items-center gap-3 border-b border-line px-4 py-3 last:border-b-0"
          >
            <div className="min-w-0 flex-1">
              <p className="m-0 truncate font-semibold">{item.name}</p>
              {item.kind === "offer" && item.bundle_title ? (
                <p className="m-0 truncate text-sm text-muted">{item.bundle_title}</p>
              ) : null}
              <p className="m-0 truncate text-sm text-muted">
                {[item.business_name, placeLine(item)].filter(Boolean).join(" · ")}
              </p>
            </div>
            <button
              className={iconButton}
              type="button"
              aria-label={`Shto ${item.name}`}
              disabled={pending}
              onClick={() =>
                onAdd({
                  kind: item.kind,
                  id: item.id,
                  name: item.name,
                  business_name: item.business_name,
                  public: true,
                })
              }
            >
              <AddOutlinedIcon fontSize="small" className="text-accent!" />
            </button>
          </li>
        ))}
      </ul>
      )}
    </section>
  );
}
