import Link from "next/link";
import { browsePath } from "@/lib/browse";
import type { PublicFolder, PublicOffer } from "@/types";

export type Crumb = {
  label: string;
  href?: string;
};

/**
 * Public standalone batches are not flyers and have no `/dosje` page.
 * TODO: Revisit how individual offers are associated with bundles and handle this more robustly.
 */
const STANDALONE_BUNDLE_TITLE = "Oferta individuale";

export function isPublicFlyerBundle<T extends { title: string }>(
  bundle: T | null | undefined,
): bundle is T {
  return bundle != null && bundle.title !== STANDALONE_BUNDLE_TITLE;
}

function categoryCrumb(offer: Pick<PublicOffer, "categories">): Crumb | null {
  const category = offer.categories?.find(
    (item) => item.name.trim() !== "" && item.slug.trim() !== "",
  );
  if (!category) {
    return null;
  }
  return {
    label: category.name,
    href: browsePath("/oferta", { category: category.slug }),
  };
}

/**
 * Ofertat › {category} › {flyer} › {name}.
 * Category and flyer are omitted when the offer has none. A trail is one
 * path, so only the first usable category is a crumb; the rest stay on the offer.
 */
export function offerCrumbs(
  offer: Pick<PublicOffer, "name" | "categories" | "bundle">,
): Crumb[] {
  const crumbs: Crumb[] = [{ label: "Ofertat", href: "/oferta" }];
  const category = categoryCrumb(offer);
  if (category) {
    crumbs.push(category);
  }
  if (isPublicFlyerBundle(offer.bundle)) {
    crumbs.push({
      label: offer.bundle.title,
      href: `/dosje/${offer.bundle.id}`,
    });
  }
  crumbs.push({ label: offer.name });
  return crumbs;
}

/** Fletushkat › {shop} › {title}. The shop crumb is omitted when the flyer has none. */
export function flyerCrumbs(folder: Pick<PublicFolder, "title" | "business">): Crumb[] {
  const crumbs: Crumb[] = [{ label: "Fletushkat", href: "/fletushka" }];
  const shop = folder.business;
  const shopName = shop?.name.trim();
  if (shop && shopName) {
    crumbs.push({
      label: shopName,
      href: `/biznese/${shop.id}`,
    });
  }
  crumbs.push({ label: folder.title });
  return crumbs;
}

const toneClass = {
  default: {
    link: "text-muted hover:text-ink",
    current: "text-ink",
    separator: "text-muted/70",
  },
  inverse: {
    link: "text-ivory/75 hover:text-ivory",
    current: "text-ivory",
    separator: "text-ivory/45",
  },
} as const;

export function Breadcrumbs({
  items,
  tone = "default",
  className,
}: {
  items: Crumb[];
  /** `inverse` is for the forest flyer hero. */
  tone?: keyof typeof toneClass;
  className?: string;
}) {
  if (items.length === 0) {
    return null;
  }

  const colors = toneClass[tone];

  return (
    <nav aria-label="Shtegu" className={className}>
      <ol className="m-0 flex min-w-0 list-none flex-wrap items-center gap-y-1 p-0 text-sm font-semibold">
        {items.map((item, index) => {
          const current = index === items.length - 1;
          const href = current ? undefined : item.href;
          return (
            <li key={`${item.href ?? "here"}-${index}`} className="flex max-w-full min-w-0 items-center">
              {index > 0 ? (
                <span aria-hidden="true" className={`px-1.5 ${colors.separator}`}>
                  ›
                </span>
              ) : null}
              {href ? (
                <Link
                  href={href}
                  className={`max-w-[11rem] truncate underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus sm:max-w-[16rem] lg:max-w-xs ${colors.link}`}
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={current ? "page" : undefined}
                  className={`min-w-0 break-words ${current ? colors.current : colors.link}`}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
