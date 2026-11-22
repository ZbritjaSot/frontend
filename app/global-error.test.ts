/** @vitest-environment jsdom */
import { createElement, isValidElement, type ReactElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("./globals.css", () => ({}));

const { default: GlobalError } = await import("@/app/global-error");

function walk(node: ReactNode, visit: (element: ReactElement) => void) {
  if (!isValidElement(node)) {
    return;
  }
  visit(node);
  const children = (node.props as { children?: ReactNode }).children;
  if (Array.isArray(children)) {
    children.forEach((child) => walk(child, visit));
    return;
  }
  walk(children, visit);
}

describe("GlobalError", () => {
  it("renders its own document, a brand message, and a retry action", () => {
    const retry = vi.fn();
    const props = { error: new Error("rrënja"), retry };
    const html = renderToStaticMarkup(createElement(GlobalError, props));

    expect(html).toContain('<html lang="sq"');
    expect(html).toContain("<body");
    expect(html).toContain("Diçka shkoi keq");
    expect(html).toContain("Provo përsëri");
    expect(html).toContain('href="/"');
    expect(html).toContain("hover:bg-hover");
    expect(html).not.toContain("hover:text-accent");

    const tree = GlobalError(props);
    let clicked = false;
    walk(tree, (element) => {
      const buttonProps = element.props as { onClick?: () => void; children?: ReactNode };
      if (element.type === "button" && buttonProps.children === "Provo përsëri") {
        buttonProps.onClick?.();
        clicked = true;
      }
    });
    expect(clicked).toBe(true);
    expect(retry).toHaveBeenCalledOnce();
  });
});
