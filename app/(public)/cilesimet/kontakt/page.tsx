import type { Metadata } from "next";
import Link from "next/link";
import { Band } from "@/features/public/Frame";
import { display, kicker } from "@/features/public/tone";
import { btnPrimary } from "@/lib/ui";
import { publicPageMetadata } from "@/lib/metadata";
import { SITE_EMAIL } from "@/lib/site";

export const metadata: Metadata = publicPageMetadata({
  title: "Na Kontakto",
  description: "Kontakto ekipin e ZbritjaSot.",
  path: "/cilesimet/kontakt",
});

export default function ContactPage() {
  return (
    <Band pad="page">
      <p className={kicker}>Cilësimet</p>
      <h1 className={`m-0 mt-2 text-[clamp(2.4rem,6vw,4rem)] ${display}`}>Na Kontakto</h1>
      <p className="mt-4 mb-0 max-w-xl text-base leading-relaxed text-muted">
        Për pyetje, sugjerime ose probleme me faqen, na shkruaj në email.
      </p>
      <a href={`mailto:${SITE_EMAIL}`} className={`${btnPrimary} mt-6`}>
        {SITE_EMAIL}
      </a>
      <p className="mt-8 mb-0">
        <Link
          href="/cilesimet"
          className="text-sm font-semibold text-ink underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
        >
          Kthehu te cilësimet
        </Link>
      </p>
    </Band>
  );
}
