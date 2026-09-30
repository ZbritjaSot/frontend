/** @vitest-environment jsdom */
import { renderHook, act } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { useFavorites } from "@/hooks/useFavorites";
import { writeFavoriteKeys } from "@/lib/favorites";

afterEach(() => {
  writeFavoriteKeys([]);
  window.localStorage.clear();
});

describe("useFavorites", () => {
  it("does not loop when reading an unchanged snapshot", () => {
    const { result, rerender } = renderHook(() => useFavorites());
    expect(result.current.keys).toEqual([]);
    rerender();
    rerender();
    expect(result.current.keys).toEqual([]);
    expect(result.current.keys).toBe(result.current.keys);
  });

  it("toggles a favorite immediately", () => {
    const { result } = renderHook(() => useFavorites());

    act(() => {
      result.current.toggleFavorite("offer", "abc");
    });

    expect(result.current.isFavorite("offer", "abc")).toBe(true);
    expect(result.current.keys).toEqual(["offer:abc"]);

    act(() => {
      result.current.toggleFavorite("offer", "abc");
    });

    expect(result.current.isFavorite("offer", "abc")).toBe(false);
  });
});
