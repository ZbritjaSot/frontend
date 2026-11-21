"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { CampaignPoster } from "@/features/public/CampaignPoster";
import { Band, EmptyNote, SectionHeading } from "@/features/public/Frame";
import { OfflineNote } from "@/features/public/OfflineNote";
import { ProductPoster } from "@/features/public/ProductPoster";
import { FavoritesSkeleton } from "@/features/public/skeletons";
import { kicker } from "@/features/public/tone";
import { useFavoriteItems } from "@/hooks/useFavoriteItems";
import { useFavorites } from "@/hooks/useFavorites";
import { useHydrated } from "@/hooks/useHydrated";
import { isNetworkError } from "@/lib/api";
import { removeFavoriteStored } from "@/lib/favorites";
import { button } from "@/lib/ui";

export function FavoritesView() {
  const { refs } = useFavorites();
  const hydrated = useHydrated();
  const pruned = useRef(new Set<string>());
  const { offers: offerBatch, flyers: flyerBatch } = useFavoriteItems(refs);
  const offers = offerBatch.items;
  const flyers = flyerBatch.items;

  // Ids the API no longer returns (expired/removed) are dropped from storage once.
  const missingOffers = offerBatch.missing;
  const missingFlyers = flyerBatch.missing;
  useEffect(() => {
    const prune = (kind: "offer" | "flyer", ids: string[]) => {
      ids.forEach((id) => {
        const key = `${kind}:${id}`;
        if (pruned.current.has(key)) {
          return;
        }
        pruned.current.add(key);
        removeFavoriteStored(kind, id);
      });
    };
    prune("offer", missingOffers);
    prune("flyer", missingFlyers);
  }, [missingOffers, missingFlyers]);

  const batches = [offerBatch, flyerBatch];
  // Before hydration the store always reads empty, so show the skeleton instead.
  const loading = !hydrated || batches.some((batch) => batch.loading);
  const networkFailed = batches.some((batch) => batch.error != null && isNetworkError(batch.error));
  const unresolved = batches.some((batch) => batch.error != null);
  const empty = hydrated && refs.length === 0;
  const nothingLeft = hydrated && !empty && !loading && !unresolved && offers.length === 0 && flyers.length === 0;

  const retry = () => {
    batches.forEach((batch) => {
      if (batch.error != null) {
        void batch.refetch();
      }
    });
  };

  return (
    <Band pad="page">
      <p className={kicker}>Ruajtjet e tua</p>
      <h1 className="m-0 mt-2 text-title-1">
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
            action={
              <Link href="/oferta" className={button({ shape: "pill" })}>
                Shfleto ofertat
              </Link>
            }
          />
        </div>
      ) : null}

      {networkFailed && offers.length === 0 && flyers.length === 0 ? (
        <OfflineNote
          onRetry={retry}
        />
      ) : null}

      {unresolved && !networkFailed && offers.length === 0 && flyers.length === 0 ? (
        <OfflineNote
          title="Diçka shkoi keq"
          body="Nuk mundëm t'i ngarkonim të preferuarat. Provo përsëri."
          onRetry={retry}
        />
      ) : null}

      {loading && !networkFailed && offers.length === 0 && flyers.length === 0 ? <FavoritesSkeleton /> : null}

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
          <SectionHeading title="Fletushkat" />
          <ul className="m-0 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2">
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
          <SectionHeading title="Ofertat" />
          <ul className="m-0 grid list-none grid-cols-2 gap-x-3 gap-y-5 p-0 sm:grid-cols-3 sm:gap-x-4 lg:grid-cols-4">
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
