"use client";

import { useEffect, useState, type DragEvent } from "react";

const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const IMAGE_NAME = /\.(jpe?g|png|webp)$/i;

export const DROP_HERE_LABEL = "Lësho këtu";

/** Dashed target: accent border and a light tint while a file is over it. */
export function fileDropZoneClass(active: boolean): string {
  return [
    "border border-dashed motion-safe:transition-colors motion-safe:duration-150",
    active ? "border-accent bg-accent/10" : "border-line bg-sunken",
  ].join(" ");
}

export function isAcceptedImage(file: File): boolean {
  if (IMAGE_TYPES.has(file.type)) {
    return true;
  }
  // Some desktop drops omit the MIME type. Trust the extension only then.
  return file.type === "" && IMAGE_NAME.test(file.name);
}

function formatLimit(maxBytes: number): string {
  const mb = maxBytes / (1024 * 1024);
  const text = Number.isInteger(mb) ? String(mb) : mb.toFixed(1).replace(".", ",");
  return `${text} MB`;
}

export function filterDroppedFiles(
  files: File[],
  options: {
    multiple?: boolean;
    maxBytes?: number;
    validateFile?: (file: File) => string | null;
  } = {},
): { accepted: File[]; error: string | null } {
  if (!options.multiple && files.length > 1) {
    return { accepted: [], error: "Zgjidh vetëm një foto." };
  }

  const accepted: File[] = [];
  // Distinct reasons, in the order they were met, so several rejected files
  // produce one readable message instead of only the last reason.
  const reasons: string[] = [];
  const reject = (reason: string) => {
    if (!reasons.includes(reason)) {
      reasons.push(reason);
    }
  };
  for (const file of files) {
    const custom = options.validateFile?.(file) ?? null;
    if (custom) {
      reject(custom);
      continue;
    }
    if (!options.validateFile && !isAcceptedImage(file)) {
      reject("Ngarko një foto JPEG, PNG ose WebP.");
      continue;
    }
    if (options.maxBytes != null && file.size > options.maxBytes) {
      reject(`Fotoja duhet të jetë më e vogël se ${formatLimit(options.maxBytes)}.`);
      continue;
    }
    accepted.push(file);
  }
  return { accepted, error: reasons.length > 0 ? reasons.join(" ") : null };
}

type UseFileDropOptions = {
  disabled?: boolean;
  multiple?: boolean;
  maxBytes?: number;
  /** Extra check. Return a message to reject that file. */
  validateFile?: (file: File) => string | null;
  onFiles: (files: File[], error: string | null) => void;
};

function dragHasFiles(event: { dataTransfer?: DataTransfer | null }): boolean {
  const types = event.dataTransfer?.types;
  if (!types) {
    return false;
  }
  return Array.from(types).includes("Files");
}

/**
 * React events bubble through portals too. Ignore drags that happened in a
 * portaled child (a Modal rendered inside the zone), which is not the zone.
 */
function insideZone(event: DragEvent): boolean {
  return event.target instanceof Node && event.currentTarget.contains(event.target);
}

let strayGuardUsers = 0;

/** A visible native file input handles its own drops. */
function isFileInput(target: EventTarget | null): boolean {
  return target instanceof HTMLInputElement && target.type === "file";
}

function blockStrayDragOver(event: globalThis.DragEvent) {
  if (event.defaultPrevented || !dragHasFiles(event) || isFileInput(event.target)) {
    return;
  }
  event.preventDefault();
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = "none";
  }
}

function blockStrayDrop(event: globalThis.DragEvent) {
  if (event.defaultPrevented || !dragHasFiles(event) || isFileInput(event.target)) {
    return;
  }
  event.preventDefault();
}

/**
 * A file dropped outside every drop zone makes the browser open it and leave
 * the page, losing unsaved form state. Zones call `preventDefault` first, so
 * this window listener only handles drops nobody claimed. Mount it once
 * (see `Providers`); it is ref-counted so a second mount is harmless.
 */
export function useBlockStrayFileDrops() {
  useEffect(() => {
    strayGuardUsers += 1;
    if (strayGuardUsers === 1) {
      window.addEventListener("dragover", blockStrayDragOver);
      window.addEventListener("drop", blockStrayDrop);
    }
    return () => {
      strayGuardUsers -= 1;
      if (strayGuardUsers === 0) {
        window.removeEventListener("dragover", blockStrayDragOver);
        window.removeEventListener("drop", blockStrayDrop);
      }
    };
  }, []);
}

/**
 * File-only drop target. Spread `dropProps` on a wrapper `<div>` (not on a
 * `<button>` that can be disabled: disabled buttons swallow drag events).
 * Non-file drags are ignored. File drags are always handled, even while
 * `disabled`, so the browser never opens a dropped file.
 */
export function useFileDrop({
  disabled = false,
  multiple = false,
  maxBytes,
  validateFile,
  onFiles,
}: UseFileDropOptions) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!active) {
      return;
    }
    // The drag can end somewhere else (Escape, dropped elsewhere).
    const clear = () => setActive(false);
    window.addEventListener("dragend", clear);
    window.addEventListener("drop", clear);
    return () => {
      window.removeEventListener("dragend", clear);
      window.removeEventListener("drop", clear);
    };
  }, [active]);

  function onDragEnter(event: DragEvent) {
    if (!insideZone(event) || !dragHasFiles(event)) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    if (!disabled) {
      setActive(true);
    }
  }

  function onDragOver(event: DragEvent) {
    if (!insideZone(event) || !dragHasFiles(event)) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = disabled ? "none" : "copy";
    }
    if (!disabled) {
      setActive(true);
    }
  }

  function onDragLeave(event: DragEvent) {
    if (!insideZone(event) || !dragHasFiles(event)) {
      return;
    }
    // Moving onto a child of the zone also fires dragleave on the zone.
    const next = event.relatedTarget as Node | null;
    if (next && event.currentTarget.contains(next)) {
      return;
    }
    setActive(false);
  }

  function onDrop(event: DragEvent) {
    if (!insideZone(event) || !dragHasFiles(event)) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    setActive(false);
    if (disabled) {
      return;
    }
    const files = Array.from(event.dataTransfer?.files ?? []);
    if (files.length === 0) {
      return;
    }
    const result = filterDroppedFiles(files, { multiple, maxBytes, validateFile });
    onFiles(result.accepted, result.error);
  }

  return {
    active,
    dropProps: { onDragEnter, onDragOver, onDragLeave, onDrop },
  };
}
