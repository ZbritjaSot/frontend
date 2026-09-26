"use client";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Spinner } from "@/components/ui/Spinner";
import { geocodeAdminAddress, updateBusiness } from "@/features/admin/businessesApi";
import { LocationForm } from "@/features/biz/LocationForm";
import {
  adminBusinessesQueryKey,
  useAdminBusiness,
} from "@/hooks/useAdminBusinesses";
import { validationMessage } from "@/lib/api";
import { pageTitle, panelLead } from "@/lib/ui";

export function AdminBusinessAddress({ id }: { id: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const businessQuery = useAdminBusiness(id);

  const heading = (
    <div className="mb-8 grid grid-cols-[1.25rem_minmax(0,1fr)] items-center gap-x-1.5">
      <Link
        href={`/admin/businesses/${id}`}
        className="col-span-2 grid grid-cols-subgrid items-center text-sm font-semibold text-muted no-underline hover:text-ink"
      >
        <ArrowBackIcon fontSize="small" />
        <span>Profili</span>
      </Link>
      <h1 className={`${pageTitle} col-start-2 mt-3 mb-0!`}>Adresa</h1>
    </div>
  );

  if (businessQuery.isLoading) {
    return (
      <div>
        {heading}
        <Spinner label="Duke ngarkuar adresën" />
      </div>
    );
  }

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
      <LocationForm
        key={businessQuery.data.updated_at ?? businessQuery.data.id}
        business={businessQuery.data}
        applyNow
        onSave={async (input) => {
          await updateBusiness(id, input);
        }}
        onFind={geocodeAdminAddress}
        onDone={async () => {
          await queryClient.invalidateQueries({
            queryKey: adminBusinessesQueryKey,
          });
          router.push(`/admin/businesses/${id}`);
        }}
      />
    </div>
  );
}
