"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PlaceMap } from "@/components/place/PlaceMap";
import { geocodeBizAddress, updateBizLocation } from "@/features/biz/api";
import { bizBusinessQueryKey } from "@/hooks/useBizProfile";
import { validationMessage } from "@/lib/api";
import { btnGhost, btnPrimary, fieldError, inputClass } from "@/lib/ui";
import { mapsUrl } from "@/lib/maps";
import { useWideScreen } from "@/lib/useWideScreen";
import type { Business } from "@/types";

function composedAddress(
  street: string,
  neighborhood: string,
  village: string,
  municipality: string,
  city: string,
): string {
  return [street, neighborhood, village, municipality, city]
    .map((part) => part.trim())
    .filter((part) => part !== "")
    .join(", ");
}

function locationSeed(business: Business, liveOnly: boolean) {
  const pending = !liveOnly && business.location_status === "pending";

  return {
    street: (pending ? business.pending_street : business.street) ?? "",
    neighborhood:
      (pending ? business.pending_neighborhood : business.neighborhood) ?? "",
    village: (pending ? business.pending_village : business.village) ?? "",
    municipality:
      (pending ? business.pending_municipality : business.municipality) ?? "",
    city: (pending ? business.pending_city : business.city) ?? "",
    latitude: (pending ? business.pending_latitude : business.latitude) ?? null,
    longitude:
      (pending ? business.pending_longitude : business.longitude) ?? null,
  };
}

type LocationInput = {
  street: string | null;
  neighborhood: string | null;
  village: string | null;
  municipality: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
};

type LocationFormProps = {
  business: Business;
  /** Admin writes the public address now. The shop sends it for approval. */
  applyNow?: boolean;
  onSave?: (input: LocationInput) => Promise<void>;
  onFind?: (address: string) => Promise<{ latitude: number; longitude: number }>;
  onDone?: () => void | Promise<void>;
};

export function LocationForm({
  business,
  applyNow = false,
  onSave,
  onFind,
  onDone,
}: LocationFormProps) {
  const wide = useWideScreen();
  const router = useRouter();
  const queryClient = useQueryClient();
  const seed = locationSeed(business, applyNow);
  const [street, setStreet] = useState(seed.street);
  const [neighborhood, setNeighborhood] = useState(seed.neighborhood);
  const [village, setVillage] = useState(seed.village);
  const [municipality, setMunicipality] = useState(seed.municipality);
  const [city, setCity] = useState(seed.city);
  const [latitude, setLatitude] = useState<number | null>(seed.latitude);
  const [longitude, setLongitude] = useState<number | null>(seed.longitude);
  const [notice, setNotice] = useState<string | null>(null);
  const [findError, setFindError] = useState<string | null>(null);

  const address = composedAddress(
    street,
    neighborhood,
    village,
    municipality,
    city,
  );
  const place = {
    address: address === "" ? null : address,
    latitude,
    longitude,
  };
  const hasSavedAddress = Boolean(business.address || business.street);

  const save = useMutation({
    mutationFn: async (clear: boolean) => {
      const blank = (value: string) =>
        clear || value.trim() === "" ? null : value.trim();
      const input: LocationInput = {
        street: clear ? null : street.trim(),
        neighborhood: blank(neighborhood),
        village: blank(village),
        municipality: blank(municipality),
        city: clear ? null : city.trim(),
        latitude: clear || address === "" ? null : latitude,
        longitude: clear || address === "" ? null : longitude,
      };
      if (onSave) {
        await onSave(input);
        return;
      }
      await updateBizLocation(input);
    },
    onSuccess: async () => {
      if (onDone) {
        await onDone();
        return;
      }
      await queryClient.invalidateQueries({ queryKey: bizBusinessQueryKey });
      router.push("/biz/profile");
    },
    onError: () => setNotice(null),
  });

  const find = useMutation({
    mutationFn: () => (onFind ? onFind(address) : geocodeBizAddress(address)),
    onSuccess: (point) => {
      setLatitude(point.latitude);
      setLongitude(point.longitude);
      setNotice(
        applyNow
          ? "Pika u gjet. Mund ta lëvizësh në hartë, pastaj ruaje."
          : "Pika u gjet. Mund ta lëvizësh në hartë, pastaj dërgoje për aprovim.",
      );
    },
    onError: () => setNotice(null),
  });

  function requireStreetAndCity(): boolean {
    if (street.trim() === "" || city.trim() === "") {
      setFindError("Shkruaj rrugën dhe qytetin. Fushat e tjera janë opsionale.");
      setNotice(null);
      return false;
    }
    setFindError(null);
    return true;
  }

  const micro = "text-xs font-bold tracking-[0.08em] text-muted uppercase";

  return (
    <form
      className="grid gap-6"
      onSubmit={(event) => {
        event.preventDefault();
        if (!requireStreetAndCity()) {
          return;
        }
        save.mutate(false);
      }}
    >
      <section className="rounded-2xl border border-line p-5">
        <div className="grid gap-4">
          <label className="flex flex-col gap-2">
            <span className={micro}>Rruga</span>
            <input
              className={inputClass}
              value={street}
              maxLength={255}
              placeholder="Rr. Garibaldi"
              onChange={(event) => {
                setStreet(event.target.value);
                setNotice(null);
                setFindError(null);
              }}
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className={micro}>Lagjja</span>
              <input
                className={inputClass}
                value={neighborhood}
                maxLength={255}
                placeholder="Opsional"
                onChange={(event) => {
                  setNeighborhood(event.target.value);
                  setNotice(null);
                  setFindError(null);
                }}
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className={micro}>Fshati</span>
              <input
                className={inputClass}
                value={village}
                maxLength={255}
                placeholder="Opsional"
                onChange={(event) => {
                  setVillage(event.target.value);
                  setNotice(null);
                  setFindError(null);
                }}
              />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className={micro}>Qyteza</span>
              <input
                className={inputClass}
                value={municipality}
                maxLength={255}
                placeholder="Opsional"
                onChange={(event) => {
                  setMunicipality(event.target.value);
                  setNotice(null);
                  setFindError(null);
                }}
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className={micro}>Qyteti</span>
              <input
                className={inputClass}
                value={city}
                maxLength={255}
                placeholder="Prishtinë"
                onChange={(event) => {
                  setCity(event.target.value);
                  setNotice(null);
                  setFindError(null);
                }}
              />
            </label>
          </div>

          <div className="flex justify-end">
            <button
              className={btnGhost}
              type="button"
              disabled={find.isPending}
              onClick={() => {
                if (!requireStreetAndCity()) {
                  return;
                }
                find.mutate();
              }}
            >
              {find.isPending ? "Duke kërkuar…" : "Gjej në hartë"}
            </button>
          </div>
        </div>

        {findError ? (
          <p className={`${fieldError} mt-4`} role="alert">
            {findError}
          </p>
        ) : null}
        {find.isError ? (
          <p className={`${fieldError} mt-4`} role="alert">
            {validationMessage(find.error, "Nuk e gjetëm këtë adresë.")}
          </p>
        ) : null}
        {notice ? (
          <p className="m-0 mt-4 text-sm font-semibold text-accent">{notice}</p>
        ) : null}

        {wide ? (
          <div className="mt-5">
            <div className="h-80 overflow-hidden rounded-xl border border-line">
              <PlaceMap
                latitude={latitude}
                longitude={longitude}
                label={business.name}
                interactive
                onPick={(nextLat, nextLng) => {
                  setLatitude(nextLat);
                  setLongitude(nextLng);
                  setNotice(
                    applyNow
                      ? "Pika u zhvendos. Ruaje që të hyjë në fuqi."
                      : "Pika u zhvendos. Dërgoje që të shkojë për aprovim.",
                  );
                }}
              />
            </div>
            <p className="m-0 mt-3 text-sm text-muted">
              Kliko hartën ose tërhiq pikën. Nëse adresa fshihet, fshihet edhe
              pika.
            </p>
          </div>
        ) : (
          <p className="m-0 mt-5 text-sm text-muted">
            Në telefon harta hapet te aplikacioni. Kërko adresën, pastaj ruaje.
          </p>
        )}

        {place.address || (latitude != null && longitude != null) ? (
          <div className="mt-4">
            <a
              className="text-sm font-semibold text-muted no-underline hover:text-accent"
              href={mapsUrl(place)}
              target="_blank"
              rel="noopener noreferrer"
            >
              Shiko lokacionin
            </a>
          </div>
        ) : null}
      </section>

      {applyNow && business.location_status === "pending" ? (
        <p className="m-0 text-sm font-semibold text-muted">
          Ruajtja zëvendëson adresën publike dhe heq kërkesën në pritje.
        </p>
      ) : null}
      {!applyNow && business.location_status === "pending" ? (
        <p className="m-0 text-sm font-semibold text-muted">
          Kjo adresë është në pritje. Ajo publike mbetet siç është derisa
          administrata ta aprovojë.
        </p>
      ) : null}
      {!applyNow && business.location_status === "rejected" ? (
        <p className="m-0 text-sm font-semibold text-danger" role="status">
          U refuzua
          {business.location_rejection_note
            ? `. ${business.location_rejection_note}`
            : "."}{" "}
          Adresa publike nuk ndryshoi.
        </p>
      ) : null}

      {save.isError ? (
        <p className={fieldError} role="alert">
          {validationMessage(save.error, "Nuk mundëm ta ruajmë adresën.")}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        {hasSavedAddress ? (
          <button
            className="cursor-pointer border-0 bg-transparent text-sm font-semibold text-danger hover:underline disabled:cursor-wait disabled:opacity-65"
            type="button"
            disabled={save.isPending}
            onClick={() => save.mutate(true)}
          >
            Hiq adresën
          </button>
        ) : (
          <span />
        )}
        <button className={btnPrimary} type="submit" disabled={save.isPending}>
          {save.isPending
            ? applyNow
              ? "Duke u ruajtur…"
              : "Duke dërguar…"
            : applyNow
              ? "Ruaj"
              : "Dërgo për aprovim"}
        </button>
      </div>
    </form>
  );
}
