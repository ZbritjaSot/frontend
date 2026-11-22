import Link from "next/link";
import { DiscoverForm } from "@/features/public/DiscoverForm";

const links = [
  { href: "/oferta", label: "Ofertat" },
  { href: "/fletushka", label: "Fletushkat" },
  { href: "/biznese", label: "Partnerët" },
] as const;

export function NotFoundRecovery() {
  return (
    <div className="mt-8 grid max-w-xl gap-6">
      <div role="search">
        <DiscoverForm basePath="/oferta" categories={[]} showCategories={false} catalog />
      </div>
      <nav aria-label="Lidhje të shpejta" className="flex flex-wrap gap-x-5 gap-y-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="inline-flex min-h-11 items-center text-sm font-extrabold tracking-tight text-ink underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
