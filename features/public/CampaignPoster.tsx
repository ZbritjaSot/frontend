import Link from "next/link";
import { FavoriteButton } from "@/components/favorites/FavoriteButton";
import { folderCount, leadProduct, productWord } from "@/features/public/compose";
import { Rail } from "@/features/public/Frame";
import { DiscountBadge } from "@/features/public/price";
import { ProductVisual, ShopLogo } from "@/features/public/visuals";
import { formatDateShortSq, formatDateSq } from "@/lib/format";
import type { PublicFolder } from "@/types";

export function CampaignPoster({
  folder,
  eager = false,
  layout = "rail",
}: {
  folder: PublicFolder;
  eager?: boolean;
  layout?: "rail" | "card" | "feature" | "shelf" | "editorial";
}) {
  const shop = folder.business?.name ?? "Dyqan";
  const lead = leadProduct(folder);
  const count = folderCount(folder);
  const percent = lead?.discount_percent ?? folder.lead_discount_percent ?? 0;
  const coverName = folder.cover?.name ?? lead?.name ?? folder.title;
  const coverUrl = folder.cover?.thumb_url ?? lead?.image?.thumb_url;
  const meta = `${count} ${productWord(count)} · deri më ${formatDateShortSq(folder.expires_at)}`;
  const heartButton = <FavoriteButton kind="flyer" id={folder.id} />;
  const heart = (
    <span className="absolute top-2 right-2 z-20 sm:top-3 sm:right-3">{heartButton}</span>
  );

  if (layout === "editorial") {
    return (
      <Link
        href={`/dosje/${folder.id}`}
        className="group grid overflow-hidden rounded-2xl bg-forest text-ivory focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent sm:grid-cols-[minmax(8.5rem,0.8fr)_minmax(0,1.2fr)]"
      >
        <span className="relative block min-h-36 sm:min-h-44">
          <ProductVisual
            fill
            eager={eager}
            name={coverName}
            imageUrl={coverUrl}
            sizes="(max-width: 640px) 100vw, 420px"
          />
          {percent > 0 ? <DiscountBadge percent={percent} /> : null}
          {heart}
        </span>
        <span className="flex min-w-0 flex-col justify-center gap-2 px-4 py-4 sm:px-6">
          <span className="min-w-0 truncate text-sm font-semibold text-ivory/80 dark:text-muted">
            {shop}
          </span>
          <span className="line-clamp-2 text-2xl leading-tight font-extrabold tracking-[-0.03em]">
            {folder.title}
          </span>
          <span className="truncate text-sm text-ivory/70 dark:text-muted">{meta}</span>
        </span>
      </Link>
    );
  }

  if (layout === "shelf") {
    return (
      <Link
        href={`/dosje/${folder.id}`}
        className="group grid h-full min-h-24 grid-cols-[5.75rem_minmax(0,1fr)] overflow-hidden rounded-xl border border-line bg-elevated focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent dark:border-white/10 dark:bg-[#1a2420]"
      >
        <span className="relative h-full min-h-24">
          <ProductVisual
            fill
            eager={eager}
            name={coverName}
            imageUrl={coverUrl}
            sizes="108px"
          />
          {percent > 0 ? <DiscountBadge percent={percent} size="sm" /> : null}
          <span className="absolute top-1 right-1 z-20 scale-90">
            <FavoriteButton kind="flyer" id={folder.id} />
          </span>
        </span>
        <span className="flex min-w-0 flex-col justify-center gap-1.5 px-3 py-3">
          <span className="min-w-0 truncate text-xs font-semibold text-muted">{shop}</span>
          <span className="line-clamp-2 text-base leading-5 font-extrabold tracking-tight">
            {folder.title}
          </span>
          <span className="truncate text-xs text-muted">
            {count} {productWord(count)} · deri më {formatDateShortSq(folder.expires_at)}
          </span>
        </span>
      </Link>
    );
  }

  if (layout === "feature") {
    return (
      <Link
        href={`/dosje/${folder.id}`}
        className="group grid overflow-hidden rounded-2xl border border-line bg-elevated focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent sm:grid-cols-2 dark:border-white/10 dark:bg-[#1a2420]"
      >
        <span className="relative block min-h-40 overflow-hidden sm:h-full">
          <ProductVisual
            fill
            eager={eager}
            name={coverName}
            imageUrl={coverUrl}
            sizes="(max-width: 1024px) 100vw, 640px"
          />
          {percent > 0 ? <DiscountBadge percent={percent} size="lg" /> : null}
          <span className="absolute top-4 right-4 z-20">
            <FavoriteButton kind="flyer" id={folder.id} size="md" />
          </span>
        </span>
        <span className="flex flex-col justify-between p-6 sm:p-8">
          <span>
            <span className="flex items-center gap-2.5">
              <ShopLogo name={shop} logoUrl={folder.business?.logo_url} size="sm" />
              <span className="truncate text-sm font-semibold">{shop}</span>
            </span>
            <span className="mt-4 line-clamp-3 block text-2xl leading-tight font-extrabold tracking-[-0.04em] sm:text-3xl">
              {folder.title}
            </span>
          </span>
          <span className="mt-8 block text-sm leading-relaxed text-muted">
            {count} {productWord(count)} · {formatDateSq(folder.starts_at)} –{" "}
            {formatDateSq(folder.expires_at)}
          </span>
        </span>
      </Link>
    );
  }

  if (layout === "card") {
    return (
      <div className="relative h-full min-w-0">
        <Link
          href={`/dosje/${folder.id}`}
          className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-elevated focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent motion-safe:transition motion-safe:duration-300 motion-safe:hover:-translate-y-0.5 dark:border-white/10 dark:bg-[#1a2420]"
        >
          <span className="relative block aspect-[5/4] overflow-hidden">
            <ProductVisual
              fill
              name={coverName}
              imageUrl={coverUrl}
              eager={eager}
              sizes="(max-width: 640px) 100vw, 50vw"
            />
            {percent > 0 ? <DiscountBadge percent={percent} /> : null}
          </span>
          <span className="flex flex-1 flex-col p-5">
            <span className="flex items-center gap-2.5">
              <ShopLogo name={shop} logoUrl={folder.business?.logo_url} size="sm" />
              <span className="truncate text-sm font-semibold">{shop}</span>
            </span>
            <span className="mt-3 line-clamp-2 h-12 overflow-hidden text-lg leading-6 font-extrabold tracking-tight">
              {folder.title}
            </span>
            <span className="mt-auto pt-4 text-sm leading-relaxed text-muted">{meta}</span>
            <span className="mt-3 text-sm font-extrabold tracking-tight">Hap fletushkën</span>
          </span>
        </Link>
        <span className="absolute top-3 right-3 z-20">{heartButton}</span>
      </div>
    );
  }

  return (
    <Link
      href={`/dosje/${folder.id}`}
      className="group flex min-h-44 w-[min(88vw,32rem)] shrink-0 snap-start overflow-hidden rounded-2xl border border-line bg-elevated focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent motion-safe:transition motion-safe:duration-300 motion-safe:hover:-translate-y-0.5 dark:border-white/10 dark:bg-[#1a2420]"
    >
      <span className="flex min-w-0 flex-1 flex-col justify-between p-5 sm:p-6">
        <span>
          <span className="flex items-center gap-2.5">
            <ShopLogo name={shop} logoUrl={folder.business?.logo_url} size="sm" />
            <span className="truncate text-sm font-semibold">{shop}</span>
          </span>
          <span className="mt-6 line-clamp-3 block text-[clamp(1.55rem,2.6vw,2rem)] leading-[1.02] font-extrabold tracking-[-0.045em]">
            {folder.title}
          </span>
        </span>
        <span className="mt-6 block text-sm leading-relaxed text-muted">{meta}</span>
      </span>
      <span className="relative w-[42%] shrink-0 self-stretch overflow-hidden">
        <ProductVisual fill name={coverName} imageUrl={coverUrl} eager={eager} sizes="240px" />
        {percent > 0 ? <DiscountBadge percent={percent} /> : null}
        {heart}
      </span>
    </Link>
  );
}

export function CampaignRail({
  folders,
  eager = false,
}: {
  folders: PublicFolder[];
  eager?: boolean;
}) {
  if (folders.length === 0) {
    return null;
  }

  return (
    <Rail label="Fletushkat">
      {folders.map((folder) => (
        <CampaignPoster key={folder.id} folder={folder} eager={eager} />
      ))}
    </Rail>
  );
}

export function CampaignGrid({ folders }: { folders: PublicFolder[] }) {
  if (folders.length === 0) {
    return null;
  }

  return (
    <ul className="m-0 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2">
      {folders.map((folder) => (
        <li key={folder.id} className="min-w-0">
          <CampaignPoster folder={folder} layout="card" />
        </li>
      ))}
    </ul>
  );
}
