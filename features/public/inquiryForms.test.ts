/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/lib/api";

const apiFetch = vi.fn();

vi.mock("@/lib/api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api")>("@/lib/api");
  return {
    ...actual,
    apiFetch: (...args: unknown[]) => apiFetch(...args),
  };
});

vi.mock("@/hooks/usePublicCities", () => ({
  publicCitiesQueryKey: ["cities"],
  usePublicCities: () => ({ data: ["Prishtinë", "Prizren"], isPending: false, isError: false }),
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    className,
  }: {
    href: string;
    children: ReactNode;
    className?: string;
  }) => createElement("a", { href, className }, children),
}));

const { ContactForm } = await import("@/features/public/ContactForm");
const { PartnerForm } = await import("@/features/public/PartnerForm");

afterEach(() => {
  cleanup();
  apiFetch.mockReset();
});

function textbox(name: RegExp | string) {
  return screen.getByRole("textbox", { name });
}

function expectInvalid(field: HTMLElement, message: string) {
  expect(field.getAttribute("aria-invalid")).toBe("true");
  const error = document.getElementById(field.getAttribute("aria-describedby") ?? "");
  expect(error?.textContent).toBe(message);
  expect(error?.getAttribute("role")).toBe("alert");
}

describe("ContactForm", () => {
  it("shows every empty required field and focuses the first one", () => {
    render(createElement(ContactForm));

    fireEvent.click(screen.getByRole("button", { name: "Dërgo mesazhin" }));

    const name = textbox(/^Emri/);
    const email = textbox("Email");
    const message = textbox("Mesazhi");
    expectInvalid(name, "Shkruaj emrin.");
    expectInvalid(email, "Shkruaj email-in.");
    expectInvalid(message, "Shkruaj mesazhin.");
    expect(document.activeElement).toBe(name);
    expect(screen.queryByText("Nuk u dërgua. Provo përsëri.")).toBeNull();
    expect(apiFetch).not.toHaveBeenCalled();
  });

  it("shows a format error beside the email and a banner only for a server failure", async () => {
    render(createElement(ContactForm));
    fireEvent.change(textbox(/^Emri/), { target: { value: "Ana" } });
    fireEvent.change(textbox("Email"), { target: { value: "ana@shembull" } });
    fireEvent.change(textbox("Mesazhi"), { target: { value: "Përshëndetje" } });

    fireEvent.click(screen.getByRole("button", { name: "Dërgo mesazhin" }));

    const email = textbox("Email");
    expectInvalid(email, "Shkruaj një email të vlefshëm.");
    expect(document.activeElement).toBe(email);
    expect(textbox(/^Emri/).hasAttribute("aria-invalid")).toBe(false);
    expect(apiFetch).not.toHaveBeenCalled();

    fireEvent.change(email, { target: { value: "ana@shembull.com" } });
    apiFetch.mockRejectedValueOnce(
      new ApiError("fail", 500, { message: "Serveri nuk përgjigjet." }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Dërgo mesazhin" }));

    const banner = await screen.findByRole("alert");
    expect(banner.textContent).toBe("Serveri nuk përgjigjet.");
    expect(banner.className).toContain("border-danger/25");
    expect(textbox("Email").hasAttribute("aria-invalid")).toBe(false);
  });
});

describe("PartnerForm", () => {
  it("shows every empty required field and focuses the first one", () => {
    render(createElement(PartnerForm));

    fireEvent.click(screen.getByRole("button", { name: "Dërgo aplikimin" }));

    const name = textbox(/^Emri(?! i)/);
    expectInvalid(name, "Shkruaj emrin.");
    expectInvalid(textbox("Email"), "Shkruaj email-in.");
    expectInvalid(textbox("Emri i dyqanit"), "Shkruaj emrin e dyqanit.");
    const cityTrigger = document.getElementById("partner-city") as HTMLElement;
    const cityError = document.getElementById(cityTrigger.getAttribute("aria-describedby") ?? "");
    expect(cityError?.textContent).toBe("Zgjidh qytetin.");
    expect(cityError?.getAttribute("role")).toBe("alert");
    expect(document.activeElement).toBe(name);
    expect(textbox("Mesazhi").hasAttribute("aria-invalid")).toBe(false);
    expect(apiFetch).not.toHaveBeenCalled();
  });

  it("picks the city from the configured list and sends a trimmed application", async () => {
    apiFetch.mockResolvedValueOnce(undefined);
    render(createElement(PartnerForm));
    fireEvent.change(textbox(/^Emri(?! i)/), { target: { value: " Ana " } });
    fireEvent.change(textbox("Email"), { target: { value: "ana@dyqani.com" } });
    fireEvent.change(textbox("Emri i dyqanit"), { target: { value: " Kafe " } });
    fireEvent.click(document.getElementById("partner-city") as HTMLElement);
    fireEvent.click(screen.getByRole("option", { name: "Prishtinë" }));

    fireEvent.click(screen.getByRole("button", { name: "Dërgo aplikimin" }));

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Aplikimi u dërgua" })).toBeTruthy();
    });
    expect(apiFetch).toHaveBeenCalledWith("/partner", {
      method: "POST",
      auth: true,
      body: JSON.stringify({
        name: "Ana",
        email: "ana@dyqani.com",
        business_name: "Kafe",
        city: "Prishtinë",
        phone: null,
        message: null,
      }),
    });
  });
});
