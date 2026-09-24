import Link from "next/link";
import { campaignWord, type ShopPresence } from "@/features/public/compose";
import { Frame } from "@/features/public/Frame";
import { ShopLogo } from "@/features/public/visuals";

export function ShopDirectory({ shops }: { shops: ShopPresence[] }) {
  if (shops.length === 0) {
    return null;
  }

  return (
    <Frame className="pt-12 pb-16 sm:pt-16">
      <h2 className="m-0 border-t border-line pt-8 text-sm font-semibold text-muted">
        Dyqanet
      </h2>
      <ul className="m-0 mt-2 grid list-none p-0 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-10">
        {shops.map((shop) => (
          <li key={shop.business.id} className="border-b border-line">
            <Link
              href={`/biznese/${shop.business.id}`}
              className="group -mx-2 flex items-center gap-4 rounded-lg px-2 py-4 hover:bg-hover"
            >
              <ShopLogo
                name={shop.business.name}
                logoUrl={shop.business.logo_url}
                size="sm"
              />
              <span className="min-w-0">
                <span className="block truncate text-lg leading-tight font-extrabold tracking-tight">
                  {shop.business.name}
                </span>
                <span className="mt-0.5 block truncate text-sm text-muted">
                  {shop.business.city ??
                    `${shop.campaigns} ${campaignWord(shop.campaigns)}`}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Frame>
  );
}
