/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ActingShopView } from "@/features/biz/ShopSwitcher";

afterEach(cleanup);

const shops = [
  { id: "a", name: "Albi Mall", city: "Prishtinë" },
  { id: "b", name: "Albi Ferizaj" },
];

describe("ActingShopView", () => {
  it("lists only the server-provided shops and reports the picked id", () => {
    const onSelect = vi.fn();
    render(createElement(ActingShopView, { shops, selectedId: "a", onSelect }));
    const select = screen.getByLabelText("Dyqani aktiv") as HTMLSelectElement;
    expect(select.value).toBe("a");
    expect(Array.from(select.options).map((o) => o.value)).toEqual(["a", "b"]);
    fireEvent.change(select, { target: { value: "b" } });
    expect(onSelect).toHaveBeenCalledWith("b");
  });

  it("asks to choose when the stored id is not in the list, and never emits unknown ids", () => {
    const onSelect = vi.fn();
    render(createElement(ActingShopView, { shops, selectedId: "stale", onSelect }));
    const select = screen.getByLabelText("Dyqani aktiv") as HTMLSelectElement;
    expect(select.value).toBe("");
    expect(Array.from(select.options).map((o) => o.value)).toEqual(["", "a", "b"]);
    fireEvent.change(select, { target: { value: "evil" } });
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("shows no select when there are no shops or loading failed", () => {
    render(createElement(ActingShopView, { shops: [], selectedId: null, onSelect: vi.fn() }));
    expect(screen.queryByRole("combobox")).toBeNull();
    cleanup();
    render(createElement(ActingShopView, { shops: [], selectedId: null, onSelect: vi.fn(), failed: true }));
    expect(screen.queryByRole("combobox")).toBeNull();
    expect(screen.getByText("Dyqanet nuk u ngarkuan.")).toBeTruthy();
  });
});
