import { describe, expect, it } from "vitest";
import { normalizePage, uniqueById } from "@/lib/pages";

describe("uniqueById", () => {
  it("keeps the first copy when a later page repeats an id", () => {
    const items = uniqueById([
      { data: [{ id: "a", name: "Kafe" }, { id: "b", name: "Bukë" }] },
      { data: [{ id: "b", name: "Bukë e re" }, { id: "c", name: "Qumësht" }] },
    ]);

    expect(items.map((item) => item.id)).toEqual(["a", "b", "c"]);
    expect(items[1]?.name).toBe("Bukë");
  });

  it("returns an empty list when there are no pages", () => {
    expect(uniqueById(undefined)).toEqual([]);
  });
});

describe("normalizePage", () => {
  it("passes an existing meta through unchanged", () => {
    const page = normalizePage(
      { data: [{ id: "a" }], meta: { current_page: 2, last_page: 5, per_page: 16, total: 80 } },
      2,
      16,
    );
    expect(page.meta).toEqual({ current_page: 2, last_page: 5, per_page: 16, total: 80 });
  });

  it("synthesizes a single-page meta when the API omits it", () => {
    const page = normalizePage({ data: [{ id: "a" }, { id: "b" }] }, 1, 16);
    expect(page.meta).toEqual({ current_page: 1, last_page: 1, per_page: 16, total: 2 });
  });
});
