"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PlaceMap } from "@/components/place/PlaceMap";
import { geocodeBizAddress, updateBizLocation } from "@/features/biz/api";
import { bizBusinessQueryKey } from "@/hooks/useBizProfile";
import { validationMessage } from "@/lib/api";
import { btnGhost, btnPrimary, fieldError, inputClass } from "@/lib/ui";
import { appleMapsUrl, googleMapsUrl } from "@/lib/maps";
import { useWideScreen } from "@/lib/useWideScreen";
import type { Business } from "@/types";

function composedAddress(street: string, village: string, city: string): string {
  return [street, village, city]
    .map((part) => part.trim())
    .filter((part) => part !== "")
    .join(", ");
}

export function LocationForm({ business }: { business: Business }) {
  const wide = useWideScreen();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [street, setStreet] = useState(business.street ?? "");
  const [village, setVillage] = useState(business.village ?? "");
  const [city, setCity] = useState(business.city ?? "");
  const [latitude, setLatitude] = useState<number | null>(
    business.latitude ?? null,
  );
  const [longitude, setLongitude] = useState<number | null>(
    business.longitude ?? null,
  );
  const [notice, setNotice] = useState<string | null>(null);
  const [findError, setFindError] = useState<string | null>(null);

  const address = composedAddress(street, village, city);
  const place = {
    address: address === "" ? null : address,
    latitude,
    longitude,
  };
  const hasSavedAddress = Boolean(business.address || business.street);

  const save = useMutation({
    mutationFn: (clear: boolean) =>
      updateBizLocation({
        street: clear ? null : street.trim(),
        village: clear ? null : village.trim() === "" ? null : village.trim(),
        city: clear ? null : city.trim(),
        latitude: clear || address === "" ? null : latitude,
        longitude: clear || address === "" ? null : longitude,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: bizBusinessQueryKey });
      router.push("/biz/profile");
    },
    onError: () => setNotice(null),
  });

  const find = useMutation({
    mutationFn: () => geocodeBizAddress(address),
    onSuccess: (point) => {
      setLatitude(point.latitude);
      setLongitude(point.longitude);
      setNotice("Pika u gjet. Mund ta lëvizësh në hartë, pastaj ruaje.");
    },
    onError: () => setNotice(null),
  });

  function requireStreetAndCity(): boolean {
    if (street.trim() === "" || city.trim() === "") {
      setFindError("Shkruaj rrugën dhe qytetin. Fshati është opsional.");
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
                  setNotice("Pika u zhvendos. Ruaje që të mbetet.");
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
          <div className="mt-4 flex flex-wrap gap-4 text-sm font-semibold">
            <a
              className="text-muted no-underline hover:text-accent"
              href={appleMapsUrl(place)}
              target="_blank"
              rel="noopener noreferrer"
            >
              Apple Maps
            </a>
            <a
              className="text-muted no-underline hover:text-accent"
              href={googleMapsUrl(place)}
              target="_blank"
              rel="noopener noreferrer"
            >
              Google Maps
            </a>
          </div>
        ) : null}
      </section>

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
          {save.isPending ? "Duke ruajtur…" : "Ruaj adresën"}
        </button>
      </div>
    </form>
  );
}
