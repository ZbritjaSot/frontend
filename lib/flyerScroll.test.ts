import { describe, expect, it } from "vitest";
import { isFlyerCataloguePath, shouldResetFlyerScroll } from "@/lib/flyerScroll";

describe("isFlyerCataloguePath", () => {
  it("matches the flyer catalogue only", () => {
    expect(isFlyerCataloguePath("/fletushka")).toBe(true);
    expect(isFlyerCataloguePath("/fletushka/")).toBe(true);
    expect(isFlyerCataloguePath("/oferta")).toBe(false);
    expect(isFlyerCataloguePath("/")).toBe(false);
    expect(isFlyerCataloguePath("/dosje/1")).toBe(false);
  });
});

describe("shouldResetFlyerScroll", () => {
  const ready = { appReady: true, historyRestore: false, suppressDocumentScroll: false };

  it("resets a client push with no hash", () => {
    expect(shouldResetFlyerScroll({ ...ready, hash: "" })).toBe(true);
  });

  it("keeps the browser position on reload, on back/forward, and for a hash", () => {
    expect(shouldResetFlyerScroll({ ...ready, appReady: false, hash: "" })).toBe(false);
    expect(shouldResetFlyerScroll({ ...ready, suppressDocumentScroll: true, hash: "" })).toBe(false);
    expect(shouldResetFlyerScroll({ ...ready, historyRestore: true, hash: "" })).toBe(false);
    expect(shouldResetFlyerScroll({ ...ready, hash: "#lista" })).toBe(false);
  });

  it("treats #top as the top of the page", () => {
    expect(shouldResetFlyerScroll({ ...ready, hash: "#top" })).toBe(true);
  });
});
