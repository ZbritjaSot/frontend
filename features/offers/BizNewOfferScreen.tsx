"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { hasRole } from "@/features/auth/api";
import { OffersBackHeading } from "@/features/offers/EditOfferScreen";
import { OfferForm } from "@/features/offers/OfferForm";
import { useMe } from "@/hooks/useAuth";

export function BizNewOfferScreen() {
  const router = useRouter();
  const { data: user } = useMe();
  const manager = !!user && hasRole(user, "manager");

  useEffect(() => {
    if (manager) {
      router.replace("/biz/review/new");
    }
  }, [manager, router]);

  if (!user || manager) {
    return null;
  }

  return (
    <>
      <OffersBackHeading title="Dosje e re" />
      <OfferForm mode="create" />
    </>
  );
}
