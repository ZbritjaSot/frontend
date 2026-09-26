"use client";

import Image from "next/image";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Spinner } from "@/components/ui/Spinner";
import { AdminSections } from "@/features/admin/AdminSections";
import { DragList } from "@/features/admin/DragList";
import {
  fetchAdminHome,
  saveAdminFlyers,
  saveAdminHero,
  saveAdminHomeShops,
} from "@/features/admin/homeCurationApi";
import { validationMessage } from "@/lib/api";
import { btnGhost, btnSm, fieldError, inputClass, panelLead } from "@/lib/ui";

const homeKey = ["admin", "home"] as const;

function homeError(error: unknown): string {
  const message = validationMessage(error, "Nuk mundëm ta ruajmë.");
  if (message === "Choose a public offer from a shop marked for extra placement.") {
    return "Zgjidh një produkt publik nga një dyqan me shfaqje shtesë.";
  }
  if (message === "Choose a public shop marked for extra placement.") {
    return "Zgjidh një dyqan publik me shfaqje shtesë.";
  }
  if (message === "Choose a public flyer from a shop marked for extra placement.") {
    return "Zgjidh një fletushkë publike nga një dyqan me shfaqje shtesë.";
  }
  return message;
}

export function AdminHome() {
  const queryClient = useQueryClient();
  const [pane, setPane] = useState<"hero" | "shops" | "flyers">("hero");
  const [heroSearch, setHeroSearch] = useState("");
  const [heroQuery, setHeroQuery] = useState("");
  const home = useQuery({
    queryKey: [...homeKey, heroQuery],
    queryFn: () => fetchAdminHome(heroQuery),
  });
  const heroes = home.data?.hero.picks ?? [];
  const shops = home.data?.shops.picks ?? [];
  const flyers = home.data?.flyers ?? [];
  const heroIds = new Set(heroes.map((offer) => offer.id));
  const heroCandidates = (home.data?.hero.candidates ?? []).filter(
    (offer) => !heroIds.has(offer.id),
  );

  useEffect(() => {
    const timer = window.setTimeout(() => setHeroQuery(heroSearch.trim()), 250);
    return () => window.clearTimeout(timer);
  }, [heroSearch]);

  const saveHero = useMutation({
    mutationFn: (ids: string[]) => saveAdminHero(ids),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: homeKey });
    },
  });
  const saveShops = useMutation({
    mutationFn: (ids: string[]) => saveAdminHomeShops(ids),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: homeKey });
    },
  });
  const saveFlyers = useMutation({
    mutationFn: (ids: string[]) => saveAdminFlyers(ids),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: homeKey });
    },
  });

  return (
    <div>
      <AdminSections />
      <p className={`${panelLead} mt-6 max-w-2xl`}>
        Vetëm nga dyqanet me shfaqje shtesë. Pa zgjedhje, kryefaqja mbetet si tani:
        pesë oferta në krye, dyqanet dhe fletushkat sipas rendit të zakonshëm.
      </p>

      {home.isLoading ? (
        <div className="mt-6">
          <Spinner label="Duke ngarkuar kryefaqen" />
        </div>
      ) : home.isError ? (
        <p className={`${panelLead} mt-6`}>
          {validationMessage(home.error, "Nuk mundëm ta ngarkojmë kryefaqen.")}
        </p>
      ) : (
        <div>
        <nav className="mt-6 flex flex-wrap gap-x-5 border-b border-line" aria-label="Pjesët e kryefaqes">
          {(
            [
              ["hero", "Hero", heroes.length],
              ["shops", "Dyqanet", shops.length],
              ["flyers", "Fletushkat", flyers.length],
            ] as const
          ).map(([id, label, count]) => (
            <button
              key={id}
              type="button"
              className={`cursor-pointer border-0 border-b-2 bg-transparent px-0 py-3 text-sm font-bold ${
                pane === id ? "border-accent text-ink" : "border-transparent text-muted"
              }`}
              onClick={() => setPane(id)}
            >
              {label}
              <span className="ml-2 tabular-nums text-muted">{count}</span>
            </button>
          ))}
        </nav>
        <div className="mt-4">
          <section hidden={pane !== "hero"}>
            <div className="border-b border-line px-4 py-3">
              <h2 className="m-0 text-xl font-bold tracking-[-0.03em]">
                Pjesa e parë
              </h2>
              <p className="m-0 mt-1 text-sm text-muted">
                Vetëm produkte nga dyqanet ekskluzive. Sa të duash.
              </p>
            </div>
            {saveHero.isError ? (
              <p className={`${fieldError} px-4 pt-3`} role="alert">
                {homeError(saveHero.error)}
              </p>
            ) : null}
            {heroes.length === 0 ? (
              <p className="m-0 px-4 py-6 text-sm text-muted">Asnjë ofertë e zgjedhur.</p>
            ) : (
              <DragList
                items={heroes}
                pending={saveHero.isPending}
                label={(offer) => offer.name}
                onReorder={(ids) => saveHero.mutate(ids)}
                trailing={(offer) => (
                  <button
                    className={`${btnGhost} ${btnSm}`}
                    type="button"
                    disabled={saveHero.isPending}
                    onClick={() =>
                      saveHero.mutate(
                        heroes.filter((item) => item.id !== offer.id).map((item) => item.id),
                      )
                    }
                  >
                    Hiq
                  </button>
                )}
              >
                {(offer) => (
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-sunken">
                      {offer.thumb_url ? (
                        <Image
                          src={offer.thumb_url}
                          alt=""
                          fill
                          unoptimized
                          className="object-cover"
                          sizes="48px"
                        />
                      ) : null}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-semibold">{offer.name}</span>
                      <span className="block truncate text-sm text-muted">
                        {[offer.bundle_title, offer.business_name]
                          .filter(Boolean)
                          .join(" · ")}
                        {offer.public ? "" : " · nuk shfaqet ende"}
                      </span>
                    </span>
                  </div>
                )}
              </DragList>
            )}
            <div className="grid gap-3 px-4 py-4">
              <input
                className={inputClass}
                value={heroSearch}
                placeholder="Kërko te ekskluzivet"
                aria-label="Kërko te ekskluzivet"
                onChange={(event) => setHeroSearch(event.target.value)}
              />
              {heroCandidates.length === 0 ? (
                <p className="m-0 text-sm text-muted">
                  {heroSearch.trim() === ""
                    ? "Nuk ka produkt publik nga një dyqan ekskluziv."
                    : "Nuk u gjet asnjë produkt ekskluziv."}
                </p>
              ) : (
                <ul className="m-0 list-none p-0">
                  {heroCandidates.map((offer) => (
                    <li key={offer.id} className="flex items-center gap-3 py-2">
                      <div className="min-w-0 flex-1">
                        <p className="m-0 truncate text-sm font-semibold">{offer.name}</p>
                        <p className="m-0 truncate text-sm text-muted">
                          {[offer.bundle_title, offer.business_name, offer.city]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      </div>
                      <button
                        className={`${btnGhost} ${btnSm}`}
                        type="button"
                        disabled={saveHero.isPending}
                        onClick={() =>
                          saveHero.mutate([...heroes.map((item) => item.id), offer.id])
                        }
                      >
                        Shto
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          <section hidden={pane !== "shops"}>
            <div className="border-b border-line px-4 py-3">
              <h2 className="m-0 text-xl font-bold tracking-[-0.03em]">
                Dyqanet
              </h2>
                <p className="m-0 mt-1 text-sm text-muted">
                  Vetëm dyqanet ekskluzive. Dalin të parët, në këtë rend.
                </p>
            </div>
            {saveShops.isError ? (
              <p className={`${fieldError} px-4 pt-3`} role="alert">
                {homeError(saveShops.error)}
              </p>
            ) : null}
            {shops.length === 0 ? (
              <p className="m-0 px-4 py-6 text-sm text-muted">
                Nuk ka dyqan ekskluziv publik.
              </p>
            ) : (
              <DragList
                items={shops}
                pending={saveShops.isPending}
                label={(shop) => shop.name}
                onReorder={(ids) => saveShops.mutate(ids)}
              >
                {(shop) => (
                  <>
                    <p className="m-0 truncate font-semibold">{shop.name}</p>
                    {shop.city ? <p className="m-0 text-sm text-muted">{shop.city}</p> : null}
                  </>
                )}
              </DragList>
            )}
          </section>

          <section hidden={pane !== "flyers"}>
            <div className="border-b border-line px-4 py-3">
              <h2 className="m-0 text-xl font-bold tracking-[-0.03em]">
                Fletushkat
              </h2>
              <p className="m-0 mt-1 text-sm text-muted">
                Ky rend del te kryefaqja dhe te lista e fletushkave.
              </p>
            </div>
            {saveFlyers.isError ? (
              <p className={`${fieldError} px-4 pt-3`} role="alert">
                {homeError(saveFlyers.error)}
              </p>
            ) : null}
            {flyers.length === 0 ? (
              <p className="m-0 px-4 py-6 text-sm text-muted">Nuk ka fletushka publike.</p>
            ) : (
              <DragList
                items={flyers}
                pending={saveFlyers.isPending}
                label={(flyer) => flyer.title}
                onReorder={(ids) => saveFlyers.mutate(ids)}
              >
                {(flyer) => (
                  <>
                    <p className="m-0 truncate font-semibold">{flyer.title}</p>
                    <p className="m-0 truncate text-sm text-muted">
                      {[flyer.business_name, flyer.city].filter(Boolean).join(" · ")}
                    </p>
                  </>
                )}
              </DragList>
            )}
          </section>
        </div>
        </div>
      )}
    </div>
  );
}
