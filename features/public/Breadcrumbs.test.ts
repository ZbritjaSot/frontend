/** @vitest-environment jsdom */
import { cleanup, render, screen } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { Breadcrumbs, flyerCrumbs, offerCrumbs } from "@/features/public/Breadcrumbs";

afterEach(() => {
  cleanup();
});

const mode = { id: "cat-mode", name: "Modë", slug: "mode" };
const food = { id: "cat-food", name: "Ushqim", slug: "ushqim" };
const drinks = { id: "cat-drinks", name: "Pije", slug: "pije" };

describe("offerCrumbs", () => {
  it("builds Ofertat › category › flyer › name from the offer itself", () => {
    expect(
      offerCrumbs({
        name: "Qumësht",
        categories: [food, drinks],
        bundle: { id: "fly-1", title: "Ushqime të javës", starts_at: "", expires_at: "" },
      }),
    ).toEqual([
      { label: "Ofertat", href: "/oferta" },
      { label: "Ushqim", href: "/oferta?category=ushqim" },
      { label: "Ushqime të javës", href: "/dosje/fly-1" },
      { label: "Qumësht" },
    ]);
  });

  it("skips a standalone batch titled Oferta individuale", () => {
    expect(
      offerCrumbs({
        name: "Këmishë",
        categories: [mode],
        bundle: { id: "batch-1", title: "Oferta individuale", starts_at: "", expires_at: "" },
      }),
    ).toEqual([
      { label: "Ofertat", href: "/oferta" },
      { label: "Modë", href: "/oferta?category=mode" },
      { label: "Këmishë" },
    ]);
  });

  it("still trails up to Ofertat when the offer has no category and no flyer", () => {
    expect(
      offerCrumbs({
        name: "Pa kategori",
        categories: [],
        bundle: null,
      }),
    ).toEqual([
      { label: "Ofertat", href: "/oferta" },
      { label: "Pa kategori" },
    ]);
  });

  it("skips a blank category and uses the next one", () => {
    expect(
      offerCrumbs({
        name: "Produkti",
        categories: [
          { id: "blank", name: " ", slug: "blank" },
          drinks,
        ],
      }).map((crumb) => crumb.label),
    ).toEqual(["Ofertat", "Pije", "Produkti"]);
  });
});

describe("flyerCrumbs", () => {
  it("builds Fletushkat › shop › title from the flyer itself", () => {
    expect(
      flyerCrumbs({
        title: "Java e ushqimeve",
        business: { id: "shop-1", name: "Viva Fresh" },
      }),
    ).toEqual([
      { label: "Fletushkat", href: "/fletushka" },
      { label: "Viva Fresh", href: "/biznese/shop-1" },
      { label: "Java e ushqimeve" },
    ]);
  });

  it("omits the shop when the flyer has no business", () => {
    expect(flyerCrumbs({ title: "Pa dyqan", business: null })).toEqual([
      { label: "Fletushkat", href: "/fletushka" },
      { label: "Pa dyqan" },
    ]);
  });
});

describe("Breadcrumbs", () => {
  it("links ancestors and marks the last crumb as the current page", () => {
    render(
      createElement(Breadcrumbs, {
        items: offerCrumbs({
          name: "Qumësht",
          categories: [food],
          bundle: { id: "fly-1", title: "Ushqime të javës", starts_at: "", expires_at: "" },
        }),
      }),
    );

    const nav = screen.getByRole("navigation", { name: "Shtegu" });
    expect(nav).toBeTruthy();

    expect(screen.getByRole("link", { name: "Ofertat" }).getAttribute("href")).toBe("/oferta");
    expect(screen.getByRole("link", { name: "Ushqim" }).getAttribute("href")).toBe(
      "/oferta?category=ushqim",
    );
    expect(screen.getByRole("link", { name: "Ushqime të javës" }).getAttribute("href")).toBe(
      "/dosje/fly-1",
    );
    expect(screen.queryByRole("link", { name: "Qumësht" })).toBeNull();
    expect(screen.getByText("Qumësht").getAttribute("aria-current")).toBe("page");
  });

  it("hides the separators from the accessibility tree", () => {
    const { container } = render(
      createElement(Breadcrumbs, {
        items: flyerCrumbs({ title: "Java", business: { id: "shop-1", name: "Abi" } }),
      }),
    );

    const separators = container.querySelectorAll("[aria-hidden='true']");
    expect(separators).toHaveLength(2);
    expect(Array.from(separators).every((node) => node.textContent === "›")).toBe(true);
  });

  it("does not link the current page even if that crumb has an href", () => {
    render(
      createElement(Breadcrumbs, {
        items: [
          { label: "Ofertat", href: "/oferta" },
          { label: "Këtu", href: "/offers/1" },
        ],
      }),
    );

    expect(screen.queryByRole("link", { name: "Këtu" })).toBeNull();
    expect(screen.getByText("Këtu").getAttribute("aria-current")).toBe("page");
  });

  it("renders nothing when there are no crumbs", () => {
    const { container } = render(createElement(Breadcrumbs, { items: [] }));
    expect(container.firstChild).toBeNull();
  });
});
