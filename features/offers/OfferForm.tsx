"use client";

import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import { useMemo, useState, type ClipboardEvent, type FormEvent, type KeyboardEvent } from "react";
import { ItemPhoto } from "@/features/gallery/ItemPhoto";
import { useRouter } from "next/navigation";
import { DateTimeField } from "@/components/ui/DateTimeField";
import { PosMoneyField } from "@/components/ui/PosMoneyField";
import { SelectField } from "@/components/ui/SelectField";
import { useUpdateAdminOffer } from "@/hooks/useAdminOffers";
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
  gallery_image_id: string | null;
  thumb_url: string | null;
  rejection_note?: string | null;
};

type OfferFormProps = {
  mode: "create" | "edit";
  offer?: OfferBundle;
  /** Admin edits a waiting flyer. The shop form stays on drafts. */
  audience?: "biz" | "admin";
};

function emptyItem(key: string): ItemDraft {
  return {
    key,
    category_id: "",
    name: "",
    original_price: 0,
    discounted_price: 0,
    discount_percent: "",
    gallery_image_id: null,
    thumb_url: null,
    rejection_note: null,
  };
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

export function OfferForm({ mode, offer, audience = "biz" }: OfferFormProps) {
  const router = useRouter();
  const { data: categories = [], isLoading: categoriesLoading } =
    useActiveCategories();
  const createMutation = useCreateBizOffer();
  const updateBizMutation = useUpdateBizOffer(offer?.id ?? "");
  const updateAdminMutation = useUpdateAdminOffer(offer?.id ?? "");
  const updateMutation =
    audience === "admin" ? updateAdminMutation : updateBizMutation;
  const leaveHref =
    audience === "admin" && offer
      ? `/admin/offers/${offer.id}`
      : "/biz/offers";

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
        original_price: item.original_price ?? 0,
        discounted_price: item.discounted_price ?? 0,
        discount_percent:
          item.discount_percent == null ? "" : String(item.discount_percent),
        gallery_image_id: item.image?.id ?? null,
        thumb_url: item.image?.thumb_url ?? null,
        rejection_note: item.rejection_note ?? null,
      }));
    }
    return [emptyItem("item-0")];
  });
  const [coverKey, setCoverKey] = useState<string | null>(() => {
    const imageId = offer?.cover_gallery_image_id;
    if (!imageId) {
      return null;
    }
    return (
      offer.items?.find((item) => item.image?.id === imageId)?.id ?? null
    );
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
    patchItem(key, { original_price: cents });
  }

  function onPercentChange(key: string, value: string) {
    patchItem(key, { discount_percent: sanitizeDiscountPercentInput(value) });
  }

  function onDiscountedChange(key: string, cents: number) {
    patchItem(key, { discounted_price: cents });
  }

  function addItem() {
    setItems((prev) => [...prev, emptyItem(`item-${Date.now()}`)]);
  }

  function removeItem(key: string) {
    setCoverKey((current) => (current === key ? null : current));
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
        ({
          category_id,
          name,
          original_price,
          discounted_price,
          discount_percent,
          gallery_image_id,
        }) => ({
          category_id,
          name,
          original_price: original_price > 0 ? original_price : null,
          discounted_price: discounted_price > 0 ? discounted_price : null,
          discount_percent:
            discount_percent.trim() === "" ? null : Number(discount_percent),
          gallery_image_id,
        }),
      ),
      cover_gallery_image_id:
        items.find((item) => item.key === coverKey)?.gallery_image_id ?? null,
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
        router.replace(leaveHref);
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
          <span className={micro}>Titulli i kampanjës</span>
          <input
            className={`${inputClass} text-lg! font-semibold`}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={pending}
            required
            maxLength={255}
            placeholder="p.sh. Nëntor 2026"
            aria-label="Titulli i kampanjës"
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
                className="border-b border-line px-4 py-4"
              >
                <div className="flex items-stretch gap-4">
                  <ItemPhoto
                    name={item.name}
                    thumbUrl={item.thumb_url}
                    businessId={
                      audience === "admin" ? offer?.business?.id : undefined
                    }
                    disabled={pending}
                    onPick={(image) => {
                      patchItem(item.key, {
                        gallery_image_id: image.id,
                        thumb_url: image.thumb_url,
                      });
                      setCoverKey((current) => current ?? item.key);
                    }}
                    onClear={() => {
                      patchItem(item.key, {
                        gallery_image_id: null,
                        thumb_url: null,
                      });
                      setCoverKey((current) =>
                        current === item.key ? null : current,
                      );
                    }}
                  />

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

                    <div className="flex flex-wrap items-end gap-3">
                      <label className="flex min-w-36 flex-1 flex-col gap-1.5">
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
                      <label className="flex w-24 shrink-0 flex-col gap-1.5">
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
                      <label className="flex w-32 shrink-0 flex-col gap-1.5">
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
                    {item.thumb_url ? (
                      <button
                        type="button"
                        disabled={pending}
                        className={`w-fit text-left text-sm font-bold ${
                          coverKey === item.key
                            ? "text-ink"
                            : "text-muted hover:text-ink"
                        }`}
                        onClick={() => setCoverKey(item.key)}
                      >
                        {coverKey === item.key
                          ? "Foto e fletushkës"
                          : "Vendose në fletushkë"}
                      </button>
                    ) : null}
                  </div>
                </div>

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
          onClick={() => router.push(leaveHref)}
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
