import Link from "next/link";
import type { ReactNode } from "react";
import { Band } from "@/features/public/Frame";
import { inquiryBack } from "@/features/public/inquiry/styles";
import { display, kicker } from "@/features/public/tone";

export function InquiryPage({
  eyebrow = "Cilësimet",
  title,
  lead,
  aside,
  children,
}: {
  eyebrow?: string;
  title: string;
  lead: ReactNode;
  /** Optional secondary column / callouts under the lead. */
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Band pad="page">
      <div className="max-w-2xl">
        <Link href="/cilesimet" className={inquiryBack}>
          ← Cilësimet
        </Link>
        <p className={`${kicker} mt-8`}>{eyebrow}</p>
        <h1 className={`m-0 mt-2 text-[clamp(2.2rem,5.5vw,3.4rem)] ${display}`}>{title}</h1>
        <div className="mt-4 max-w-xl text-base leading-relaxed text-muted [&_p]:m-0 [&_p+p]:mt-3">
          {lead}
        </div>
        {aside ? <div className="mt-5">{aside}</div> : null}
        <div className="mt-8 sm:mt-10">{children}</div>
      </div>
    </Band>
  );
}
