/** @vitest-environment jsdom */
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AdminPlatformGallery } from "@/features/admin/AdminPlatformGallery";
import {
  fetchAdminPlatformGallery,
  uploadAdminPlatformGallery,
} from "@/features/gallery/api";
import type { OfferImage } from "@/types";

vi.mock("@/features/gallery/api", () => ({
  fetchAdminPlatformGallery: vi.fn(),
  uploadAdminPlatformGallery: vi.fn(),
  updateAdminPlatformGallery: vi.fn(),
  deleteAdminPlatformGallery: vi.fn(),
}));

function renderGallery() {
  const queryClient = new QueryClient();
  render(
    createElement(
      QueryClientProvider,
      { client: queryClient },
      createElement(AdminPlatformGallery, {}),
    ),
  );
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("AdminPlatformGallery upload-in-flight guard", () => {
  it("keeps the dialog open if Mbyll is pressed while an upload is still in flight", async () => {
    vi.mocked(fetchAdminPlatformGallery).mockResolvedValue({
      data: [],
      meta: { total: 0, last_page: 1, current_page: 1, per_page: 25 },
    });
    let resolveUpload: () => void = () => {};
    const uploadedImage: OfferImage = {
      id: "img-1",
      thumb_url: "",
      detail_url: "",
      title: "Foto",
    };
    vi.mocked(uploadAdminPlatformGallery).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveUpload = () => resolve(uploadedImage);
        }),
    );

    renderGallery();

    fireEvent.click(await screen.findByRole("button", { name: /Shto foto/ }));
    expect(screen.getByRole("dialog")).toBeTruthy();

    const file = new File(["x"], "produkt.png", { type: "image/png" });
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [file] } });

    fireEvent.click(screen.getByRole("button", { name: "Ruaj" }));

    await vi.waitFor(() => expect(uploadAdminPlatformGallery).toHaveBeenCalledTimes(1));

    const dialog = screen.getByRole("dialog");

    // The upload is still pending here — closing must be a no-op. Modal keeps
    // a closing dialog mounted during its exit transition (`present` lags
    // `open`), so a dialog node existing in the DOM doesn't prove it's still
    // open; its `inert` attribute mirrors the live `open` prop synchronously.
    fireEvent.click(screen.getByLabelText("Mbyll"));
    expect(dialog.hasAttribute("inert")).toBe(false);

    resolveUpload();
    await vi.waitFor(() => expect(dialog.hasAttribute("inert")).toBe(true));
  });
});
