/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { NewsletterSignup } from "@/features/public/NewsletterSignup";

afterEach(() => {
  cleanup();
});

describe("NewsletterSignup", () => {
  it("links the consent line to the privacy page", () => {
    render(createElement(NewsletterSignup, { variant: "footer" }));

    expect(screen.getByText(/Duke u abonuar pranon/)).toBeTruthy();
    expect(screen.getByRole("link", { name: "Privatësinë" }).getAttribute("href")).toBe(
      "/privatesia",
    );
  });

  it("uses 44px controls and the danger token for errors on the forest band", () => {
    render(createElement(NewsletterSignup, { variant: "footer" }));

    const email = screen.getByPlaceholderText("email@shembull.com");
    const submit = screen.getByRole("button", { name: "Abonohu" });
    expect(email.className).toContain("min-h-11");
    expect(submit.className).toContain("min-h-11");

    fireEvent.click(submit);
    const message = screen.getByRole("alert").querySelector("p");
    expect(message?.textContent).toBe("Shkruaj email-in.");
    expect(message?.className).toContain("text-danger");
    expect(message?.className).toContain("--color-danger:var(--color-danger-on-forest)");
    expect(message?.className).not.toContain("#ffb4b4");
  });
});
