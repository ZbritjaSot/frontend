"use client";

import { useEffect } from "react";

/**
 * Warn before closing or refreshing the tab while work is in flight.
 * In-app navigation stays in the same tab, so the current fetch loop can finish.
 */
export function useLeaveGuard(active: boolean) {
  useEffect(() => {
    if (!active) {
      return;
    }

    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [active]);
}
