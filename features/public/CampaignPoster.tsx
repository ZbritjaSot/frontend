import {
  CAMPAIGN_BANNER_IMAGE_SIZES,
  CAMPAIGN_CARD_COLUMNS,
  CAMPAIGN_CARD_IMAGE_SIZES,
  CAMPAIGN_GRID_CLASS,
} from "@/features/public/campaignGrid";
import Link from "next/link";
import { FavoriteButton } from "@/components/favorites/FavoriteButton";
import { folderCount, leadProduct, offerWord } from "@/features/public/compose";
import { flyerPhoto } from "@/features/public/flyerPhoto";
import { Rail } from "@/features/public/Frame";
import { FlyerRail } from "@/features/public/price";
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
  const photo = flyerPhoto(folder);
  const hasFlyerImage = Boolean(folder.image?.thumb_url);
  /**
   * Uploaded flyer images are 2700 × 1080 (5:2) banners. With one, every layout
   * gives the image a ~5:2 slot (stacked above the copy, or a wide column) so it
   * is not cover-cropped to a square; product-cover fallbacks keep the original
   * layouts.
   */
  const banner = hasFlyerImage;
  const coverName = hasFlyerImage ? folder.title : (folder.cover?.name ?? lead?.name ?? folder.title);
  const coverUrl = photo.thumbUrl ?? lead?.image?.thumb_url;
  const meta = `${count} ${offerWord(count)} · deri më ${formatDateShortSq(folder.expires_at)}`;
  const heartButton = (
    <FavoriteButton
      kind="flyer"
      id={folder.id}
      thumbnailUrl={coverUrl}
      thumbnailName={coverName}
    />
  );
  const heart = (
    <span className="absolute top-2 right-2 z-20 sm:top-3 sm:right-3">{heartButton}</span>
  );

  if (layout === "editorial") {
    return (
      <Link
        href={`/dosje/${folder.id}`}
        className={`group grid overflow-hidden rounded-2xl bg-forest text-ivory focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus ${
          banner
            ? "sm:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]"
            : "sm:grid-cols-[minmax(8.5rem,0.8fr)_minmax(0,1.2fr)]"
        }`}
      >
        <span
          className={`relative block [--color-focus:var(--color-lime)] ${
            banner ? "aspect-[5/2] bg-forest" : "min-h-44 bg-white sm:min-h-56"
          }`}
        >
          <ProductVisual
            fill
            eager={eager}
            fit={banner ? "cover" : "contain"}
            name={coverName}
            imageUrl={banner ? (photo.detailUrl ?? coverUrl) : coverUrl}
            sizes={banner ? "(max-width: 640px) 100vw, 760px" : "(max-width: 640px) 100vw, 420px"}
          />
          <FlyerRail folder={folder} size="md" />
          {heart}
        </span>
        <span className="flex min-w-0 flex-col justify-center gap-2 px-4 py-4 sm:px-6">
          <span className="flex min-w-0 items-center gap-2.5">
            <ShopLogo name={shop} logoUrl={folder.business?.logo_url} size="sm" />
            <span className="min-w-0 truncate text-sm font-semibold text-ivory/80 dark:text-muted">
              {shop}
            </span>
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
        className={`group grid h-full min-h-24 overflow-hidden rounded-2xl border border-line bg-elevated focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus dark:border-white/10 dark:bg-[#1a2420] ${
          banner ? "grid-cols-1 sm:grid-cols-[15rem_minmax(0,1fr)]" : "grid-cols-[10.5rem_minmax(0,1fr)]"
        }`}
      >
        <span className={`relative ${banner ? "aspect-[5/2]" : "h-full min-h-24"}`}>
          <ProductVisual
            fill
            eager={eager}
            name={coverName}
            imageUrl={coverUrl}
            sizes={banner ? "(max-width: 640px) 100vw, 240px" : "168px"}
          />
          <FlyerRail folder={folder} size="sm" />
          <span className="absolute top-1 right-1 z-20 scale-90">
            <FavoriteButton
              kind="flyer"
              id={folder.id}
              thumbnailUrl={coverUrl}
              thumbnailName={coverName}
            />
          </span>
        </span>
        <span className="flex min-w-0 flex-col justify-center gap-1.5 px-3 py-3">
          <span className="flex min-w-0 items-center gap-1.5">
            <ShopLogo name={shop} logoUrl={folder.business?.logo_url} size="xs" />
            <span className="min-w-0 truncate text-xs font-semibold text-muted">{shop}</span>
          </span>
          <span className="line-clamp-2 text-base leading-5 font-extrabold tracking-tight">
            {folder.title}
          </span>
          <span className="truncate text-xs text-muted">
            {count} {offerWord(count)} · deri më {formatDateShortSq(folder.expires_at)}
          </span>
        </span>
      </Link>
    );
  }

  if (layout === "feature") {
    return (
      <Link
        href={`/dosje/${folder.id}`}
        className={`group grid overflow-hidden rounded-2xl border border-line bg-elevated focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus dark:border-white/10 dark:bg-[#1a2420] ${
          banner ? "sm:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]" : "sm:grid-cols-2"
        }`}
      >
        <span
          className={`relative block overflow-hidden ${
            banner ? "aspect-[5/2] bg-forest" : "min-h-48 bg-white sm:h-full sm:min-h-64"
          }`}
        >
          <ProductVisual
            fill
            eager={eager}
            fit={hasFlyerImage ? "cover" : "contain"}
            name={coverName}
            imageUrl={banner ? (photo.detailUrl ?? coverUrl) : coverUrl}
            sizes={banner ? "(max-width: 640px) 100vw, 760px" : "(max-width: 1024px) 100vw, 640px"}
          />
          <FlyerRail folder={folder} size="md" />
          <span className="absolute top-4 right-4 z-20">
            <FavoriteButton
              kind="flyer"
              id={folder.id}
              size="md"
              thumbnailUrl={coverUrl}
              thumbnailName={coverName}
            />
          </span>
        </span>
        <span className="flex flex-col justify-between p-6 sm:p-8">
          <span>
            <span className="flex items-center gap-2.5">
              <ShopLogo name={shop} logoUrl={folder.business?.logo_url} size="sm" />
              <span className="truncate text-sm font-semibold text-muted">{shop}</span>
            </span>
            <span className="mt-4 line-clamp-3 block text-title-2 break-words">
              {folder.title}
            </span>
          </span>
          <span className="mt-8 block text-sm leading-relaxed text-muted">
            {count} {offerWord(count)} · {formatDateSq(folder.starts_at)} –{" "}
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
          className={`group grid h-full overflow-hidden rounded-2xl border border-line bg-elevated focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus motion-safe:transition motion-safe:duration-300 motion-safe:hover:-translate-y-0.5 dark:border-white/10 dark:bg-[#1a2420] ${
            banner ? "grid-cols-1 content-start" : `min-h-32 sm:min-h-40 ${CAMPAIGN_CARD_COLUMNS}`
          }`}
        >
          <span
            className={`relative overflow-hidden ${banner ? "aspect-[5/2]" : "h-full min-h-32 sm:min-h-40"}`}
          >
            <ProductVisual
              fill
              name={coverName}
              imageUrl={coverUrl}
              eager={eager}
              sizes={banner ? CAMPAIGN_BANNER_IMAGE_SIZES : CAMPAIGN_CARD_IMAGE_SIZES}
            />
            <FlyerRail folder={folder} size="sm" />
          </span>
          <span className="flex min-w-0 flex-col justify-center gap-1.5 p-4 sm:p-5">
            <span className="flex min-w-0 items-center gap-2.5">
              <ShopLogo name={shop} logoUrl={folder.business?.logo_url} size="sm" />
              <span className="min-w-0 truncate text-sm font-semibold text-muted">{shop}</span>
            </span>
            <span className="line-clamp-2 text-base leading-5 font-extrabold tracking-tight sm:text-lg sm:leading-6">
              {folder.title}
            </span>
            <span className="truncate text-xs text-muted sm:text-sm">{meta}</span>
            <span className="truncate text-xs font-extrabold tracking-tight sm:text-sm">
              Hap fletushkën
            </span>
          </span>
        </Link>
        <span className="absolute top-3 right-3 z-20">{heartButton}</span>
      </div>
    );
  }

  return (
    <Link
      href={`/dosje/${folder.id}`}
      className={`group flex min-h-44 w-[min(88vw,32rem)] shrink-0 snap-start overflow-hidden rounded-2xl border border-line bg-elevated focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus motion-safe:transition motion-safe:duration-300 motion-safe:hover:-translate-y-0.5 dark:border-white/10 dark:bg-[#1a2420] ${
        banner ? "flex-col-reverse" : ""
      }`}
    >
      <span className="flex min-w-0 flex-1 flex-col justify-between p-5 sm:p-6">
        <span>
          <span className="flex items-center gap-2.5">
            <ShopLogo name={shop} logoUrl={folder.business?.logo_url} size="sm" />
            <span className="truncate text-sm font-semibold text-muted">{shop}</span>
          </span>
          <span className="mt-6 line-clamp-3 block text-title-2 break-words">
            {folder.title}
          </span>
        </span>
        <span className="mt-6 block text-sm leading-relaxed text-muted">{meta}</span>
      </span>
      <span
        className={`relative shrink-0 overflow-hidden ${banner ? "aspect-[5/2] w-full" : "w-[42%] self-stretch"}`}
      >
        <ProductVisual
          fill
          name={coverName}
          imageUrl={coverUrl}
          eager={eager}
          sizes={banner ? "(max-width: 640px) 88vw, 512px" : "240px"}
        />
        <FlyerRail folder={folder} size="md" />
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
    <ul className={CAMPAIGN_GRID_CLASS}>
      {folders.map((folder) => (
        <li key={folder.id} className="min-w-0">
          <CampaignPoster folder={folder} layout="card" />
        </li>
      ))}
    </ul>
  );
}
