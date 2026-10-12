import { describe, expect, it } from "vitest";
import { safeNextPath } from "@/lib/safeNextPath";

describe("safeNextPath", () => {
  it("returns fallback for empty or external values", () => {
    expect(safeNextPath(null, "/biz", ["/biz"])).toBe("/biz");
    expect(safeNextPath("https://evil.test/x", "/biz", ["/biz"])).toBe("/biz");
    expect(safeNextPath("//evil.test", "/biz", ["/biz"])).toBe("/biz");
    expect(safeNextPath("/admin", "/biz", ["/biz"])).toBe("/biz");
  });

  it("allows same-area relative paths", () => {
    expect(safeNextPath("/biz/offers", "/biz", ["/biz"])).toBe("/biz/offers");
    expect(safeNextPath("/admin/offers?x=1", "/admin", ["/admin"])).toBe(
      "/admin/offers?x=1",
    );
  });
});
