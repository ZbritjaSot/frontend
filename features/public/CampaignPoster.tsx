import Link from "next/link";
import { folderCount, leadProduct, productWord } from "@/features/public/compose";
import { Rail } from "@/features/public/Frame";
import { ProductVisual, ShopLogo } from "@/features/public/visuals";
import { formatDateShortSq, formatDiscountPercent } from "@/lib/format";
import type { PublicFolder } from "@/types";

export function CampaignPoster({ folder }: { folder: PublicFolder }) {
  const shop = folder.business?.name ?? "Dyqan";
  const lead = leadProduct(folder);
  const count = folderCount(folder);

  return (
    <Link
      href={`/dosje/${folder.id}`}
      className="group flex w-[min(88vw,36rem)] shrink-0 snap-start overflow-hidden rounded-[1.75rem] bg-elevated ring-1 ring-line transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_var(--color-shadow)] dark:bg-[#1a2420] dark:ring-white/10"
    >
      <span className="flex min-w-0 flex-1 flex-col p-5 sm:p-6">
        <span className="flex items-center gap-2.5">
          <ShopLogo name={shop} size="sm" />
          <span className="truncate text-sm font-semibold">{shop}</span>
        </span>
        <span className="mt-8 block text-[clamp(1.7rem,3vw,2.15rem)] leading-[1.02] font-extrabold tracking-[-0.045em]">
          {folder.title}
        </span>
        <span className="mt-3 block text-sm leading-relaxed text-muted">
          {count} {productWord(count)} · deri më {formatDateShortSq(folder.expires_at)}
          {(lead?.discount_percent ?? folder.lead_discount_percent ?? 0) > 0
            ? ` · ${formatDiscountPercent(lead?.discount_percent ?? folder.lead_discount_percent ?? 0)}`
            : ""}
        </span>
        <span className="mt-5 block text-sm font-extrabold tracking-tight text-ink transition-colors group-hover:text-accent">
          Shiko produktet
        </span>
      </span>
      <span className="relative w-[34%] shrink-0 self-stretch overflow-hidden">
        <ProductVisual
          fill
          name={lead?.name ?? folder.title}
          className="transition duration-700 ease-out group-hover:scale-105"
        />
      </span>
    </Link>
  );
}

export function CampaignRail({ folders }: { folders: PublicFolder[] }) {
  if (folders.length === 0) {
    return null;
  }

  return (
    <Rail label="Fletushkat">
      {folders.map((folder) => (
        <CampaignPoster key={folder.id} folder={folder} />
      ))}
    </Rail>
  );
}
