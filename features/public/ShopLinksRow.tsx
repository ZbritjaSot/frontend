import { shopLinks } from "@/features/business/links";
import type { PublicBusiness } from "@/types";

export function ShopLinksRow({
  business,
  className = "",
}: {
  business: Pick<
    PublicBusiness,
    "website_url" | "instagram_url" | "facebook_url" | "whatsapp"
  >;
  className?: string;
}) {
  const links = shopLinks(business);
  if (links.length === 0) {
    return null;
  }

  return (
    <ul
      className={`m-0 flex list-none flex-wrap gap-x-4 gap-y-2 p-0 ${className}`.trim()}
    >
      {links.map((link) => (
        <li key={link.key}>
          <a
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-ink underline underline-offset-2"
          >
            {link.label}
          </a>
        </li>
      ))}
    </ul>
  );
}
