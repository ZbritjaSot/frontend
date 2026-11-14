import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { NavIcon } from "@/components/chrome/NavIcon";
import { SmoothScrollLink } from "@/components/ui/SmoothScrollLink";
import { FavoriteButton } from "@/components/favorites/FavoriteButton";
import { leadProduct, offerWord, withCampaign } from "@/features/public/compose";
import { flyerPhoto } from "@/features/public/flyerPhoto";
import { BranchPlaces, PlaceBranchRow } from "@/features/public/BranchPlaces";
import { Breadcrumbs, flyerCrumbs } from "@/features/public/Breadcrumbs";
import { Band, EmptyNote, Frame, SectionHeading } from "@/features/public/Frame";
import { ProductList } from "@/features/public/ProductPoster";
import { FlyerRail } from "@/features/public/price";
import { ProductVisual } from "@/features/public/visuals";
import { fetchPublicFolder, isNotFound } from "@/features/offers/api";
import { formatDateShortSq } from "@/lib/format";
import { publicPageMetadata } from "@/lib/metadata";
import { SITE_NAME } from "@/lib/site";
import type { PublicFolder } from "@/types";

type FolderPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: FolderPageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const folder = await fetchPublicFolder(id);
    const shop = folder.business?.name;
    const photo = flyerPhoto(folder);
    return publicPageMetadata({
      title: shop ? `${folder.title} · ${shop}` : folder.title,
      description: shop
        ? `${folder.title} nga ${shop}. ${SITE_NAME}`
        : `${folder.title}. ${SITE_NAME}`,
      path: `/dosje/${folder.id}`,
      image: photo.detailUrl ?? photo.thumbUrl,
    });
  } catch {
    return { title: "Fletushka", robots: { index: false, follow: false } };
  }
}

export default async function FolderPage({ params }: FolderPageProps) {
  const { id } = await params;
  let folder: PublicFolder | null = null;

  try {
    folder = await fetchPublicFolder(id);
  } catch (error) {
    if (isNotFound(error)) {
      notFound();
    }
    return (
      <Frame className="py-16">
        <EmptyNote
          title="Diçka shkoi keq"
          body="Nuk mundëm ta ngarkojmë këtë fletushkë. Provo përsëri së shpejti."
        />
      </Frame>
    );
  }

  const count = folder.items.length;
  const lead =
    folder.items.find((item) => item.id === folder.cover?.id) ??
    leadProduct(folder);
  const photo = flyerPhoto(folder);
  const coverName = folder.image?.thumb_url
    ? folder.title
    : (folder.cover?.name ?? lead?.name ?? folder.title);
  const coverUrl = photo.thumbUrl ?? lead?.image?.thumb_url;

  const hasFlyerImage = Boolean(folder.image?.thumb_url);
  const backdrop = photo.thumbUrl ?? lead?.image?.thumb_url;

  return (
    <article>
      <section className="relative isolate overflow-hidden bg-forest text-ivory [--color-focus:var(--color-lime)]">
        {backdrop ? (
          <>
            <Image
              src={backdrop}
              alt=""
              aria-hidden="true"
              fill
              unoptimized
              priority
              className="-z-20 scale-125 object-cover opacity-40 blur-3xl"
            />
            <span
              aria-hidden="true"
              className="absolute inset-0 -z-10 bg-gradient-to-b from-forest/60 via-forest/80 to-forest"
            />
          </>
        ) : null}
        <Frame className="py-8 sm:py-12">
          <div className="flex items-center justify-between gap-3">
            <Breadcrumbs
              items={flyerCrumbs(folder)}
              tone="inverse"
              className="min-w-0 flex-1"
            />
            <FavoriteButton
              kind="flyer"
              id={folder.id}
              size="md"
              className="shrink-0 ring-1 ring-ivory/20"
              thumbnailUrl={coverUrl}
              thumbnailName={coverName}
            />
          </div>
          <div className="mt-8 grid items-center gap-8 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] lg:gap-14">
            <div className="relative">
              <span
                aria-hidden="true"
                className="absolute -inset-3 -z-10 rounded-[2rem] bg-lime/15 blur-2xl"
              />
              <span
                className={`relative block aspect-[16/10] overflow-hidden rounded-hero shadow-2xl ring-1 ring-ivory/15 ${
                  hasFlyerImage ? "bg-forest" : "bg-white"
                }`}
              >
                <ProductVisual
                  fill
                  eager
                  fit={hasFlyerImage ? "cover" : "contain"}
                  name={photo.name}
                  imageUrl={photo.detailUrl ?? coverUrl}
                  sizes="(max-width: 1024px) 100vw, 720px"
                />
                <FlyerRail folder={folder} size="md" />
              </span>
            </div>
            <div className="min-w-0">
              <h1 className="m-0 max-w-3xl text-title-1 break-words line-clamp-3">
                {folder.title}
              </h1>
              <ul className="m-0 mt-5 flex list-none flex-wrap gap-2 p-0 text-sm font-semibold">
                <li className="rounded-full bg-ivory/10 px-3.5 py-1.5 ring-1 ring-ivory/15">
                  {count} {offerWord(count)}
                </li>
                <li className="rounded-full bg-lime px-3.5 py-1.5 text-charcoal">
                  {formatDateShortSq(folder.starts_at)} – {formatDateShortSq(folder.expires_at)}
                </li>
              </ul>
              {folder.business ? (
                <PlaceBranchRow
                  place={folder.business}
                  tone="onForest"
                  className="mt-5 max-w-md"
                />
              ) : null}
              {count > 0 ? (
                <SmoothScrollLink
                  targetId="ofertat"
                  className="mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-lime px-6 text-base font-extrabold text-charcoal no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
                >
                  Shiko ofertat
                  <NavIcon name="chevron-down" size={20} />
                </SmoothScrollLink>
              ) : null}
            </div>
          </div>
        </Frame>
      </section>

      <Band>
        <div id="ofertat" className="scroll-mt-20" />
        <SectionHeading title="Ofertat" />
        {count > 0 ? (
          <ProductList offers={withCampaign(folder)} />
        ) : (
          <EmptyNote
            title="Kjo fletushkë është bosh"
            body="Nuk ka oferta aktive brenda kësaj fletushke."
          />
        )}
        <BranchPlaces places={folder.also_at} className="mt-8" />
      </Band>
    </article>
  );
}
