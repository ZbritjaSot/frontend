/** @vitest-environment jsdom */
import { cleanup, render, screen } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TableSearch } from "@/components/ui/TableSearch";

afterEach(cleanup);

describe("TableSearch", () => {
  it("uses the label as the placeholder and keeps it for screen readers", () => {
    render(
      createElement(TableSearch, {
        value: "",
        onChange: vi.fn(),
        label: "Kërko dyqanin ose titullin",
      }),
    );

    const field = screen.getByRole("textbox");
    expect(field.getAttribute("placeholder")).toBe("Kërko dyqanin ose titullin");
    expect(screen.getByText("Kërko dyqanin ose titullin").className).toContain("sr-only");
  });
});
