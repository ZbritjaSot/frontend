"use client";

import { ErrorFallback } from "@/features/public/ErrorFallback";

/** Inside `(public)/layout`, so the site header and footer stay mounted. */
export default function PublicError({
  reset,
  retry,
}: {
  error: unknown;
  reset: () => void;
  /** Next 16.3+: re-fetches and re-renders (unlike `reset`, which only re-renders children). */
  retry?: () => void;
}) {
  return <ErrorFallback reset={retry ?? reset} variant="content" />;
}
