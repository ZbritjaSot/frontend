/** @vitest-environment jsdom */
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

const mutation = () => ({ isPending: false, isError: false, error: null, reset: vi.fn(), mutate: vi.fn() });

vi.mock("@/hooks/useAdminCategories", () => ({
  adminCategoriesQueryKey: ["admin", "categories"],
  useAdminCategories: () => ({
    data: {
      data: [
        { id: "c1", name: "Ushqim", slug: "ushqim", icon: null, is_active: true, sort_order: 1 },
        { id: "c2", name: "Veshje", slug: "veshje", icon: null, is_active: false, sort_order: 2 },
      ],
      meta: { last_page: 1, total: 2 },
    },
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  }),
  useCreateCategory: mutation,
  useUpdateCategory: mutation,
  useDeleteCategory: mutation,
  useReorderCategories: mutation,
}));

const { AdminCategories } = await import("@/features/admin/AdminCategories");

afterEach(cleanup);

describe("AdminCategories rows below md", () => {
  it("keeps desktop subgrid classes, adds card classes and a single set of controls", () => {
    render(createElement(QueryClientProvider, { client: new QueryClient() }, createElement(AdminCategories)));

    const row = screen.getAllByRole("listitem").find((li) => li.className.includes("md:grid-cols-subgrid"));
    expect(row).toBeTruthy();
    expect(row!.className).toContain("col-span-4 grid items-center gap-3 border-b border-line px-4 py-3 last:border-b-0 md:grid-cols-subgrid md:gap-x-4");
    expect(row!.className).toContain("max-md:flex-wrap");

    expect(screen.getAllByRole("button", { name: "Ndrysho Ushqim" })).toHaveLength(1);
    expect(screen.getAllByRole("button", { name: "Zhvendos poshtë: Ushqim" })).toHaveLength(1);
    // The ↑/↓ pair stays together as one group below md.
    const down = screen.getByRole("button", { name: "Zhvendos poshtë: Ushqim" });
    expect(down.parentElement?.className).toContain("md:contents");
    // Drag handle is desktop-only (HTML5 drag does not work on touch).
    expect(screen.getByRole("button", { name: "Rendit Ushqim", hidden: true }).className).toContain("max-md:hidden");
  });
});
