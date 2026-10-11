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
  saveAdminRecommended,
  saveAdminSpotlight,
} from "@/features/admin/homeCurationApi";
import { validationMessage } from "@/lib/api";
import { btnGhost, checkInput, fieldError, iconButton, inputClass, panelLead } from "@/lib/ui";

const homeKey = ["admin", "home"] as const;

function homeError(error: unknown): string {
  const message = validationMessage(error, "Nuk mundëm ta ruajmë.");
  if (message === "Choose a public offer.") {
    return "Zgjidh një produkt publik.";
  }
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
  const [pane, setPane] = useState<"hero" | "spotlight" | "shops" | "flyers" | "recommended">(
    "hero",
  );
  const [heroSearch, setHeroSearch] = useState("");
  const [heroQuery, setHeroQuery] = useState("");
  const [spotlightSearch, setSpotlightSearch] = useState("");
  const [spotlightQuery, setSpotlightQuery] = useState("");
  const [recommendedSearch, setRecommendedSearch] = useState("");
  const [recommendedQuery, setRecommendedQuery] = useState("");
  const [creatingHero, setCreatingHero] = useState(false);
  const listQuery =
    pane === "recommended"
      ? recommendedQuery
      : pane === "spotlight"
        ? spotlightQuery
        : heroQuery;
  const home = useQuery({
    queryKey: [...homeKey, listQuery],
    queryFn: () => fetchAdminHome(listQuery),
    placeholderData: (previous) => previous,
  });
  const heroes = home.data?.hero.picks ?? [];
  const spotlight = home.data?.spotlight.picks ?? [];
  const shops = home.data?.shops.picks ?? [];
  const flyers = home.data?.flyers ?? [];
  const recommended = home.data?.recommended.picks ?? [];
  const shuffle = home.data?.recommended.shuffle ?? true;
  const heroIds = new Set(heroes.map((offer) => offer.id));
  const heroCandidates = (home.data?.hero.candidates ?? []).filter(
    (offer) => !heroIds.has(offer.id),
  );
  const spotlightIds = new Set(spotlight.map((offer) => offer.id));
  const spotlightCandidates = (home.data?.spotlight.candidates ?? []).filter(
    (offer) => !spotlightIds.has(offer.id),
  );
  const recommendedIds = new Set(recommended.map((offer) => offer.id));
  const recommendedCandidates = (home.data?.recommended.candidates ?? []).filter(
    (offer) => !recommendedIds.has(offer.id),
  );

  useEffect(() => {
    const timer = window.setTimeout(() => setHeroQuery(heroSearch.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [heroSearch]);

  useEffect(() => {
    const timer = window.setTimeout(() => setSpotlightQuery(spotlightSearch.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [spotlightSearch]);

  useEffect(() => {
    const timer = window.setTimeout(() => setRecommendedQuery(recommendedSearch.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [recommendedSearch]);

  function commitHeroSearch() {
    setHeroQuery(heroSearch.trim());
  }

  function commitSpotlightSearch() {
    setSpotlightQuery(spotlightSearch.trim());
  }

  function commitRecommendedSearch() {
    setRecommendedQuery(recommendedSearch.trim());
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
  const saveRecommended = useMutation({
    mutationFn: (next: { offerIds: string[]; shuffle: boolean }) =>
      saveAdminRecommended(next.offerIds, next.shuffle),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: homeKey });
    },
  });

  return (
    <div>
      <AdminSections />
      <p className={`${panelLead} mt-6 max-w-2xl`}>
        Zbritjet e Ditës dhe Zbritjet e forta janë zgjedhje manuale nga çdo dyqan
        publik. Zbritjet e forta dalin të parat; vendet e mbetura (deri në 16) mbushen
        me oferta të rastësishme. Dyqanet, fletushkat dhe të rekomanduarat mbeten te
        dyqanet ekskluzive.
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
                ["shops", "Dyqanet", shops.length],
                ["flyers", "Fletushkat", flyers.length],
                ["recommended", "Të rekomanduara", recommended.length],
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
                  Zgjidh dhe rendit produktet që dalin të parat te Zbritje të forta. Deri në
                  16 vende: zgjedhjet e tua, pastaj oferta të rastësishme (jo ato që ke zgjedhur).
                </p>
              </div>
              {saveSpotlight.isError ? (
                <p className={`${fieldError} px-4 pt-3`} role="alert">
                  {homeError(saveSpotlight.error)}
                </p>
              ) : null}
              {spotlight.length === 0 ? (
                <p className="m-0 px-4 py-6 text-sm text-muted">
                  Asnjë ofertë e zgjedhur — kryefaqja tregon deri në 16 oferta të rastësishme.
                </p>
              ) : (
                <DragList
                  items={spotlight}
                  pending={saveSpotlight.isPending}
                  label={(offer) => offer.name}
                  onReorder={(ids) => saveSpotlight.mutate(ids)}
                  trailing={(offer) => (
                    <button
                      className={iconButton}
                      type="button"
                      aria-label={`Hiq ${offer.name}`}
                      disabled={saveSpotlight.isPending}
                      onClick={() =>
                        saveSpotlight.mutate(
                          spotlight.filter((item) => item.id !== offer.id).map((item) => item.id),
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
                <input
                  className={inputClass}
                  value={spotlightSearch}
                  placeholder=""
                  aria-label="Kërko produkt për Zbritjet e forta"
                  onChange={(event) => setSpotlightSearch(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      commitSpotlightSearch();
                    }
                  }}
                />
                {spotlightSearch.trim() === "" ? (
                  <p className="m-0 text-sm text-muted">
                    Shkruaj për të kërkuar produkte nga të gjitha dyqanet.
                  </p>
                ) : home.isFetching && spotlightCandidates.length === 0 ? (
                  <p className="m-0 text-sm text-muted">Duke kërkuar…</p>
                ) : spotlightCandidates.length === 0 ? (
                  <p className="m-0 text-sm text-muted">Nuk u gjet asnjë produkt.</p>
                ) : (
                  <ul className="m-0 list-none p-0">
                    {spotlightCandidates.map((offer) => (
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
                          disabled={saveSpotlight.isPending}
                          onClick={() =>
                            saveSpotlight.mutate([
                              ...spotlight.map((item) => item.id),
                              offer.id,
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
                <h2 className="m-0 text-xl font-bold tracking-[-0.03em]">Dyqanet</h2>
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

            <section hidden={pane !== "recommended"}>
              <div className="border-b border-line px-4 py-3">
                <h2 className="m-0 text-xl font-bold tracking-[-0.03em]">Të rekomanduara</h2>
                <p className="m-0 mt-1 text-sm text-muted">
                  Produkte nga dyqanet ekskluzive. Dalin poshtë një oferte, deri në tetë.
                </p>
              </div>
              <label className="flex items-start gap-3 px-4 py-4 text-sm font-semibold">
                <input
                  type="checkbox"
                  className={checkInput}
                  checked={shuffle}
                  disabled={saveRecommended.isPending}
                  onChange={(event) =>
                    saveRecommended.mutate({
                      offerIds: recommended.map((item) => item.id),
                      shuffle: event.target.checked,
                    })
                  }
                />
                <span>
                  Përziej në çdo faqe
                  <span className="mt-1 block font-medium text-muted">
                    Çdo faqe oferte nis te një vend tjetër i listës, që të mos dalin gjithmonë të
                    njëjtat.
                  </span>
                </span>
              </label>
              {saveRecommended.isError ? (
                <p className={`${fieldError} px-4`} role="alert">
                  {homeError(saveRecommended.error)}
                </p>
              ) : null}
              {recommended.length === 0 ? (
                <p className="m-0 px-4 py-6 text-sm text-muted">Asnjë ofertë e zgjedhur.</p>
              ) : (
                <DragList
                  items={recommended}
                  pending={saveRecommended.isPending}
                  label={(offer) => offer.name}
                  onReorder={(ids) => saveRecommended.mutate({ offerIds: ids, shuffle })}
                  trailing={(offer) => (
                    <button
                      className={iconButton}
                      type="button"
                      aria-label={`Hiq ${offer.name}`}
                      disabled={saveRecommended.isPending}
                      onClick={() =>
                        saveRecommended.mutate({
                          offerIds: recommended
                            .filter((item) => item.id !== offer.id)
                            .map((item) => item.id),
                          shuffle,
                        })
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
                <input
                  className={inputClass}
                  value={recommendedSearch}
                  placeholder=""
                  aria-label="Kërko te ekskluzivet për të rekomanduara"
                  onChange={(event) => setRecommendedSearch(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      commitRecommendedSearch();
                    }
                  }}
                />
                {recommendedCandidates.length === 0 ? (
                  <p className="m-0 text-sm text-muted">
                    {recommendedSearch.trim() === ""
                      ? "Nuk ka produkt publik nga një dyqan ekskluziv."
                      : "Nuk u gjet asnjë produkt ekskluziv."}
                  </p>
                ) : (
                  <ul className="m-0 list-none p-0">
                    {recommendedCandidates.map((offer) => (
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
                          disabled={saveRecommended.isPending}
                          onClick={() =>
                            saveRecommended.mutate({
                              offerIds: [...recommended.map((item) => item.id), offer.id],
                              shuffle,
                            })
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
          </div>
        </div>
      )}
    </div>
  );
}
