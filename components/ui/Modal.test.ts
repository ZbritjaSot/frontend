/** @vitest-environment jsdom */
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createElement, useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { Modal } from "@/components/ui/Modal";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

function OpenModal({
  danger = false,
  onClose = () => undefined,
}: {
  danger?: boolean;
  onClose?: () => void;
}) {
  return createElement(
    "div",
    null,
    createElement("button", { type: "button" }, "Jashtë"),
    createElement(
      Modal,
      { open: true, title: "Hiq nga faqja", danger, onClose },
      createElement("textarea", { "aria-label": "Arsye" }),
      createElement("button", { type: "button" }, "Ruaj"),
    ),
  );
}

describe("Modal focus", () => {
  it("cycles Tab and Shift+Tab inside the dialog and keeps the page behind out of the cycle", () => {
    render(createElement(OpenModal));
    const dialog = screen.getByRole("dialog");
    const outside = screen.getByRole("button", { name: "Jashtë" });
    const close = screen.getByRole("button", { name: "Mbyll" });
    const reason = screen.getByRole("textbox", { name: "Arsye" });
    const save = screen.getByRole("button", { name: "Ruaj" });

    expect(document.activeElement).toBe(dialog);

    fireEvent.keyDown(window, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(save);

    fireEvent.keyDown(window, { key: "Tab" });
    expect(document.activeElement).toBe(close);

    reason.focus();
    fireEvent.keyDown(window, { key: "Tab" });
    expect(document.activeElement).toBe(reason);

    outside.focus();
    fireEvent.keyDown(window, { key: "Tab" });
    expect(document.activeElement).toBe(close);
    expect(document.activeElement).not.toBe(outside);
  });

  it("keeps a field focused when the parent re-renders", () => {
    const { rerender } = render(createElement(OpenModal));
    const reason = screen.getByRole("textbox", { name: "Arsye" });
    reason.focus();

    rerender(createElement(OpenModal));

    expect(document.activeElement).toBe(reason);
  });

  it("returns focus to the control that opened the dialog", () => {
    function Harness() {
      const [open, setOpen] = useState(false);
      return createElement(
        "div",
        null,
        createElement(
          "button",
          { type: "button", onClick: () => setOpen(true) },
          "Hap",
        ),
        createElement(
          Modal,
          { open, title: "Titulli", onClose: () => setOpen(false) },
          createElement("button", { type: "button" }, "Brenda"),
        ),
      );
    }

    render(createElement(Harness));
    const trigger = screen.getByRole("button", { name: "Hap" });
    trigger.focus();
    fireEvent.click(trigger);

    expect(document.activeElement).toBe(screen.getByRole("dialog"));

    fireEvent.click(screen.getByRole("button", { name: "Mbyll" }));
    expect(document.activeElement).toBe(trigger);
  });

  it("closes on Escape", () => {
    const onClose = vi.fn();
    render(createElement(OpenModal, { onClose }));
    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalledOnce();
  });
});

describe("Modal motion and close control", () => {
  it("uses the catalog-filter timing and keeps the dialog mounted through the exit", () => {
    vi.useFakeTimers();
    function Harness() {
      const [open, setOpen] = useState(true);
      return createElement(
        "div",
        null,
        createElement(
          "button",
          { type: "button", onClick: () => setOpen(false) },
          "Mbyll nga jashtë",
        ),
        createElement(
          Modal,
          {
            open,
            title: "Titulli",
            onClose: () => setOpen(false),
          },
          "Përmbajtja",
        ),
      );
    }

    render(createElement(Harness));
    const dialog = screen.getByRole("dialog");
    expect(dialog.className).toContain("duration-150");
    expect(dialog.className).toContain("ease-out");
    expect(dialog.className).toContain("starting:opacity-0");
    expect(dialog.className).toContain("starting:scale-[0.98]");

    const scroller = dialog.querySelector(".overflow-y-auto");
    expect(scroller?.textContent).toContain("Përmbajtja");

    fireEvent.click(screen.getByRole("button", { name: "Mbyll" }));
    expect(screen.getByRole("dialog")).toBeTruthy();

    act(() => {
      vi.advanceTimersByTime(149);
    });
    expect(screen.getByRole("dialog")).toBeTruthy();

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("gives the close button a 40px target and a visible focus ring", () => {
    render(createElement(OpenModal));
    const close = screen.getByRole("button", { name: "Mbyll" });
    expect(close.className).toContain("size-10");
    expect(close.className).toContain("focus-visible:outline-2");
    expect(close.className).toContain("focus-visible:outline-focus");
  });
});

describe("ConfirmModal danger", () => {
  it("keeps a neutral dialog and paints only the confirm button with the danger token", () => {
    render(
      createElement(ConfirmModal, {
        open: true,
        title: "Fshi kategorinë",
        message: "Fshi “Bukë”? Nuk kthehet.",
        confirmLabel: "Fshi",
        danger: true,
        onConfirm: () => undefined,
        onClose: () => undefined,
      }),
    );

    const dialog = screen.getByRole("dialog");
    expect(dialog.className).toContain("bg-elevated");
    expect(dialog.className).not.toContain("#4a1212");
    expect(dialog.className).not.toContain("#c62828");
    expect(dialog.className).not.toContain("#3a0d0d");
    expect(screen.getByText("Fshi “Bukë”? Nuk kthehet.").className).toContain("text-muted");
    expect(dialog.querySelector("[data-icon='warning']")).toBeTruthy();

    const confirm = screen.getByRole("button", { name: "Fshi" });
    expect(confirm.className).toContain("bg-danger");
    expect(confirm.className).not.toContain("#d32f2f");
    expect(screen.getByRole("button", { name: "Anulo" }).className).toContain("text-ink");
  });
});
