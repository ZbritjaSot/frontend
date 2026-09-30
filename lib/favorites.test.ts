/** @vitest-environment jsdom */
import { afterEach, describe, expect, it } from "vitest";
import {
  favoriteKey,
  parseFavoriteKey,
  readFavoriteKeys,
  removeFavoriteStored,
  serverFavoriteKeys,
  toggleFavoriteStored,
  writeFavoriteKeys,
} from "@/lib/favorites";

afterEach(() => {
  writeFavoriteKeys([]);
  window.localStorage.clear();
});

describe("favorites storage", () => {
  it("parses offer and flyer keys", () => {
    expect(parseFavoriteKey("offer:abc")).toEqual({ kind: "offer", id: "abc" });
    expect(parseFavoriteKey("flyer:9")).toEqual({ kind: "flyer", id: "9" });
    expect(parseFavoriteKey("nope")).toBeNull();
  });

  it("keeps a stable snapshot when contents do not change", () => {
    writeFavoriteKeys([favoriteKey("offer", "1")]);
    const first = readFavoriteKeys();
    const second = readFavoriteKeys();
    expect(first).toBe(second);
    expect(serverFavoriteKeys()).toBe(serverFavoriteKeys());
  });

  it("toggles and removes favorites", () => {
    expect(toggleFavoriteStored("offer", "1")).toBe(true);
    expect(readFavoriteKeys()).toEqual(["offer:1"]);
    expect(toggleFavoriteStored("offer", "1")).toBe(false);
    expect(readFavoriteKeys()).toEqual([]);

    writeFavoriteKeys(["flyer:2", "offer:3"]);
    removeFavoriteStored("flyer", "2");
    expect(readFavoriteKeys()).toEqual(["offer:3"]);
  });

  it("ignores invalid stored JSON", () => {
    window.localStorage.setItem("zbritjasot-favorites", "{bad");
    expect(readFavoriteKeys()).toEqual([]);
  });
});
