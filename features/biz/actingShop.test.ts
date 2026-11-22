/** @vitest-environment jsdom */
import { afterEach, describe, expect, it } from "vitest";
import { clearActingShopId, readActingShopId, writeActingShopId } from "@/features/biz/actingShop";

afterEach(() => {
  clearActingShopId();
});

describe("acting shop storage", () => {
  it("returns a stored UUID", () => {
    writeActingShopId("0b1f6c2e-3a4d-4c8e-9f10-1234567890ab");
    expect(readActingShopId()).toBe("0b1f6c2e-3a4d-4c8e-9f10-1234567890ab");
  });

  it("ignores any stored value that is not a UUID", () => {
    window.localStorage.setItem("zbritjasot-shop", "evil\r\nX-Injected: 1");
    expect(readActingShopId()).toBeNull();
    window.localStorage.setItem("zbritjasot-shop", "not-a-uuid");
    expect(readActingShopId()).toBeNull();
  });

  it("clears the stored shop", () => {
    writeActingShopId("0b1f6c2e-3a4d-4c8e-9f10-1234567890ab");
    clearActingShopId();
    expect(readActingShopId()).toBeNull();
  });
});
