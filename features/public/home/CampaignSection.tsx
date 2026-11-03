import { CampaignPoster } from "@/features/public/CampaignPoster";
import { Frame, SeeAll, SectionHeading } from "@/features/public/Frame";
import type { PublicFolder } from "@/types";

export function CampaignSection({
  folders,
  title = "Fletushkat",
}: {
  folders: PublicFolder[];
  title?: string;
}) {
  if (folders.length === 0) {
    return null;
  }

  return (
    <Frame className="pt-10 pb-12 sm:pt-12 sm:pb-16">
      <SectionHeading title={title} action={<SeeAll href="/fletushka">Shiko të gjitha</SeeAll>} />
      <CampaignPoster folder={folders[0]} layout="editorial" eager />
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
