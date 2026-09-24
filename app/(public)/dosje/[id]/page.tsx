import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { leadProduct, productWord, withCampaign } from "@/features/public/compose";
import { BackLink, Band, EmptyNote, Frame } from "@/features/public/Frame";
import { ProductGrid } from "@/features/public/ProductPoster";
import { ProductVisual, ShopLogo } from "@/features/public/visuals";
import { fetchPublicFolder, isNotFound } from "@/features/offers/api";
import { formatDateSq, formatDiscountPercent, formatEurFromCents } from "@/lib/format";
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
    return {
      title: shop ? `${folder.title} · ${shop}` : folder.title,
      description: shop
        ? `${folder.title} nga ${shop} — ${SITE_NAME}`
        : `${folder.title} — ${SITE_NAME}`,
    };
  } catch {
    return { title: "Fletushka" };
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
  const lead = leadProduct(folder);
  const backHref = folder.business ? `/biznese/${folder.business.id}` : "/";

  return (
    <article>
      <section className="bg-sunken dark:bg-[#101614]">
        <Frame className="py-10 sm:py-16">
          <BackLink href={backHref}>
            {folder.business ? "Kthehu te dyqani" : "Kreu"}
          </BackLink>
          <div className="mt-8 grid items-start gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(220px,0.7fr)]">
            <div>
              <p className="m-0 flex items-center gap-3 text-sm font-semibold">
                <ShopLogo name={shop} size="sm" />
                {folder.business ? (
                  <Link
                    href={`/biznese/${folder.business.id}`}
                    className="underline-offset-4 hover:underline"
                  >
                    {shop}
                  </Link>
                ) : (
                  shop
                )}
              </p>
              <h1 className="m-0 mt-5 max-w-3xl text-[clamp(2.8rem,8vw,5.2rem)] leading-[0.9] font-extrabold tracking-[-0.055em]">
                {folder.title}
              </h1>
              <p className="mt-5 mb-0 max-w-xl text-lg leading-relaxed text-muted">
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
                    className="aspect-[4/5] w-full transition duration-700 group-hover:scale-[1.03]"
                  />
                </span>
                <span className="mt-3 block font-extrabold tracking-tight">
                  {lead.name}
                </span>
                <span className="mt-1 flex items-baseline gap-3">
                  <span className="text-lg font-extrabold tabular-nums dark:text-accent">
                    {formatEurFromCents(lead.discounted_price)}
                  </span>
                  {lead.discount_percent > 0 ? (
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
          <ProductGrid offers={withCampaign(folder)} />
        ) : (
          <EmptyNote
            title="Kjo fletushkë është bosh"
            body="Nuk ka produkte aktive brenda kësaj fletushke."
          />
        )}
      </Band>
    </article>
  );
}
