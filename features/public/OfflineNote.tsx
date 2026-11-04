import { button } from "@/lib/ui";

export function OfflineNote({ onRetry }: { onRetry: () => void }) {
  return (
    <div role="alert" className="mt-10 flex flex-col items-center gap-3 px-4 py-8 text-center">
      <div className="flex h-36 w-44 items-center justify-center rounded-hero bg-forest">
        <svg viewBox="0 0 120 96" className="h-24 w-28" aria-hidden="true">
          <rect x="28" y="8" width="64" height="80" rx="14" fill="#f6f3ea" />
          <rect x="36" y="18" width="48" height="36" rx="8" fill="#243528" />
          <path d="M44 34h32M48 42h16" stroke="#a8ff00" strokeWidth="3" strokeLinecap="round" />
          <circle cx="86" cy="70" r="16" fill="#a8ff00" />
          <path d="M80 70h12M86 64v12" stroke="#0b0f0e" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
      </div>
      <h2 className="m-0 text-title-2">Nuk ka lidhje</h2>
      <p className="m-0 max-w-sm text-muted">Kontrollo internetin dhe provo përsëri.</p>
      <button
        type="button"
        onClick={onRetry}
        className={`${button({ shape: "pill" })} mt-1`}
      >
        Provo përsëri
      </button>
    </div>
  );
}
