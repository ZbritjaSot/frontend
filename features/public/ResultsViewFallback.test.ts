/** @vitest-environment jsdom */
import { cleanup, render, screen } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ResultsView } from "@/features/public/ResultsView";
import type { PublicOffer } from "@/types";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
// The stream is a react-query client component; only its props matter here.
vi.mock("@/features/public/CatalogStream", () => ({
  CatalogStream: (props: { category?: string; offers: PublicOffer[] }) =>
    createElement("div", {
      "data-testid": "stream",
      "data-category": props.category ?? "",
      "data-count": props.offers.length,
    }),
}));

afterEach(cleanup);

const categories = [{ id: "1", name: "Pije", slug: "pije" }];
const base = {
  folders: [],
  offers: [],
  categories,
  q: "",
  category: "pije",
  katalog: "oferta" as const,
  page: 1,
  offerLastPage: 1,
  folderLastPage: 1,
};
const fallback = { offers: [{ id: "o1" }, { id: "o2" }] as PublicOffer[], folders: [], lastPage: 1 };

describe("ResultsView empty-category fallback", () => {
  it("shows the category notice followed by an unfiltered stream", () => {
    render(createElement(ResultsView, { ...base, fallback }));

    expect(screen.getByText("Nuk ka oferta te Pije tani")).toBeTruthy();
    const stream = screen.getByTestId("stream");
    expect(stream.getAttribute("data-category")).toBe("");
    expect(stream.getAttribute("data-count")).toBe("2");
    expect(screen.queryByText("Nuk u gjet asgjë")).toBeNull();
  });

  it("keeps the generic empty state when the fallback is empty", () => {
    render(
      createElement(ResultsView, { ...base, fallback: { offers: [], folders: [], lastPage: 1 } }),
    );
    expect(screen.getByText("Nuk u gjet asgjë")).toBeTruthy();
    expect(screen.queryByTestId("stream")).toBeNull();
  });

  it("keeps the generic empty state for a search with no fallback", () => {
    render(createElement(ResultsView, { ...base, q: "qumesht" }));
    expect(screen.getByText("Nuk u gjet asgjë")).toBeTruthy();
  });
});
