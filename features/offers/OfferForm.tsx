"use client";

import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import { useQuery } from "@tanstack/react-query";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ClipboardEvent,
  type KeyboardEvent,
} from "react";
import {
  fetchAdminCompanyShops,
  fetchBizCompanyShops,
} from "@/features/branches/api";
import { fetchManagerCompanyShops } from "@/features/biz/managerApi";
import { ItemPhoto } from "@/features/gallery/ItemPhoto";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { DateTimeField } from "@/components/ui/DateTimeField";
import { Modal } from "@/components/ui/Modal";
import { PosMoneyField } from "@/components/ui/PosMoneyField";
import { SelectField } from "@/components/ui/SelectField";
import { useCreateAdminOffer, useUpdateAdminOffer } from "@/hooks/useAdminOffers";
import { useCreateManagerBundle, useUpdateManagerBundle } from "@/hooks/useManagerReview";
import {
  useActiveCategories,
  useCreateBizOffer,
  useSubmitBizOffer,
  useUpdateBizOffer,
} from "@/hooks/useBizOffers";
import {
  defaultOfferWindow,
  immediateOfferWindow,
  OFFER_START_LEAD_HOURS,
  toHourLocalValue,
} from "@/lib/datetime";
import { formatDateShortSq, formatEurFromCents } from "@/lib/format";
import { validationMessage } from "@/lib/api";
import {
  btnGhost,
  btnPrimary,
  fieldError,
  inputClass,
} from "@/lib/ui";
import type { BundleCatalog } from "@/features/offers/bizApi";
import {
  adminOfferBundleFormSchema,
  offerBundleFormSchema,
} from "@/schemas/offer";
import type { OfferBundle } from "@/types";

type ItemDraft = {
  key: string;
  category_ids: string[];
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
  /** Admin or a manager edits a waiting flyer. The shop form stays on drafts. */
  audience?: "biz" | "admin" | "manager";
  /** Shop that owns a flyer a manager is writing from scratch. */
  businessId?: string;
  /** A main shop can carry the flyer at its other locations. */
  canShare?: boolean;
  /** Flyers = folder with cover; offers = standalone products (min one). */
  catalog?: BundleCatalog;
  /** Where create/cancel returns. Defaults to the audience list or dossier. */
  doneHref?: string;
};

function emptyItem(key: string): ItemDraft {
  return {
    key,
    category_ids: [],
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

export function OfferForm({
  mode,
  offer,
  audience = "biz",
  businessId,
  canShare = false,
  catalog = "flyers",
  doneHref,
}: OfferFormProps) {
  const router = useRouter();
  const resolvedCatalog: BundleCatalog =
    offer?.is_standalone === true
      ? "offers"
      : offer?.is_standalone === false
        ? "flyers"
        : catalog;
  const isFlyer = resolvedCatalog === "flyers";
  const listHref = isFlyer ? "/biz/flyers" : "/biz/offers";
  const { data: categories = [], isLoading: categoriesLoading } =
    useActiveCategories();
  const createBizMutation = useCreateBizOffer(resolvedCatalog);
  const createManagerMutation = useCreateManagerBundle(
    businessId ?? "",
    resolvedCatalog,
  );
  const createAdminMutation = useCreateAdminOffer(
    businessId ?? "",
    resolvedCatalog,
  );
  const createMutation =
    audience === "manager"
      ? createManagerMutation
      : audience === "admin"
        ? createAdminMutation
        : createBizMutation;
  const updateBizMutation = useUpdateBizOffer(offer?.id ?? "", resolvedCatalog);
  const updateAdminMutation = useUpdateAdminOffer(offer?.id ?? "");
  const updateManagerMutation = useUpdateManagerBundle(offer?.id ?? "");
  const updateMutation =
    audience === "admin"
      ? updateAdminMutation
      : audience === "manager"
        ? updateManagerMutation
        : updateBizMutation;
  const submitBiz = useSubmitBizOffer();
  const [reviewOpen, setReviewOpen] = useState(false);
  const leaveHref =
    doneHref ??
    (audience === "admin" && offer
      ? `/admin/offers/${offer.id}`
      : audience === "manager" && offer
        ? `/biz/review/${offer.id}`
        : listHref);

  const defaults =
    audience === "admin" && mode === "create"
      ? immediateOfferWindow()
      : defaultOfferWindow();
  const formSchema =
    audience === "admin" ? adminOfferBundleFormSchema : offerBundleFormSchema;
  const [title, setTitle] = useState(offer?.title ?? "");
  const [startsAt, setStartsAt] = useState(
    offer ? toHourLocalValue(offer.starts_at) : defaults.starts_at,
  );
  const [expiresAt, setExpiresAt] = useState(
    offer ? toHourLocalValue(offer.expires_at) : defaults.expires_at,
  );
  const [items, setItems] = useState<ItemDraft[]>(() => {
    if (offer?.items?.length) {
      return offer.items.map((item, index) => ({
        key: item.id ?? `item-${index}`,
        category_ids: item.categories?.map((category) => category.id) ?? [],
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
  const ownerShopId = businessId ?? offer?.business?.id;
  const [branchIds, setBranchIds] = useState<string[]>(() => {
    const carriers = offer?.branches?.map((branch) => branch.id) ?? [];
    if (mode === "edit" && offer?.business?.id) {
      return Array.from(new Set([offer.business.id, ...carriers]));
    }
    return carriers;
  });
  const companyShopId =
    audience === "manager" || audience === "admin"
      ? ownerShopId
      : offer?.business?.id;
  const companyShops = useQuery({
    queryKey: ["company-shops", audience, companyShopId ?? "biz"],
    queryFn: () => {
      if (audience === "admin" && companyShopId) {
        return fetchAdminCompanyShops(companyShopId);
      }
      if (audience === "manager" && companyShopId) {
        return fetchManagerCompanyShops(companyShopId);
      }
      return fetchBizCompanyShops();
    },
    enabled: audience === "biz" || Boolean(companyShopId),
  });
  const seededBranches = useRef(mode !== "create");
  useEffect(() => {
    if (seededBranches.current || !companyShops.data?.length) {
      return;
    }
    seededBranches.current = true;
    setBranchIds(companyShops.data.map((shop) => shop.id));
  }, [companyShops.data]);
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

  const pending =
    createMutation.isPending || updateMutation.isPending || submitBiz.isPending;
  const sendsForApproval = audience === "biz" || (audience === "manager" && mode === "create");
  const confirmsBeforeSave = sendsForApproval || audience === "admin";
  const primaryLabel =
    audience === "admin" && mode === "create"
      ? "Publiko"
      : audience === "manager" && mode === "create"
        ? "Dërgo në pritje"
        : audience === "biz"
          ? "Dërgo për aprovim"
          : "Përditëso";
  const kindLabel = isFlyer ? "Fletushkë" : "Oferta";
  const kindTitle = isFlyer ? "Dosje e re" : "Oferta të reja";
  const allowShare =
    audience === "biz" ||
    (audience === "admin" && (mode === "edit" || canShare)) ||
    (audience === "manager" && Boolean(ownerShopId));

  const categoryOptions = useMemo(
    () =>
      categories.map((c) => ({
        value: c.id,
        label: c.name,
      })),
    [categories],
  );

  const formPayload = useMemo(() => {
    const resolvedTitle = isFlyer ? title.trim() : "Oferta individuale";

    return {
      title: resolvedTitle,
      starts_at: startsAt,
      expires_at: expiresAt,
      items: items.map(
        ({
          category_ids,
          name,
          original_price,
          discounted_price,
          discount_percent,
          gallery_image_id,
        }) => ({
          category_ids,
          name,
          original_price: original_price > 0 ? original_price : null,
          discounted_price: discounted_price > 0 ? discounted_price : null,
          discount_percent:
            discount_percent.trim() === "" ? null : Number(discount_percent),
          gallery_image_id,
        }),
      ),
      cover_gallery_image_id: isFlyer
        ? items.find((item) => item.key === coverKey)?.gallery_image_id ?? null
        : null,
      ...(allowShare && (companyShops.data?.length ?? 0) > 0
        ? { branch_ids: branchIds }
        : {}),
    };
  }, [
    allowShare,
    branchIds,
    companyShops.data?.length,
    coverKey,
    expiresAt,
    isFlyer,
    items,
    startsAt,
    title,
  ]);

  const reviewValidationError = useMemo(() => {
    for (const item of items) {
      const percent = Number(item.discount_percent);
      if (
        item.discount_percent.trim() !== "" &&
        (!Number.isFinite(percent) || percent < 1 || percent > 99)
      ) {
        return "Zbritja duhet të jetë midis 1% dhe 99%.";
      }
    }

    if (items.length < 1) {
      return "Shto të paktën një ofertë.";
    }

    const parsed = formSchema.safeParse(formPayload);

    if (!parsed.success) {
      return parsed.error.issues[0]?.message ?? "Të dhënat nuk janë të vlefshme.";
    }

    return null;
  }, [formPayload, formSchema, items]);

  const modalError = reviewValidationError ?? error;
  const submitBlocked = Boolean(reviewValidationError);

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

  async function save(thenSubmit: boolean) {
    setError(null);
    if (!thenSubmit) {
      setReviewOpen(false);
    }

    if (thenSubmit && reviewValidationError) {
      return;
    }

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

    const parsed = formSchema.safeParse(formPayload);

    if (!parsed.success) {
      setError(
        parsed.error.issues[0]?.message ?? "Të dhënat nuk janë të vlefshme.",
      );
      return;
    }

    try {
      if (mode === "create") {
        const created = await createMutation.mutateAsync(parsed.data);
        if (thenSubmit && audience === "biz") {
          await submitBiz.mutateAsync(created.id);
        }
        router.replace(
          doneHref ??
            (audience === "manager"
              ? `/biz/review/${created.id}`
              : audience === "admin"
                ? `/admin/offers/${created.id}`
                : listHref),
        );
      } else if (offer) {
        await updateMutation.mutateAsync(parsed.data);
        if (thenSubmit && audience === "biz") {
          await submitBiz.mutateAsync(offer.id);
        }
        router.replace(leaveHref);
      }
    } catch (err) {
      setError(validationMessage(err, "Nuk mundëm ta ruajmë ofertën."));
      if (thenSubmit) {
        setReviewOpen(true);
      }
    }
  }

  const micro =
    "text-xs font-bold tracking-[0.08em] text-muted uppercase";
  const locationNames =
    companyShops.data
      ?.filter((shop) => branchIds.includes(shop.id))
      .map((shop) => shop.name) ?? [];
  const iconButton =
    "inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-line bg-sunken text-ink hover:border-accent/60 disabled:cursor-wait disabled:opacity-65";

  return (
    <form
      className="flex flex-col gap-10"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        if (confirmsBeforeSave) {
          setReviewOpen(true);
          return;
        }
        void save(false);
      }}
    >
      <div className="sticky top-0 z-20 -mx-5 flex flex-wrap items-center justify-between gap-3 border-b border-line bg-canvas px-5 py-3 sm:-mx-8 sm:px-8">
        <div className="min-w-0">
          <p className={`${micro} m-0`}>{kindLabel}</p>
          <p className="m-0 truncate text-lg font-bold">
            {isFlyer ? title.trim() || kindTitle : "Oferta individuale"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className={btnGhost} type="button" disabled={pending} onClick={() => router.push(leaveHref)}>
            Anulo
          </button>
          {audience === "biz" ? (
            <button className={btnGhost} type="button" disabled={pending} onClick={() => void save(false)}>
              {pending ? "Duke u ruajtur…" : "Ruaj draft"}
            </button>
          ) : null}
          <button className={btnPrimary} type="submit" disabled={pending}>
            {pending ? "Duke u ruajtur…" : primaryLabel}
          </button>
        </div>
      </div>
      <section>
        <h2 className="m-0 text-xl font-bold tracking-[-0.03em]">
          {isFlyer ? "Fletushka" : "Ofertat"}
        </h2>
        <p className="m-0 mt-1 text-sm text-muted">
          {isFlyer
            ? "Titulli dhe periudha e kampanjës."
            : "Shto një ose më shumë oferta individuale (jo fletushkë)."}
        </p>
        {isFlyer ? (
          <label className="mt-5 flex flex-col gap-2">
            <span className={micro}>Titulli i fletushkës</span>
            <input
              className={`${inputClass} text-2xl! font-bold tracking-[-0.03em]`}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={pending}
              required
              maxLength={255}
              placeholder="p.sh. Nëntor 2026"
              aria-label="Titulli i fletushkës"
            />
          </label>
        ) : null}
        <p className={`${micro} ${isFlyer ? "mt-6" : "mt-5"} mb-3`}>Periudha</p>
        <p className="m-0 mb-3 text-sm leading-relaxed text-muted">
          {audience === "admin"
            ? "Ora vetëm me :00. Mund ta publikosh kur të duash, pa pritjen 2-orëshe."
            : `Fillimi së paku ${OFFER_START_LEAD_HOURS} orë nga tani — kohë për shqyrtim nga menaxheri ose admini. Ora vetëm me :00.`}
        </p>
        <div className="grid gap-5 md:grid-cols-2 md:gap-8">
          <label className="flex flex-col gap-2">
            <span className={micro}>Fillon</span>
            <DateTimeField
              value={startsAt}
              onChange={setStartsAt}
              disabled={pending}
              aria-label="Fillon"
              hourOnly
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className={micro}>Skadon</span>
            <DateTimeField
              value={expiresAt}
              onChange={setExpiresAt}
              disabled={pending}
              aria-label="Skadon"
              hourOnly
            />
          </label>
        </div>
      </section>

      {allowShare && (companyShops.data?.length ?? 0) > 0 ? (
        <section>
          <h2 className="m-0 text-xl font-bold tracking-[-0.03em]">Ku shfaqet</h2>
          <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
            <p className="m-0 text-sm text-muted">
              Të gjitha lokacionet janë zgjedhur. Hiqi ato që nuk duhen.
            </p>
            <button
              type="button"
              disabled={pending}
              className="cursor-pointer border-0 bg-transparent p-0 text-sm font-semibold text-ink hover:text-accent"
              onClick={() => {
                const ids = companyShops.data?.map((shop) => shop.id) ?? [];
                const allOn = ids.every((id) => branchIds.includes(id));
                setBranchIds(allOn ? [] : ids);
              }}
            >
              {companyShops.data?.every((shop) => branchIds.includes(shop.id))
                ? "Hiqi të gjitha"
                : "Zgjidhi të gjitha"}
            </button>
          </div>
          <ul className="m-0 mt-4 grid list-none gap-2 p-0 sm:grid-cols-2">
            {companyShops.data?.map((shop) => {
              const selected = branchIds.includes(shop.id);
              const place = [shop.street || shop.address, shop.city]
                .filter(Boolean)
                .join(", ");
              return (
                <li key={shop.id}>
                  <button
                    type="button"
                    aria-pressed={selected}
                    disabled={pending}
                    className={`flex w-full cursor-pointer flex-col gap-1 rounded-xl border px-4 py-3 text-left ${
                      selected ? "border-accent bg-accent/10" : "border-line bg-transparent hover:bg-sunken"
                    }`}
                    onClick={() =>
                      setBranchIds((current) =>
                        current.includes(shop.id)
                          ? current.filter((id) => id !== shop.id)
                          : [...current, shop.id],
                      )
                    }
                  >
                    <span className="text-xs font-bold tracking-[0.08em] text-muted uppercase">
                      {shop.id === ownerShopId
                        ? "Aktual"
                        : shop.parent_id
                          ? "Degë"
                          : "Dyqan"}
                    </span>
                    <span className="font-semibold">{shop.name}</span>
                    <span className="text-sm text-muted">{place || "Pa adresë"}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      <section>
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <h2 className="m-0 text-xl font-bold tracking-[-0.03em]">
            {isFlyer ? "Produktet" : "Ofertat"}
          </h2>
          <p className="m-0 text-sm font-semibold text-muted tabular-nums">
            {items.length}{" "}
            {isFlyer
              ? items.length === 1
                ? "produkt"
                : "produkte"
              : items.length === 1
                ? "ofertë"
                : "oferta"}
          </p>
        </div>

        {isFlyer ? (
          <div className="mb-4 rounded-2xl border border-line p-4">
            <p className="m-0 text-sm font-semibold">Foto e fletushkës</p>
            <p className="m-0 mt-1 text-sm text-muted">
              Opsionale. Zgjidh foton e një produkti. Pa të, fletushka del pa foto.
            </p>
            {items.some((item) => item.thumb_url) ? (
              <ul className="m-0 mt-3 flex list-none flex-wrap gap-3 p-0">
                {items.map((item) =>
                  item.thumb_url ? (
                    <li key={item.key}>
                      <button
                        type="button"
                        aria-pressed={coverKey === item.key}
                        disabled={pending}
                        className={`flex w-28 cursor-pointer flex-col gap-2 rounded-xl border p-2 text-left ${
                          coverKey === item.key
                            ? "border-accent bg-accent/10"
                            : "border-line bg-transparent hover:bg-sunken"
                        }`}
                        onClick={() =>
                          setCoverKey((current) => (current === item.key ? null : item.key))
                        }
                      >
                        <span className="relative block aspect-square overflow-hidden rounded-lg">
                          <Image
                            src={item.thumb_url}
                            alt=""
                            fill
                            unoptimized
                            className="object-cover"
                            sizes="112px"
                          />
                        </span>
                        <span className="truncate text-xs font-bold">
                          {coverKey === item.key ? "E zgjedhur" : item.name || "Produkt"}
                        </span>
                      </button>
                    </li>
                  ) : null,
                )}
              </ul>
            ) : (
              <p className="m-0 mt-3 text-sm text-muted">
                Shto një foto te një produkt më poshtë, pastaj zgjidhe këtu.
              </p>
            )}
          </div>
        ) : null}

        <div className="grid gap-3">
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
                className={`rounded-2xl border px-4 py-4 ${
                  isFlyer && coverKey === item.key ? "border-accent" : "border-line"
                }`}
              >
                <div className="flex items-stretch gap-4">
                  <ItemPhoto
                    name={item.name}
                    thumbUrl={item.thumb_url}
                    selectedId={item.gallery_image_id}
                    businessId={
                      audience === "biz" ? undefined : (businessId ?? offer?.business?.id)
                    }
                    gallery={audience === "manager" ? "manager" : audience === "admin" ? "admin" : "biz"}
                    disabled={pending}
                    onPick={(image) => {
                      // Business + ZbritjaSot gallery: seed product name from image title (still editable).
                      const imageTitle = image.title?.trim();
                      patchItem(item.key, {
                        gallery_image_id: image.id,
                        thumb_url: image.thumb_url,
                        ...(imageTitle ? { name: imageTitle } : {}),
                      });
                      if (isFlyer) {
                        setCoverKey((current) => current ?? item.key);
                      }
                    }}
                    onClear={() => {
                      patchItem(item.key, {
                        gallery_image_id: null,
                        thumb_url: null,
                      });
                      if (isFlyer) {
                        setCoverKey((current) =>
                          current === item.key ? null : current,
                        );
                      }
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
                          value=""
                          onChange={(value) => {
                            if (!value || item.category_ids.includes(value)) {
                              return;
                            }
                            patchItem(item.key, {
                              category_ids: [...item.category_ids, value],
                            });
                          }}
                          options={categoryOptions.filter(
                            (option) => !item.category_ids.includes(option.value),
                          )}
                          searchable
                          placeholder={
                            item.category_ids.length > 0
                              ? "Shto kategori"
                              : "Kategoria"
                          }
                          disabled={pending || categoriesLoading}
                          aria-label={`Kategoritë e produktit ${index + 1}`}
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
                    {item.category_ids.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {item.category_ids.map((id) => (
                          <button
                            key={id}
                            type="button"
                            className="inline-flex items-center gap-1 rounded-full border border-line bg-elevated px-2.5 py-1 text-sm font-semibold text-ink"
                            disabled={pending}
                            onClick={() =>
                              patchItem(item.key, {
                                category_ids: item.category_ids.filter(
                                  (current) => current !== id,
                                ),
                              })
                            }
                          >
                            {categoryOptions.find((option) => option.value === id)
                              ?.label ?? "Kategori"}
                            <span aria-hidden>×</span>
                            <span className="sr-only">Hiq kategorinë</span>
                          </button>
                        ))}
                      </div>
                    ) : null}

                    <div className="grid items-end gap-3 sm:grid-cols-3">
                      <label className="flex min-w-0 flex-col gap-1.5">
                        <span className={micro}>Çmimi i vjetër</span>
                        <PosMoneyField
                          valueCents={item.original_price}
                          onChangeCents={(cents) =>
                            onOriginalChange(item.key, cents)
                          }
                          disabled={pending}
                          aria-label={`Çmimi origjinal i produktit ${index + 1}`}
                        />
                      </label>
                      <label className="flex min-w-0 flex-col gap-1.5">
                        <span className={micro}>Zbritja %</span>
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
                          <span aria-hidden="true" className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm font-bold text-muted">
                            %
                          </span>
                        </div>
                      </label>
                      <label className="flex min-w-0 flex-col gap-1.5">
                        <span className={micro}>Çmimi i ri</span>
                        <div className={hasDeal ? "[&_input]:text-accent!" : ""}>
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
                    {hasDeal ? (
                      <p className="m-0 text-sm font-semibold text-accent">
                        {formatEurFromCents(item.original_price)} − {percent}% = {formatEurFromCents(item.discounted_price)}
                      </p>
                    ) : null}
                  </div>
                </div>

              </div>
            );
          })}

          <button
            type="button"
            className="flex w-full cursor-pointer items-center gap-2 rounded-2xl border border-dashed border-line bg-transparent px-4 py-3 text-sm font-semibold text-muted hover:bg-sunken hover:text-ink disabled:cursor-wait disabled:opacity-65"
            disabled={pending}
            onClick={addItem}
          >
            <AddOutlinedIcon fontSize="small" />
            {isFlyer ? "Shto produkt" : "Shto ofertë"}
          </button>
        </div>
      </section>

      {error && !reviewOpen ? (
        <p className={fieldError} role="alert">
          {error}
        </p>
      ) : null}

      <Modal
        open={reviewOpen}
        title={isFlyer ? title.trim() || "Fletushka" : "Oferta individuale"}
        size="lg"
        onClose={() => {
          if (!pending) {
            setReviewOpen(false);
            setError(null);
          }
        }}
        footer={
          <>
            <button
              className={btnGhost}
              type="button"
              disabled={pending}
              onClick={() => {
                setReviewOpen(false);
                setError(null);
              }}
            >
              Kthehu dhe ndrysho
            </button>
            <button
              className={btnPrimary}
              type="button"
              disabled={pending || submitBlocked}
              onClick={() => void save(audience === "biz")}
            >
              {pending ? "Duke u ruajtur…" : primaryLabel}
            </button>
          </>
        }
      >
        {audience === "admin" ? (
          <p className="m-0 mb-3 text-sm leading-relaxed text-muted">
            {mode === "create"
              ? "Ruhet e aprovuar menjëherë. Nuk kalon në pritje."
              : "Ndryshimet ruhen pa e kthyer dosjen në pritje."}
          </p>
        ) : null}
        {modalError ? (
          <p className={`${fieldError} mb-4`} role="alert">
            {modalError}
          </p>
        ) : null}
        <p className="m-0 text-sm text-muted">
          {formatDateShortSq(startsAt)} → {formatDateShortSq(expiresAt)}
          {locationNames.length > 0 ? ` · ${locationNames.join(", ")}` : ""}
        </p>
        <ul className="m-0 mt-4 list-none p-0">
          {items.map((item) => (
            <li key={item.key} className="flex items-center gap-3 border-t border-line py-3">
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold">{item.name || "Pa emër"}</span>
                <span className="block text-sm text-muted">
                  {item.discount_percent ? `${item.discount_percent}%` : "Pa përqindje"}
                  {item.discounted_price > 0 ? ` · ${formatEurFromCents(item.discounted_price)}` : ""}
                </span>
              </span>
              {item.original_price > 0 ? (
                <span className="text-sm text-muted line-through tabular-nums">
                  {formatEurFromCents(item.original_price)}
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      </Modal>
    </form>
  );
}
