"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PlaceMap } from "@/components/place/PlaceMap";
import { geocodeBizAddress, updateBizLocation } from "@/features/biz/api";
import { bizBusinessQueryKey } from "@/hooks/useBizProfile";
import { validationMessage } from "@/lib/api";
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

  return (
    <form
      className="location-form"
      onSubmit={(event) => {
        event.preventDefault();
        if (!requireStreetAndCity()) {
          return;
        }
        save.mutate(false);
      }}
    >
      <label className="offer-form__field">
        <span>Rruga</span>
        <input
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

      <div className="offer-form__row">
        <label className="offer-form__field">
          <span>Fshati (opsional)</span>
          <input
            value={village}
            maxLength={255}
            placeholder="Kodra e Trimave"
            onChange={(event) => {
              setVillage(event.target.value);
              setNotice(null);
              setFindError(null);
            }}
          />
        </label>
        <label className="offer-form__field">
          <span>Qyteti</span>
          <input
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

      <div className="location-form__actions">
        <button
          className="btn btn--ghost"
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
        <button className="btn btn--primary" type="submit" disabled={save.isPending}>
          {save.isPending ? "Duke ruajtur…" : "Ruaj adresën"}
        </button>
      </div>

      {findError ? (
        <p className="offer-form__error" role="alert">
          {findError}
        </p>
      ) : null}
      {find.isError ? (
        <p className="offer-form__error" role="alert">
          {validationMessage(find.error, "Nuk e gjetëm këtë adresë.")}
        </p>
      ) : null}
      {save.isError ? (
        <p className="offer-form__error" role="alert">
          {validationMessage(save.error, "Nuk mundëm ta ruajmë adresën.")}
        </p>
      ) : null}
      {notice ? <p className="shell-panel__note">{notice}</p> : null}

      {wide ? (
        <div className="location-form__map">
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
          <p className="shell-panel__note">
            Kliko hartën ose tërhiq pikën. Nëse adresa fshihet, fshihet edhe pika.
          </p>
        </div>
      ) : (
        <p className="shell-panel__note">
          Në telefon harta hapet te aplikacioni. Kërko adresën, pastaj ruaje.
        </p>
      )}

      {place.address || (latitude != null && longitude != null) ? (
        <div className="place-card__apps">
          <a
            className="btn btn--ghost"
            href={appleMapsUrl(place)}
            target="_blank"
            rel="noopener noreferrer"
          >
            Apple Maps
          </a>
          <a
            className="btn btn--ghost"
            href={googleMapsUrl(place)}
            target="_blank"
            rel="noopener noreferrer"
          >
            Google Maps
          </a>
        </div>
      ) : null}

      {hasSavedAddress ? (
        <button
          className="btn btn--ghost"
          type="button"
          disabled={save.isPending}
          onClick={() => save.mutate(true)}
        >
          Hiq adresën
        </button>
      ) : null}
    </form>
  );
}
