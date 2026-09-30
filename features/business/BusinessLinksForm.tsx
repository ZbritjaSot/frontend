"use client";

import { useState, type FormEvent } from "react";
import {
  blankToNull,
  linksFromBusiness,
  sanitizeWhatsappInput,
  type BusinessLinksInput,
} from "@/features/business/links";
import { validationMessage } from "@/lib/api";
import { btnPrimary, fieldError, fieldLabel, inputClass } from "@/lib/ui";
import type { Business } from "@/types";

const micro = "text-xs font-bold tracking-[0.08em] text-muted uppercase";

export function BusinessLinksForm({
  business,
  readOnly = false,
  onSave,
}: {
  business: Business;
  readOnly?: boolean;
  onSave: (links: BusinessLinksInput) => Promise<void>;
}) {
  const seed = linksFromBusiness(business);
  const [website, setWebsite] = useState(seed.website_url ?? "");
  const [instagram, setInstagram] = useState(seed.instagram_url ?? "");
  const [facebook, setFacebook] = useState(seed.facebook_url ?? "");
  const [whatsapp, setWhatsapp] = useState(
    sanitizeWhatsappInput(seed.whatsapp ?? ""),
  );
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (readOnly) {
      return;
    }
    setError(null);
    setBusy(true);
    try {
      await onSave({
        website_url: blankToNull(website),
        instagram_url: blankToNull(instagram),
        facebook_url: blankToNull(facebook),
        whatsapp: blankToNull(whatsapp),
      });
    } catch (caught) {
      setError(validationMessage(caught, "Nuk mundëm t’i ruajmë lidhjet."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="grid gap-3 border-t border-line px-5 py-4" onSubmit={(event) => void onSubmit(event)}>
      <div>
        <p className={`m-0 ${micro}`}>Website dhe rrjete</p>
        {readOnly ? (
          <p className="m-0 mt-1 text-sm text-muted">
            Lidhjet menaxhohen te dyqani kryesor.
          </p>
        ) : (
          <p className="m-0 mt-1 text-sm text-muted">
            Shfaqen te faqja publike e dyqanit.
          </p>
        )}
      </div>
      {error ? (
        <p className={fieldError} role="alert">
          {error}
        </p>
      ) : null}
      <label className={fieldLabel}>
        <span>Website</span>
        <input
          className={inputClass}
          value={website}
          maxLength={255}
          disabled={readOnly || busy}
          onChange={(event) => setWebsite(event.target.value)}
        />
      </label>
      <label className={fieldLabel}>
        <span>Instagram</span>
        <input
          className={inputClass}
          value={instagram}
          maxLength={255}
          disabled={readOnly || busy}
          onChange={(event) => setInstagram(event.target.value)}
        />
      </label>
      <label className={fieldLabel}>
        <span>Facebook</span>
        <input
          className={inputClass}
          value={facebook}
          maxLength={255}
          disabled={readOnly || busy}
          onChange={(event) => setFacebook(event.target.value)}
        />
      </label>
      <label className={fieldLabel}>
        <span>WhatsApp</span>
        <span className="relative block">
          <span
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm font-semibold text-muted"
          >
            +
          </span>
          <input
            className={`${inputClass} pl-7`}
            value={whatsapp}
            maxLength={15}
            disabled={readOnly || busy}
            inputMode="tel"
            autoComplete="tel"
            placeholder="383 44 000 000"
            onChange={(event) =>
              setWhatsapp(sanitizeWhatsappInput(event.target.value))
            }
          />
        </span>
      </label>
      {!readOnly ? (
        <div className="flex justify-end">
          <button className={btnPrimary} type="submit" disabled={busy}>
            {busy ? "Duke u ruajtur…" : "Ruaj lidhjet"}
          </button>
        </div>
      ) : null}
    </form>
  );
}
