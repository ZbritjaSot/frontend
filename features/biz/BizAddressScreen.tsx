"use client";

import Link from "next/link";
import { Spinner } from "@/components/ui/Spinner";
import { LocationForm } from "@/features/biz/LocationForm";
import { useBizBusiness } from "@/hooks/useBizProfile";
import { validationMessage } from "@/lib/api";

export function BizAddressScreen() {
  const businessQuery = useBizBusiness();

  if (businessQuery.isLoading) {
    return <Spinner label="Duke ngarkuar adresën" />;
  }

  if (businessQuery.isError || !businessQuery.data) {
    return (
      <div className="shell-panel">
        <p className="shell-panel__lead">
          {validationMessage(
            businessQuery.error,
            "Nuk mundëm ta ngarkojmë adresën.",
          )}
        </p>
      </div>
    );
  }

  return (
    <div className="shell-panel">
      <Link href="/biz/profile" className="offer-detail__back">
        ← Profili
      </Link>
      <LocationForm key={businessQuery.data.id} business={businessQuery.data} />
    </div>
  );
}
