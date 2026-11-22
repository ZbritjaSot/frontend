/** @vitest-environment jsdom */
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn() }),
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

vi.mock("@/features/auth/api", () => ({
  loginWithCookies: vi.fn(),
  logout: vi.fn(),
}));

const { LoginForm } = await import("@/features/auth/LoginForm");
const { loginWithCookies } = await import("@/features/auth/api");

function renderForm() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    createElement(
      QueryClientProvider,
      { client },
      createElement(LoginForm, { forgotHref: "/biz/forgot-password" }),
    ),
  );
}

function alertFor(field: HTMLElement) {
  const id = field.getAttribute("aria-describedby");
  return id ? document.getElementById(id) : null;
}

afterEach(() => {
  cleanup();
  vi.mocked(loginWithCookies).mockReset();
});

describe("LoginForm password toggle", () => {
  it("shows and hides the password without submitting", () => {
    renderForm();
    const password = screen.getByLabelText("Fjalëkalimi");
    expect(password.getAttribute("type")).toBe("password");

    fireEvent.click(screen.getByRole("button", { name: "Shfaq fjalëkalimin" }));

    expect(password.getAttribute("type")).toBe("text");
    const hide = screen.getByRole("button", { name: "Fshih fjalëkalimin" });
    expect(hide.getAttribute("aria-pressed")).toBe("true");

    fireEvent.click(hide);
    expect(password.getAttribute("type")).toBe("password");
    expect(screen.getByRole("button", { name: "Shfaq fjalëkalimin" }).getAttribute("aria-pressed")).toBe(
      "false",
    );
    expect(loginWithCookies).not.toHaveBeenCalled();
  });
});

describe("LoginForm error linkage", () => {
  it("ties an email error to the email field only", () => {
    renderForm();
    fireEvent.click(screen.getByRole("button", { name: "Hyr" }));

    const email = screen.getByLabelText("Email");
    const password = screen.getByLabelText("Fjalëkalimi");
    const alert = screen.getByRole("alert");

    expect(alert.textContent).toBe("Email-i është i detyrueshëm.");
    expect(email.getAttribute("aria-invalid")).toBe("true");
    expect(alertFor(email)).toBe(alert);
    expect(password.hasAttribute("aria-invalid")).toBe(false);
    expect(password.hasAttribute("aria-describedby")).toBe(false);
  });

  it("ties a password error to the password field only", () => {
    renderForm();
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "ana@shembull.com" } });
    fireEvent.click(screen.getByRole("button", { name: "Hyr" }));

    const email = screen.getByLabelText("Email");
    const password = screen.getByLabelText("Fjalëkalimi");
    const alert = screen.getByRole("alert");

    expect(alert.textContent).toBe("Fjalëkalimi është i detyrueshëm.");
    expect(password.getAttribute("aria-invalid")).toBe("true");
    expect(alertFor(password)).toBe(alert);
    expect(email.hasAttribute("aria-invalid")).toBe(false);
    expect(email.hasAttribute("aria-describedby")).toBe(false);
  });

  it("ties a rejected sign-in to both fields", async () => {
    vi.mocked(loginWithCookies).mockRejectedValueOnce(new Error("nope"));
    renderForm();
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "ana@shembull.com" } });
    fireEvent.change(screen.getByLabelText("Fjalëkalimi"), { target: { value: "sekret" } });
    fireEvent.click(screen.getByRole("button", { name: "Hyr" }));

    const alert = await screen.findByRole("alert");
    const email = screen.getByLabelText("Email");
    const password = screen.getByLabelText("Fjalëkalimi");

    expect(alert.textContent).toBe("Email ose fjalëkalim i pasaktë.");
    expect(email.getAttribute("aria-invalid")).toBe("true");
    expect(password.getAttribute("aria-invalid")).toBe("true");
    expect(alertFor(email)).toBe(alert);
    expect(alertFor(password)).toBe(alert);
  });
});
