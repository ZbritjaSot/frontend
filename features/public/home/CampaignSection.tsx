"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchPublicFolder } from "@/features/offers/api";
import { CampaignPoster } from "@/features/public/CampaignPoster";
import { Frame, SeeAll, SectionHeading } from "@/features/public/Frame";
import { discountSegments } from "@/features/public/price";
import type { PublicFolder } from "@/types";

export function CampaignSection({
  folders,
  title = "Fletushkat",
}: {
  folders: PublicFolder[];
  title?: string;
}) {
  const lead = folders[0] as PublicFolder | undefined;

  // Homepage's flyer list doesn't eager-load `items` (only the aggregate
  // `lead_discount_percent`), so the lead flyer's own per-item discount
  // bands are fetched separately here. Bounded to this one flyer; every
  // other flyer on the homepage is untouched and keeps rendering from the
  // list payload alone.
  const { data: leadFolder } = useQuery({
    queryKey: ["public-folder", lead?.id],
    queryFn: () => fetchPublicFolder(lead!.id),
    enabled: Boolean(lead),
  });

  // `discountSegments` now picks randomly (see its own doc comment) —
  // memoized on the actual fetched folder so the colors don't reshuffle on
  // every unrelated re-render, only when the data itself changes. Computed
  // unconditionally (ahead of the `folders.length` early return below) to
  // keep this hook call order stable across renders.
  const segments = useMemo(
    () => (leadFolder ? discountSegments(leadFolder.items) : []),
    [leadFolder],
  );

  if (folders.length === 0) {
    return null;
  }

  return (
    <Frame className="pt-10 pb-12 sm:pt-12 sm:pb-16">
      <SectionHeading title={title} action={<SeeAll href="/fletushka">Shiko të gjitha</SeeAll>} />
      <CampaignPoster
        folder={folders[0]}
        layout="editorial"
        eager
        discountSegments={segments}
      />
      {folders.length > 1 ? (
        <ul className="m-0 mt-3 grid list-none grid-cols-1 gap-3 p-0 md:grid-cols-2">
          {folders.slice(1).map((folder) => (
            <li key={folder.id} className="min-w-0">
              <CampaignPoster folder={folder} layout="shelf" />
            </li>
          ))}
        </ul>
      ) : null}
    </Frame>
  );
}
