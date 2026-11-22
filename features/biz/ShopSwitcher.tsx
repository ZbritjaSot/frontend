"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useId, useSyncExternalStore } from "react";
import { fetchBizShops } from "@/features/branches/api";
import {
  clearActingShopId,
  readActingShopId,
  subscribeActingShop,
  writeActingShopId,
} from "@/features/biz/actingShop";
import { useBizBusiness } from "@/hooks/useBizProfile";
import { input } from "@/lib/ui";
import type { CompanyShop } from "@/types";

const labelClass = "m-0 text-[0.6875rem] font-bold tracking-[0.08em] text-muted uppercase";

function shopLabel(shop: CompanyShop): string {
  const place = shop.city || shop.village;
  return place ? `${shop.name} · ${place}` : shop.name;
}

function useStoredShopId(): string | null {
  return useSyncExternalStore(subscribeActingShop, readActingShopId, () => null);
}

/** Pure view. The switcher only ever offers ids from `shops`, the list the server returned. */
export function ActingShopView({
  shops,
  selectedId,
  onSelect,
  loading = false,
  failed = false,
}: {
  shops: CompanyShop[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  loading?: boolean;
  failed?: boolean;
}) {
  const selectId = useId();
  const current = shops.find((shop) => shop.id === selectedId) ?? null;

  if (loading) {
    return (
      <p className="m-0 text-xs text-muted" role="status">
        Duke ngarkuar dyqanet…
      </p>
    );
  }
  if (failed || shops.length === 0) {
    return (
      <p className="m-0 text-xs text-muted">
        {failed ? "Dyqanet nuk u ngarkuan." : "Nuk ka dyqane të caktuara."}
      </p>
    );
  }

  return (
    <div className="flex min-w-0 flex-col gap-1">
      <label htmlFor={selectId} className={labelClass}>
        Dyqani aktiv
      </label>
      <select
        id={selectId}
        value={current?.id ?? ""}
        onChange={(event) => {
          const next = shops.find((shop) => shop.id === event.target.value);
          if (next) {
            onSelect(next.id);
          }
        }}
        className={`${input({ size: "sm" })} cursor-pointer appearance-auto! text-base sm:text-sm`}
      >
        {current ? null : (
          <option value="" disabled>
            Zgjidh dyqanin
          </option>
        )}
        {shops.map((shop) => (
          <option key={shop.id} value={shop.id}>
            {shopLabel(shop)}
          </option>
        ))}
      </select>
    </div>
  );
}

export function ManagerShopSwitcher() {
  const queryClient = useQueryClient();
  const storedId = useStoredShopId();
  const shops = useQuery({ queryKey: ["biz", "shops"], queryFn: fetchBizShops });
  const list = shops.data;

  useEffect(() => {
    if (!list) {
      return;
    }
    // A stored id the server no longer offers would still be sent as X-Shop-Id and 404.
    if (storedId && !list.some((shop) => shop.id === storedId)) {
      clearActingShopId();
      return;
    }
    if (!storedId && list.length === 1) {
      writeActingShopId(list[0].id);
    }
  }, [list, storedId]);

  return (
    <ActingShopView
      shops={shops.data ?? []}
      selectedId={storedId}
      loading={shops.isPending}
      failed={shops.isError}
      onSelect={(id) => {
        // Same mechanism as lib/api.ts: localStorage id sent as X-Shop-Id, authorised server-side.
        writeActingShopId(id);
        void queryClient.invalidateQueries({ queryKey: ["biz"] });
        void queryClient.invalidateQueries({ queryKey: ["company-shops"] });
      }}
    />
  );
}

export function ShopReadOnly() {
  const { data, isPending } = useBizBusiness();
  const name = data?.name?.trim();

  return (
    <div className="flex min-w-0 flex-col gap-1">
      <p className={labelClass}>Dyqani aktiv</p>
      <p className="m-0 truncate text-sm font-semibold text-ink" title={name || undefined}>
        {name || (isPending ? "Duke ngarkuar…" : "—")}
      </p>
    </div>
  );
}
