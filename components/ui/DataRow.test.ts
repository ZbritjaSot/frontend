/** @vitest-environment jsdom */
import { cleanup, render, screen } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { CellLabel, dataCell, dataRowCard } from "@/components/ui/DataRow";

afterEach(cleanup);

describe("DataRow primitives", () => {
  it("only ever adds max-md classes so the desktop table classes are untouched", () => {
    const all = [dataRowCard, ...Object.values(dataCell)].join(" ").split(" ");
    for (const cls of all) {
      expect(cls.startsWith("max-md:")).toBe(true);
    }
  });

  it("orders the card: title, status, meta, actions", () => {
    expect(dataCell.title).toContain("max-md:order-1");
    expect(dataCell.status).toContain("max-md:order-2");
    expect(dataCell.meta).toContain("max-md:order-3");
    expect(dataCell.actions).toContain("max-md:order-4");
    expect(dataCell.actions).toContain("max-md:border-l-0");
  });

  it("never gives the title a zero flex-basis (it would let meta cells squeeze beside it)", () => {
    expect(dataCell.title).toContain("max-md:basis-[calc(100%-9rem)]");
    expect(dataCell.title).not.toMatch(/basis-0\b/);
    expect(dataCell.title).not.toContain("flex-1");
    expect(dataCell.titleFull).toContain("max-md:basis-full");
  });

  it("renders an inline label that is hidden from md up", () => {
    render(createElement("p", null, createElement(CellLabel, null, "Skadon"), "12 Nën"));
    const label = screen.getByText("Skadon:");
    expect(label.className).toContain("md:hidden");
  });

  it("renders a block label on its own line", () => {
    render(createElement(CellLabel, { block: true }, "Pronari"));
    const label = screen.getByText("Pronari");
    expect(label.className).toContain("block");
    expect(label.className).toContain("md:hidden");
  });
});
