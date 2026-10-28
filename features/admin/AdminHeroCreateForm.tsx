"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { DateTimeField } from "@/components/ui/DateTimeField";
import { PosMoneyField } from "@/components/ui/PosMoneyField";
import { ItemPhoto } from "@/features/gallery/ItemPhoto";
import { fetchAdminBusinesses } from "@/features/admin/businessesApi";
import {
  createStandaloneHeroOffer,
  type StandaloneHeroOfferInput,
} from "@/features/admin/homeCurationApi";
import { useActiveCategories } from "@/hooks/useBizOffers";
import {
  defaultOfferWindow,
  fromHourLocalValue,
  localCalendarDayKey,
  OFFER_START_LEAD_HOURS,
} from "@/lib/datetime";
import { validationMessage } from "@/lib/api";
import { btnGhost, btnPrimary, fieldError, inputClass } from "@/lib/ui";

type AdminHeroCreateFormProps = {
  onCreated: () => void;
  onCancel: () => void;
};

export function AdminHeroCreateForm({ onCreated, onCancel }: AdminHeroCreateFormProps) {
  const windowDefaults = useMemo(() => defaultOfferWindow(), []);
  const [shopSearch, setShopSearch] = useState("");
  const [shopQuery, setShopQuery] = useState("");
  const [businessId, setBusinessId] = useState("");
  const [name, setName] = useState("");
  const [startsAt, setStartsAt] = useState(windowDefaults.starts_at);
  const [expiresAt, setExpiresAt] = useState(windowDefaults.expires_at);
  const [originalPrice, setOriginalPrice] = useState(0);
  const [discountedPrice, setDiscountedPrice] = useState(0);
  const [discountPercent, setDiscountPercent] = useState("");
  const [purchaseUrl, setPurchaseUrl] = useState("");
  const [galleryImageId, setGalleryImageId] = useState<string | null>(null);
  const [thumbUrl, setThumbUrl] = useState<string | null>(null);
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [addToHero, setAddToHero] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories = useActiveCategories();
  const shops = useQuery({
    queryKey: ["admin", "businesses", "hero-create", shopQuery],
    queryFn: () => fetchAdminBusinesses(1, 12, shopQuery, "active"),
    enabled: shopQuery.trim().length >= 1,
    placeholderData: (previous) => previous,
  });

  useEffect(() => {
    const timer = window.setTimeout(() => setShopQuery(shopSearch.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [shopSearch]);

  function commitShopSearch() {
    setShopQuery(shopSearch.trim());
  }

  const selectedShop = shops.data?.data.find((shop) => shop.id === businessId);

  async function submit() {
    setError(null);
    if (!businessId) {
      setError("Zgjidh një dyqan.");
      return;
    }
    if (name.trim() === "") {
      setError("Shkruaj titullin e produktit.");
      return;
    }
    if (categoryIds.length === 0) {
      setError("Zgjidh të paktën një kategori.");
      return;
    }
    const percent = discountPercent.trim() === "" ? null : Number(discountPercent);
    const payload: StandaloneHeroOfferInput = {
      business_id: businessId,
      name: name.trim(),
      starts_at: fromHourLocalValue(startsAt),
      expires_at: fromHourLocalValue(expiresAt),
      original_price: originalPrice > 0 ? originalPrice : null,
      discounted_price: discountedPrice > 0 ? discountedPrice : null,
      discount_percent: percent != null && Number.isFinite(percent) ? percent : null,
      purchase_url: purchaseUrl.trim() === "" ? null : purchaseUrl.trim(),
      gallery_image_id: galleryImageId,
      category_ids: categoryIds,
      add_to_hero: addToHero,
    };
    setBusy(true);
    try {
      await createStandaloneHeroOffer(payload);
      onCreated();
    } catch (err) {
      setError(validationMessage(err, "Nuk mundëm ta krijojmë ofertën."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-4 rounded-2xl border border-line bg-elevated p-4">
      <div>
        <h3 className="m-0 text-base font-bold tracking-tight">Ofertë e re për Hero</h3>
        <p className="m-0 mt-1 text-sm text-muted">
          Ofertë e vetme — del te Ofertat dhe te Zbritjet e Ditës, jo si fletushkë.
        </p>
      </div>

      <label className="grid gap-1.5 text-sm font-semibold">
        Dyqani
        <input
          className={inputClass}
          value={shopSearch}
          placeholder=""
          aria-label="Kërko dyqanin"
          onChange={(event) => setShopSearch(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              commitShopSearch();
            }
          }}
        />
      </label>
      {shopQuery === "" ? (
        <p className="m-0 text-sm text-muted">Kërko për të zgjedhur dyqanin.</p>
      ) : shops.isFetching && !shops.data ? (
        <p className="m-0 text-sm text-muted">Duke kërkuar…</p>
      ) : (shops.data?.data.length ?? 0) === 0 ? (
        <p className="m-0 text-sm text-muted">Nuk u gjet asnjë dyqan.</p>
      ) : (
        <ul className="m-0 max-h-40 list-none overflow-auto p-0">
          {shops.data?.data.map((shop) => {
            const active = shop.id === businessId;
            return (
              <li key={shop.id}>
                <button
                  type="button"
                  className={`flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl border-0 px-3 py-2 text-left text-sm ${
                    active ? "bg-accent font-semibold text-on-accent" : "bg-transparent hover:bg-hover"
                  }`}
                  onClick={() => {
                    setBusinessId(shop.id);
                    setShopSearch(shop.name);
                  }}
                >
                  <span className="min-w-0 truncate">{shop.name}</span>
                  <span className={`shrink-0 text-xs ${active ? "text-on-accent/80" : "text-muted"}`}>
                    {[shop.city, shop.village].filter(Boolean).join(" · ") || "—"}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
      {selectedShop ? (
        <p className="m-0 text-xs text-muted">
          Lokacioni merret nga dyqani:{" "}
          {[selectedShop.address, selectedShop.city].filter(Boolean).join(" · ") || "pa adresë"}
        </p>
      ) : null}

      <label className="grid gap-1.5 text-sm font-semibold">
        Produkti
        <input
          className={inputClass}
          value={name}
          placeholder="p.sh. Coca Cola 1.5L"
          onChange={(event) => setName(event.target.value)}
        />
      </label>

      <p className="m-0 text-sm leading-relaxed text-muted">
        Fillimi së paku {OFFER_START_LEAD_HOURS} orë nga tani. Ora vetëm me :00.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1.5 text-sm font-semibold">
          Nga
          <DateTimeField
            value={startsAt}
            onChange={setStartsAt}
            aria-label="Nga"
            hourOnly
            minDate={localCalendarDayKey()}
          />
        </label>
        <label className="grid gap-1.5 text-sm font-semibold">
          Deri më
          <DateTimeField
            value={expiresAt}
            onChange={setExpiresAt}
            aria-label="Deri më"
            hourOnly
            minDate={localCalendarDayKey()}
          />
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <label className="grid gap-1.5 text-sm font-semibold">
          Çmimi fillestar
          <PosMoneyField
            valueCents={originalPrice}
            onChangeCents={setOriginalPrice}
            aria-label="Çmimi fillestar"
          />
        </label>
        <label className="grid gap-1.5 text-sm font-semibold">
          Çmimi me zbritje
          <PosMoneyField
            valueCents={discountedPrice}
            onChangeCents={setDiscountedPrice}
            aria-label="Çmimi me zbritje"
          />
        </label>
        <label className="grid gap-1.5 text-sm font-semibold">
          Zbritja %
          <input
            className={inputClass}
            inputMode="numeric"
            value={discountPercent}
            placeholder="p.sh. 20"
            onChange={(event) =>
              setDiscountPercent(event.target.value.replace(/\D/g, "").slice(0, 2))
            }
          />
        </label>
      </div>

      <label className="grid gap-1.5 text-sm font-semibold">
        Linku i blerjes (opsional)
        <input
          className={inputClass}
          type="url"
          inputMode="url"
          autoComplete="off"
          spellCheck={false}
          maxLength={2048}
          value={purchaseUrl}
          placeholder="https://…"
          onChange={(event) => setPurchaseUrl(event.target.value)}
        />
        <span className="font-medium text-muted">
          Nëse e plotëson, vizitori mund ta hapë te dyqani online (p.sh. Gjirafa).
        </span>
      </label>

      {businessId ? (
        <ItemPhoto
          name={name || "Produkt"}
          thumbUrl={thumbUrl}
          selectedId={galleryImageId}
          businessId={businessId}
          gallery="admin"
          onPick={(image) => {
            setGalleryImageId(image.id);
            setThumbUrl(image.thumb_url);
            const platformTitle = image.title?.trim();
            if (image.source === "platform" && platformTitle) {
              setName(platformTitle);
            }
          }}
          onClear={() => {
            setGalleryImageId(null);
            setThumbUrl(null);
          }}
        />
      ) : null}

      {(categories.data?.length ?? 0) > 0 ? (
        <fieldset className="m-0 grid gap-2 border-0 p-0">
          <legend className="text-sm font-semibold">Kategoritë</legend>
          <div className="flex flex-wrap gap-2">
            {categories.data?.map((category) => {
              const on = categoryIds.includes(category.id);
              return (
                <button
                  key={category.id}
                  type="button"
                  className={`cursor-pointer rounded-full border px-3 py-1 text-xs font-semibold ${
                    on
                      ? "border-accent bg-accent text-on-accent"
                      : "border-line bg-transparent text-muted hover:text-ink"
                  }`}
                  onClick={() =>
                    setCategoryIds((current) =>
                      on
                        ? current.filter((id) => id !== category.id)
                        : [...current, category.id],
                    )
                  }
                >
                  {category.name}
                </button>
              );
            })}
          </div>
        </fieldset>
      ) : null}

      <label className="flex items-start gap-3 text-sm font-semibold">
        <input
          type="checkbox"
          className="mt-0.5"
          checked={addToHero}
          onChange={(event) => setAddToHero(event.target.checked)}
        />
        <span>
          Shto te Zbritjet e Ditës
          <span className="mt-1 block font-medium text-muted">
            Nëse e fikësh, oferta del vetëm te Ofertat derisa ta shtosh manualisht.
          </span>
        </span>
      </label>

      {error ? (
        <p className={fieldError} role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <button type="button" className={btnPrimary} disabled={busy} onClick={() => void submit()}>
          {busy ? "Duke ruajtur…" : "Krijo ofertën"}
        </button>
        <button type="button" className={btnGhost} disabled={busy} onClick={onCancel}>
          Anulo
        </button>
      </div>
    </div>
  );
}
