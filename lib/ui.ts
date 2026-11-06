/** Shared Tailwind class strings. Colors follow the light/dark CSS variables. */

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";
type ControlShape = "rounded" | "pill";

const buttonBase =
  "inline-flex shrink-0 cursor-pointer appearance-none items-center justify-center gap-2 border text-center no-underline transition-[filter,background-color,border-color,color,transform] duration-150 motion-safe:active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-65 aria-busy:cursor-wait";

const buttonSize: Record<ControlShape, Record<ButtonSize, string>> = {
  rounded: {
    sm: "min-h-9 rounded-lg px-3 py-1.5 text-[0.8125rem] font-bold",
    md: "min-h-11 rounded-lg px-4 py-2 text-base font-bold",
    lg: "min-h-12 rounded-lg px-5 py-2.5 text-base font-bold",
  },
  pill: {
    sm: "min-h-9 rounded-full px-3.5 py-1.5 text-[0.8125rem] font-bold",
    md: "min-h-11 rounded-full px-5 py-2 text-sm font-extrabold tracking-tight",
    lg: "min-h-12 rounded-full px-6 py-2.5 text-base font-extrabold tracking-tight",
  },
};

const buttonVariant: Record<ButtonVariant, string> = {
  primary: "border-transparent bg-accent text-on-accent hover:brightness-105",
  secondary: "border-line bg-transparent text-ink hover:border-slate/45 hover:bg-hover",
  ghost: "border-transparent bg-transparent text-muted hover:bg-hover hover:text-ink",
  danger: "border-transparent bg-danger text-white hover:brightness-90 dark:text-charcoal",
};

/** Layout and size only, no colour — only for fixed-colour surfaces (the ConfirmModal danger shell). Caller supplies border/background/text colours. */
export function buttonFrame({ size = "md", shape = "rounded" }: { size?: ButtonSize; shape?: ControlShape } = {}) {
  return `${buttonBase} ${buttonSize[shape][size]}`;
}
export function button({ variant = "primary", size = "md", shape = "rounded" }: { variant?: ButtonVariant; size?: ButtonSize; shape?: ControlShape } = {}) {
  return `${buttonFrame({ size, shape })} ${buttonVariant[variant]}`;
}

type InputSize = "sm" | "md" | "lg";
const inputBase =
  "w-full min-w-0 appearance-none border text-base font-medium outline-hidden transition-[border-color,box-shadow] duration-150 focus:ring-1 disabled:cursor-not-allowed disabled:opacity-60 aria-[invalid=true]:border-danger aria-[invalid=true]:focus:border-danger aria-[invalid=true]:focus:ring-danger";
const inputTone = {
  default: "border-line bg-elevated text-ink placeholder:text-muted/70 focus:border-focus focus:ring-focus",
  inverse: "border-ivory/20 bg-black/30 text-ivory placeholder:text-ivory/40 focus:border-focus focus:ring-focus",
} as const;
const inputPad = { sm: "px-3 py-1.5", md: "px-3.5 py-2.5", lg: "px-4 py-3" } as const;
const inputMinH = { sm: "min-h-9", md: "min-h-11", lg: "min-h-12" } as const;
const inputShape = { rounded: "rounded-lg", pill: "rounded-full" } as const;

export function input({ size = "md", shape = "rounded", tone = "default", multiline = false }:
  { size?: InputSize; shape?: ControlShape; tone?: keyof typeof inputTone; multiline?: boolean } = {}) {
  return `${inputBase} ${inputTone[tone]} ${inputShape[shape]} ${inputPad[size]}${multiline ? "" : ` ${inputMinH[size]}`}`;
}

export const fieldLabel =
  "flex flex-col gap-1.5 text-sm font-semibold text-muted";

export const fieldError = "m-0 text-sm font-semibold text-danger";

export const iconButton =
  "inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-line bg-sunken text-ink no-underline hover:border-slate/45 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-65 aria-busy:cursor-wait";

export const checkInput =
  "mt-px size-5 shrink-0 cursor-pointer appearance-none rounded border-[1.5px] border-line bg-elevated bg-center bg-no-repeat bg-[length:0.75rem_0.75rem] hover:border-accent/45 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus checked:border-accent checked:bg-accent checked:[background-image:var(--check)] disabled:cursor-not-allowed disabled:opacity-55";

export const statusBadge =
  "mt-0.5 shrink-0 self-start rounded px-[0.45rem] py-0.5 text-[0.6875rem] font-bold tracking-[0.06em] text-charcoal uppercase";

const statusTone: Record<string, string> = {
  draft: "bg-sunken text-ink",
  pending: "bg-pending",
  approved: "bg-accent",
  rejected: "bg-danger-soft",
  taken_down: "bg-danger-soft",
  expired: "bg-danger-soft shadow-[inset_0_0_0_1px_var(--color-danger)]",
};

export function offerStatusClass(status: string): string {
  return `${statusBadge} ${statusTone[status] ?? "bg-muted"}`;
}

export const pageTitle =
  "m-0 mb-5 text-[clamp(1.25rem,4vw,1.5rem)] font-bold tracking-[-0.02em]";

export const panelLead = "m-0 leading-relaxed text-muted";

export const panelNote =
  "mt-5 text-sm leading-normal text-muted [&_code]:font-mono [&_code]:text-[0.8125rem] [&_code]:text-accent-fg";

export const triggerClass =
  "flex min-h-11 w-full cursor-pointer appearance-none items-center justify-between gap-2 rounded-lg border border-line bg-elevated px-3.5 py-2.5 text-left text-base font-medium text-ink outline-2 outline-offset-1 hover:border-slate/45 focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-55";
