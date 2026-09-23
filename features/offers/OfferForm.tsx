"use client";

import { useMemo, useState, type ClipboardEvent, type FormEvent, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { DateTimeField } from "@/components/ui/DateTimeField";
import { PosMoneyField } from "@/components/ui/PosMoneyField";
import { SelectField } from "@/components/ui/SelectField";
import {
  useActiveCategories,
  useCreateBizOffer,
  useUpdateBizOffer,
} from "@/hooks/useBizOffers";
import { defaultOfferWindow, toDateTimeLocalValue } from "@/lib/datetime";
import { validationMessage } from "@/lib/api";
import { offerBundleFormSchema } from "@/schemas/offer";
import type { OfferBundle } from "@/types";

type ItemDraft = {
  key: string;
  category_id: string;
  name: string;
  /** Integer cents (POS). */
  original_price: number;
  /** Integer cents (POS). */
  discounted_price: number;
  discount_percent: string;
  rejection_note?: string | null;
};

type OfferFormProps = {
  mode: "create" | "edit";
  offer?: OfferBundle;
};

function emptyItem(key: string): ItemDraft {
  return {
    key,
    category_id: "",
    name: "",
    original_price: 0,
    discounted_price: 0,
    discount_percent: "",
    rejection_note: null,
  };
}

function percentFromCents(originalCents: number, discountedCents: number): string {
  if (
    !(originalCents > 0) ||
    !(discountedCents >= 0) ||
    discountedCents >= originalCents
  ) {
    return "";
  }
  return String(
    Math.round(((originalCents - discountedCents) / originalCents) * 100),
  );
}

function discountedFromPercent(originalCents: number, percent: number): number {
  if (!(originalCents > 0) || !(percent >= 1) || percent > 99) {
    return 0;
  }
  return Math.max(1, Math.round(originalCents * (1 - percent / 100)));
}

/** Keep % as integer digits only, clamped to 1–99 while typing. */
function sanitizeDiscountPercentInput(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (!digits) {
    return "";
  }
  const n = Math.min(99, Number(digits));
  if (!Number.isFinite(n) || n < 1) {
    return digits.length > 0 && Number(digits) === 0 ? "0" : "";
  }
  return String(n);
}

function isDigitKey(key: string): boolean {
  return key >= "0" && key <= "9";
}

function onPercentKeyDown(event: KeyboardEvent<HTMLInputElement>) {
  if (event.metaKey || event.ctrlKey || event.altKey) {
    return;
  }
  if (isDigitKey(event.key) || event.key === "Backspace" || event.key === "Delete") {
    return;
  }
  const allowed = [
    "Tab",
    "Escape",
    "Enter",
    "ArrowLeft",
    "ArrowRight",
    "ArrowUp",
    "ArrowDown",
    "Home",
    "End",
  ];
  if (!allowed.includes(event.key)) {
    event.preventDefault();
  }
}

export function OfferForm({ mode, offer }: OfferFormProps) {
  const router = useRouter();
  const { data: categories = [], isLoading: categoriesLoading } =
    useActiveCategories();
  const createMutation = useCreateBizOffer();
  const updateMutation = useUpdateBizOffer(offer?.id ?? "");

  const defaults = defaultOfferWindow();
  const [title, setTitle] = useState(offer?.title ?? "");
  const [startsAt, setStartsAt] = useState(
    offer ? toDateTimeLocalValue(offer.starts_at) : defaults.starts_at,
  );
  const [expiresAt, setExpiresAt] = useState(
    offer ? toDateTimeLocalValue(offer.expires_at) : defaults.expires_at,
  );
  const [items, setItems] = useState<ItemDraft[]>(() => {
    if (offer?.items?.length) {
      return offer.items.map((item, index) => ({
        key: item.id ?? `item-${index}`,
        category_id: item.category?.id ?? "",
        name: item.name,
        original_price: item.original_price,
        discounted_price: item.discounted_price,
        discount_percent: String(item.discount_percent),
        rejection_note: item.rejection_note ?? null,
      }));
    }
    return [emptyItem("item-0")];
  });
  const [error, setError] = useState<string | null>(null);

  const pending = createMutation.isPending || updateMutation.isPending;

  const categoryOptions = useMemo(
    () =>
      categories.map((c) => ({
        value: c.id,
        label: c.name,
      })),
    [categories],
  );

  function patchItem(key: string, patch: Partial<ItemDraft>) {
    setItems((prev) =>
      prev.map((item) => (item.key === key ? { ...item, ...patch } : item)),
    );
  }

  function onOriginalChange(key: string, cents: number) {
    setItems((prev) =>
      prev.map((item) => {
        if (item.key !== key) {
          return item;
        }
        const percent = Number(item.discount_percent);
        if (cents > 0 && Number.isFinite(percent) && percent >= 1 && percent <= 99) {
          return {
            ...item,
            original_price: cents,
            discounted_price: discountedFromPercent(cents, percent),
          };
        }
        if (cents > 0 && item.discounted_price > 0) {
          return {
            ...item,
            original_price: cents,
            discount_percent: percentFromCents(cents, item.discounted_price),
          };
        }
        return { ...item, original_price: cents };
      }),
    );
  }

  function onPercentChange(key: string, value: string) {
    const sanitized = sanitizeDiscountPercentInput(value);
    setItems((prev) =>
      prev.map((item) => {
        if (item.key !== key) {
          return item;
        }
        const percent = Number(sanitized);
        if (
          item.original_price > 0 &&
          Number.isFinite(percent) &&
          percent >= 1 &&
          percent <= 99
        ) {
          return {
            ...item,
            discount_percent: sanitized,
            discounted_price: discountedFromPercent(
              item.original_price,
              percent,
            ),
          };
        }
        return { ...item, discount_percent: sanitized };
      }),
    );
  }

  function onDiscountedChange(key: string, cents: number) {
    setItems((prev) =>
      prev.map((item) => {
        if (item.key !== key) {
          return item;
        }
        if (item.original_price > 0) {
          return {
            ...item,
            discounted_price: cents,
            discount_percent: percentFromCents(item.original_price, cents),
          };
        }
        return { ...item, discounted_price: cents };
      }),
    );
  }

  function addItem() {
    setItems((prev) => [...prev, emptyItem(`item-${Date.now()}`)]);
  }

  function removeItem(key: string) {
    setItems((prev) =>
      prev.length <= 1 ? prev : prev.filter((i) => i.key !== key),
    );
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    for (const item of items) {
      const percent = Number(item.discount_percent);
      if (
        item.discount_percent.trim() !== "" &&
        (!Number.isFinite(percent) || percent < 1 || percent > 99)
      ) {
        setError("Zbritja duhet të jetë midis 1% dhe 99%.");
        return;
      }
    }

    const parsed = offerBundleFormSchema.safeParse({
      title,
      starts_at: startsAt,
      expires_at: expiresAt,
      items: items.map(
        ({ category_id, name, original_price, discounted_price }) => ({
          category_id,
          name,
          original_price,
          discounted_price,
        }),
      ),
    });

    if (!parsed.success) {
      setError(
        parsed.error.issues[0]?.message ?? "Të dhënat nuk janë të vlefshme.",
      );
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
        <span>Titulli i dosjes</span>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={pending}
          required
          maxLength={255}
          placeholder="p.sh. Nëntor 2026"
        />
      </label>

      <div className="offer-form__row">
        <label className="offer-form__field">
          <span>Fillon</span>
          <DateTimeField
            value={startsAt}
            onChange={setStartsAt}
            disabled={pending}
            aria-label="Fillon"
          />
        </label>

        <label className="offer-form__field">
          <span>Skadon</span>
          <DateTimeField
            value={expiresAt}
            onChange={setExpiresAt}
            disabled={pending}
            aria-label="Skadon"
          />
        </label>
      </div>

      <div className="offer-form__items">
        <div className="offer-form__items-head">
          <h2 className="offer-form__items-title">Produktet</h2>
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            disabled={pending}
            onClick={addItem}
          >
            + Shto produkt
          </button>
        </div>

        {offer?.status === "rejected" && offer.rejection_reason ? (
          <p className="bundle-view__reject" role="status">
            Arsye refuzimi: {offer.rejection_reason}
          </p>
        ) : null}

        {items.map((item, index) => (
          <fieldset
            key={item.key}
            className={
              item.rejection_note
                ? "offer-form__item offer-form__item--flagged"
                : "offer-form__item"
            }
          >
            <legend>
              Produkt {index + 1}
              {item.rejection_note ? " · Duhet rregulluar" : ""}
            </legend>

            {item.rejection_note ? (
              <p className="offer-form__item-note">{item.rejection_note}</p>
            ) : null}

            <label className="offer-form__field">
              <span>Kategoria</span>
              <SelectField
                value={item.category_id}
                onChange={(value) =>
                  patchItem(item.key, { category_id: value })
                }
                options={categoryOptions}
                placeholder="Zgjidh kategorinë"
                disabled={pending || categoriesLoading}
                aria-label={`Kategoria e produktit ${index + 1}`}
              />
            </label>

            <label className="offer-form__field">
              <span>Emri i produktit</span>
              <input
                type="text"
                value={item.name}
                onChange={(e) => patchItem(item.key, { name: e.target.value })}
                disabled={pending}
                required
                maxLength={255}
              />
            </label>

            <label className="offer-form__field">
              <span>Çmimi origjinal (EUR)</span>
              <PosMoneyField
                valueCents={item.original_price}
                onChangeCents={(cents) => onOriginalChange(item.key, cents)}
                disabled={pending}
                aria-label={`Çmimi origjinal i produktit ${index + 1}`}
              />
            </label>

            <div className="offer-form__row">
              <label className="offer-form__field">
                <span>Zbritja (%)</span>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  spellCheck={false}
                  pattern="[0-9]*"
                  maxLength={2}
                  value={item.discount_percent}
                  onKeyDown={onPercentKeyDown}
                  onPaste={(event: ClipboardEvent<HTMLInputElement>) => {
                    event.preventDefault();
                    onPercentChange(
                      item.key,
                      event.clipboardData.getData("text"),
                    );
                  }}
                  onChange={(e) => onPercentChange(item.key, e.target.value)}
                  disabled={pending}
                  placeholder="p.sh. 30"
                  aria-label={`Zbritja në përqindje e produktit ${index + 1}`}
                />
              </label>

              <label className="offer-form__field">
                <span>Çmimi me zbritje (EUR)</span>
                <PosMoneyField
                  valueCents={item.discounted_price}
                  onChangeCents={(cents) =>
                    onDiscountedChange(item.key, cents)
                  }
                  disabled={pending}
                  aria-label={`Çmimi me zbritje i produktit ${index + 1}`}
                />
              </label>
            </div>

            <p className="offer-form__hint">
              Plotëso % (1–99) ose çmimin me zbritje — tjetri llogaritet
              automatikisht. Çmimi me zbritje duhet të jetë më i ulët se
              origjinali.
            </p>

            {items.length > 1 ? (
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                disabled={pending}
                onClick={() => removeItem(item.key)}
              >
                Hiq produktin
              </button>
            ) : null}
          </fieldset>
        ))}
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
