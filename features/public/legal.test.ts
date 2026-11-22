/** @vitest-environment jsdom */
import { cleanup, render, screen } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, describe, expect, it } from "vitest";
import PrivacyPage from "@/app/(public)/privatesia/page";
import TermsPage from "@/app/(public)/kushtet/page";
import {
  PRIVACY_LEGAL_LAST_UPDATED,
  TERMS_LEGAL_LAST_UPDATED,
  legalUpdatedText,
} from "@/features/public/legal";

afterEach(() => {
  cleanup();
});

describe("legalUpdatedText", () => {
  it("hides the line when no date has been supplied", () => {
    expect(legalUpdatedText("")).toBeNull();
    expect(legalUpdatedText("   ")).toBeNull();
  });

  it("formats a date the legal owner has supplied", () => {
    expect(legalUpdatedText(" 21 nëntor 2026 ")).toBe("Përditësuar më 21 nëntor 2026");
  });
});

describe("legal pages", () => {
  it("keeps the privacy updated line hidden until a date is set, and uses the prose body", () => {
    render(createElement(PrivacyPage));
    const updated = legalUpdatedText(PRIVACY_LEGAL_LAST_UPDATED);
    if (updated) {
      expect(screen.getByText(updated)).toBeTruthy();
    } else {
      expect(screen.queryByText(/Përditësuar më/)).toBeNull();
    }
    const body = screen.getByText(/ZbritjaSot e mban këtë faqe/);
    expect(body.className).toContain("text-base");
    expect(body.className).toContain("text-ink/85");
    expect(body.className).toContain("leading-7");
    expect(body.closest(".max-w-prose")).toBeTruthy();
  });

  it("keeps the terms updated line hidden until a date is set", () => {
    render(createElement(TermsPage));
    const updated = legalUpdatedText(TERMS_LEGAL_LAST_UPDATED);
    if (updated) {
      expect(screen.getByText(updated)).toBeTruthy();
    } else {
      expect(screen.queryByText(/Përditësuar më/)).toBeNull();
    }
    const body = screen.getByText(/ZbritjaSot liston zbritjet/);
    expect(body.className).toContain("text-base");
    expect(body.className).toContain("leading-7");
    expect(body.closest(".max-w-prose")).toBeTruthy();
  });
});
