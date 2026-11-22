/** @vitest-environment jsdom */
import { cleanup, render, screen } from "@testing-library/react";
import { createElement, type ComponentType } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { NotFoundRecovery } from "@/features/public/NotFoundRecovery";
import OfferNotFound from "@/app/(public)/offers/[id]/not-found";
import FolderNotFound from "@/app/(public)/dosje/[id]/not-found";
import BusinessNotFound from "@/app/(public)/biznese/[id]/not-found";

vi.mock("next/navigation", () => ({
  usePathname: () => "/e-humbur",
  useRouter: () => ({ push: vi.fn() }),
}));

const { default: RootNotFound } = await import("@/app/not-found");

afterEach(() => {
  cleanup();
});

function expectRecovery() {
  const search = screen.getByRole("search");
  const form = search.querySelector("form");
  expect(form?.getAttribute("action")).toBe("/oferta");
  expect(form?.getAttribute("method")?.toLowerCase()).toBe("get");
  expect(form?.querySelector("input[name='q']")).toBeTruthy();

  const nav = screen.getByRole("navigation", { name: "Lidhje të shpejta" });
  expect(nav.querySelector("a[href='/oferta']")?.textContent).toBe("Ofertat");
  expect(nav.querySelector("a[href='/fletushka']")?.textContent).toBe("Fletushkat");
  expect(nav.querySelector("a[href='/biznese']")?.textContent).toBe("Partnerët");

  const back = screen.getByRole("link", { name: "Kthehu te ofertat" });
  expect(back.getAttribute("href")).toBe("/");
}

describe("NotFoundRecovery", () => {
  it("searches offers and links to the three catalogues", () => {
    render(createElement(NotFoundRecovery));

    const search = screen.getByRole("search");
    const form = search.querySelector("form");
    expect(form?.getAttribute("action")).toBe("/oferta");
    expect(form?.querySelector("input[name='q']")).toBeTruthy();
    const field = form?.querySelector("input[name='q']");
    expect(field?.className).toContain("h-11");
    expect(field?.className).toContain("placeholder:text-muted/70");

    const nav = screen.getByRole("navigation", { name: "Lidhje të shpejta" });
    for (const link of nav.querySelectorAll("a")) {
      expect(link.className).toContain("hover:underline");
      expect(link.className).toContain("text-ink");
      expect(link.className).not.toContain("hover:text-accent");
    }
  });
});

describe("not-found pages", () => {
  it.each([
    ["offer", OfferNotFound, "Oferta nuk u gjet"],
    ["flyer", FolderNotFound, "Fletushka nuk u gjet"],
    ["business", BusinessNotFound, "Dyqani nuk u gjet"],
    ["root", RootNotFound, "Faqja nuk u gjet"],
  ] as const)("keeps the back link and adds recovery on the %s page", (_name, Page, title) => {
    render(createElement(Page as ComponentType));
    expect(screen.getByRole("heading", { name: title })).toBeTruthy();
    expectRecovery();
  });
});
