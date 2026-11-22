/** @vitest-environment jsdom */
import { cleanup, render } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { PageWidth } from "@/components/chrome/PageWidth";

afterEach(cleanup);

describe("PageWidth", () => {
  it.each([
    ["list", "max-w-6xl"],
    ["form", "max-w-3xl"],
    ["wide", "max-w-7xl"],
  ] as const)("caps the %s variant with %s and keeps children", (variant, cls) => {
    const { container, getByText } = render(
      createElement(PageWidth, { variant }, createElement("p", null, "përmbajtja")),
    );
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.className).toContain(cls);
    expect(wrapper.className).not.toContain("mx-auto");
    expect(wrapper.contains(getByText("përmbajtja"))).toBe(true);
  });
});
