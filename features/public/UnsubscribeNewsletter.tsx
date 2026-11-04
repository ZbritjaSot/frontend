"use client";

import Link from "next/link";
import { useState } from "react";
import { ApiError, apiFetch } from "@/lib/api";
import { kicker } from "@/features/public/tone";
import { button } from "@/lib/ui";

type Phase = "confirm" | "done" | "invalid";

const primary = `${button({ size: "lg", shape: "pill" })} w-full`;

const secondary = `${button({ variant: "secondary", size: "lg", shape: "pill" })} w-full`;

export function UnsubscribeNewsletter({ token }: { token: string }) {
  const [phase, setPhase] = useState<Phase>(token === "" ? "invalid" : "confirm");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const onConfirm = async () => {
    setPending(true);
    setError(null);
    try {
      await apiFetch(`/newsletter/unsubscribe/${encodeURIComponent(token)}`, {
        method: "POST",
        auth: true,
      });
      setPhase("done");
    } catch (caught) {
      if (caught instanceof ApiError && caught.status === 404) {
        setPhase("invalid");
        return;
      }
      setError("Nuk mundëm të të çregjistrojmë. Provo përsëri.");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-md flex-col justify-center px-5 py-12 sm:min-h-[32rem] sm:py-20">
      <div className="rounded-2xl border border-line bg-elevated px-5 py-8 sm:px-8 sm:py-10 dark:border-white/10">
        <p className={kicker}>ZbritjaSot në inbox</p>
        {phase === "done" ? (
          <Done />
        ) : phase === "invalid" ? (
          <Invalid />
        ) : (
          <>
            <h1 className="m-0 mt-3 text-title-1">
              Po largohesh nga ZbritjaSot?
            </h1>
            <p className="mt-4 mb-0 text-base leading-relaxed text-muted">
              Nëse vazhdon, nuk do të marrësh më email me oferta, ulje dhe zbulime.
            </p>
            {error ? (
              <p className="mt-4 mb-0 text-sm font-semibold text-danger" role="alert">
                {error}
              </p>
            ) : null}
            <div className="mt-7 grid gap-2.5">
              <button
                className={primary}
                type="button"
                disabled={pending}
                aria-busy={pending}
                onClick={() => {
                  void onConfirm();
                }}
              >
                {pending ? "Duke u çregjistruar…" : "Çregjistrohu"}
              </button>
              <Link className={secondary} href="/">
                Mbaj abonimin
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Done() {
  return (
    <>
      <h1 className="m-0 mt-3 text-title-1">
        U çregjistrove.
      </h1>
      <p className="mt-4 mb-0 text-base leading-relaxed text-muted">
        Nuk do të të shkruajmë më në këtë adresë. Mund të kthehesh kur të duash.
      </p>
      <div className="mt-7">
        <Link className={primary} href="/">
          Kthehu te ZbritjaSot
        </Link>
      </div>
    </>
  );
}

function Invalid() {
  return (
    <>
      <h1 className="m-0 mt-3 text-title-1">
        Ky link nuk është i vlefshëm.
      </h1>
      <p className="mt-4 mb-0 text-base leading-relaxed text-muted">
        Nuk gjetëm një abonim me këtë link. Nëse je larguar tashmë, nuk do të marrësh email të tjera.
      </p>
      <div className="mt-7">
        <Link className={primary} href="/">
          Kthehu te ZbritjaSot
        </Link>
      </div>
    </>
  );
}
