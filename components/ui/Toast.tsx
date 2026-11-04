"use client";

import CloseIcon from "@mui/icons-material/Close";
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

type ToastOptions = {
  tone?: ToastTone;
  /** ms before auto-dismiss. Defaults to 5s (6s for errors, so a failure
   * reason stays readable a little longer). Keep within the 4–6s window. */
  duration?: number;
  action?: ToastAction;
};

type ToastItem = {
  id: number;
  message: string;
  tone: ToastTone;
  duration: number;
  action?: ToastAction;
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

      const next = [...toastsRef.current, { id, message, tone, duration, action: options.action }];
      if (next.length > MAX_VISIBLE_TOASTS) {
        const oldest = next.shift();
        if (oldest) {
          forget(oldest.id);
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
      ? "border-danger/60 bg-[#3a0d0d] text-white [--color-focus:var(--color-lime)]"
      : "border-line bg-elevated text-ink";
  const actionTone = toast.tone === "error" ? "text-white" : "text-accent-fg";
  const closeTone =
    toast.tone === "error" ? "text-white/80 hover:text-white" : "text-muted hover:text-ink";

  return (
    <div
      className={`pointer-events-auto flex w-full items-start gap-3 rounded-xl border px-4 py-3 shadow-[0_12px_32px_var(--color-shadow)] transition-[opacity,transform] duration-200 motion-reduce:transition-none sm:w-96 ${toneShell} ${
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
      <p className="m-0 flex-1 text-sm leading-snug font-semibold">{toast.message}</p>
      {toast.action ? (
        <button
          type="button"
          // Visible label stays short ("Shiko", "Zhbëj"); the accessible
          // name includes the toast's own message so screen reader users
          // can tell stacked toasts' action buttons apart from one another.
          aria-label={`${toast.action.label}: ${toast.message}`}
          className={`shrink-0 cursor-pointer border-0 bg-transparent p-0 text-sm font-bold underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus ${actionTone}`}
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
        className={`-mt-0.5 -mr-0.5 shrink-0 cursor-pointer border-0 bg-transparent p-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus ${closeTone}`}
        onClick={onDismiss}
      >
        <CloseIcon fontSize="small" />
      </button>
    </div>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
}
