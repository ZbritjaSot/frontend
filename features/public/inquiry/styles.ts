/** Shared inquiry form classes — Kontakt & Partner. Keep within public design tokens. */

export const inquiryField =
  "flex flex-col gap-2";

export const inquiryLabelRow =
  "flex items-baseline justify-between gap-3";

export const inquiryLabel =
  "text-sm font-bold tracking-tight text-ink";

export const inquiryOptional =
  "text-xs font-semibold text-muted";

export const inquiryInput =
  "w-full min-h-12 appearance-none rounded-xl border border-line bg-canvas px-4 py-3 text-base font-medium text-ink outline-none transition-[border-color,box-shadow] placeholder:text-muted/70 focus:border-accent focus:ring-2 focus:ring-accent/25 disabled:cursor-wait disabled:opacity-60 dark:bg-elevated dark:border-white/10";

export const inquiryTextarea =
  `${inquiryInput} min-h-36 resize-y leading-relaxed`;

export const inquiryError =
  "m-0 rounded-xl border border-danger/25 bg-danger-soft/40 px-3.5 py-3 text-sm font-semibold text-danger dark:bg-danger-soft/15";

export const inquirySubmit =
  "inline-flex min-h-12 w-full cursor-pointer items-center justify-center rounded-xl border-0 bg-accent px-5 text-base font-extrabold tracking-tight text-charcoal transition-[filter,transform] duration-150 hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:scale-[0.99] disabled:cursor-wait disabled:opacity-65 sm:w-auto sm:min-w-[11rem]";

export const inquiryForm =
  "grid gap-5";

export const inquiryPanel =
  "rounded-2xl border border-line bg-elevated p-5 sm:p-7 dark:border-white/10 dark:bg-[#1a2420]";

export const inquiryBack =
  "inline-flex items-center gap-1.5 text-sm font-bold text-muted underline-offset-4 transition-colors hover:text-ink hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent";
