"use client";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Link from "next/link";
import { Spinner } from "@/components/ui/Spinner";
import { LocationForm } from "@/features/biz/LocationForm";
import { useBizBusiness } from "@/hooks/useBizProfile";
import { validationMessage } from "@/lib/api";
import { pageTitle, panelLead } from "@/lib/ui";

export function BizAddressScreen() {
  const businessQuery = useBizBusiness();

  if (businessQuery.isLoading) {
    return <Spinner label="Duke ngarkuar adresën" />;
  }

  const heading = (
    <div className="mb-8 grid grid-cols-[1.25rem_minmax(0,1fr)] items-center gap-x-1.5">
      <Link
        href="/biz/profile"
        className="col-span-2 grid grid-cols-subgrid items-center text-sm font-semibold text-muted no-underline hover:text-ink"
      >
        <ArrowBackIcon fontSize="small" />
        <span>Profili</span>
      </Link>
      <h1 className={`${pageTitle} col-start-2 mt-3 mb-0!`}>Adresa</h1>
    </div>
  );

  if (businessQuery.isError || !businessQuery.data) {
    return (
      <div>
        {heading}
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
    <div>
      {heading}
      <LocationForm key={businessQuery.data.id} business={businessQuery.data} />
    </div>
  );
}
