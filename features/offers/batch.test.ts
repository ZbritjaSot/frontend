import { beforeEach, describe, expect, it, vi } from "vitest";

const apiFetch = vi.fn();
vi.mock("@/lib/api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/api")>()),
  apiFetch: (...args: unknown[]) => apiFetch(...args),
}));

const { fetchPublicOffersBatch, fetchPublicFoldersBatch } = await import("@/features/offers/api");

const uuid = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;

beforeEach(() => {
  apiFetch.mockReset().mockResolvedValue({ data: [] });
});

describe("fetchBatch", () => {
  it("splits 51 ids into requests of 50 and 1 and merges the results", async () => {
    const ids = Array.from({ length: 51 }, (_, i) => uuid(i));
    apiFetch.mockImplementation(async (url: string) => ({
      data: new URL(url, "http://x").searchParams.get("ids")!.split(",").map((id) => ({ id })),
    }));

    const result = await fetchPublicOffersBatch(ids);

    expect(apiFetch).toHaveBeenCalledTimes(2);
    const sizes = apiFetch.mock.calls.map((c) => (c[0] as string).split("=")[1].split(",").length);
    expect(sizes).toEqual([50, 1]);
    expect(apiFetch.mock.calls[0][0]).toMatch(/^\/offers\/batch\?ids=/);
    expect(result).toHaveLength(51);
  });

  it("uses the flyer endpoint for folders", async () => {
    await fetchPublicFoldersBatch([uuid(1)]);
    expect(apiFetch.mock.calls[0][0]).toBe(`/offer-folders/batch?ids=${uuid(1)}`);
  });

  it("rejects the whole batch when one chunk fails", async () => {
    const ids = Array.from({ length: 51 }, (_, i) => uuid(i));
    apiFetch.mockResolvedValueOnce({ data: [] }).mockRejectedValueOnce(new Error("500"));
    await expect(fetchPublicOffersBatch(ids)).rejects.toThrow("500");
  });
});
