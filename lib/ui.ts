/** Shared Tailwind class strings. Colors follow the light/dark CSS variables. */

export const inputClass =
  "w-full min-h-11 appearance-none rounded-lg border border-line bg-elevated px-3.5 py-2.5 text-base font-medium text-ink outline-2 outline-offset-1 focus:border-accent/40 focus:outline-accent/55";

export const fieldLabel =
  "flex flex-col gap-1.5 text-sm font-semibold text-muted";

export const fieldError = "m-0 text-sm font-semibold text-danger";

export const btn =
  "inline-flex appearance-none items-center justify-center gap-1.5 rounded-lg border-0 px-4 py-2.5 min-h-11 text-base font-bold no-underline cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent/55 disabled:cursor-wait disabled:opacity-65";

export const btnPrimary = `${btn} bg-accent text-charcoal hover:brightness-105`;

export const btnGhost = `${btn} border border-line bg-transparent text-muted hover:border-slate/45 hover:text-ink`;

export const btnDanger = `${btn} bg-danger-soft text-[#1a0505] hover:brightness-105`;

export const iconButton =
  "inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-line bg-sunken text-ink no-underline hover:border-accent/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent/55 disabled:cursor-wait disabled:opacity-65";

export const btnSm = "min-h-10 px-3.5 py-2 text-[0.8125rem]";

export const checkInput =
  "mt-px size-5 shrink-0 cursor-pointer appearance-none rounded border-[1.5px] border-line bg-elevated bg-center bg-no-repeat bg-[length:0.75rem_0.75rem] hover:border-accent/45 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent/55 checked:border-accent checked:bg-accent checked:[background-image:var(--check)] disabled:cursor-not-allowed disabled:opacity-55";

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
  "mt-5 text-sm leading-normal text-muted [&_code]:font-mono [&_code]:text-[0.8125rem] [&_code]:text-accent";

export const triggerClass =
  "flex min-h-11 w-full cursor-pointer appearance-none items-center justify-between gap-2 rounded-lg border border-line bg-elevated px-3.5 py-2.5 text-left text-base font-medium text-ink outline-2 outline-offset-1 hover:border-accent/40 focus-visible:outline-accent/55 disabled:cursor-not-allowed disabled:opacity-55";
