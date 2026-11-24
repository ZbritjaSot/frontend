/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({ data: ["Prishtinë", "Prizren"] as string[] | undefined, isPending: false, isError: false }));

vi.mock("@/hooks/usePublicCities", () => ({
  publicCitiesQueryKey: ["cities"],
  usePublicCities: () => state,
}));

const { CityField } = await import("@/components/ui/CityField");

afterEach(() => {
  cleanup();
  Object.assign(state, { data: ["Prishtinë", "Prizren"], isPending: false, isError: false });
});

describe("CityField", () => {
  it("offers the managed cities and reports the pick", () => {
    const onChange = vi.fn();
    render(createElement(CityField, { value: "", onChange, id: "c" }));

    fireEvent.click(document.getElementById("c") as HTMLElement);
    expect(screen.getAllByRole("option").map((option) => option.textContent)).toEqual(["Prishtinë", "Prizren"]);
    fireEvent.click(screen.getByRole("option", { name: "Prizren" }));
    expect(onChange).toHaveBeenCalledWith("Prizren");
  });

  it("keeps a saved city that is no longer in the list", () => {
    render(createElement(CityField, { value: "Atlantis", onChange: vi.fn(), id: "c" }));
    expect(screen.getByRole("button").textContent).toContain("Atlantis");
  });

  it("is disabled while the list loads", () => {
    Object.assign(state, { data: undefined, isPending: true });
    render(createElement(CityField, { value: "", onChange: vi.fn(), id: "c" }));
    expect((screen.getByRole("button") as HTMLButtonElement).disabled).toBe(true);
  });
});
