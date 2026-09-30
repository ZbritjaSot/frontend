"use client";

import { useEffect, useRef } from "react";
import { useQueries } from "@tanstack/react-query";
import { CampaignPoster } from "@/features/public/CampaignPoster";
import { Band, EmptyNote } from "@/features/public/Frame";
import { ProductPoster } from "@/features/public/ProductPoster";
import { display, kicker } from "@/features/public/tone";
import {
  fetchPublicFolder,
  fetchPublicOffer,
  isNotFound,
} from "@/features/offers/api";
import { useFavorites } from "@/hooks/useFavorites";
import { removeFavoriteStored } from "@/lib/favorites";
import type { PublicFolder, PublicOffer } from "@/types";

export function FavoritesView() {
  const { refs } = useFavorites();
  const offerRefs = refs.filter((item) => item.kind === "offer");
  const flyerRefs = refs.filter((item) => item.kind === "flyer");
  const pruned = useRef(new Set<string>());

  const offerQueries = useQueries({
    queries: offerRefs.map((item) => ({
      queryKey: ["favorite-offer", item.id],
      queryFn: () => fetchPublicOffer(item.id),
      retry: false,
      staleTime: 60_000,
    })),
  });

  const flyerQueries = useQueries({
    queries: flyerRefs.map((item) => ({
      queryKey: ["favorite-flyer", item.id],
      queryFn: () => fetchPublicFolder(item.id),
      retry: false,
      staleTime: 60_000,
    })),
  });

  useEffect(() => {
    offerQueries.forEach((query, index) => {
      const id = offerRefs[index]?.id;
      if (!id || !query.isError || !isNotFound(query.error)) {
        return;
      }
      const key = `offer:${id}`;
      if (pruned.current.has(key)) {
        return;
      }
      pruned.current.add(key);
      removeFavoriteStored("offer", id);
    });
    flyerQueries.forEach((query, index) => {
      const id = flyerRefs[index]?.id;
      if (!id || !query.isError || !isNotFound(query.error)) {
        return;
      }
      const key = `flyer:${id}`;
      if (pruned.current.has(key)) {
        return;
      }
      pruned.current.add(key);
      removeFavoriteStored("flyer", id);
    });
  }, [offerQueries, flyerQueries, offerRefs, flyerRefs]);

  const loading =
    offerQueries.some((query) => query.isPending) ||
    flyerQueries.some((query) => query.isPending);

  const offers = offerQueries
    .map((query) => query.data)
    .filter((offer): offer is PublicOffer => offer != null);

  const flyers = flyerQueries
    .map((query) => query.data)
    .filter((folder): folder is PublicFolder => folder != null);

  const empty = refs.length === 0;
  const nothingLeft = !empty && !loading && offers.length === 0 && flyers.length === 0;

  return (
    <Band className="pt-8 pb-16">
      <p className={kicker}>Ruajtjet e tua</p>
      <h1 className={`m-0 mt-2 text-[clamp(2.4rem,6vw,4rem)] ${display}`}>
        Të preferuarat
      </h1>
      <p className="mt-4 mb-0 max-w-xl text-sm leading-relaxed text-muted">
        Ofertat dhe fletushkat që i ruan këtu mbeten vetëm në këtë pajisje.
      </p>

      {empty ? (
        <div className="mt-12">
          <EmptyNote
            title="Ende bosh"
            body="Shto një zemër te një ofertë ose fletushkë. Lista mbetet në këtë shfletues."
          />
        </div>
      ) : null}

      {loading && offers.length === 0 && flyers.length === 0 ? (
        <p className="mt-10 mb-0 text-sm font-semibold text-muted">Duke ngarkuar…</p>
      ) : null}

      {nothingLeft ? (
        <div className="mt-12">
          <EmptyNote
            title="Nuk janë më të disponueshme"
            body="Ofertat ose fletushkat e ruajtura kanë skaduar ose janë hequr."
          />
        </div>
      ) : null}

      {flyers.length > 0 ? (
        <section className="mt-12">
          <h2 className="m-0 text-sm font-bold tracking-[0.18em] text-muted uppercase">
            Fletushkat
          </h2>
          <ul className="m-0 mt-4 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2">
            {flyers.map((folder) => (
              <li key={folder.id} className="min-w-0">
                <CampaignPoster folder={folder} layout="card" />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {offers.length > 0 ? (
        <section className="mt-12">
          <h2 className="m-0 text-sm font-bold tracking-[0.18em] text-muted uppercase">
            Ofertat
          </h2>
          <ul className="m-0 mt-4 grid list-none grid-cols-2 gap-x-3 gap-y-5 p-0 sm:grid-cols-3 sm:gap-x-4 lg:grid-cols-4">
            {offers.map((offer) => (
              <li key={offer.id} className="min-w-0">
                <ProductPoster offer={offer} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </Band>
  );
}
