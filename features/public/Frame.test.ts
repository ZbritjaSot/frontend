/** @vitest-environment jsdom */
import { cleanup, render, screen } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { EmptyNote } from "@/features/public/Frame";

afterEach(() => {
  cleanup();
});

describe("EmptyNote", () => {
  it("renders the title with no brand kicker and no leftover gap", () => {
    render(
      createElement(EmptyNote, {
        title: "Faqja nuk u gjet",
        body: "Kjo adresë nuk ekziston.",
      }),
    );

    expect(screen.queryByText("ZbritjaSot")).toBeNull();
    const heading = screen.getByRole("heading", { level: 2, name: "Faqja nuk u gjet" });
    expect(heading.className).toBe("m-0 text-title-2");
    expect(screen.getByText("Kjo adresë nuk ekziston.")).toBeTruthy();
  });

  it("renders a kicker only when one is passed, with the gap under it", () => {
    render(
      createElement(EmptyNote, {
        kicker: "Fletushka",
        title: "Kjo fletushkë është bosh",
        body: "Nuk ka oferta aktive.",
      }),
    );

    expect(screen.getByText("Fletushka").tagName).toBe("P");
    const heading = screen.getByRole("heading", { level: 2, name: "Kjo fletushkë është bosh" });
    expect(heading.className).toBe("m-0 mt-3 text-title-2");
  });
});
