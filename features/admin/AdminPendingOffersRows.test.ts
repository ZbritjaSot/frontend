/** @vitest-environment jsdom */
import { cleanup, render, screen } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ToastProvider } from "@/components/ui/Toast";

const pending = vi.hoisted(() => vi.fn());

vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: ReactNode }) =>
    createElement("a", { href, ...rest }, children),
}));

vi.mock("@/hooks/useAdminOffers", () => ({
  usePendingOffers: (...args: unknown[]) => pending(...args),
  useApproveOffer: () => ({ isPending: false, isError: false, error: null, reset: vi.fn(), mutate: vi.fn() }),
}));

const { AdminPendingOffers } = await import("@/features/admin/AdminPendingOffers");

afterEach(() => {
  cleanup();
  pending.mockReset();
});

describe("AdminPendingOffers rows below md", () => {
  it("labels each meta value, keeps desktop subgrid classes and the action names", () => {
    pending.mockReturnValue({
      data: {
        data: [
          {
            id: "b1",
            title: "Fletushka verore",
            starts_at: "2026-11-22T10:00:00Z",
            expires_at: "2026-11-30T10:00:00Z",
            status: "pending",
            rejection_reason: null,
            items_count: 3,
            business: { id: "s1", name: "Dyqani Një" },
          },
        ],
        meta: { last_page: 1, total: 1 },
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });

    render(
      createElement(
        ToastProvider,
        null,
        createElement(AdminPendingOffers, { query: "", onQueryChange: () => {}, q: "", page: 1, onPageChange: () => {} }),
      ),
    );

    const row = screen.getAllByRole("listitem").find((li) => li.className.includes("md:grid-cols-subgrid") && li.querySelector("a"));
    expect(row).toBeTruthy();
    expect(row!.className).toContain("col-span-6 grid items-center gap-3 border-b border-line px-4 py-3 last:border-b-0 md:grid-cols-subgrid md:gap-x-4");
    expect(row!.className).toContain("max-md:flex-wrap");

    for (const label of ["Biznesi:", "Produkte:", "Skadon:"]) {
      expect(screen.getByText(label).className).toContain("md:hidden");
    }
    // Single DOM: one approve button, one view link, no duplicated aria-labels.
    expect(screen.getAllByRole("button", { name: "Aprovo Fletushka verore" })).toHaveLength(1);
    expect(screen.getAllByRole("link", { name: "Shiko Fletushka verore" })).toHaveLength(1);
  });
});
