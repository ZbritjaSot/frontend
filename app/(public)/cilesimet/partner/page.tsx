import type { Metadata } from "next";
import Link from "next/link";
import { Band } from "@/features/public/Frame";
import { display, kicker } from "@/features/public/tone";
import { btnPrimary } from "@/lib/ui";
import { publicPageMetadata } from "@/lib/metadata";
import { SITE_EMAIL } from "@/lib/site";

export const metadata: Metadata = publicPageMetadata({
  title: "Bëhu Partner",
  description: "Bashkohu me ZbritjaSot dhe trego zbritjet e dyqanit tënd.",
  path: "/cilesimet/partner",
});

export default function PartnerPage() {
  return (
    <Band className="pt-8 pb-16">
      <p className={kicker}>Cilësimet</p>
      <h1 className={`m-0 mt-2 text-[clamp(2.4rem,6vw,4rem)] ${display}`}>Bëhu Partner</h1>
      <p className="mt-4 mb-0 max-w-xl text-base leading-relaxed text-muted">
        Ke një dyqan në Kosovë? Bashkohu me ZbritjaSot që klientët të gjejnë zbritjet e tua.
      </p>
      <p className="mt-4 mb-0 max-w-xl text-base leading-relaxed text-muted">
        Shkruaji ekipit për t’u bërë partner:
      </p>
      <a
        href={`mailto:${SITE_EMAIL}?subject=${encodeURIComponent("Aplikim për partneritet — ZbritjaSot")}`}
        className={`${btnPrimary} mt-6`}
      >
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
