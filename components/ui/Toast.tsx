"use client";

import CloseIcon from "@mui/icons-material/Close";
import Image from "next/image";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { shopInitials } from "@/features/public/initials";
import { WASHES, washIndex } from "@/features/public/visuals";

function subscribeNoop() {
  return () => {};
}
function getClientMounted() {
  return true;
}
function getServerMounted() {
  return false;
}

/** True once mounted on the client, false during SSR and the hydration pass
 * — matching `ThemeProvider`/`useFavorites`' existing `useSyncExternalStore`
 * pattern for "this differs between server and client" state. Unlike a bare
 * `typeof document !== "undefined"` check (which is already true on the
 * client's *first*, pre-hydration render), `getServerSnapshot` keeps that
 * first pass matching the server, then React itself reconciles to the real
 * client value right after — no manual effect/setState needed. */
function useMounted(): boolean {
  return useSyncExternalStore(subscribeNoop, getClientMounted, getServerMounted);
}

type ToastTone = "success" | "error";

type ToastAction = {
  label: string;
  onClick: () => void;
};

/** Decorative leading thumbnail. `name` only drives the fallback wash/initials
 * — it is never used as alt text or announced, the toast message already
 * carries the meaning. */
type ToastThumbnail = {
  url?: string | null;
  name: string;
};

type ToastOptions = {
  tone?: ToastTone;
  /** ms before auto-dismiss. Defaults to 5s (6s for errors, so a failure
   * reason stays readable a little longer). Keep within the 4–6s window. */
  duration?: number;
  action?: ToastAction;
  thumbnail?: ToastThumbnail;
  /** When this matches an already-visible toast's key, that toast's content
   * is replaced in place (and its entry transition re-triggered) instead of
   * appending a new stacked toast. No key, or a key with no current match,
   * behaves exactly like today — append, capped at `MAX_VISIBLE_TOASTS`. */
  key?: string;
};

type ToastItem = {
  id: number;
  message: string;
  tone: ToastTone;
  duration: number;
  action?: ToastAction;
  thumbnail?: ToastThumbnail;
  key?: string;
};

type ToastContextValue = {
  showToast: (message: string, options?: ToastOptions) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const DEFAULT_DURATION = 5000;
const ERROR_DURATION = 6000;
/** Cap simultaneous toasts so a burst of rapid actions (e.g. approving
 * several offers back to back) stacks instead of growing without bound.
 * The oldest is dropped to make room — by then it has already had several
 * seconds on screen and been announced once via aria-live. */
const MAX_VISIBLE_TOASTS = 4;

let nextToastId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const mounted = useMounted();
  // Mirrors `toasts` synchronously (unlike the state above, which may not
  // re-render before the next `showToast` call) so the cap/drop decision in
  // `showToast` never depends on when React happens to run a state updater.
  const toastsRef = useRef<ToastItem[]>([]);
  // `window.setTimeout` (browser) returns a numeric handle, unlike bare
  // `setTimeout` which @types/node's ambient globals type as `NodeJS.Timeout`.
  const timers = useRef(new Map<number, number>());
  // ms left on a toast's auto-dismiss, kept so hover/focus can pause and
  // later resume for the remainder rather than restarting the full duration.
  const remaining = useRef(new Map<number, number>());
  const startedAt = useRef(new Map<number, number>());

  const clearTimer = useCallback((id: number) => {
    const timer = timers.current.get(id);
    if (timer !== undefined) {
      window.clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  /** Drops every trace of a toast's timing state — used both when a toast
   * dismisses normally and when the oldest is evicted for the `MAX_VISIBLE_TOASTS` cap. */
  const forget = useCallback(
    (id: number) => {
      clearTimer(id);
      remaining.current.delete(id);
      startedAt.current.delete(id);
    },
    [clearTimer],
  );

  const dismiss = useCallback(
    (id: number) => {
      forget(id);
      toastsRef.current = toastsRef.current.filter((toast) => toast.id !== id);
      setToasts(toastsRef.current);
    },
    [forget],
  );

  const startTimer = useCallback(
    (id: number, ms: number) => {
      startedAt.current.set(id, Date.now());
      timers.current.set(
        id,
        window.setTimeout(() => dismiss(id), ms),
      );
    },
    [dismiss],
  );

  /** A keyboard or mouse user reaching for an action/close button shouldn't
   * lose the toast mid-reach — pause the remaining time while it has focus
   * or hover, resume it on blur/leave. */
  const pause = useCallback((id: number) => {
    const timer = timers.current.get(id);
    if (timer === undefined) {
      return;
    }
    window.clearTimeout(timer);
    timers.current.delete(id);
    const started = startedAt.current.get(id) ?? Date.now();
    const left = remaining.current.get(id) ?? 0;
    remaining.current.set(id, Math.max(left - (Date.now() - started), 0));
  }, []);

  const resume = useCallback(
    (id: number) => {
      if (timers.current.has(id)) {
        return;
      }
      const left = remaining.current.get(id);
      if (left === undefined || left <= 0) {
        dismiss(id);
        return;
      }
      startTimer(id, left);
    },
    [dismiss, startTimer],
  );

  const showToast = useCallback(
    (message: string, options: ToastOptions = {}) => {
      const tone = options.tone ?? "success";
      const duration =
        options.duration ?? (tone === "error" ? ERROR_DURATION : DEFAULT_DURATION);
      const id = ++nextToastId;
      const toast: ToastItem = {
        id,
        message,
        tone,
        duration,
        action: options.action,
        thumbnail: options.thumbnail,
        key: options.key,
      };

      // A matching key on an already-visible toast replaces its content in
      // place (new id, so `ToastCard` remounts and its entry transition
      // re-plays) instead of stacking a near-duplicate toast.
      const matchIndex = options.key
        ? toastsRef.current.findIndex((item) => item.key === options.key)
        : -1;

      let next: ToastItem[];
      if (matchIndex !== -1) {
        forget(toastsRef.current[matchIndex].id);
        // Moved to the end (not updated in place): array position doubles
        // as age for the MAX_VISIBLE_TOASTS eviction below, so a refreshed
        // toast should read as the newest, not stay next in line to be
        // evicted because it happened to be the oldest before this update.
        next = [...toastsRef.current.filter((_, index) => index !== matchIndex), toast];
      } else {
        next = [...toastsRef.current, toast];
        if (next.length > MAX_VISIBLE_TOASTS) {
          const oldest = next.shift();
          if (oldest) {
            forget(oldest.id);
          }
        }
      }
      toastsRef.current = next;
      setToasts(next);

      remaining.current.set(id, duration);
      startTimer(id, duration);
    },
    [forget, startTimer],
  );

  useEffect(() => {
    const map = timers.current;
    return () => {
      map.forEach((timer) => window.clearTimeout(timer));
      map.clear();
    };
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {mounted
        ? createPortal(
            <div
              className="pointer-events-none fixed inset-x-4 bottom-4 z-[200] flex flex-col items-stretch gap-2 sm:inset-x-auto sm:right-4 sm:bottom-6 sm:items-end"
              aria-live="polite"
              aria-atomic="false"
            >
              {toasts.map((toast) => (
                <ToastCard
                  key={toast.id}
                  toast={toast}
                  onDismiss={() => dismiss(toast.id)}
                  onPause={() => pause(toast.id)}
                  onResume={() => resume(toast.id)}
                />
              ))}
            </div>,
            document.body,
          )
        : null}
    </ToastContext.Provider>
  );
}

function ToastCard({
  toast,
  onDismiss,
  onPause,
  onResume,
}: {
  toast: ToastItem;
  onDismiss: () => void;
  onPause: () => void;
  onResume: () => void;
}) {
  const [entered, setEntered] = useState(false);
  // Hover and focus are independent signals that can overlap (e.g. mouse
  // hovering while focus is also inside, from a prior Tab press) — only
  // resume once *neither* is true, so one leaving doesn't cancel the pause
  // the other is still asking for.
  const hovered = useRef(false);
  const focusedWithin = useRef(false);

  const maybeResume = useCallback(() => {
    if (!hovered.current && !focusedWithin.current) {
      onResume();
    }
  }, [onResume]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const toneShell =
    toast.tone === "error"
      ? "bg-danger-surface text-ivory [--color-focus:var(--color-lime)]"
      : "bg-forest text-ivory [--color-focus:var(--color-lime)]";
  const actionTone = toast.tone === "error" ? "text-ivory" : "text-accent";
  const hasThumbnail = toast.thumbnail != null;

  return (
    <div
      className={`pointer-events-auto flex w-full min-h-14 items-center gap-3 rounded-2xl border border-white/10 py-2 ${hasThumbnail ? "pl-2" : "pl-4"} pr-2 shadow-[0_1px_2px_var(--color-shadow),0_12px_32px_var(--color-shadow)] transition-[opacity,transform] duration-[220ms] ease-[cubic-bezier(0.215,0.61,0.355,1)] motion-reduce:transition-none sm:w-96 ${toneShell} ${
        entered ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
      }`}
      onMouseEnter={() => {
        hovered.current = true;
        onPause();
      }}
      onMouseLeave={() => {
        hovered.current = false;
        maybeResume();
      }}
      onFocusCapture={() => {
        focusedWithin.current = true;
        onPause();
      }}
      onBlurCapture={(event) => {
        // Moving focus between this card's own action/close buttons fires
        // blur then focus in the same tick — skip the pause/resume churn
        // (and the time it would (barely) subtract) when focus is staying
        // inside the card.
        if (event.currentTarget.contains(event.relatedTarget)) {
          return;
        }
        focusedWithin.current = false;
        maybeResume();
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          // Don't let this bubble to a Modal's own window-level Escape
          // listener — a toast shown while a modal is open (e.g. an error
          // toast alongside a still-open ConfirmModal) should only close
          // itself, not also close the modal underneath it.
          event.stopPropagation();
          onDismiss();
        }
      }}
    >
      {toast.thumbnail ? (
        <ToastThumb key={toast.id} url={toast.thumbnail.url} name={toast.thumbnail.name} />
      ) : null}
      <p className="m-0 flex-1 text-sm leading-5 font-semibold text-ivory">{toast.message}</p>
      {toast.action ? (
        <button
          type="button"
          // Visible label stays short ("Shiko"); the accessible name
          // includes the toast's own message so screen reader users can
          // tell stacked toasts' action buttons apart from one another.
          aria-label={`${toast.action.label}: ${toast.message}`}
          className={`h-10 shrink-0 cursor-pointer rounded-lg border-0 bg-transparent px-3 text-sm font-bold hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus ${actionTone}`}
          onClick={() => {
            toast.action?.onClick();
            onDismiss();
          }}
        >
          {toast.action.label}
        </button>
      ) : null}
      <button
        type="button"
        aria-label={`Mbyll njoftimin: ${toast.message}`}
        className="grid size-8 shrink-0 cursor-pointer place-items-center rounded-lg border-0 bg-transparent text-ivory/75 hover:bg-white/10 hover:text-ivory focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
        onClick={onDismiss}
      >
        <CloseIcon fontSize="small" />
      </button>
    </div>
  );
}

/** Decorative leading thumbnail — real photo when available, otherwise the
 * same name-hashed wash + initials `ProductVisual` uses, scaled to 40px.
 * Keyed by the toast's id (by the caller) so a new toast with a different
 * thumbnail doesn't inherit a prior one's failed-load state. */
function ToastThumb({ url, name }: { url?: string | null; name: string }) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(url) && !failed;

  return (
    <span className="relative size-10 shrink-0 overflow-hidden rounded-lg">
      {showImage ? (
        <Image
          src={url as string}
          alt=""
          fill
          unoptimized
          sizes="40px"
          loading="eager"
          className="object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <span
          aria-hidden
          className={`absolute inset-0 grid place-items-center ${WASHES[washIndex(name)]}`}
        >
          <span className="text-[13px] leading-none font-extrabold text-charcoal/25 dark:text-white/35">
            {shopInitials(name)}
          </span>
        </span>
      )}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-lg ring-1 ring-inset ring-white/10"
      />
    </span>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
}
