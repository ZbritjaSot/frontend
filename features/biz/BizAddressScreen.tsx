"use client";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Link from "next/link";
import { Spinner } from "@/components/ui/Spinner";
import { LocationForm } from "@/features/biz/LocationForm";
import { useBizBusiness } from "@/hooks/useBizProfile";
import { validationMessage } from "@/lib/api";
import { panelLead } from "@/lib/ui";

export function BizAddressScreen() {
  const businessQuery = useBizBusiness();

  if (businessQuery.isLoading) {
    return <Spinner label="Duke ngarkuar adresën" />;
  }

  if (businessQuery.isError || !businessQuery.data) {
    return (
      <div className="max-w-[40rem]">
        <p className={panelLead}>
          {validationMessage(
            businessQuery.error,
            "Nuk mundëm ta ngarkojmë adresën.",
          )}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-[40rem]">
      <Link
        href="/biz/profile"
        className="mt-14 inline-flex items-center gap-1 text-sm font-semibold text-muted hover:text-accent"
      >
        <ArrowBackIcon fontSize="small" />
        Profili
      </Link>
      <LocationForm key={businessQuery.data.id} business={businessQuery.data} />
    </div>
  );
}
