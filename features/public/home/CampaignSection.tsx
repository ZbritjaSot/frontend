import { CampaignRail } from "@/features/public/CampaignPoster";
import { Frame } from "@/features/public/Frame";
import type { PublicFolder } from "@/types";

export function CampaignSection({ folders }: { folders: PublicFolder[] }) {
  if (folders.length === 0) {
    return null;
  }

  return (
    <Frame className="pt-16 pb-4 sm:pt-20">
      <h2 className="m-0 text-[clamp(1.7rem,3vw,2.3rem)] leading-none font-extrabold tracking-[-0.04em]">
        Fletushkat
      </h2>
      <div className="mt-8">
        <CampaignRail folders={folders} />
      </div>
    </Frame>
  );
}
