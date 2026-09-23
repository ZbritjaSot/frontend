import type { ReactNode } from "react";
import { pageTitle } from "@/lib/ui";

export function LegalDocument({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <article className="mx-auto max-w-2xl">
      <h1 className={pageTitle}>{title}</h1>
      <div className="grid gap-6 text-sm leading-relaxed text-muted [&_h2]:m-0 [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-ink [&_p]:m-0">
        {children}
      </div>
    </article>
  );
}
