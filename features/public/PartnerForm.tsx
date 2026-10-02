"use client";

import { useState, type FormEvent } from "react";
import { Spinner } from "@/components/ui/Spinner";
import {
  InquiryField,
  InquiryInput,
  InquiryTextarea,
} from "@/features/public/inquiry/InquiryField";
import { InquirySuccess } from "@/features/public/inquiry/InquirySuccess";
import {
  inquiryError,
  inquiryForm,
  inquiryPanel,
  inquirySubmit,
} from "@/features/public/inquiry/styles";
import { apiFetch, validationMessage } from "@/lib/api";

const emailPattern = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

type FieldKey = "name" | "email" | "businessName" | "city";

export function PartnerForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [invalid, setInvalid] = useState<Partial<Record<FieldKey, boolean>>>({});
  const [done, setDone] = useState(false);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedBusiness = businessName.trim();
    const trimmedCity = city.trim();
    const nextInvalid: Partial<Record<FieldKey, boolean>> = {};
    if (trimmedName === "") {
      nextInvalid.name = true;
      setInvalid(nextInvalid);
      setError("Shkruaj emrin.");
      return;
    }
    if (trimmedEmail === "") {
      nextInvalid.email = true;
      setInvalid(nextInvalid);
      setError("Shkruaj email-in.");
      return;
    }
    if (!emailPattern.test(trimmedEmail)) {
      nextInvalid.email = true;
      setInvalid(nextInvalid);
      setError("Shkruaj një email të vlefshëm.");
      return;
    }
    if (trimmedBusiness === "") {
      nextInvalid.businessName = true;
      setInvalid(nextInvalid);
      setError("Shkruaj emrin e dyqanit.");
      return;
    }
    if (trimmedCity === "") {
      nextInvalid.city = true;
      setInvalid(nextInvalid);
      setError("Shkruaj qytetin.");
      return;
    }
    setInvalid({});
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
      <InquirySuccess
        title="Aplikimi u dërgua"
        body="Faleminderit. Ekipi ynë do të shikojë aplikimin dhe do të të kontaktojë së shpejti."
      />
    );
  }

  return (
    <div className="grid gap-4">
      <div className={inquiryPanel}>
        <p className="m-0 text-[0.7rem] font-bold tracking-[0.16em] text-muted uppercase">
          Aplikimi
        </p>
        <form className={`${inquiryForm} mt-5`} onSubmit={onSubmit} noValidate>
          <div className="grid gap-5 sm:grid-cols-2">
            <InquiryField label="Emri" required htmlFor="partner-name">
              <InquiryInput
                id="partner-name"
                name="name"
                autoComplete="name"
                value={name}
                maxLength={120}
                disabled={pending}
                invalid={invalid.name}
                placeholder="Emri yt"
                onChange={(event) => {
                  setName(event.target.value);
                  setInvalid((prev) => ({ ...prev, name: false }));
                }}
                required
              />
            </InquiryField>
            <InquiryField label="Email" required htmlFor="partner-email">
              <InquiryInput
                id="partner-email"
                type="email"
                name="email"
                autoComplete="email"
                value={email}
                maxLength={255}
                disabled={pending}
                invalid={invalid.email}
                placeholder="email@dyqani.com"
                onChange={(event) => {
                  setEmail(event.target.value);
                  setInvalid((prev) => ({ ...prev, email: false }));
                }}
                required
              />
            </InquiryField>
          </div>
          <InquiryField label="Emri i dyqanit" required htmlFor="partner-shop">
            <InquiryInput
              id="partner-shop"
              name="business_name"
              autoComplete="organization"
              value={businessName}
              maxLength={160}
              disabled={pending}
              invalid={invalid.businessName}
              placeholder="Si quhet dyqani"
              onChange={(event) => {
                setBusinessName(event.target.value);
                setInvalid((prev) => ({ ...prev, businessName: false }));
              }}
              required
            />
          </InquiryField>
          <div className="grid gap-5 sm:grid-cols-2">
            <InquiryField label="Qyteti" required htmlFor="partner-city">
              <InquiryInput
                id="partner-city"
                name="city"
                autoComplete="address-level2"
                value={city}
                maxLength={120}
                disabled={pending}
                invalid={invalid.city}
                placeholder="p.sh. Prishtinë"
                onChange={(event) => {
                  setCity(event.target.value);
                  setInvalid((prev) => ({ ...prev, city: false }));
                }}
                required
              />
            </InquiryField>
            <InquiryField label="Telefoni" htmlFor="partner-phone">
              <InquiryInput
                id="partner-phone"
                type="tel"
                name="phone"
                autoComplete="tel"
                value={phone}
                maxLength={40}
                disabled={pending}
                placeholder="p.sh. +383 44 000 000"
                onChange={(event) => setPhone(event.target.value)}
              />
            </InquiryField>
          </div>
          <InquiryField label="Mesazhi" htmlFor="partner-message">
            <InquiryTextarea
              id="partner-message"
              name="message"
              value={message}
              maxLength={5000}
              disabled={pending}
              placeholder="Diçka që dëshiron të na tregosh (opsionale)"
              className="min-h-28"
              onChange={(event) => setMessage(event.target.value)}
            />
          </InquiryField>
          {error ? (
            <p className={inquiryError} role="alert">
              {error}
            </p>
          ) : null}
          <div className="pt-1">
            <button className={inquirySubmit} type="submit" disabled={pending} aria-busy={pending}>
              {pending ? (
                <span className="inline-flex items-center gap-2.5">
                  <Spinner label="Duke u dërguar" size="sm" block={false} tone="onAccent" />
                  <span>Duke u dërguar…</span>
                </span>
              ) : (
                "Dërgo aplikimin"
              )}
            </button>
          </div>
        </form>
      </div>
      <p className="m-0 max-w-xl text-sm leading-relaxed text-muted">
        Pas dërgimit, ekipi ynë shikon aplikimin dhe të kontakton me hapat e
        ardhshëm. Nuk ka pagesë për të aplikuar.
      </p>
    </div>
  );
}
