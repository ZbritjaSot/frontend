import Link from "next/link";

const toneClass = {
  ink: "text-ink",
  pending: "text-pending",
  danger: "text-danger",
  accent: "text-accent",
} as const;

type DashboardKpiProps = {
  value: string | number;
  label: string;
  detail: string;
  tone?: keyof typeof toneClass;
  href?: string;
  active?: boolean;
  onClick?: () => void;
};

const shell =
  "flex min-w-0 flex-col gap-1 border-l border-line px-4 py-1 text-left first:border-l-0 first:pl-0";

export function DashboardKpi({
  value,
  label,
  detail,
  tone = "ink",
  href,
  active = false,
  onClick,
}: DashboardKpiProps) {
  const body = (
    <>
      <span className={`text-2xl leading-none font-bold tracking-[-0.04em] tabular-nums ${toneClass[tone]}`}>
        {value}
      </span>
      <span className="text-sm font-semibold text-ink">{label}</span>
      <span className="text-sm text-muted">{detail}</span>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={`${shell} no-underline hover:text-accent`}>
        {body}
      </Link>
    );
  }

  if (!onClick) {
    return <div className={shell}>{body}</div>;
  }

  return (
    <button
      type="button"
      aria-pressed={active}
      className={`${shell} cursor-pointer border-0 bg-transparent ${active ? "opacity-100" : "hover:opacity-80"}`}
      onClick={onClick}
    >
      {body}
    </button>
  );
}
