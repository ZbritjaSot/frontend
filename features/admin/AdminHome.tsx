"use client";

import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import Image from "next/image";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Spinner } from "@/components/ui/Spinner";
import { AdminHeroCreateForm } from "@/features/admin/AdminHeroCreateForm";
import { AdminSections } from "@/features/admin/AdminSections";
import { DragList } from "@/features/admin/DragList";
import {
  fetchAdminHome,
  saveAdminFlyers,
  saveAdminHero,
  saveAdminHomeShops,
  saveAdminSpotlight,
} from "@/features/admin/homeCurationApi";
import { validationMessage } from "@/lib/api";
import { btnGhost, fieldError, iconButton, inputClass, panelLead } from "@/lib/ui";

const homeKey = ["admin", "home"] as const;

function homeError(error: unknown): string {
  const message = validationMessage(error, "Nuk mundëm ta ruajmë.");
  if (message === "Choose a public offer.") {
    return "Zgjidh një produkt publik.";
  }
  if (message === "Choose an active category.") {
    return "Zgjidh një kategori aktive.";
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
  const [pane, setPane] = useState<"hero" | "spotlight" | "shops" | "flyers">("hero");
  const [heroSearch, setHeroSearch] = useState("");
  const [heroQuery, setHeroQuery] = useState("");
  const [creatingHero, setCreatingHero] = useState(false);
  const home = useQuery({
    queryKey: [...homeKey, heroQuery],
    queryFn: () => fetchAdminHome(heroQuery),
    placeholderData: (previous) => previous,
  });
  const heroes = home.data?.hero.picks ?? [];
  const spotlight = home.data?.spotlight.picks ?? [];
  const shops = home.data?.shops.picks ?? [];
  const flyers = home.data?.flyers ?? [];
  const heroIds = new Set(heroes.map((offer) => offer.id));
  const heroCandidates = (home.data?.hero.candidates ?? []).filter(
    (offer) => !heroIds.has(offer.id),
  );
  const spotlightIds = new Set(spotlight.map((category) => category.id));
  const spotlightCandidates = (home.data?.spotlight.candidates ?? []).filter(
    (category) => !spotlightIds.has(category.id),
  );

  useEffect(() => {
    const timer = window.setTimeout(() => setHeroQuery(heroSearch.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [heroSearch]);

  function commitHeroSearch() {
    setHeroQuery(heroSearch.trim());
  }

  const saveHero = useMutation({
    mutationFn: (ids: string[]) => saveAdminHero(ids),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: homeKey });
    },
  });
  const saveSpotlight = useMutation({
    mutationFn: (ids: string[]) => saveAdminSpotlight(ids),
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
        Zbritjet e Ditës janë zgjedhje manuale nga çdo dyqan publik. Zbritjet e forta
        mbushen automatikisht nga kategoritë që zgjedh (deri në 4 produkte për kategori,
        të përziera). Dyqanet dhe fletushkat mbeten te dyqanet ekskluzive. Rekomandimet
        te faqja e ofertës mbushen automatikisht.
      </p>

      {home.isPending && !home.data ? (
        <div className="mt-6">
          <Spinner label="Duke ngarkuar kryefaqen" />
        </div>
      ) : home.isError && !home.data ? (
        <p className={`${panelLead} mt-6`}>
          {validationMessage(home.error, "Nuk mundëm ta ngarkojmë kryefaqen.")}
        </p>
      ) : (
        <div>
          <nav className="mt-6 flex flex-wrap gap-x-5 border-b border-line" aria-label="Pjesët e kryefaqes">
            {(
              [
                ["hero", "Zbritjet e Ditës", heroes.length],
                ["spotlight", "Zbritjet e forta", spotlight.length],
                ["shops", "Partnerët", shops.length],
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
                <h2 className="m-0 text-xl font-bold tracking-[-0.03em]">Zbritjet e Ditës</h2>
                <p className="m-0 mt-1 text-sm text-muted">
                  Kërko çdo produkt publik nga çdo dyqan, ose krijo një ofertë të re pa fletushkë.
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
                      className={iconButton}
                      type="button"
                      aria-label={`Hiq ${offer.name}`}
                      disabled={saveHero.isPending}
                      onClick={() =>
                        saveHero.mutate(
                          heroes.filter((item) => item.id !== offer.id).map((item) => item.id),
                        )
                      }
                    >
                      <DeleteOutlinedIcon fontSize="small" className="text-danger!" />
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
                          {[offer.bundle_title, offer.business_name].filter(Boolean).join(" · ")}
                          {offer.public ? "" : " · nuk shfaqet ende"}
                        </span>
                      </span>
                    </div>
                  )}
                </DragList>
              )}
              <div className="grid gap-3 px-4 py-4">
                <div className="flex flex-wrap items-center gap-3">
                  <input
                    className={`${inputClass} min-w-0 flex-1`}
                    value={heroSearch}
                    placeholder=""
                    aria-label="Kërko produkt, dyqan ose qytet"
                    onChange={(event) => setHeroSearch(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        commitHeroSearch();
                      }
                    }}
                  />
                  <button
                    type="button"
                    className={btnGhost}
                    onClick={() => setCreatingHero((open) => !open)}
                  >
                    {creatingHero ? "Mbyll formularin" : "Krijo ofertë"}
                  </button>
                </div>
                {creatingHero ? (
                  <AdminHeroCreateForm
                    onCancel={() => setCreatingHero(false)}
                    onCreated={async () => {
                      setCreatingHero(false);
                      await queryClient.invalidateQueries({ queryKey: homeKey });
                    }}
                  />
                ) : null}
                {heroSearch.trim() === "" ? (
                  <p className="m-0 text-sm text-muted">
                    Shkruaj për të kërkuar produkte nga të gjitha dyqanet.
                  </p>
                ) : home.isFetching && heroCandidates.length === 0 ? (
                  <p className="m-0 text-sm text-muted">Duke kërkuar…</p>
                ) : heroCandidates.length === 0 ? (
                  <p className="m-0 text-sm text-muted">Nuk u gjet asnjë produkt.</p>
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
                          className={iconButton}
                          type="button"
                          aria-label={`Shto ${offer.name}`}
                          disabled={saveHero.isPending}
                          onClick={() =>
                            saveHero.mutate([...heroes.map((item) => item.id), offer.id])
                          }
                        >
                          <AddOutlinedIcon fontSize="small" className="text-accent!" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>

            <section hidden={pane !== "spotlight"}>
              <div className="border-b border-line px-4 py-3">
                <h2 className="m-0 text-xl font-bold tracking-[-0.03em]">Zbritjet e forta</h2>
                <p className="m-0 mt-1 text-sm text-muted">
                  Zgjidh kategoritë. Kryefaqja tregon deri në 4 produkte për kategori,
                  të përziera. Nëse një kategori s’ka mjaft produkte, vendet mbushen nga
                  kategoritë e tjera të zgjedhura.
                </p>
              </div>
              {saveSpotlight.isError ? (
                <p className={`${fieldError} px-4 pt-3`} role="alert">
                  {homeError(saveSpotlight.error)}
                </p>
              ) : null}
              {spotlight.length === 0 ? (
                <p className="m-0 px-4 py-6 text-sm text-muted">
                  Asnjë kategori e zgjedhur — seksioni fshihet nga kryefaqja.
                </p>
              ) : (
                <DragList
                  items={spotlight}
                  pending={saveSpotlight.isPending}
                  label={(category) => category.name}
                  onReorder={(ids) => saveSpotlight.mutate(ids)}
                  trailing={(category) => (
                    <button
                      className={iconButton}
                      type="button"
                      aria-label={`Hiq ${category.name}`}
                      disabled={saveSpotlight.isPending}
                      onClick={() =>
                        saveSpotlight.mutate(
                          spotlight
                            .filter((item) => item.id !== category.id)
                            .map((item) => item.id),
                        )
                      }
                    >
                      <DeleteOutlinedIcon fontSize="small" className="text-danger!" />
                    </button>
                  )}
                >
                  {(category) => (
                    <>
                      <p className="m-0 truncate font-semibold">{category.name}</p>
                      {category.slug ? (
                        <p className="m-0 truncate text-sm text-muted">{category.slug}</p>
                      ) : null}
                    </>
                  )}
                </DragList>
              )}
              <div className="grid gap-3 px-4 py-4">
                {spotlightCandidates.length === 0 ? (
                  <p className="m-0 text-sm text-muted">
                    {spotlight.length === 0
                      ? "Nuk ka kategori aktive."
                      : "Të gjitha kategoritë aktive janë zgjedhur."}
                  </p>
                ) : (
                  <ul className="m-0 list-none p-0">
                    {spotlightCandidates.map((category) => (
                      <li key={category.id} className="flex items-center gap-3 py-2">
                        <div className="min-w-0 flex-1">
                          <p className="m-0 truncate text-sm font-semibold">{category.name}</p>
                          {category.slug ? (
                            <p className="m-0 truncate text-sm text-muted">{category.slug}</p>
                          ) : null}
                        </div>
                        <button
                          className={iconButton}
                          type="button"
                          aria-label={`Shto ${category.name}`}
                          disabled={saveSpotlight.isPending}
                          onClick={() =>
                            saveSpotlight.mutate([
                              ...spotlight.map((item) => item.id),
                              category.id,
                            ])
                          }
                        >
                          <AddOutlinedIcon fontSize="small" className="text-accent!" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>

            <section hidden={pane !== "shops"}>
              <div className="border-b border-line px-4 py-3">
                <h2 className="m-0 text-xl font-bold tracking-[-0.03em]">Partnerët</h2>
                <p className="m-0 mt-1 text-sm text-muted">
                  Vetëm partnerët ekskluzivë. Dalin të parët, në këtë rend.
                </p>
              </div>
              {saveShops.isError ? (
                <p className={`${fieldError} px-4 pt-3`} role="alert">
                  {homeError(saveShops.error)}
                </p>
              ) : null}
              {shops.length === 0 ? (
                <p className="m-0 px-4 py-6 text-sm text-muted">Nuk ka dyqan ekskluziv publik.</p>
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
                <h2 className="m-0 text-xl font-bold tracking-[-0.03em]">Fletushkat</h2>
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
