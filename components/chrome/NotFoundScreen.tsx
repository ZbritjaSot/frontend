import Link from "next/link";
import { LogoMark } from "@/components/brand/LogoMark";
import { btnPrimary } from "@/lib/ui";

export function NotFoundScreen({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <section className="mx-auto flex w-full max-w-lg flex-col items-center px-2 py-16 text-center sm:py-24">
      <LogoMark size={72} />
      <p className="m-0 mt-6 text-6xl leading-none font-bold tracking-[-0.06em] sm:text-7xl">
        <span className="text-ink">4</span>
        <span className="text-accent">0</span>
        <span className="text-ink">4</span>
      </p>
      <h1 className="m-0 mt-5 text-xl font-bold tracking-[-0.02em]">{title}</h1>
      <p className="m-0 mt-3 max-w-md leading-relaxed text-muted">
        {description}
      </p>
      <Link href="/" className={`${btnPrimary} mt-8`}>
        Te ofertat
      </Link>
    </section>
  );
}
