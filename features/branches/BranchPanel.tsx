"use client";

import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import CheckOutlinedIcon from "@mui/icons-material/CheckOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { adminBranchKey, bizBranchKey, IndicatorKey } from "@/components/ui/IndicatorKey";
import { PlaceMap } from "@/components/place/PlaceMap";
import { geocodeAdminAddress } from "@/features/admin/businessesApi";
import {
  approveAdminBranch,
  createAdminBranch,
  createBizBranch,
  deleteAdminBranch,
  fetchAdminBranches,
  fetchBizBranches,
  makeAdminBranchMain,
} from "@/features/branches/api";
import { adminBusinessesQueryKey } from "@/hooks/useAdminBusinesses";
import { geocodeBizAddress } from "@/features/biz/api";
import { accountEmailMessage, validationMessage } from "@/lib/api";
import { btnGhost, btnPrimary, fieldError, fieldLabel, iconButton, inputClass, offerStatusClass } from "@/lib/ui";
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
  const [panel, setPanel] = useState<"none" | "create">("none");
  const [confirm, setConfirm] = useState<
    { kind: "main" | "delete"; id: string } | null
  >(null);
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
      if (mode === "admin") {
        await queryClient.invalidateQueries({ queryKey: adminBusinessesQueryKey });
      }
    } catch (err) {
      setError(accountEmailMessage(err, "Nuk mundëm ta shtojmë degën."));
    } finally {
      setPending(false);
    }
  }

  async function refreshCompany() {
    await queryClient.invalidateQueries({ queryKey });
    await queryClient.invalidateQueries({ queryKey: adminBusinessesQueryKey });
  }

  async function onApprove(id: string) {
    setError(null);
    setPending(true);
    try {
      await approveAdminBranch(id);
      await refreshCompany();
    } catch (err) {
      setError(validationMessage(err, "Nuk mundëm ta aprovojmë degën."));
    } finally {
      setPending(false);
    }
  }

  async function onConfirm() {
    if (!confirm) {
      return;
    }
    setError(null);
    setPending(true);
    try {
      if (confirm.kind === "main") {
        await makeAdminBranchMain(confirm.id);
      } else {
        await deleteAdminBranch(confirm.id);
      }
      setConfirm(null);
      setPanel("none");
      await refreshCompany();
    } catch (err) {
      setError(
        validationMessage(
          err,
          confirm.kind === "main"
            ? "Nuk mundëm ta bëjmë këtë lokacion kryesor."
            : "Nuk mundëm ta fshijmë degën.",
        ),
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="mt-8 rounded-2xl border border-line p-5 lg:col-span-2">
      {mode === "admin" ? <IndicatorKey items={adminBranchKey} /> : null}
      {mode === "biz" ? (
        <IndicatorKey
          items={canCreate ? bizBranchKey : bizBranchKey.filter((item) => item.mark !== "add")}
        />
      ) : null}
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
          . Nuk është dyqan më vete.
        </p>
      ) : (branches.data?.length ?? 0) > 0 ? (
        <p className="m-0 mt-2 text-sm leading-relaxed text-muted">
          Dyqani kryesor. Degët përdorin emrin, logon dhe abonimin e tij.
        </p>
      ) : branches.isSuccess ? (
        <p className="m-0 mt-2 text-sm leading-relaxed text-muted">
          Ky është dyqan më vete.
        </p>
      ) : null}

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
              <span
                className={
                  mode === "admin"
                    ? "grid shrink-0 grid-cols-[7.75rem_2.25rem_2.25rem_2.25rem] items-center gap-1.5"
                    : "flex shrink-0 items-center"
                }
              >
                <span
                  className={`${offerStatusClass(
                    branch.is_approved === false
                      ? "pending"
                      : branch.is_active
                        ? "approved"
                        : "rejected",
                  )} mt-0! justify-self-end self-center!`}
                >
                  {branch.is_approved === false
                    ? "Pret aprovim"
                    : branch.is_active
                      ? "Aktive"
                      : "Joaktive"}
                </span>
                {mode === "admin" ? (
                  branch.is_approved === false ? (
                    <button
                      type="button"
                      className={iconButton}
                      aria-label={`Aprovo degën në ${branch.city || branch.name}`}
                      disabled={pending}
                      onClick={() => void onApprove(branch.id)}
                    >
                      <CheckOutlinedIcon fontSize="small" className="text-accent!" />
                    </button>
                  ) : (
                    <span className="size-9" aria-hidden />
                  )
                ) : null}
                {mode === "admin" ? (
                  branch.is_approved !== false ? (
                    <button
                      type="button"
                      className={iconButton}
                      aria-label={`Bëje kryesore degën në ${branch.city || branch.name}`}
                      disabled={pending}
                      onClick={() => setConfirm({ kind: "main", id: branch.id })}
                    >
                      <HomeOutlinedIcon fontSize="small" />
                    </button>
                  ) : (
                    <span className="size-9" aria-hidden />
                  )
                ) : null}
                {mode === "admin" ? (
                  <button
                    type="button"
                    className={iconButton}
                    aria-label={`Fshi degën në ${branch.city || branch.name}`}
                    disabled={pending}
                    onClick={() => setConfirm({ kind: "delete", id: branch.id })}
                  >
                    <DeleteOutlinedIcon fontSize="small" className="text-danger!" />
                  </button>
                ) : null}
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      {canCreate ? (
        <div className="mt-5 border-t border-line pt-5">
          {mode === "biz" ? (
            <button
              type="button"
              className={iconButton}
              aria-label="Shto degë"
              aria-expanded={panel === "create"}
              onClick={() => {
                setError(null);
                setPanel((current) => (current === "create" ? "none" : "create"));
              }}
            >
              <AddOutlinedIcon fontSize="small" className="text-accent!" />
            </button>
          ) : (
            <button
              type="button"
              className={panel === "create" ? btnPrimary : btnGhost}
              onClick={() => {
                setError(null);
                setPanel((current) => (current === "create" ? "none" : "create"));
              }}
            >
              <AddOutlinedIcon fontSize="small" />
              Shto degë
            </button>
          )}
        </div>
      ) : null}

      {panel === "create" ? (
        <form className="mt-4 grid gap-4" onSubmit={onSubmit}>
          <p className="m-0 text-sm text-muted">
            Emri mbetet {business.name}. Adresa hyen menjëherë, bashkë me degën.
            {mode === "biz"
              ? " Degë e re pret aprovimin dhe nuk del publike derisa administrata ta pranojë."
              : ""}
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
              {pending ? "Duke shtuar…" : "Konfirmo"}
            </button>
          </div>
        </form>
      ) : null}

      {mode === "admin" && business.parent_id ? (
        <div className="mt-5 grid w-fit grid-cols-[7.75rem_2.25rem_2.25rem_2.25rem] items-center gap-1.5 border-t border-line pt-5">
          <span
            className={`${offerStatusClass(
              business.is_approved === false
                ? "pending"
                : business.is_active
                  ? "approved"
                  : "rejected",
            )} mt-0! justify-self-end self-center!`}
          >
            {business.is_approved === false
              ? "Pret aprovim"
              : business.is_active
                ? "Aktive"
                : "Joaktive"}
          </span>
          {business.is_approved === false ? (
            <button
              className={iconButton}
              type="button"
              aria-label="Aprovo degën"
              disabled={pending}
              onClick={() => void onApprove(business.id)}
            >
              <CheckOutlinedIcon fontSize="small" className="text-accent!" />
            </button>
          ) : (
            <span className="size-9" aria-hidden />
          )}
          {business.is_approved !== false ? (
            <button
              className={iconButton}
              type="button"
              aria-label="Bëje kryesore"
              disabled={pending}
              onClick={() => setConfirm({ kind: "main", id: business.id })}
            >
              <HomeOutlinedIcon fontSize="small" />
            </button>
          ) : (
            <span className="size-9" aria-hidden />
          )}
          <button
            className={iconButton}
            type="button"
            aria-label="Fshi degën"
            disabled={pending}
            onClick={() => setConfirm({ kind: "delete", id: business.id })}
          >
            <DeleteOutlinedIcon fontSize="small" className="text-danger!" />
          </button>
        </div>
      ) : null}

      {error && panel === "none" ? (
        <p className={`${fieldError} mt-3`} role="alert">
          {error}
        </p>
      ) : null}

      <ConfirmModal
        open={confirm !== null}
        title={confirm?.kind === "delete" ? "Ta fshish këtë degë?" : "Ta bësh këtë lokacion kryesor?"}
        message={
          confirm?.kind === "delete"
            ? "Fshihet vetëm ky lokacion. Fletushkat e kompanisë mbeten te të tjerët. Një dyqan më vete hapet si biznes i ri, me abonimin e vet."
            : "Abonimi, menaxheri dhe fletushkat e kompanisë kalojnë këtu. Lokacionet e tjera mbeten degë."
        }
        confirmLabel={confirm?.kind === "delete" ? "Fshi degën" : "Bëje kryesore"}
        danger={confirm?.kind === "delete"}
        pending={pending}
        onConfirm={() => void onConfirm()}
        onClose={() => {
          if (!pending) {
            setConfirm(null);
          }
        }}
      />
    </section>
  );
}
