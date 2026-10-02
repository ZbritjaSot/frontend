import type { Metadata } from "next";
import Link from "next/link";
import { Band } from "@/features/public/Frame";
import { inquiryBack } from "@/features/public/inquiry/styles";
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
      <div className="max-w-xl">
        <Link href="/cilesimet" className={inquiryBack}>
          ← Cilësimet
        </Link>
        <p className={`${kicker} mt-8`}>Cilësimet</p>
        <h1 className={`m-0 mt-2 text-[clamp(2.2rem,5.5vw,3.4rem)] ${display}`}>
          Njoftimet
        </h1>
        <div className="mt-8 rounded-2xl border border-line bg-elevated p-5 sm:p-6 dark:border-white/10 dark:bg-[#1a2420]">
          <p className="m-0 text-[0.7rem] font-bold tracking-[0.16em] text-muted uppercase">
            Së shpejti
          </p>
          <p className="mt-3 mb-0 text-base leading-relaxed text-ink">
            Njoftimet push nuk janë gati ende. Këtu do të mund t’i ndezësh ose
            fikësh kur të shtohen.
          </p>
        </div>
      </div>
    </Band>
  );
}
