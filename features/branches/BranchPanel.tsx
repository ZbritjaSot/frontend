"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { PlaceMap } from "@/components/place/PlaceMap";
import { geocodeAdminAddress } from "@/features/admin/businessesApi";
import {
  createAdminBranch,
  createBizBranch,
  fetchAdminBranches,
  fetchBizBranches,
} from "@/features/branches/api";
import { geocodeBizAddress } from "@/features/biz/api";
import { accountEmailMessage, validationMessage } from "@/lib/api";
import { btnGhost, btnPrimary, fieldError, fieldLabel, inputClass } from "@/lib/ui";
import { useWideScreen } from "@/lib/useWideScreen";
import type { Business } from "@/types";

type BranchPanelProps = {
  mode: "admin" | "biz";
  business: Business;
};

export function BranchPanel({ mode, business }: BranchPanelProps) {
  const queryClient = useQueryClient();
  const queryKey = ["branches", mode, business.id] as const;
  const branches = useQuery({
    queryKey,
    queryFn: () =>
      mode === "admin" ? fetchAdminBranches(business.id) : fetchBizBranches(),
  });
  const wide = useWideScreen();
  const [ownerName, setOwnerName] = useState("");
  const [email, setEmail] = useState("");
  const [street, setStreet] = useState("");
  const [village, setVillage] = useState("");
  const [city, setCity] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const canCreate = !business.parent_id;
  const address = [street, village, city].map((part) => part.trim()).filter(Boolean).join(", ");

  async function pointForAddress(): Promise<{ latitude: number; longitude: number } | null> {
    if (latitude != null && longitude != null) {
      return { latitude, longitude };
    }
    if (street.trim() === "" || city.trim() === "") {
      setError("Shkruaj rrugën dhe qytetin.");
      return null;
    }
    try {
      const point = mode === "admin"
        ? await geocodeAdminAddress(address)
        : await geocodeBizAddress(address);
      setLatitude(point.latitude);
      setLongitude(point.longitude);
      return point;
    } catch (err) {
      setError(validationMessage(err, "Nuk e gjetëm këtë adresë."));
      return null;
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (!email.trim()) {
      setError("Shkruaj emailin e degës.");
      return;
    }
    if (street.trim() === "" || city.trim() === "") {
      setError("Shkruaj rrugën dhe qytetin.");
      return;
    }

    setPending(true);
    try {
      const point = await pointForAddress();
      if (!point) {
        return;
      }
      const input = {
        name: business.name,
        owner_name: ownerName.trim() || undefined,
        owner_email: email.trim(),
        street: street.trim(),
        village: village.trim() || null,
        city: city.trim(),
        latitude: point.latitude,
        longitude: point.longitude,
      };
      if (mode === "admin") {
        await createAdminBranch(business.id, input);
      } else {
        await createBizBranch(input);
      }
      setOwnerName("");
      setEmail("");
      setStreet("");
      setVillage("");
      setCity("");
      setLatitude(null);
      setLongitude(null);
      await queryClient.invalidateQueries({ queryKey });
    } catch (err) {
      setError(accountEmailMessage(err, "Nuk mundëm ta shtojmë degën."));
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="mt-8 rounded-2xl border border-line p-5 lg:col-span-2">
      <p className="m-0 text-xs font-bold tracking-[0.08em] text-muted uppercase">
        Degët
      </p>
      {business.parent ? (
        <p className="m-0 mt-2 text-sm text-muted">
          Kjo është degë e{" "}
          {mode === "admin" ? (
            <Link
              href={`/admin/businesses/${business.parent.id}`}
              className="font-semibold text-ink underline-offset-4 hover:underline"
            >
              {business.parent.name}
            </Link>
          ) : (
            <span className="font-semibold text-ink">{business.parent.name}</span>
          )}
          .
        </p>
      ) : (
        <p className="m-0 mt-2 text-sm leading-relaxed text-muted">
          Dyqani kryesor. Çdo degë ka adresën, emailin dhe hyrjen e vet.
        </p>
      )}

      {branches.data && branches.data.some((branch) => branch.id !== business.id) ? (
        <ul className="m-0 mt-4 list-none p-0">
          {branches.data.filter((branch) => branch.id !== business.id).map((branch) => (
            <li
              key={branch.id}
              className="flex items-center justify-between gap-3 border-t border-line py-3"
            >
              <span className="min-w-0">
                {mode === "admin" ? (
                  <Link
                    href={`/admin/businesses/${branch.id}`}
                    className="font-semibold text-ink underline-offset-4 hover:underline"
                  >
                    {branch.name}
                    {branch.city ? (
                      <span className="font-medium text-muted"> · {branch.city}</span>
                    ) : null}
                  </Link>
                ) : (
                  <span className="font-semibold text-ink">
                    {branch.name}
                    {branch.city ? (
                      <span className="font-medium text-muted"> · {branch.city}</span>
                    ) : null}
                  </span>
                )}
                <span className="mt-0.5 block truncate text-sm text-muted">
                  {[branch.street, branch.owner?.email].filter(Boolean).join(" · ")}
                </span>
              </span>
              <span className="shrink-0 text-sm text-muted">
                {branch.is_active ? "Aktive" : "Joaktive"}
              </span>
            </li>
          ))}
        </ul>
      ) : canCreate ? (
        <p className="m-0 mt-4 text-sm text-muted">Ende pa degë.</p>
      ) : null}

      {canCreate ? (
        <form className="mt-5 grid gap-4 border-t border-line pt-5" onSubmit={onSubmit}>
          <p className="m-0 text-sm font-semibold">Shto degë</p>
          <p className="m-0 text-sm text-muted">
            Emri mbetet {business.name}. Adresa hyen menjëherë, bashkë me degën.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <label className={fieldLabel}>
              <span>Emri i llogarisë</span>
              <input
                className={inputClass}
                value={ownerName}
                onChange={(event) => setOwnerName(event.target.value)}
                disabled={pending}
              />
            </label>
            <label className={fieldLabel}>
              <span>Email</span>
              <input
                className={inputClass}
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={pending}
                required
              />
            </label>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className={fieldLabel}>
              <span>Rruga</span>
              <input
                className={inputClass}
                value={street}
                maxLength={255}
                placeholder="Rr. Garibaldi"
                disabled={pending}
                required
                onChange={(event) => {
                  setStreet(event.target.value);
                  setLatitude(null);
                  setLongitude(null);
                }}
              />
            </label>
            <label className={fieldLabel}>
              <span>Qyteti</span>
              <input
                className={inputClass}
                value={city}
                maxLength={255}
                placeholder="Prishtinë"
                disabled={pending}
                required
                onChange={(event) => {
                  setCity(event.target.value);
                  setLatitude(null);
                  setLongitude(null);
                }}
              />
            </label>
          </div>
          <label className={fieldLabel}>
            <span>Fshati</span>
            <input
              className={inputClass}
              value={village}
              maxLength={255}
              placeholder="Opsional"
              disabled={pending}
              onChange={(event) => {
                setVillage(event.target.value);
                setLatitude(null);
                setLongitude(null);
              }}
            />
          </label>
          <div className="flex justify-end">
            <button
              className={btnGhost}
              type="button"
              disabled={pending}
              onClick={() => {
                setError(null);
                void pointForAddress();
              }}
            >
              Gjej në hartë
            </button>
          </div>
          {wide && latitude != null && longitude != null ? (
            <div className="h-64 overflow-hidden rounded-xl border border-line">
              <PlaceMap
                latitude={latitude}
                longitude={longitude}
                label={business.name}
                interactive
                onPick={(nextLat, nextLng) => {
                  setLatitude(nextLat);
                  setLongitude(nextLng);
                }}
              />
            </div>
          ) : null}
          {error ? (
            <p className={fieldError} role="alert">
              {error}
            </p>
          ) : null}
          <div>
            <button className={btnPrimary} type="submit" disabled={pending}>
              {pending ? "Duke shtuar" : "Shto degën"}
            </button>
          </div>
        </form>
      ) : null}
    </section>
  );
}
