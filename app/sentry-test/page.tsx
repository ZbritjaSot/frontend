"use client";

import * as Sentry from "@sentry/nextjs";
import { useState } from "react";
import { button } from "@/lib/ui";

/** TEMPORARY Sentry test page (`/sentry-test`). Remove with `app/api/sentry-test` after testing. */
export default function SentryTestPage() {
  const [crash, setCrash] = useState(false);
  const [status, setStatus] = useState("");

  if (crash) {
    throw new Error("Sentry test: client render error");
  }

  return (
    <main className="mx-auto flex max-w-md flex-col gap-4 p-8">
      <h1 className="m-0 text-title-1">Sentry test</h1>
      <button
        type="button"
        className={button()}
        onClick={() => {
          Sentry.captureException(new Error("Sentry test: manual client capture"));
          setStatus("Client capture sent.");
        }}
      >
        Capture client error
      </button>
      <button type="button" className={button({ variant: "secondary" })} onClick={() => setCrash(true)}>
        Throw render error (error boundary)
      </button>
      <button
        type="button"
        className={button({ variant: "secondary" })}
        onClick={async () => {
          const res = await fetch("/api/sentry-test");
          setStatus(`Server route responded ${res.status}.`);
        }}
      >
        Trigger server error
      </button>
      {status ? <p className="m-0 text-muted">{status}</p> : null}
    </main>
  );
}
