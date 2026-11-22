/** @vitest-environment jsdom */
import { cleanup, render, screen } from "@testing-library/react";
import { createElement, type ComponentType } from "react";
import { afterEach, describe, expect, it } from "vitest";
import {
  FavoritesSkeleton,
  FlyerCatalogueSkeleton,
  FlyerDetailSkeleton,
  HomePageSkeleton,
  OfferCatalogueSkeleton,
  OfferDetailSkeleton,
  PartnerDirectorySkeleton,
  ShopDetailSkeleton,
} from "@/features/public/skeletons";

afterEach(() => {
  cleanup();
});

const pageSkeletons: ComponentType[] = [
  HomePageSkeleton,
  OfferCatalogueSkeleton,
  FlyerCatalogueSkeleton,
  PartnerDirectorySkeleton,
  OfferDetailSkeleton,
  FlyerDetailSkeleton,
  ShopDetailSkeleton,
];

function tokens(className: string): string[] {
  return className.split(/\s+/).filter(Boolean);
}

function bones(root: HTMLElement): HTMLElement[] {
  return [...root.querySelectorAll("div")].filter((node) =>
    tokens(node.className).includes("motion-safe:animate-pulse"),
  );
}

describe("loading skeletons", () => {
  it("uses the same max-w-7xl frame as the real pages", () => {
    for (const Skeleton of pageSkeletons) {
      const { container, unmount } = render(createElement(Skeleton));
      expect(container.innerHTML).toContain("max-w-7xl");
      expect(container.innerHTML).not.toContain("max-w-6xl");
      unmount();
    }
  });

  it("keeps the favorites skeleton inside the page frame instead of adding another", () => {
    render(createElement(FavoritesSkeleton));
    const root = screen.getByLabelText("Duke ngarkuar të preferuarat");
    expect(root.className).not.toContain("max-w-");
  });

  it("splits the home hero into the real two columns at lg", () => {
    render(createElement(HomePageSkeleton));
    const root = screen.getByLabelText("Duke ngarkuar kryefaqen");
    const grid = [...root.querySelectorAll("div")].find((node) =>
      node.className.includes("lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]"),
    );
    expect(grid?.className).toContain("lg:gap-12");
    const hero = bones(root).find((node) => tokens(node.className).includes("rounded-hero"));
    expect(tokens(hero?.className ?? "")).toEqual(
      expect.arrayContaining(["aspect-[4/3]", "rounded-hero", "bg-white/10", "motion-safe:animate-pulse"]),
    );
    expect(tokens(hero?.className ?? "")).not.toContain("bg-sunken");
    expect(grid?.querySelector(".lg\\:col-span-2")).toBeTruthy();
  });

  it("splits the flyer hero into the real two columns at lg", () => {
    render(createElement(FlyerDetailSkeleton));
    const root = screen.getByLabelText("Duke ngarkuar fletushkën");
    const grid = [...root.querySelectorAll("div")].find((node) =>
      node.className.includes("lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]"),
    );
    expect(grid?.className).toContain("lg:gap-14");
    const hero = bones(root).find((node) => tokens(node.className).includes("rounded-hero"));
    expect(tokens(hero?.className ?? "")).toEqual(
      expect.arrayContaining(["aspect-[16/10]", "rounded-hero"]),
    );
  });

  it("paints cards with the sunken bone and keeps rounded-2xl", () => {
    render(createElement(OfferCatalogueSkeleton));
    const root = screen.getByLabelText("Duke ngarkuar ofertat");
    const card = bones(root).find((node) => tokens(node.className).includes("rounded-2xl"));
    const cardTokens = tokens(card?.className ?? "");
    expect(cardTokens).toEqual(
      expect.arrayContaining(["rounded-2xl", "bg-sunken", "motion-safe:animate-pulse"]),
    );
    expect(cardTokens).not.toContain("rounded-lg");
    expect(cardTokens).not.toContain("bg-elevated");
    expect(cardTokens).not.toContain("animate-pulse");
  });
});
