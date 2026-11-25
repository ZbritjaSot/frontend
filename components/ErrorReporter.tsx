"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

/** Reports a route error-boundary error to Sentry (a no-op while Sentry has no DSN). */
export function ErrorReporter({ error }: { error: unknown }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return null;
}
