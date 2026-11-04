/** @vitest-environment jsdom */
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { createElement, useState, type ChangeEvent } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api";
import type { User } from "@/types";

const replace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  usePathname: () => "/admin/offers/123",
}));

const fetchMe = vi.fn();

vi.mock("@/features/auth/api", () => ({
  fetchMe: (...args: unknown[]) => fetchMe(...args),
  hasRole: (user: User, role: string) => (user.roles ?? []).includes(role),
}));

// Imported after the mocks above so RequireAdminAuth picks up the mocked
// `fetchMe` via `useMe`.
const { RequireAdminAuth } = await import("@/features/auth/RequireAdminAuth");

const adminUser: User = {
  id: "00000000-0000-4000-8000-000000000001",
  name: "Admin",
  email: "admin@example.com",
  roles: ["admin"],
};

let mountCount = 0;

/** Stands in for a mid-edit OfferForm: it has local unsaved state and tracks
 * how many times it has been mounted, so a spurious remount is detectable. */
function StatefulForm() {
  const [value, setValue] = useState("");

  useState(() => {
    mountCount += 1;
    return null;
  });

  return createElement("input", {
    "aria-label": "title",
    value,
    onChange: (event: ChangeEvent<HTMLInputElement>) =>
      setValue(event.target.value),
  });
}

function renderGuard(queryClient: QueryClient) {
  return render(
    createElement(
      QueryClientProvider,
      { client: queryClient },
      createElement(RequireAdminAuth, null, createElement(StatefulForm, null)),
    ),
  );
}

beforeEach(() => {
  mountCount = 0;
  fetchMe.mockReset();
  replace.mockReset();
});

afterEach(() => {
  cleanup();
});

describe("RequireAdminAuth", () => {
  it("shows a spinner on the very first fetch (isLoading), with no cached data yet", async () => {
    let resolveFirstFetch!: (user: User) => void;
    fetchMe.mockImplementation(
      () =>
        new Promise<User>((resolve) => {
          resolveFirstFetch = resolve;
        }),
    );

    const queryClient = new QueryClient();
    renderGuard(queryClient);

    expect(screen.getByText("Duke kontrolluar hyrjen")).toBeTruthy();
    expect(screen.queryByLabelText("title")).toBeNull();

    resolveFirstFetch(adminUser);

    expect(await screen.findByLabelText("title")).toBeTruthy();
    expect(mountCount).toBe(1);
  });

  it("does NOT remount children or lose their state on a background refetch (isFetching) after staleTime", async () => {
    fetchMe.mockResolvedValueOnce(adminUser);

    const queryClient = new QueryClient();
    renderGuard(queryClient);

    // Let the initial fetch settle.
    expect(await screen.findByLabelText("title")).toBeTruthy();
    expect(mountCount).toBe(1);

    // Simulate the user typing into the (unsaved) form.
    fireEvent.change(screen.getByLabelText("title"), {
      target: { value: "Unsaved edits" },
    });
    expect((screen.getByLabelText("title") as HTMLInputElement).value).toBe(
      "Unsaved edits",
    );

    // Simulate another `useMe` consumer elsewhere on the page triggering a
    // background refetch once the 60s staleTime window has passed. Keep it
    // pending for a moment so isFetching=true while isLoading=false and
    // cached data is still being shown — this is exactly the state that used
    // to incorrectly show the full-screen spinner and unmount the form.
    let resolveBackgroundFetch!: (user: User) => void;
    fetchMe.mockImplementation(
      () =>
        new Promise<User>((resolve) => {
          resolveBackgroundFetch = resolve;
        }),
    );

    let refetchPromise!: Promise<unknown>;
    act(() => {
      refetchPromise = queryClient.refetchQueries({
        queryKey: ["auth", "me"],
      });
    });

    // Make sure the refetch has genuinely started (fetchStatus flips to
    // "fetching" independently of whether/how React has re-rendered yet)
    // before asserting on the DOM, so this test can't pass by accident
    // because React simply hasn't caught up to the state change.
    await waitFor(() => {
      expect(
        queryClient.getQueryState(["auth", "me"])?.fetchStatus,
      ).toBe("fetching");
    });

    // While the background refetch is in flight: no spinner, form still
    // mounted, unsaved input untouched.
    expect(screen.queryByText("Duke kontrolluar hyrjen")).toBeNull();
    expect(screen.getByLabelText("title")).toBeTruthy();
    expect(mountCount).toBe(1);
    expect((screen.getByLabelText("title") as HTMLInputElement).value).toBe(
      "Unsaved edits",
    );

    await act(async () => {
      resolveBackgroundFetch(adminUser);
      await refetchPromise;
    });

    // After the background refetch resolves, the form is still the same
    // mounted instance with the same unsaved value.
    expect(mountCount).toBe(1);
    expect((screen.getByLabelText("title") as HTMLInputElement).value).toBe(
      "Unsaved edits",
    );
    expect(replace).not.toHaveBeenCalled();
  });

  it("still redirects to login when a background refetch genuinely fails with 401", async () => {
    fetchMe.mockResolvedValueOnce(adminUser);

    const queryClient = new QueryClient();
    renderGuard(queryClient);

    expect(await screen.findByLabelText("title")).toBeTruthy();

    fetchMe.mockRejectedValueOnce(new ApiError("Unauthenticated", 401));

    act(() => {
      queryClient.refetchQueries({ queryKey: ["auth", "me"] }).catch(() => {});
    });

    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith(
        "/login?next=%2Fadmin%2Foffers%2F123",
      );
    });
  });
});
