/** @vitest-environment jsdom */
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ToastProvider } from "@/components/ui/Toast";
import { FavoriteButton } from "@/components/favorites/FavoriteButton";
import { isFavoriteStored, readFavoriteKeys, writeFavoriteKeys } from "@/lib/favorites";

const OFFER_A = "11111111-1111-4111-8111-111111111111";
const OFFER_B = "22222222-2222-4222-8222-222222222222";
const FLYER_A = "33333333-3333-4333-8333-333333333333";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }), usePathname: () => "/" }));
vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: ReactNode }) =>
    createElement("a", { href, ...rest }, children),
}));
vi.mock("@/features/public/ProductPoster", () => ({
  ProductPoster: ({ offer }: { offer: { id: string; name: string } }) =>
    createElement("div", { "data-testid": "offer" }, offer.name),
}));
vi.mock("@/features/public/CampaignPoster", () => ({
  CampaignPoster: ({ folder }: { folder: { id: string; title: string } }) =>
    createElement("div", { "data-testid": "flyer" }, folder.title),
}));

const offersBatch = vi.fn();
const foldersBatch = vi.fn();
vi.mock("@/features/offers/api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/features/offers/api")>()),
  fetchPublicOffersBatch: (ids: string[]) => offersBatch(ids),
  fetchPublicFoldersBatch: (ids: string[]) => foldersBatch(ids),
}));

const { FavoritesView } = await import("@/features/public/FavoritesView");

function wrap(children: ReactNode, client = new QueryClient()) {
  return createElement(QueryClientProvider, { client }, createElement(ToastProvider, null, children));
}

beforeEach(() => {
  offersBatch.mockReset().mockResolvedValue([]);
  foldersBatch.mockReset().mockResolvedValue([]);
});

afterEach(() => {
  cleanup();
  act(() => writeFavoriteKeys([]));
  window.localStorage.clear();
});

describe("FavoritesView hydration", () => {
  it("server-renders the skeleton, never the empty state", () => {
    const html = renderToString(wrap(createElement(FavoritesView)));
    expect(html).toContain("aria-busy");
    expect(html).not.toContain("Ende bosh");
  });

  it("shows the empty state with a Shfleto ofertat link once hydrated", () => {
    render(wrap(createElement(FavoritesView)));
    expect(screen.getByText("Ende bosh")).toBeTruthy();
    const link = screen.getByRole("link", { name: "Shfleto ofertat" });
    expect(link.getAttribute("href")).toBe("/oferta");
    expect(offersBatch).not.toHaveBeenCalled();
    expect(foldersBatch).not.toHaveBeenCalled();
  });
});

describe("FavoritesView batch loading", () => {
  it("issues one request per kind with sorted ids and renders results", async () => {
    act(() => writeFavoriteKeys([`offer:${OFFER_B}`, `offer:${OFFER_A}`, `flyer:${FLYER_A}`]));
    offersBatch.mockResolvedValue([
      { id: OFFER_A, name: "Kafe" },
      { id: OFFER_B, name: "Bukë" },
    ]);
    foldersBatch.mockResolvedValue([{ id: FLYER_A, title: "Fletushka" }]);

    render(wrap(createElement(FavoritesView)));

    await waitFor(() => expect(screen.getAllByTestId("offer")).toHaveLength(2));
    expect(screen.getAllByTestId("flyer")).toHaveLength(1);
    expect(offersBatch).toHaveBeenCalledTimes(1);
    expect(offersBatch).toHaveBeenCalledWith([OFFER_A, OFFER_B]);
    expect(foldersBatch).toHaveBeenCalledTimes(1);
    expect(foldersBatch).toHaveBeenCalledWith([FLYER_A]);
    expect(readFavoriteKeys()).toHaveLength(3);
  });

  it("prunes ids the API did not return, and non-uuid ids, but keeps the rest", async () => {
    act(() => writeFavoriteKeys([`offer:${OFFER_A}`, `offer:${OFFER_B}`, "offer:legacy-1", `flyer:${FLYER_A}`]));
    offersBatch.mockResolvedValue([{ id: OFFER_A, name: "Kafe" }]);
    foldersBatch.mockResolvedValue([{ id: FLYER_A, title: "Fletushka" }]);

    render(wrap(createElement(FavoritesView)));

    await waitFor(() => expect(readFavoriteKeys()).toEqual([`offer:${OFFER_A}`, `flyer:${FLYER_A}`]));
    expect(offersBatch).toHaveBeenCalledWith([OFFER_A, OFFER_B]);
  });

  it("does not prune when the request fails", async () => {
    act(() => writeFavoriteKeys([`offer:${OFFER_A}`]));
    offersBatch.mockRejectedValue(new Error("boom"));

    render(wrap(createElement(FavoritesView)));

    await waitFor(() => expect(offersBatch).toHaveBeenCalled());
    await act(async () => {});
    expect(readFavoriteKeys()).toEqual([`offer:${OFFER_A}`]);
  });
});

describe("FavoritesView ordering, ids and errors", () => {
  it("renders in stored save order, not the API's sorted order", async () => {
    act(() => writeFavoriteKeys([`offer:${OFFER_B}`, `offer:${OFFER_A}`]));
    offersBatch.mockResolvedValue([
      { id: OFFER_A, name: "A" },
      { id: OFFER_B, name: "B" },
    ]);
    render(wrap(createElement(FavoritesView)));
    await waitFor(() => expect(screen.getAllByTestId("offer")).toHaveLength(2));
    expect(screen.getAllByTestId("offer").map((node) => node.textContent)).toEqual(["B", "A"]);
  });

  it("sends lower-cased ids and does not prune an upper-case stored id", async () => {
    const upper = OFFER_A.replace("1111", "AAAA").toUpperCase();
    act(() => writeFavoriteKeys([`offer:${upper}`]));
    offersBatch.mockResolvedValue([{ id: upper.toLowerCase(), name: "Kafe" }]);
    render(wrap(createElement(FavoritesView)));
    await waitFor(() => expect(screen.getAllByTestId("offer")).toHaveLength(1));
    expect(offersBatch).toHaveBeenCalledWith([upper.toLowerCase()]);
    expect(readFavoriteKeys()).toEqual([`offer:${upper}`]);
  });

  it("does not prune while placeholder data is showing for a new id set", async () => {
    act(() => writeFavoriteKeys([`offer:${OFFER_A}`]));
    offersBatch.mockResolvedValueOnce([{ id: OFFER_A, name: "A" }]);
    render(wrap(createElement(FavoritesView)));
    await waitFor(() => expect(screen.getAllByTestId("offer")).toHaveLength(1));

    let resolve!: (value: unknown[]) => void;
    offersBatch.mockReturnValueOnce(new Promise((r) => (resolve = r)));
    act(() => writeFavoriteKeys([`offer:${OFFER_A}`, `offer:${OFFER_B}`]));
    await waitFor(() => expect(offersBatch).toHaveBeenCalledTimes(2));
    expect(readFavoriteKeys()).toHaveLength(2);

    await act(async () => resolve([{ id: OFFER_A, name: "A" }, { id: OFFER_B, name: "B" }]));
    await waitFor(() => expect(screen.getAllByTestId("offer")).toHaveLength(2));
    expect(readFavoriteKeys()).toHaveLength(2);
  });

  it("shows an error note with retry on a non-network failure", async () => {
    act(() => writeFavoriteKeys([`offer:${OFFER_A}`]));
    offersBatch.mockRejectedValueOnce(new Error("500"));
    render(wrap(createElement(FavoritesView)));
    await screen.findByText("Diçka shkoi keq");
    offersBatch.mockResolvedValueOnce([{ id: OFFER_A, name: "A" }]);
    fireEvent.click(screen.getByRole("button", { name: "Provo përsëri" }));
    await waitFor(() => expect(screen.getAllByTestId("offer")).toHaveLength(1));
  });
});

describe("FavoriteButton undo", () => {
  it("re-adds the exact item from the toast action without a second toast", () => {
    act(() => writeFavoriteKeys([`flyer:${FLYER_A}`]));
    render(wrap(createElement(FavoriteButton, { kind: "flyer", id: FLYER_A })));

    fireEvent.click(screen.getByRole("button", { name: "Hiq nga të preferuarat" }));
    expect(isFavoriteStored("flyer", FLYER_A)).toBe(false);
    expect(screen.getByText("U hoq nga të preferuarat")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: /^Kthe/ }));
    expect(readFavoriteKeys()).toEqual([`flyer:${FLYER_A}`]);
    expect(screen.queryByText("U shtua te të preferuarat")).toBeNull();
  });

  it("does not toggle an already re-added item back off", () => {
    act(() => writeFavoriteKeys([`offer:${OFFER_A}`]));
    render(wrap(createElement(FavoriteButton, { kind: "offer", id: OFFER_A })));

    fireEvent.click(screen.getByRole("button", { name: "Hiq nga të preferuarat" }));
    act(() => writeFavoriteKeys([`offer:${OFFER_A}`]));
    fireEvent.click(screen.getByRole("button", { name: /^Kthe/ }));
    expect(readFavoriteKeys()).toEqual([`offer:${OFFER_A}`]);
  });
});
