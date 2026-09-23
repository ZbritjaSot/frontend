"use client";

import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
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
import {
  btnGhost,
  btnPrimary,
  fieldError,
  inputClass,
} from "@/lib/ui";
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

  const micro =
    "text-xs font-bold tracking-[0.08em] text-muted uppercase";
  const iconButton =
    "inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-line bg-sunken text-ink hover:border-accent/60 disabled:cursor-wait disabled:opacity-65";

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit} noValidate>
      <section className="rounded-2xl border border-line px-5 py-5">
        <label className="flex flex-col gap-2">
          <span className={micro}>Titulli</span>
          <input
            className={`${inputClass} text-lg! font-semibold`}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={pending}
            required
            maxLength={255}
            placeholder="p.sh. Nëntor 2026"
            aria-label="Titulli i dosjes"
          />
        </label>
        <div className="mt-5 grid gap-5 border-t border-line pt-5 md:grid-cols-2 md:gap-8">
          <label className="flex flex-col gap-2">
            <span className={micro}>Fillon</span>
            <DateTimeField
              value={startsAt}
              onChange={setStartsAt}
              disabled={pending}
              aria-label="Fillon"
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className={micro}>Skadon</span>
            <DateTimeField
              value={expiresAt}
              onChange={setExpiresAt}
              disabled={pending}
              aria-label="Skadon"
            />
          </label>
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <h2 className={`${micro} m-0`}>Produktet</h2>
          <p className="m-0 text-sm font-semibold text-muted tabular-nums">
            {items.length} {items.length === 1 ? "produkt" : "produkte"}
          </p>
        </div>

        {offer?.status === "rejected" && offer.rejection_reason ? (
          <p className="m-0 mb-3 text-sm font-semibold text-danger" role="status">
            {offer.rejection_reason}
          </p>
        ) : null}

        <div className="overflow-hidden rounded-2xl border border-line">
          {items.map((item, index) => {
            const percent = Number(item.discount_percent);
            const hasDeal =
              item.original_price > 0 &&
              item.discounted_price > 0 &&
              item.discounted_price < item.original_price &&
              Number.isFinite(percent) &&
              percent >= 1 &&
              percent <= 99;

            return (
              <div
                key={item.key}
                className={`border-b border-line px-4 py-4 ${
                  item.rejection_note
                    ? "shadow-[inset_3px_0_0_var(--color-danger)]"
                    : ""
                }`}
              >
                <div className="flex items-stretch gap-4">
                  <div
                    className="flex w-20 shrink-0 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-line bg-sunken text-muted sm:w-28"
                    aria-hidden
                  >
                    <ImageOutlinedIcon fontSize="small" />
                    <span className="text-[0.6875rem] font-semibold tracking-[0.08em] uppercase">
                      Foto
                    </span>
                  </div>

                  <div className="grid min-w-0 flex-1 gap-3">
                    <div className="flex items-start gap-3">
                      <div className="grid min-w-0 flex-1 gap-3 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
                        <input
                          className={inputClass}
                          type="text"
                          value={item.name}
                          onChange={(e) =>
                            patchItem(item.key, { name: e.target.value })
                          }
                          disabled={pending}
                          required
                          maxLength={255}
                          placeholder="Emri i produktit"
                          aria-label={`Emri i produktit ${index + 1}`}
                        />
                        <SelectField
                          value={item.category_id}
                          onChange={(value) =>
                            patchItem(item.key, { category_id: value })
                          }
                          options={categoryOptions}
                          placeholder="Kategoria"
                          disabled={pending || categoriesLoading}
                          aria-label={`Kategoria e produktit ${index + 1}`}
                        />
                      </div>
                      {items.length > 1 ? (
                        <button
                          type="button"
                          className={iconButton}
                          aria-label={`Hiq produktin ${index + 1}`}
                          disabled={pending}
                          onClick={() => removeItem(item.key)}
                        >
                          <DeleteOutlinedIcon
                            fontSize="small"
                            className="text-danger!"
                          />
                        </button>
                      ) : null}
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      <label className="flex flex-col gap-1.5">
                        <span className={micro}>Origjinali</span>
                        <PosMoneyField
                          valueCents={item.original_price}
                          onChangeCents={(cents) =>
                            onOriginalChange(item.key, cents)
                          }
                          disabled={pending}
                          aria-label={`Çmimi origjinal i produktit ${index + 1}`}
                        />
                      </label>
                      <label className="flex flex-col gap-1.5">
                        <span className={micro}>Zbritja</span>
                        <div className="relative">
                          <input
                            className={`${inputClass} pr-8 text-right tabular-nums`}
                            type="text"
                            inputMode="numeric"
                            autoComplete="off"
                            spellCheck={false}
                            pattern="[0-9]*"
                            maxLength={2}
                            value={item.discount_percent}
                            onKeyDown={onPercentKeyDown}
                            onPaste={(
                              event: ClipboardEvent<HTMLInputElement>,
                            ) => {
                              event.preventDefault();
                              onPercentChange(
                                item.key,
                                event.clipboardData.getData("text"),
                              );
                            }}
                            onChange={(e) =>
                              onPercentChange(item.key, e.target.value)
                            }
                            disabled={pending}
                            placeholder="0"
                            aria-label={`Zbritja në përqindje e produktit ${index + 1}`}
                          />
                          <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm font-bold text-muted">
                            %
                          </span>
                        </div>
                      </label>
                      <label className="flex flex-col gap-1.5">
                        <span className={micro}>Çmimi</span>
                        <div
                          className={
                            hasDeal ? "[&_input]:text-accent!" : undefined
                          }
                        >
                          <PosMoneyField
                            valueCents={item.discounted_price}
                            onChangeCents={(cents) =>
                              onDiscountedChange(item.key, cents)
                            }
                            disabled={pending}
                            aria-label={`Çmimi me zbritje i produktit ${index + 1}`}
                          />
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                {item.rejection_note ? (
                  <p className="m-0 mt-3 text-sm font-semibold text-danger">
                    {item.rejection_note}
                  </p>
                ) : null}
              </div>
            );
          })}

          <button
            type="button"
            className="flex w-full cursor-pointer items-center gap-2 bg-transparent px-4 py-3 text-sm font-semibold text-muted hover:bg-sunken hover:text-ink disabled:cursor-wait disabled:opacity-65"
            disabled={pending}
            onClick={addItem}
          >
            <AddOutlinedIcon fontSize="small" />
            Shto produkt
          </button>
        </div>
      </section>

      {error ? (
        <p className={fieldError} role="alert">
          {error}
        </p>
      ) : null}

      <div className="sticky bottom-0 z-20 -mx-5 flex items-center justify-end gap-2 border-t border-line bg-canvas px-5 py-3 sm:-mx-8 sm:px-8">
        <button
          className={btnGhost}
          type="button"
          disabled={pending}
          onClick={() => router.push("/biz/offers")}
        >
          Anulo
        </button>
        <button className={btnPrimary} type="submit" disabled={pending}>
          {pending
            ? "Duke u ruajtur…"
            : mode === "create"
              ? "Ruaj draft"
              : "Përditëso"}
        </button>
      </div>
    </form>
  );
}
