/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createElement, useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TabPanel, Tabs } from "@/components/ui/Tabs";

afterEach(cleanup);

const tabs = [
  { id: "a", label: "Alfa" },
  { id: "b", label: "Beta" },
  { id: "c", label: "Gama" },
];

function Harness({
  activation,
  onChange,
}: {
  activation?: "automatic" | "manual";
  onChange?: (id: string) => void;
}) {
  const [value, setValue] = useState("a");
  return createElement(
    "div",
    null,
    createElement(Tabs<string>, {
      tabs,
      value,
      idPrefix: "t",
      label: "Test",
      activation,
      onChange: (id) => {
        onChange?.(id);
        setValue(id);
      },
    }),
    // eslint-disable-next-line react/no-children-prop
    createElement(TabPanel, { idPrefix: "t", id: value, children: `panel ${value}` }),
  );
}

const tab = (name: string) => screen.getByRole("tab", { name });

describe("Tabs", () => {
  it("exposes tablist, tabs, selection and panel wiring", () => {
    render(createElement(Harness));
    expect(screen.getByRole("tablist").getAttribute("aria-label")).toBe("Test");
    expect(tab("Alfa").getAttribute("aria-selected")).toBe("true");
    expect(tab("Beta").getAttribute("aria-selected")).toBe("false");
    const panel = screen.getByRole("tabpanel");
    expect(tab("Alfa").getAttribute("aria-controls")).toBe(panel.id);
    expect(panel.getAttribute("aria-labelledby")).toBe(tab("Alfa").id);
  });

  it("uses roving tabindex", () => {
    render(createElement(Harness));
    expect(tab("Alfa").tabIndex).toBe(0);
    expect(tab("Beta").tabIndex).toBe(-1);
    expect(tab("Gama").tabIndex).toBe(-1);
  });

  it("changes value on click", () => {
    const onChange = vi.fn();
    render(createElement(Harness, { onChange }));
    fireEvent.click(tab("Beta"));
    expect(onChange).toHaveBeenCalledWith("b");
    expect(tab("Beta").getAttribute("aria-selected")).toBe("true");
    expect(screen.getByRole("tabpanel").textContent).toBe("panel b");
  });

  it("navigates with arrows, Home and End and activates automatically", () => {
    render(createElement(Harness));
    tab("Alfa").focus();
    fireEvent.keyDown(tab("Alfa"), { key: "ArrowRight" });
    expect(document.activeElement).toBe(tab("Beta"));
    expect(tab("Beta").getAttribute("aria-selected")).toBe("true");
    fireEvent.keyDown(tab("Beta"), { key: "End" });
    expect(document.activeElement).toBe(tab("Gama"));
    fireEvent.keyDown(tab("Gama"), { key: "ArrowRight" });
    expect(document.activeElement).toBe(tab("Alfa"));
    fireEvent.keyDown(tab("Alfa"), { key: "ArrowLeft" });
    expect(document.activeElement).toBe(tab("Gama"));
    fireEvent.keyDown(tab("Gama"), { key: "Home" });
    expect(document.activeElement).toBe(tab("Alfa"));
    expect(tab("Alfa").getAttribute("aria-selected")).toBe("true");
  });

  it("only moves focus in manual mode", () => {
    const onChange = vi.fn();
    render(createElement(Harness, { activation: "manual", onChange }));
    tab("Alfa").focus();
    fireEvent.keyDown(tab("Alfa"), { key: "ArrowRight" });
    expect(document.activeElement).toBe(tab("Beta"));
    expect(onChange).not.toHaveBeenCalled();
    expect(tab("Alfa").getAttribute("aria-selected")).toBe("true");
    expect(tab("Beta").tabIndex).toBe(0);
  });
});
