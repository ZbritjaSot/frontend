import Link from "next/link";
import type { ReactNode } from "react";

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

export function Band({
  children,
  tone = "canvas",
  className,
}: {
  children: ReactNode;
  tone?: "canvas" | "wash";
  className?: string;
}) {
  return (
    <section className={tone === "wash" ? "bg-sunken dark:bg-[#101614]" : ""}>
      <Frame className={`py-14 sm:py-16 ${className ?? ""}`}>{children}</Frame>
    </section>
  );
}

export function SectionHeading({
  kicker,
  title,
  action,
}: {
  kicker: string;
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-8 flex items-end justify-between gap-4">
      <div className="min-w-0">
        <p className="m-0 text-[0.7rem] font-bold tracking-[0.18em] text-muted uppercase">
          {kicker}
        </p>
        <h2 className="m-0 mt-2 text-[clamp(1.65rem,3vw,2.35rem)] leading-none font-extrabold tracking-[-0.04em]">
          {title}
        </h2>
      </div>
      {action}
    </div>
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
      className="-mx-5 flex snap-x snap-proximity gap-4 overflow-x-auto px-5 pb-2 [scrollbar-width:none] sm:-mx-8 sm:px-8 [&::-webkit-scrollbar]:hidden"
      aria-label={label}
    >
      {children}
    </div>
  );
}

export function BackLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="text-sm font-semibold text-muted hover:text-ink"
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
        <Link href={hrefFor(page - 1)} className="text-ink underline-offset-4 hover:underline">
          Prapa
        </Link>
      ) : (
        <span />
      )}
      <span className="text-muted tabular-nums">
        {page} / {lastPage}
      </span>
      {page < lastPage ? (
        <Link href={hrefFor(page + 1)} className="text-ink underline-offset-4 hover:underline">
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
}: {
  title: string;
  body: string;
}) {
  return (
    <div className="max-w-xl py-6" role="status">
      <p className="m-0 text-[0.7rem] font-bold tracking-[0.18em] text-muted uppercase">
        ZbritjaSot
      </p>
      <h2 className="m-0 mt-3 text-[clamp(1.8rem,4vw,2.6rem)] leading-[1.05] font-extrabold tracking-[-0.04em]">
        {title}
      </h2>
      <p className="mt-4 mb-0 text-base leading-relaxed text-muted">{body}</p>
    </div>
  );
}
