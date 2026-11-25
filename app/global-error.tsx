"use client";

import Link from "next/link";
import { ErrorReporter } from "@/components/ErrorReporter";
import { THEME_STORAGE_KEY } from "@/lib/theme";
import { button } from "@/lib/ui";
import "./globals.css";

const themeBoot = `(function(){try{var p=location.pathname||"";var dash=p==="/login"||p==="/admin"||p.indexOf("/admin/")===0||p==="/biz"||p.indexOf("/biz/")===0;if(dash){document.documentElement.setAttribute("data-theme","dark");return;}var t=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});if(t==="dark"||t==="light"){document.documentElement.setAttribute("data-theme",t);}else{document.documentElement.setAttribute("data-theme","light");}}catch(e){document.documentElement.setAttribute("data-theme","light");}})();`;

export default function GlobalError({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  return (
    <html lang="sq" className="h-full antialiased" data-theme="light" suppressHydrationWarning>
      <head>
        <title>Diçka shkoi keq</title>
        <script dangerouslySetInnerHTML={{ __html: themeBoot }} />
      </head>
      <body className="min-h-full bg-canvas font-sans text-ink">
        <ErrorReporter error={error} />
        <main className="flex min-h-dvh flex-col items-center justify-center gap-5 p-8 text-center">
          <h1 className="m-0 text-title-1">Diçka shkoi keq</h1>
          <p className="m-0 max-w-md text-base leading-relaxed text-muted">
            Faqja nuk u ngarkua si duhet. Provo përsëri, ose kthehu te faqja kryesore.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button className={button()} type="button" onClick={() => retry()}>
              Provo përsëri
            </button>
            <Link href="/" className={button({ variant: "secondary" })}>
              Faqja kryesore
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}
