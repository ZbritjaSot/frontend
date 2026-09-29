import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { leadProduct, productWord, withCampaign } from "@/features/public/compose";
import { display } from "@/features/public/tone";
import { BranchPlaces } from "@/features/public/BranchPlaces";
import { BackLink, Band, EmptyNote, Frame } from "@/features/public/Frame";
import { ProductGrid } from "@/features/public/ProductPoster";
import { ProductVisual, ShopLogo } from "@/features/public/visuals";
import { fetchPublicFolder, isNotFound } from "@/features/offers/api";
import { formatDateSq, formatDiscountPercent, formatEurFromCents } from "@/lib/format";
import { publicPageMetadata } from "@/lib/metadata";
import { SITE_NAME } from "@/lib/site";
import type { PublicFolder, PublicOffer } from "@/types";

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
    return publicPageMetadata({
      title: shop ? `${folder.title} · ${shop}` : folder.title,
      description: shop
        ? `${folder.title} nga ${shop}. ${SITE_NAME}`
        : `${folder.title}. ${SITE_NAME}`,
      path: `/dosje/${folder.id}`,
      image: folder.cover?.detail_url ?? folder.cover?.thumb_url,
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

  const shop = folder.business?.name ?? "Dyqan";
  const count = folder.items.length;
  const lead =
    folder.items.find((item) => item.id === folder.cover?.id) ??
    leadProduct(folder);
  const backHref = folder.business ? `/biznese/${folder.business.id}` : "/";

  return (
    <article>
      <section className="bg-forest text-ivory dark:bg-[#101614] dark:text-ink">
        <Frame className="py-10 sm:py-14">
          <BackLink
            href={backHref}
            className="text-ivory/75 hover:text-ivory dark:text-muted dark:hover:text-ink"
          >
            {folder.business ? "Kthehu te dyqani" : "Kreu"}
          </BackLink>
          <div className="mt-8 grid items-start gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(220px,0.7fr)]">
            <div>
              <p className="m-0 flex min-w-0 items-center gap-3 text-sm font-semibold">
                <ShopLogo
                  name={shop}
                  logoUrl={folder.business?.logo_url}
                  size="sm"
                />
                {folder.business ? (
                  <Link
                    href={`/biznese/${folder.business.id}`}
                    className="min-w-0 truncate underline-offset-4 hover:underline"
                  >
                    {shop}
                  </Link>
                ) : (
                  <span className="min-w-0 truncate">{shop}</span>
                )}
              </p>
              <h1 className={`m-0 mt-5 max-w-3xl text-[clamp(3rem,8vw,5.8rem)] ${display}`}>
                {folder.title}
              </h1>
              <p className="mt-5 mb-0 max-w-xl text-lg leading-relaxed text-ivory/75 dark:text-muted">
                {count} {productWord(count)} nga {shop}. Nga{" "}
                {formatDateSq(folder.starts_at)} deri më{" "}
                {formatDateSq(folder.expires_at)}.
              </p>
            </div>
            {lead ? (
              <Link href={`/offers/${lead.id}`} className="group block max-w-sm">
                <span className="relative block overflow-hidden rounded-[1.6rem]">
                  <ProductVisual
                    name={lead.name}
                    imageUrl={lead.image?.thumb_url}
                    eager
                    className="aspect-[4/5] w-full"
                  />
                </span>
                <span className="mt-3 line-clamp-2 block font-extrabold tracking-tight text-ivory dark:text-ink">
                  {lead.name}
                </span>
                <span className="mt-1 flex min-w-0 items-baseline gap-3">
                  {lead.discounted_price != null ? (
                    <span className="text-lg font-extrabold text-accent tabular-nums">
                      {formatEurFromCents(lead.discounted_price)}
                    </span>
                  ) : null}
                  {lead.discount_percent != null && lead.discount_percent > 0 ? (
                    <span className="text-sm font-bold">
                      {formatDiscountPercent(lead.discount_percent)}
                    </span>
                  ) : null}
                </span>
              </Link>
            ) : null}
          </div>
        </Frame>
      </section>

      <Band>
        <h2 className="m-0 mb-8 text-[clamp(1.7rem,3vw,2.3rem)] leading-none font-extrabold tracking-[-0.04em]">
          Produktet
        </h2>
        {count > 0 ? (
          <FlyerProducts items={withCampaign(folder)} />
        ) : (
          <EmptyNote
            title="Kjo fletushkë është bosh"
            body="Nuk ka produkte aktive brenda kësaj fletushke."
          />
        )}
        <BranchPlaces places={folder.also_at} />
      </Band>
    </article>
  );
}

function FlyerProducts({ items }: { items: PublicOffer[] }) {
  const groups = new Map<string, { id: string; name: string; items: PublicOffer[] }>();
  for (const item of items) {
    const categories = item.categories?.length
      ? item.categories
      : [{ id: "other", name: "Të tjera", slug: "" }];
    for (const category of categories) {
      const group = groups.get(category.id) ?? {
        id: category.id,
        name: category.name,
        items: [],
      };
      group.items.push(item);
      groups.set(category.id, group);
    }
  }
  const grouped = [...groups.values()];

  if (grouped.length < 2) {
    return <ProductGrid offers={items} dense={items.length > 9} />;
  }

  return (
    <div className="grid gap-14">
      {grouped.map((group) => (
        <section key={group.id}>
          <h3 className="m-0 mb-6 text-sm font-bold tracking-[0.16em] text-muted uppercase">
            {group.name}
          </h3>
          <ProductGrid offers={group.items} dense={items.length > 9} />
        </section>
      ))}
    </div>
  );
}
