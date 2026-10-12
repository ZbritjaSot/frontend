"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { hasRole } from "@/features/auth/api";
import type { BundleCatalog } from "@/features/offers/bizApi";
import { OffersBackHeading } from "@/features/offers/EditOfferScreen";
import { OfferForm } from "@/features/offers/OfferForm";
import { useMe } from "@/hooks/useAuth";

export function BizNewOfferScreen({
  catalog = "flyers",
}: {
  catalog?: BundleCatalog;
}) {
  const router = useRouter();
  const { data: user } = useMe();
  const manager = !!user && hasRole(user, "manager");

  useEffect(() => {
    if (manager) {
      router.replace(
        catalog === "offers" ? "/biz/review/new?kind=offers" : "/biz/review/new",
      );
    }
  }, [catalog, manager, router]);

  if (!user || manager) {
    return null;
  }

  return (
    <>
      <OffersBackHeading
        catalog={catalog}
        title={catalog === "flyers" ? "Fletushkë e re" : "Oferta të reja"}
      />
      <OfferForm mode="create" catalog={catalog} />
    </>
  );
}
