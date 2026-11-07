"use client";

import { useEffect, useState } from "react";

export function useFocusInvalidField() {
  const [targetId, setTargetId] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!targetId) {
      return;
    }
    document.getElementById(targetId)?.focus();
  }, [targetId, attempt]);

  return {
    focus(id: string) {
      setTargetId(id);
      setAttempt((current) => current + 1);
    },
  };
}
