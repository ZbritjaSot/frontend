/** @vitest-environment jsdom */
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ToastProvider } from "@/components/ui/Toast";
import { fieldLabel } from "@/lib/ui";
import type { OfferBundle, OfferItem } from "@/types";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
}));

vi.mock("next/image", () => ({
  default: (props: { alt?: string }) => createElement("img", { alt: props.alt ?? "" }),
}));

const { OfferForm } = await import("@/features/offers/OfferForm");

afterEach(cleanup);

function product(id: string, name: string, imageId?: string): OfferItem {
  return {
    id,
    name,
    original_price: 200,
    discounted_price: 150,
    discount_percent: null,
    view_count: 0,
    purchase_url: `https://dyqani.test/${id}`,
    image: imageId
      ? { id: imageId, thumb_url: `https://img.test/${id}.jpg`, detail_url: `https://img.test/${id}.jpg` }
      : null,
  };
}

function bundle(items: OfferItem[], extra: Partial<OfferBundle> = {}): OfferBundle {
  return {
    id: "bundle-1",
    title: "Nëntor",
    starts_at: "2026-11-22T10:00:00Z",
    expires_at: "2026-11-30T10:00:00Z",
    status: "draft",
    rejection_reason: null,
    is_standalone: true,
    items,
    ...extra,
  };
}

function renderForm(offer: OfferBundle) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    createElement(
      QueryClientProvider,
      { client },
      createElement(
        ToastProvider,
        null,
        createElement(OfferForm, { mode: "edit", offer, catalog: "offers", audience: "biz" }),
      ),
    ),
  );
}

function names(): string[] {
  return [1, 2, 3]
    .map((index) => screen.queryByLabelText(`Emri i produktit ${index}`))
    .filter((field): field is HTMLInputElement => field instanceof HTMLInputElement)
    .map((field) => field.value);
}

describe("OfferForm", () => {
  it("restores a removed product at its original index from the undo toast", () => {
    renderForm(
      bundle([
        product("a", "Kafe"),
        product("b", "Bukë"),
        product("c", "Djathë"),
      ]),
    );

    expect(names()).toEqual(["Kafe", "Bukë", "Djathë"]);
    fireEvent.click(screen.getByRole("button", { name: "Hiq produktin 2" }));
    expect(names()).toEqual(["Kafe", "Djathë"]);
    expect(screen.getByText("U hoq produkti.")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: /^Kthe/ }));
    expect(names()).toEqual(["Kafe", "Bukë", "Djathë"]);
    expect(
      (screen.getByLabelText("Linku i blerjes i produktit 2") as HTMLInputElement).value,
    ).toBe("https://dyqani.test/b");
  });

  it("puts a removed cover product back as the cover", () => {
    renderForm(
      bundle(
        [
          product("a", "Kafe", "img-a"),
          product("b", "Bukë", "img-b"),
          product("c", "Djathë", "img-c"),
        ],
        { is_standalone: false, cover_gallery_image_id: "img-b" },
      ),
    );

    const cover = () => screen.getByRole("button", { name: "E zgjedhur" });
    expect(cover().getAttribute("aria-pressed")).toBe("true");
    fireEvent.click(screen.getByRole("button", { name: "Hiq produktin 2" }));
    expect(screen.queryByRole("button", { name: "E zgjedhur" })).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: /^Kthe/ }));
    expect(cover().getAttribute("aria-pressed")).toBe("true");
    expect(names()).toEqual(["Kafe", "Bukë", "Djathë"]);
  });

  it("uses the sentence-case field label on the period fields", () => {
    renderForm(bundle([product("a", "Kafe"), product("b", "Bukë")]));

    for (const label of ["Fillon", "Skadon"]) {
      const node = screen.getByText(label);
      expect(node.className).toBe(fieldLabel);
      expect(node.className).not.toContain("uppercase");
    }
    expect(screen.getByText("Periudha").className).toContain("uppercase");
  });
});
