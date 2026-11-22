/** @vitest-environment jsdom */
import { cleanup, createEvent, fireEvent, render, screen } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Modal } from "@/components/ui/Modal";
import { DateTimeField } from "@/components/ui/DateTimeField";
import { formatWeekdayDateSq } from "@/lib/format";

afterEach(() => {
  cleanup();
});

function openCalendar(value: string, props: Record<string, unknown> = {}) {
  const onChange = vi.fn();
  render(
    createElement(DateTimeField, {
      dateOnly: true,
      value,
      onChange,
      "aria-label": "Data",
      ...props,
    }),
  );
  fireEvent.click(screen.getByRole("button", { name: "Data" }));
  return { onChange, trigger: screen.getByRole("button", { name: "Data" }) };
}

describe("DateTimeField keyboard", () => {
  it("labels the selected day and moves with the arrow keys", () => {
    openCalendar("2026-11-12");
    const selected = screen.getByRole("gridcell", { name: "e enjte, 12 nëntor 2026" });
    expect(selected.getAttribute("aria-selected")).toBe("true");
    expect(document.activeElement).toBe(selected);

    fireEvent.keyDown(selected, { key: "ArrowRight" });
    const friday = screen.getByRole("gridcell", { name: "e premte, 13 nëntor 2026" });
    expect(document.activeElement).toBe(friday);
    expect(friday.getAttribute("tabindex")).toBe("0");
    expect(selected.getAttribute("tabindex")).toBe("-1");

    fireEvent.keyDown(friday, { key: "ArrowDown" });
    expect(document.activeElement).toBe(
      screen.getByRole("gridcell", { name: "e premte, 20 nëntor 2026" }),
    );

    fireEvent.keyDown(document.activeElement!, { key: "Home" });
    expect(document.activeElement).toBe(
      screen.getByRole("gridcell", { name: "e hënë, 16 nëntor 2026" }),
    );

    fireEvent.keyDown(document.activeElement!, { key: "End" });
    expect(document.activeElement).toBe(
      screen.getByRole("gridcell", { name: "e diel, 22 nëntor 2026" }),
    );
  });

  it("moves by month and year, selects with Enter, and closes on Escape", () => {
    const { onChange, trigger } = openCalendar("2026-11-12");
    const selected = screen.getByRole("gridcell", { name: "e enjte, 12 nëntor 2026" });

    fireEvent.keyDown(selected, { key: "PageDown" });
    const december = screen.getByRole("gridcell", { name: "e shtunë, 12 dhjetor 2026" });
    expect(document.activeElement).toBe(december);

    fireEvent.keyDown(december, { key: "PageUp" });
    expect(document.activeElement).toBe(
      screen.getByRole("gridcell", { name: "e enjte, 12 nëntor 2026" }),
    );

    fireEvent.keyDown(document.activeElement!, { key: "PageDown", shiftKey: true });
    const nextYear = screen.getByRole("gridcell", { name: "e premte, 12 nëntor 2027" });
    expect(document.activeElement).toBe(nextYear);

    fireEvent.keyDown(nextYear, { key: "Enter" });
    expect(onChange).toHaveBeenCalledWith("2027-11-12");
    expect(screen.queryByRole("dialog", { name: "Kalendari" })).toBeNull();
    expect(document.activeElement).toBe(trigger);

    fireEvent.click(trigger);
    fireEvent.keyDown(screen.getByRole("gridcell", { name: "e enjte, 12 nëntor 2026" }), {
      key: " ",
    });
    expect(onChange).toHaveBeenCalledWith("2026-11-12");
    expect(document.activeElement).toBe(trigger);

    fireEvent.click(trigger);
    const reopened = screen.getByRole("gridcell", { name: "e enjte, 12 nëntor 2026" });
    fireEvent.keyDown(reopened, { key: "Escape" });
    expect(screen.queryByRole("dialog", { name: "Kalendari" })).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it("skips days outside min and max without focusing them", () => {
    openCalendar("2026-11-12", { minDate: "2026-11-12", maxDate: "2026-11-12" });
    const only = screen.getByRole("gridcell", { name: "e enjte, 12 nëntor 2026" });
    const before = screen.getByRole("gridcell", { name: "e mërkurë, 11 nëntor 2026" });
    expect((before as HTMLButtonElement).disabled).toBe(true);
    expect(before.getAttribute("tabindex")).toBe("-1");

    fireEvent.keyDown(only, { key: "ArrowLeft" });
    expect(document.activeElement).toBe(only);
    fireEvent.keyDown(only, { key: "ArrowRight" });
    expect(document.activeElement).toBe(only);
  });

  it("marks today and focuses it when nothing is selected", () => {
    openCalendar("");
    const today = new Date();
    const label = formatWeekdayDateSq(
      today.getFullYear(),
      today.getMonth() + 1,
      today.getDate(),
    );
    const day = screen.getByRole("gridcell", { name: label });
    expect(day.getAttribute("aria-current")).toBe("date");
    expect(document.activeElement).toBe(day);
  });

  it("clamps Jan 31 + PageDown to the last day of February, leap years included", () => {
    openCalendar("2027-01-31");
    fireEvent.keyDown(screen.getByRole("gridcell", { name: /31 janar 2027/ }), { key: "PageDown" });
    expect(document.activeElement).toBe(screen.getByRole("gridcell", { name: /28 shkurt 2027/ }));
  });

  it("clamps to Feb 29 in a leap year", () => {
    openCalendar("2028-01-31");
    fireEvent.keyDown(screen.getByRole("gridcell", { name: /31 janar 2028/ }), { key: "PageDown" });
    expect(document.activeElement).toBe(screen.getByRole("gridcell", { name: /29 shkurt 2028/ }));
  });

  it("keeps focus on the month button and selects nothing when it is pressed", () => {
    const { onChange } = openCalendar("2026-11-12");
    const next = screen.getByRole("button", { name: "Muaji tjetër" });
    next.focus();
    fireEvent.keyDown(next, { key: "Enter" });
    fireEvent.click(next);
    expect(document.activeElement).toBe(next);
    expect(screen.getByRole("gridcell", { name: /12 dhjetor 2026/ }).getAttribute("tabindex")).toBe("0");
    fireEvent.click(next);
    expect(document.activeElement).toBe(next);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("uses the cell that received the key", () => {
    openCalendar("2026-11-12");
    const other = screen.getByRole("gridcell", { name: /20 nëntor 2026/ });
    fireEvent.keyDown(other, { key: "ArrowRight" });
    expect(document.activeElement).toBe(screen.getByRole("gridcell", { name: /21 nëntor 2026/ }));
  });
});

describe("DateTimeField inside a Modal", () => {
  it("closes only the calendar on Escape and returns focus to the trigger", () => {
    const onClose = vi.fn();
    render(
      createElement(
        Modal,
        { open: true, title: "Abonimi", onClose },
        createElement(DateTimeField, {
          dateOnly: true,
          value: "2026-11-12",
          onChange: vi.fn(),
          "aria-label": "Data",
        }),
      ),
    );
    const trigger = screen.getByRole("button", { name: "Data" });
    fireEvent.click(trigger);
    fireEvent.keyDown(screen.getByRole("gridcell", { name: /12 nëntor 2026/ }), { key: "Escape" });
    expect(screen.queryByRole("dialog", { name: "Kalendari" })).toBeNull();
    expect(onClose).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(trigger);

    fireEvent.keyDown(trigger, { key: "Escape" });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("lets Tab move inside the open calendar without the modal trap taking focus", () => {
    render(
      createElement(
        Modal,
        { open: true, title: "Abonimi", onClose: vi.fn() },
        createElement(DateTimeField, {
          dateOnly: true,
          value: "2026-11-12",
          onChange: vi.fn(),
          "aria-label": "Data",
        }),
      ),
    );
    fireEvent.click(screen.getByRole("button", { name: "Data" }));
    const day = screen.getByRole("gridcell", { name: /12 nëntor 2026/ });
    const previous = screen.getByRole("button", { name: "Muaji i kaluar" });
    const next = screen.getByRole("button", { name: "Muaji tjetër" });

    // The day is the last tabbable control: Tab loops to the first.
    expect(document.activeElement).toBe(day);
    const tab = createEvent.keyDown(day, { key: "Tab" });
    fireEvent(day, tab);
    expect(tab.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(previous);

    // Shift+Tab on the first loops back to the last.
    fireEvent.keyDown(previous, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(day);

    // In the middle, the browser order is left alone.
    next.focus();
    const middle = createEvent.keyDown(next, { key: "Tab" });
    fireEvent(next, middle);
    expect(middle.defaultPrevented).toBe(false);
  });
});
