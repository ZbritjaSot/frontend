/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CategoryChips } from "@/features/offers/CategoryChips";

afterEach(() => {
  cleanup();
});

const labels: Record<string, string> = {
  food: "Ushqim",
  drinks: "Pije",
  mode: "Modë",
};

function labelFor(id: string) {
  return labels[id] ?? id;
}

describe("CategoryChips", () => {
  it("marks only the first category as primary", () => {
    render(
      createElement(CategoryChips, {
        categoryIds: ["food", "drinks", "mode"],
        labelFor,
        onReorder: vi.fn(),
        onRemove: vi.fn(),
        idPrefix: "1",
      }),
    );

    expect(screen.getAllByText("Kryesore")).toHaveLength(1);
    const chips = screen.getAllByText(/Ushqim|Pije|Modë/);
    expect(chips.map((el) => el.textContent)).toEqual(["Ushqim", "Pije", "Modë"]);
  });

  it("moving the second category left makes it primary", () => {
    const onReorder = vi.fn();
    render(
      createElement(CategoryChips, {
        categoryIds: ["food", "drinks"],
        labelFor,
        onReorder,
        onRemove: vi.fn(),
        idPrefix: "1",
      }),
    );

    fireEvent.click(screen.getByLabelText('Zhvendos "Pije" më parë'));
    expect(onReorder).toHaveBeenCalledWith(["drinks", "food"]);
  });

  it("moving the first category right demotes it", () => {
    const onReorder = vi.fn();
    render(
      createElement(CategoryChips, {
        categoryIds: ["food", "drinks", "mode"],
        labelFor,
        onReorder,
        onRemove: vi.fn(),
        idPrefix: "1",
      }),
    );

    fireEvent.click(screen.getByLabelText('Zhvendos "Ushqim" më vonë'));
    expect(onReorder).toHaveBeenCalledWith(["drinks", "food", "mode"]);
  });

  it("disables moving the first category further left and the last further right", () => {
    render(
      createElement(CategoryChips, {
        categoryIds: ["food", "drinks"],
        labelFor,
        onReorder: vi.fn(),
        onRemove: vi.fn(),
        idPrefix: "1",
      }),
    );

    expect((screen.getByLabelText('Zhvendos "Ushqim" më parë') as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByLabelText('Zhvendos "Pije" më vonë') as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByLabelText('Zhvendos "Ushqim" më vonë') as HTMLButtonElement).disabled).toBe(false);
    expect((screen.getByLabelText('Zhvendos "Pije" më parë') as HTMLButtonElement).disabled).toBe(false);
  });

  it("removes a category by id", () => {
    const onRemove = vi.fn();
    render(
      createElement(CategoryChips, {
        categoryIds: ["food", "drinks"],
        labelFor,
        onReorder: vi.fn(),
        onRemove,
        idPrefix: "1",
      }),
    );

    fireEvent.click(screen.getByLabelText('Hiq kategorinë "Pije"'));
    expect(onRemove).toHaveBeenCalledWith("drinks");
  });

  it("shows the primary-category hint", () => {
    render(
      createElement(CategoryChips, {
        categoryIds: ["food"],
        labelFor,
        onReorder: vi.fn(),
        onRemove: vi.fn(),
        idPrefix: "1",
      }),
    );

    expect(
      screen.getByText(/Kategoria e parë përdoret si kategoria kryesore/),
    ).toBeTruthy();
  });

  it("renders nothing when there are no categories", () => {
    const { container } = render(
      createElement(CategoryChips, {
        categoryIds: [],
        labelFor,
        onReorder: vi.fn(),
        onRemove: vi.fn(),
        idPrefix: "1",
      }),
    );

    expect(container.firstChild).toBeNull();
  });
});
