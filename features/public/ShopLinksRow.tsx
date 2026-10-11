import { shopLinks, type ShopLink } from "@/features/business/links";
import type { PublicBusiness } from "@/types";

export function ShopLinksRow({
  business,
  layout = "row",
  className = "",
}: {
  business: Pick<
    PublicBusiness,
    "website_url" | "instagram_url" | "facebook_url" | "whatsapp"
  >;
  /** column — stacked list for the shop profile. */
  layout?: "row" | "column";
  className?: string;
}) {
  const links = shopLinks(business);
  if (links.length === 0) {
    return null;
  }

  const listClass =
    layout === "column"
      ? "m-0 flex list-none flex-col items-stretch gap-2 p-0"
      : "m-0 flex list-none flex-wrap gap-2 p-0";
  const chipClass =
    layout === "column"
      ? "inline-flex w-full items-center gap-2.5 rounded-xl border border-line bg-elevated px-3.5 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent dark:border-white/10"
      : "inline-flex items-center gap-2 rounded-full border border-line bg-elevated px-3 py-1.5 text-sm font-semibold text-ink transition-colors hover:bg-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent dark:border-white/10";

  return (
    <ul className={`${listClass} ${className}`.trim()}>
      {links.map((link) => (
        <li key={link.key}>
          <a
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className={chipClass}
          >
            <SocialIcon link={link} />
            <span>{link.label}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}

function SocialIcon({ link }: { link: ShopLink }) {
  const className = "size-4 shrink-0 fill-current";
  switch (link.key) {
    case "website":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
          <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm7.4 9h-3.1a15.4 15.4 0 0 0-1.3-5.1A8 8 0 0 1 19.4 11ZM12 4a13.5 13.5 0 0 1 1.7 6H10.3A13.5 13.5 0 0 1 12 4ZM4.6 13h3.1a15.4 15.4 0 0 0 1.3 5.1A8 8 0 0 1 4.6 13Zm3.1-2H4.6a8 8 0 0 1 4.4-5.1A15.4 15.4 0 0 0 7.7 11Zm2.6 2h3.4a13.5 13.5 0 0 1-1.7 6 13.5 13.5 0 0 1-1.7-6Zm4.7 5.1A15.4 15.4 0 0 0 16.3 13h3.1a8 8 0 0 1-4.4 5.1Z" />
        </svg>
      );
    case "instagram":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
          <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2Zm-.2 2A3.6 3.6 0 0 0 4 7.6v8.8A3.6 3.6 0 0 0 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6A3.6 3.6 0 0 0 16.4 4H7.6Zm9.65 1.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
        </svg>
      );
    case "facebook":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
          <path d="M13.5 22v-8h2.7l.4-3.1h-3.1V8.9c0-.9.3-1.5 1.6-1.5H16.7V4.6c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.4H7.3V14h2.7v8h3.5Z" />
        </svg>
      );
    case "whatsapp":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
          <path d="M12.04 2a9.9 9.9 0 0 0-8.5 14.9L2 22l5.3-1.4A9.9 9.9 0 1 0 12.04 2Zm0 1.8a8.1 8.1 0 0 1 6.9 12.3l-.3.5.2 1.1.7 2.6-2.7-.7-1-.3-.5.3a8.1 8.1 0 0 1-11.4-7.2 8.1 8.1 0 0 1 8.1-8.6Zm-2.8 3.5c-.2 0-.5 0-.7.3-.3.3-1 1-1 2.4s1 2.8 1.2 3c.2.2 2 3.1 4.9 4.2 2.4 1 2.9.8 3.4.8.5 0 1.7-.7 2-1.4.2-.7.2-1.3.2-1.4 0-.1-.2-.2-.5-.3l-1.8-.9c-.2-.1-.4 0-.6.2l-.7.9c-.1.2-.3.2-.6.1-.2-.1-1-.4-1.9-1.2-.7-.6-1.2-1.4-1.3-1.6-.2-.3 0-.4.1-.6l.5-.6c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.8-1.9c-.2-.5-.4-.5-.6-.5Z" />
        </svg>
      );
  }
}
