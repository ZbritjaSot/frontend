import Link from "next/link";
import type { ReactNode } from "react";
import { kicker } from "@/features/public/tone";
import { button } from "@/lib/ui";

export function Frame({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`mx-auto w-full max-w-7xl px-5 sm:px-8 ${className ?? ""}`}
    >
      {children}
    </div>
  );
}

/** Vertical rhythm for public page sections. Avoid overriding with conflicting pt/pb/py. */
const bandPad = {
  section: "py-14 sm:py-16",
  page: "pt-8 pb-14 sm:pb-16",
  compact: "py-8 sm:py-10",
  flush: "",
} as const;

export type BandPad = keyof typeof bandPad;

export function Band({
  children,
  tone = "canvas",
  pad = "section",
  className,
}: {
  children: ReactNode;
  tone?: "canvas" | "wash";
  /** section = default feed blocks; page = catalog/settings entry; compact = location/tool strips. */
  pad?: BandPad;
  className?: string;
}) {
  return (
    <section className={tone === "wash" ? "bg-sunken dark:bg-[#101614]" : ""}>
      <Frame className={`${bandPad[pad]} ${className ?? ""}`.trim()}>{children}</Frame>
    </section>
  );
}

export function SectionHeading({
  kicker: kickerText,
  title,
  note,
  action,
}: {
  kicker?: string;
  title: string;
  note?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-x-4 gap-y-3">
      <div className="min-w-0">
        {kickerText ? <p className={kicker}>{kickerText}</p> : null}
        <h2
          className={`m-0 text-title-2 break-words line-clamp-2 ${kickerText ? "mt-2" : ""}`}
        >
          {title}
        </h2>
        {note ? (
          <p className="mt-3 mb-0 max-w-xl text-sm leading-relaxed text-muted">{note}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

export function SeeAll({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-11 shrink-0 items-center text-sm font-extrabold tracking-tight text-ink underline-offset-4 hover:underline hover:decoration-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus"
    >
      {children}
    </Link>
  );
}

export function Rail({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <div
      className="flex snap-x snap-proximity gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      aria-label={label}
    >
      {children}
    </div>
  );
}

export function BackLink({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`text-sm font-semibold ${className ?? "text-muted hover:text-ink"}`}
    >
      {children}
    </Link>
  );
}

export function Pager({
  page,
  lastPage,
  hrefFor,
}: {
  page: number;
  lastPage: number;
  hrefFor: (page: number) => string;
}) {
  if (lastPage <= 1) {
    return null;
  }

  return (
    <nav
      className="mt-12 flex items-center justify-between gap-4 text-sm font-semibold"
      aria-label="Faqet"
    >
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} className={button({ variant: "secondary", shape: "pill" })}>
          Prapa
        </Link>
      ) : (
        <span />
      )}
      <span className="text-muted tabular-nums">
        {page} / {lastPage}
      </span>
      {page < lastPage ? (
        <Link href={hrefFor(page + 1)} className={button({ shape: "pill" })}>
          Tjetra
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}

export function EmptyNote({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="max-w-xl py-6" role="status">
      <p className={kicker}>ZbritjaSot</p>
      <h2 className="m-0 mt-3 text-title-2">{title}</h2>
      <p className="mt-4 mb-0 text-base leading-relaxed text-muted">{body}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
