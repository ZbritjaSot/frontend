"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useActiveCategories, useCreateBizOffer, useUpdateBizOffer } from "@/hooks/useBizOffers";
import { defaultOfferWindow, toDateTimeLocalValue } from "@/lib/datetime";
import { validationMessage } from "@/lib/api";
import { offerFormSchema } from "@/schemas/offer";
import type { Offer } from "@/types";

type OfferFormProps = {
  mode: "create" | "edit";
  offer?: Offer;
};

export function OfferForm({ mode, offer }: OfferFormProps) {
  const router = useRouter();
  const { data: categories = [], isLoading: categoriesLoading } =
    useActiveCategories();
  const createMutation = useCreateBizOffer();
  const updateMutation = useUpdateBizOffer(offer?.id ?? "");

  const defaults = defaultOfferWindow();
  const [categoryId, setCategoryId] = useState(offer?.category?.id ?? "");
  const [name, setName] = useState(offer?.name ?? "");
  const [originalPrice, setOriginalPrice] = useState(
    offer?.original_price ?? "",
  );
  const [discountedPrice, setDiscountedPrice] = useState(
    offer?.discounted_price ?? "",
  );
  const [startsAt, setStartsAt] = useState(
    offer ? toDateTimeLocalValue(offer.starts_at) : defaults.starts_at,
  );
  const [expiresAt, setExpiresAt] = useState(
    offer ? toDateTimeLocalValue(offer.expires_at) : defaults.expires_at,
  );
  const [error, setError] = useState<string | null>(null);

  const pending = createMutation.isPending || updateMutation.isPending;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const parsed = offerFormSchema.safeParse({
      category_id: categoryId,
      name,
      original_price: originalPrice,
      discounted_price: discountedPrice,
      starts_at: startsAt,
      expires_at: expiresAt,
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Të dhënat nuk janë të vlefshme.");
      return;
    }

    try {
      if (mode === "create") {
        await createMutation.mutateAsync(parsed.data);
        router.replace("/biz/offers");
      } else if (offer) {
        await updateMutation.mutateAsync(parsed.data);
        router.replace("/biz/offers");
      }
    } catch (err) {
      setError(validationMessage(err, "Nuk mundëm ta ruajmë ofertën."));
    }
  }

  return (
    <form className="offer-form" onSubmit={onSubmit} noValidate>
      <label className="offer-form__field">
        <span>Kategoria</span>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          disabled={pending || categoriesLoading}
          required
        >
          <option value="">Zgjidh kategorinë</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>

      <label className="offer-form__field">
        <span>Emri i produktit</span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={pending}
          required
          maxLength={255}
        />
      </label>

      <div className="offer-form__row">
        <label className="offer-form__field">
          <span>Çmimi origjinal (EUR)</span>
          <input
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0.01"
            value={originalPrice}
            onChange={(e) => setOriginalPrice(e.target.value)}
            disabled={pending}
            required
          />
        </label>

        <label className="offer-form__field">
          <span>Çmimi me zbritje (EUR)</span>
          <input
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0.01"
            value={discountedPrice}
            onChange={(e) => setDiscountedPrice(e.target.value)}
            disabled={pending}
            required
          />
        </label>
      </div>

      <div className="offer-form__row">
        <label className="offer-form__field">
          <span>Fillon</span>
          <input
            type="datetime-local"
            value={startsAt}
            onChange={(e) => setStartsAt(e.target.value)}
            disabled={pending}
            required
          />
        </label>

        <label className="offer-form__field">
          <span>Skadon</span>
          <input
            type="datetime-local"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            disabled={pending}
            required
          />
        </label>
      </div>

      {error ? (
        <p className="offer-form__error" role="alert">
          {error}
        </p>
      ) : null}

      <div className="offer-form__actions">
        <button className="btn btn--primary" type="submit" disabled={pending}>
          {pending
            ? "Duke u ruajtur…"
            : mode === "create"
              ? "Ruaj draft"
              : "Përditëso"}
        </button>
        <button
          className="btn btn--ghost"
          type="button"
          disabled={pending}
          onClick={() => router.push("/biz/offers")}
        >
          Anulo
        </button>
      </div>
    </form>
  );
}
