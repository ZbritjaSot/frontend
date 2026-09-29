import Link from "next/link";
import { CategoryGlyph } from "@/lib/categoryIcons";

export function CategoryChip({
  name,
  icon,
  href,
  active = false,
}: {
  name: string;
  icon?: string | null;
  href: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "true" : undefined}
      className="flex w-[4.75rem] shrink-0 flex-col items-center gap-1.5 px-1 py-1 no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      <span
        className={`flex size-12 items-center justify-center rounded-full ${
          active ? "bg-accent text-charcoal" : "text-muted"
        }`}
      >
        <CategoryGlyph name={icon} active={active} size={24} />
      </span>
      <span
        className={`line-clamp-2 w-full text-center text-xs leading-tight ${
          active ? "font-extrabold text-ink" : "font-semibold text-muted"
        }`}
      >
        {name}
      </span>
    </Link>
  );
}
