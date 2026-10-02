"use client";

import { useState, type FormEvent } from "react";
import { apiFetch, validationMessage } from "@/lib/api";
import { btnPrimary, fieldError, fieldLabel, inputClass } from "@/lib/ui";

const emailPattern = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

type PartnerFormProps = {
  intro?: string;
};

export function PartnerForm({ intro }: PartnerFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedBusiness = businessName.trim();
    const trimmedCity = city.trim();
    if (trimmedName === "") {
      setError("Shkruaj emrin.");
      return;
    }
    if (trimmedEmail === "") {
      setError("Shkruaj email-in.");
      return;
    }
    if (!emailPattern.test(trimmedEmail)) {
      setError("Shkruaj një email të vlefshëm.");
      return;
    }
    if (trimmedBusiness === "") {
      setError("Shkruaj emrin e dyqanit.");
      return;
    }
    if (trimmedCity === "") {
      setError("Shkruaj qytetin.");
      return;
    }
    setError(null);
    setPending(true);
    try {
      await apiFetch("/partner", {
        method: "POST",
        auth: true,
        body: JSON.stringify({
          name: trimmedName,
          email: trimmedEmail,
          business_name: trimmedBusiness,
          city: trimmedCity,
          phone: phone.trim() || null,
          message: message.trim() || null,
        }),
      });
      setDone(true);
      setName("");
      setEmail("");
      setBusinessName("");
      setCity("");
      setPhone("");
      setMessage("");
    } catch (caught) {
      setError(validationMessage(caught, "Nuk u dërgua. Provo përsëri."));
    } finally {
      setPending(false);
    }
  }

  if (done) {
    return (
      <p className="m-0 max-w-xl text-base leading-relaxed font-semibold text-ink" role="status">
        Aplikimi u dërgua. Ekipi ynë do të të kontaktojë së shpejti.
      </p>
    );
  }

  return (
    <form className="mt-6 grid max-w-xl gap-5" onSubmit={onSubmit} noValidate>
      {intro ? (
        <p className="m-0 text-base leading-relaxed text-muted">{intro}</p>
      ) : null}
      <label className={fieldLabel}>
        <span>Emri *</span>
        <input
          className={inputClass}
          name="name"
          autoComplete="name"
          value={name}
          maxLength={120}
          disabled={pending}
          onChange={(event) => setName(event.target.value)}
          required
        />
      </label>
      <label className={fieldLabel}>
        <span>Email *</span>
        <input
          className={inputClass}
          type="email"
          name="email"
          autoComplete="email"
          value={email}
          maxLength={255}
          disabled={pending}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </label>
      <label className={fieldLabel}>
        <span>Emri i dyqanit *</span>
        <input
          className={inputClass}
          name="business_name"
          autoComplete="organization"
          value={businessName}
          maxLength={160}
          disabled={pending}
          onChange={(event) => setBusinessName(event.target.value)}
          required
        />
      </label>
      <label className={fieldLabel}>
        <span>Qyteti *</span>
        <input
          className={inputClass}
          name="city"
          autoComplete="address-level2"
          value={city}
          maxLength={120}
          disabled={pending}
          onChange={(event) => setCity(event.target.value)}
          required
        />
      </label>
      <label className={fieldLabel}>
        <span>Telefoni</span>
        <input
          className={inputClass}
          type="tel"
          name="phone"
          autoComplete="tel"
          value={phone}
          maxLength={40}
          disabled={pending}
          onChange={(event) => setPhone(event.target.value)}
          placeholder="opsionale"
        />
      </label>
      <label className={fieldLabel}>
        <span>Mesazhi</span>
        <textarea
          className={`${inputClass} min-h-28 resize-y`}
          name="message"
          value={message}
          maxLength={5000}
          disabled={pending}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="opsionale"
        />
      </label>
      {error ? (
        <p className={fieldError} role="alert">
          {error}
        </p>
      ) : null}
      <button className={`${btnPrimary} w-fit`} type="submit" disabled={pending} aria-busy={pending}>
        {pending ? "Duke u dërguar…" : "Dërgo aplikimin"}
      </button>
    </form>
  );
}
