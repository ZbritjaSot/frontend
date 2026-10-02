import Link from "next/link";
import { inquiryBack, inquiryPanel } from "@/features/public/inquiry/styles";

export function InquirySuccess({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <div className={inquiryPanel} role="status">
      <p className="m-0 text-[0.7rem] font-bold tracking-[0.18em] text-accent uppercase">
        U dërgua
      </p>
      <h2 className="m-0 mt-3 text-2xl font-extrabold tracking-tight text-ink">{title}</h2>
      <p className="mt-3 mb-0 max-w-md text-base leading-relaxed text-muted">{body}</p>
      <p className="mt-6 mb-0">
        <Link href="/cilesimet" className={inquiryBack}>
          ← Kthehu te cilësimet
        </Link>
      </p>
    </div>
  );
}
