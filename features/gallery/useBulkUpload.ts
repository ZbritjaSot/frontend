"use client";

import { useCallback, useRef, useState } from "react";
import { ApiError, isNetworkError } from "@/lib/api";

export type UploadCandidate = { file: File; title: string };

export type UploadStatus = "pending" | "uploading" | "success" | "failed";

export type UploadItem<T> = {
  id: string;
  file: File;
  title: string;
  status: UploadStatus;
  error: string | null;
  result: T | null;
};

export type UploadSummary = {
  total: number;
  success: number;
  failed: number;
  pending: number;
};

type UploadFn<T> = (
  file: File,
  title: string,
  options: { clientToken: string; signal: AbortSignal },
) => Promise<T>;

const CONCURRENCY = 3;
const MAX_ATTEMPTS = 3;
const RETRY_DELAYS_MS = [600, 1800];
const UPLOAD_TIMEOUT_MS = 30_000;

function isTransient(error: unknown): boolean {
  if (error instanceof DOMException && error.name === "AbortError") {
    return true;
  }
  if (isNetworkError(error)) {
    return true;
  }
  if (error instanceof ApiError) {
    return error.status === 408 || error.status === 429 || error.status >= 500;
  }
  return false;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function summaryOf<T>(items: UploadItem<T>[]): UploadSummary {
  return {
    total: items.length,
    success: items.filter((item) => item.status === "success").length,
    failed: items.filter((item) => item.status === "failed").length,
    pending: items.filter(
      (item) => item.status === "pending" || item.status === "uploading",
    ).length,
  };
}

export function useBulkUpload<T>(
  uploadFn: UploadFn<T>,
  describeError: (error: unknown) => string,
) {
  const [items, setItems] = useState<UploadItem<T>[]>([]);
  const itemsRef = useRef<UploadItem<T>[]>([]);
  const [busy, setBusy] = useState(false);

  const setAndTrack = useCallback((next: UploadItem<T>[]) => {
    itemsRef.current = next;
    setItems(next);
  }, []);

  const patchItem = useCallback(
    (id: string, patch: Partial<UploadItem<T>>) => {
      setAndTrack(
        itemsRef.current.map((item) =>
          item.id === id ? { ...item, ...patch } : item,
        ),
      );
    },
    [setAndTrack],
  );

  const runQueue = useCallback(
    async (targetIds: string[]): Promise<UploadSummary> => {
      setBusy(true);
      try {
        let cursor = 0;
        async function worker() {
          for (;;) {
            const index = cursor;
            cursor += 1;
            if (index >= targetIds.length) {
              return;
            }
            const id = targetIds[index];
            if (id === undefined) {
              continue;
            }
            patchItem(id, { status: "uploading", error: null });

            for (let attempt = 1; ; attempt += 1) {
              const item = itemsRef.current.find((entry) => entry.id === id);
              if (!item) {
                break;
              }
              const controller = new AbortController();
              const timer = setTimeout(
                () => controller.abort(),
                UPLOAD_TIMEOUT_MS,
              );
              try {
                const result = await uploadFn(item.file, item.title, {
                  clientToken: id,
                  signal: controller.signal,
                });
                clearTimeout(timer);
                patchItem(id, { status: "success", result, error: null });
                break;
              } catch (caught) {
                clearTimeout(timer);
                if (isTransient(caught) && attempt < MAX_ATTEMPTS) {
                  await delay(RETRY_DELAYS_MS[attempt - 1] ?? 1800);
                  continue;
                }
                patchItem(id, {
                  status: "failed",
                  error: describeError(caught),
                });
                break;
              }
            }
          }
        }

        await Promise.all(
          Array.from(
            { length: Math.min(CONCURRENCY, targetIds.length) },
            worker,
          ),
        );
      } finally {
        setBusy(false);
      }

      return summaryOf(itemsRef.current);
    },
    [uploadFn, describeError, patchItem],
  );

  const start = useCallback(
    async (photos: UploadCandidate[]): Promise<UploadSummary> => {
      const seeded: UploadItem<T>[] = photos.map((photo) => ({
        id: crypto.randomUUID(),
        file: photo.file,
        title: photo.title,
        status: "pending",
        error: null,
        result: null,
      }));
      setAndTrack(seeded);
      return runQueue(seeded.map((item) => item.id));
    },
    [runQueue, setAndTrack],
  );

  const retryFailed = useCallback(async (): Promise<UploadSummary> => {
    const failedIds = itemsRef.current
      .filter((item) => item.status === "failed")
      .map((item) => item.id);
    if (failedIds.length === 0) {
      return summaryOf(itemsRef.current);
    }
    setAndTrack(
      itemsRef.current.map((item) =>
        item.status === "failed"
          ? { ...item, status: "pending", error: null }
          : item,
      ),
    );
    return runQueue(failedIds);
  }, [runQueue, setAndTrack]);

  const reset = useCallback(() => {
    setAndTrack([]);
  }, [setAndTrack]);

  const summary = summaryOf(items);

  return { items, busy, summary, start, retryFailed, reset };
}
