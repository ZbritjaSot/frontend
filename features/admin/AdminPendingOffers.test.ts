/** @vitest-environment jsdom */
import { cleanup, render, screen, waitFor } from "@testing-library/react";
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
  useApproveOffer: () => ({
    isPending: false,
    isError: false,
    error: null,
    reset: vi.fn(),
    mutate: vi.fn(),
  }),
}));

const { AdminPendingOffers } = await import("@/features/admin/AdminPendingOffers");

afterEach(() => {
  cleanup();
  pending.mockReset();
});

function list(page: number, onPageChange: (page: number) => void) {
  return createElement(
    ToastProvider,
    null,
    createElement(AdminPendingOffers, {
      query: "",
      onQueryChange: () => {},
      q: "",
      page,
      onPageChange,
    }),
  );
}

describe("AdminPendingOffers page clamp", () => {
  it("moves to the last page after render when the current page is past it", async () => {
    const onPageChange = vi.fn();
    pending.mockReturnValue({
      data: { data: [], meta: { last_page: 2, total: 0 } },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });

    render(list(5, onPageChange));

    await waitFor(() => expect(onPageChange).toHaveBeenCalledWith(2));
    expect(onPageChange).toHaveBeenCalledTimes(1);
  });

  it("does not change the page while the list is loading or already in range", async () => {
    const onPageChange = vi.fn();
    pending.mockReturnValue({
      data: { data: [], meta: { last_page: 1, total: 0 } },
      isLoading: true,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });

    const view = render(list(5, onPageChange));
    expect(screen.getByText("Duke ngarkuar listën")).toBeTruthy();
    await waitFor(() => expect(pending).toHaveBeenCalled());
    expect(onPageChange).not.toHaveBeenCalled();

    pending.mockReturnValue({
      data: { data: [], meta: { last_page: 2, total: 0 } },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });
    view.rerender(list(2, onPageChange));
    await waitFor(() => expect(screen.getByText("Nuk ka oferta në pritje.")).toBeTruthy());
    expect(onPageChange).not.toHaveBeenCalled();
  });
});
