/** @vitest-environment jsdom */
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AdminHeroCreateForm } from "@/features/admin/AdminHeroCreateForm";
import { fetchAdminBusinesses } from "@/features/admin/businessesApi";
import { createStandaloneHeroOffer } from "@/features/admin/homeCurationApi";
import { fetchActiveCategories } from "@/features/offers/bizApi";
import type { Business } from "@/types";

vi.mock("@/features/admin/businessesApi", () => ({
  fetchAdminBusinesses: vi.fn(),
}));
vi.mock("@/features/admin/homeCurationApi", () => ({
  createStandaloneHeroOffer: vi.fn(),
}));
vi.mock("@/features/offers/bizApi", () => ({
  fetchActiveCategories: vi.fn(),
}));

const food = { id: "cat-food", name: "Ushqim", slug: "ushqim", icon: null, is_active: true, sort_order: 0 };
const drinks = { id: "cat-drinks", name: "Pije", slug: "pije", icon: null, is_active: true, sort_order: 1 };

const shop: Business = { id: "shop-1", name: "Shop One", is_active: true };

function renderForm() {
  const queryClient = new QueryClient();
  const onCreated = vi.fn();
  const onCancel = vi.fn();
  render(
    createElement(
      QueryClientProvider,
      { client: queryClient },
      createElement(AdminHeroCreateForm, { onCreated, onCancel }),
    ),
  );
  return { onCreated, onCancel };
}

async function pickShop() {
  fireEvent.change(screen.getByLabelText("Kërko dyqanin"), { target: { value: "Shop" } });
  fireEvent.keyDown(screen.getByLabelText("Kërko dyqanin"), { key: "Enter" });
  await vi.waitFor(() => screen.getByText("Shop One"));
  fireEvent.click(screen.getByText("Shop One"));
}

/** Opens the "Kategoritë" dropdown (same `SelectField` the regular offer form uses) and picks one option. */
async function selectCategory(label: string) {
  fireEvent.click(await screen.findByRole("button", { name: "Kategoritë" }));
  const option = await screen.findByRole("option", { name: label });
  fireEvent.click(option);
}

beforeEach(() => {
  vi.mocked(fetchActiveCategories).mockResolvedValue([food, drinks]);
  vi.mocked(fetchAdminBusinesses).mockResolvedValue({ data: [shop] });
  vi.mocked(createStandaloneHeroOffer).mockResolvedValue({ picks: [], candidates: [] });
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("AdminHeroCreateForm category chips", () => {
  it("marks the first selected category as primary and shows the breadcrumb hint", async () => {
    renderForm();

    await selectCategory("Ushqim");
    await selectCategory("Pije");

    const badge = screen.getByText("Kryesore");
    expect(badge.parentElement?.textContent).toContain("Ushqim");
    expect(
      screen.getByText(/Kategoria e parë përdoret si kategoria kryesore/),
    ).toBeTruthy();
  });

  it("moving a category left promotes it to primary", async () => {
    renderForm();

    await selectCategory("Ushqim");
    await selectCategory("Pije");

    fireEvent.click(screen.getByLabelText('Zhvendos "Pije" më parë'));

    const badge = screen.getByText("Kryesore");
    expect(badge.parentElement?.textContent).toContain("Pije");
  });

  it("submits category_ids in the reordered sequence, primary category first", async () => {
    renderForm();

    // Select in click order Ushqim, Pije — then promote Pije to primary.
    await selectCategory("Ushqim");
    await selectCategory("Pije");
    fireEvent.click(screen.getByLabelText('Zhvendos "Pije" më parë'));

    await pickShop();
    fireEvent.change(screen.getByPlaceholderText("p.sh. Coca Cola 1.5L"), {
      target: { value: "Produkt testimi" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Krijo ofertën" }));

    await vi.waitFor(() => expect(createStandaloneHeroOffer).toHaveBeenCalledTimes(1));
    expect(vi.mocked(createStandaloneHeroOffer).mock.calls[0][0]).toMatchObject({
      category_ids: ["cat-drinks", "cat-food"],
    });
  });

  it("removing a category from the chips makes it selectable again in the dropdown", async () => {
    renderForm();

    await selectCategory("Ushqim");
    fireEvent.click(screen.getByLabelText('Hiq kategorinë "Ushqim"'));

    expect(screen.queryByText("Kryesore")).toBeNull();
    expect(screen.queryByLabelText('Zhvendos "Ushqim" më vonë')).toBeNull();

    fireEvent.click(await screen.findByRole("button", { name: "Kategoritë" }));
    expect(await screen.findByRole("option", { name: "Ushqim" })).toBeTruthy();
  });
});
