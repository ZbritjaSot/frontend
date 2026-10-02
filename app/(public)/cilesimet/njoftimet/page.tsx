import type { Metadata } from "next";
import Link from "next/link";
import { Band } from "@/features/public/Frame";
import { display, kicker } from "@/features/public/tone";
import { publicPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = publicPageMetadata({
  title: "Njoftimet",
  description: "Cilësimet e njoftimeve në ZbritjaSot.",
  path: "/cilesimet/njoftimet",
});

export default function NotificationsPage() {
  return (
    <Band pad="page">
      <p className={kicker}>Cilësimet</p>
      <h1 className={`m-0 mt-2 text-[clamp(2.4rem,6vw,4rem)] ${display}`}>Njoftimet</h1>
      <p className="mt-4 mb-0 max-w-xl text-base leading-relaxed text-muted">
        Njoftimet nuk janë gati ende. Këtu do të mund t’i ndezësh ose fikësh kur të shtohen.
      </p>
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
