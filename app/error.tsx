"use client";

import { ErrorReporter } from "@/components/ErrorReporter";
import { ErrorFallback } from "@/features/public/ErrorFallback";

/** Login, admin, and biz. Public routes use `(public)/error`; root-layout failures use `global-error`. */
export default function AppError({
  error,
  reset,
  retry,
}: {
  error: unknown;
  reset: () => void;
  /** Next 16.3+: re-fetches and re-renders (unlike `reset`, which only re-renders children). */
  retry?: () => void;
}) {
  return (
    <>
      <ErrorReporter error={error} />
      <ErrorFallback reset={retry ?? reset} variant="bare" />
    </>
  );
}
