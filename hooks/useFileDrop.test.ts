/** @vitest-environment jsdom */
import { cleanup, createEvent, fireEvent, render, screen } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  filterDroppedFiles,
  useBlockStrayFileDrops,
  useFileDrop,
} from "@/hooks/useFileDrop";

afterEach(() => {
  cleanup();
});

function DropTarget({
  multiple = false,
  disabled = false,
  onFiles,
  onClick,
}: {
  multiple?: boolean;
  disabled?: boolean;
  onFiles: (files: File[], error: string | null) => void;
  onClick?: () => void;
}) {
  const drop = useFileDrop({ multiple, disabled, onFiles });
  return createElement(
    "div",
    { "data-testid": "zone", "data-active": drop.active ? "true" : "false", ...drop.dropProps },
    createElement(
      "button",
      { type: "button", disabled, onClick: () => onClick?.() },
      "Ngarko foto",
    ),
  );
}

function Guard() {
  useBlockStrayFileDrops();
  return null;
}

function transfer(types: string[], files: File[] = []) {
  return {
    types,
    files,
    dropEffect: "none",
  };
}

describe("useFileDrop", () => {
  it("accepts a JPEG and shows the drag-over state", () => {
    const onFiles = vi.fn();
    render(createElement(DropTarget, { onFiles }));
    const button = screen.getByTestId("zone");
    const jpeg = new File(["photo"], "foto.jpg", { type: "image/jpeg" });

    fireEvent.dragEnter(button, { dataTransfer: transfer(["Files"], [jpeg]) });
    expect(button.getAttribute("data-active")).toBe("true");

    const over = createEvent.dragOver(button, {
      dataTransfer: transfer(["Files"], [jpeg]),
    });
    fireEvent(button, over);
    expect(over.defaultPrevented).toBe(true);
    expect(button.getAttribute("data-active")).toBe("true");

    const dropped = createEvent.drop(button, {
      dataTransfer: transfer(["Files"], [jpeg]),
    });
    fireEvent(button, dropped);
    expect(dropped.defaultPrevented).toBe(true);
    expect(button.getAttribute("data-active")).toBe("false");
    expect(onFiles).toHaveBeenCalledWith([jpeg], null);
  });

  it("rejects a file that is not an image and clears the drag-over state on leave", () => {
    const onFiles = vi.fn();
    render(createElement(DropTarget, { onFiles }));
    const button = screen.getByTestId("zone");
    const pdf = new File(["x"], "shenime.pdf", { type: "application/pdf" });

    fireEvent.dragEnter(button, { dataTransfer: transfer(["Files"], [pdf]) });
    expect(button.getAttribute("data-active")).toBe("true");
    fireEvent.dragLeave(button, { dataTransfer: transfer(["Files"], [pdf]) });
    expect(button.getAttribute("data-active")).toBe("false");

    fireEvent.drop(button, { dataTransfer: transfer(["Files"], [pdf]) });
    expect(onFiles).toHaveBeenCalledWith([], "Ngarko një foto JPEG, PNG ose WebP.");
  });

  it("rejects every file when a single-file target receives more than one", () => {
    const onFiles = vi.fn();
    render(createElement(DropTarget, { onFiles }));
    const button = screen.getByTestId("zone");
    const first = new File(["a"], "a.jpg", { type: "image/jpeg" });
    const second = new File(["b"], "b.png", { type: "image/png" });

    fireEvent.drop(button, { dataTransfer: transfer(["Files"], [first, second]) });
    expect(onFiles).toHaveBeenCalledWith([], "Zgjidh vetëm një foto.");
  });

  it("keeps the valid files from a mixed drop and reports the rejection", () => {
    const onFiles = vi.fn();
    render(createElement(DropTarget, { multiple: true, onFiles }));
    const button = screen.getByTestId("zone");
    const jpeg = new File(["a"], "a.jpg", { type: "image/jpeg" });
    const pdf = new File(["b"], "b.pdf", { type: "application/pdf" });

    fireEvent.drop(button, { dataTransfer: transfer(["Files"], [jpeg, pdf]) });
    expect(onFiles).toHaveBeenCalledWith([jpeg], "Ngarko një foto JPEG, PNG ose WebP.");
  });

  it("ignores a drag that is not a file", () => {
    const onFiles = vi.fn();
    render(createElement(DropTarget, { onFiles }));
    const button = screen.getByTestId("zone");
    const over = createEvent.dragOver(button, {
      dataTransfer: transfer(["text/plain"]),
    });
    fireEvent(button, over);
    const dropped = createEvent.drop(button, {
      dataTransfer: transfer(["text/plain"]),
    });
    fireEvent(button, dropped);

    expect(over.defaultPrevented).toBe(false);
    expect(dropped.defaultPrevented).toBe(false);
    expect(button.getAttribute("data-active")).toBe("false");
    expect(onFiles).not.toHaveBeenCalled();
  });

  it("opens the picker on a click after a drop", () => {
    const onFiles = vi.fn();
    const onClick = vi.fn();
    render(createElement(DropTarget, { onFiles, onClick }));
    const zone = screen.getByTestId("zone");
    const button = screen.getByRole("button", { name: "Ngarko foto" });
    const jpeg = new File(["photo"], "foto.jpg", { type: "image/jpeg" });

    fireEvent.drop(zone, { dataTransfer: transfer(["Files"], [jpeg]) });
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("keeps the highlight while moving onto a child and clears it when leaving the zone", () => {
    render(createElement(DropTarget, { onFiles: vi.fn() }));
    const zone = screen.getByTestId("zone");
    const button = screen.getByRole("button", { name: "Ngarko foto" });
    const dataTransfer = transfer(["Files"]);

    fireEvent.dragEnter(zone, { dataTransfer });
    // jsdom's generic event ignores `relatedTarget` in the init, so set it directly.
    const leave = (relatedTarget: Node) => {
      const event = createEvent.dragLeave(zone, { dataTransfer });
      Object.defineProperty(event, "relatedTarget", { value: relatedTarget });
      fireEvent(zone, event);
    };
    leave(button);
    expect(zone.getAttribute("data-active")).toBe("true");
    leave(document.body);
    expect(zone.getAttribute("data-active")).toBe("false");
  });

  it("clears the highlight when the drag ends elsewhere", () => {
    render(createElement(DropTarget, { onFiles: vi.fn() }));
    const zone = screen.getByTestId("zone");
    fireEvent.dragEnter(zone, { dataTransfer: transfer(["Files"]) });
    expect(zone.getAttribute("data-active")).toBe("true");
    fireEvent.dragEnd(window);
    expect(zone.getAttribute("data-active")).toBe("false");
  });

  it("claims file drags on a disabled zone but ignores the files", () => {
    const onFiles = vi.fn();
    render(createElement(DropTarget, { onFiles, disabled: true }));
    const zone = screen.getByTestId("zone");
    const jpeg = new File(["photo"], "foto.jpg", { type: "image/jpeg" });
    const dataTransfer = transfer(["Files"], [jpeg]);

    fireEvent.dragEnter(zone, { dataTransfer });
    expect(zone.getAttribute("data-active")).toBe("false");
    const over = createEvent.dragOver(zone, { dataTransfer });
    fireEvent(zone, over);
    expect(over.defaultPrevented).toBe(true);
    expect(dataTransfer.dropEffect).toBe("none");
    const dropped = createEvent.drop(zone, { dataTransfer });
    fireEvent(zone, dropped);
    expect(dropped.defaultPrevented).toBe(true);
    expect(onFiles).not.toHaveBeenCalled();
  });
});

describe("nested zones through a portal", () => {
  function Outer({
    onOuter,
    onInner,
  }: {
    onOuter: (files: File[]) => void;
    onInner: (files: File[]) => void;
  }) {
    const outer = useFileDrop({ onFiles: (files) => onOuter(files) });
    const inner = useFileDrop({ onFiles: (files) => onInner(files) });
    const portaled: ReactNode = createPortal(
      createElement(
        "div",
        { "data-testid": "portal" },
        createElement("div", { "data-testid": "inner", ...inner.dropProps }, "Brenda"),
        createElement("p", { "data-testid": "plain" }, "Tekst"),
      ),
      document.body,
    );
    return createElement(
      "div",
      { "data-testid": "outer", ...outer.dropProps },
      createElement("span", null, "Jashtë"),
      portaled,
    );
  }

  it("calls only the inner zone when the drop lands on the portaled zone", () => {
    const onOuter = vi.fn();
    const onInner = vi.fn();
    render(createElement(Outer, { onOuter, onInner }));
    const jpeg = new File(["p"], "foto.jpg", { type: "image/jpeg" });
    fireEvent.drop(screen.getByTestId("inner"), { dataTransfer: transfer(["Files"], [jpeg]) });
    expect(onInner).toHaveBeenCalledOnce();
    expect(onOuter).not.toHaveBeenCalled();
  });

  it("does not let the outer zone claim drags over other portaled content", () => {
    const onOuter = vi.fn();
    render(createElement(Outer, { onOuter, onInner: vi.fn() }));
    const plain = screen.getByTestId("plain");
    const dataTransfer = transfer(["Files"], [new File(["p"], "foto.jpg", { type: "image/jpeg" })]);
    const over = createEvent.dragOver(plain, { dataTransfer });
    fireEvent(plain, over);
    expect(over.defaultPrevented).toBe(false);
    fireEvent.drop(plain, { dataTransfer });
    expect(onOuter).not.toHaveBeenCalled();
    expect(screen.getByTestId("outer").getAttribute("data-active")).toBeNull();
  });
});

describe("filterDroppedFiles", () => {
  it("builds the size message from maxBytes", () => {
    const big = new File([new Uint8Array(3 * 1024 * 1024)], "a.jpg", { type: "image/jpeg" });
    expect(filterDroppedFiles([big], { maxBytes: 2 * 1024 * 1024 }).error).toBe(
      "Fotoja duhet të jetë më e vogël se 2 MB.",
    );
  });

  it("reports each distinct rejection reason once", () => {
    const pdf = new File(["x"], "a.pdf", { type: "application/pdf" });
    const txt = new File(["x"], "b.txt", { type: "text/plain" });
    const result = filterDroppedFiles([pdf, txt], { multiple: true });
    expect(result.accepted).toEqual([]);
    expect(result.error).toBe("Ngarko një foto JPEG, PNG ose WebP.");
  });
});

describe("useBlockStrayFileDrops", () => {
  it("cancels file drags that no zone claimed", () => {
    render(createElement(Guard));
    const dataTransfer = transfer(["Files"]);
    const over = createEvent.dragOver(document.body, { dataTransfer });
    fireEvent(document.body, over);
    expect(over.defaultPrevented).toBe(true);
    expect(dataTransfer.dropEffect).toBe("none");
    const dropped = createEvent.drop(document.body, { dataTransfer });
    fireEvent(document.body, dropped);
    expect(dropped.defaultPrevented).toBe(true);
  });

  it("leaves non-file drags alone and keeps a zone's copy effect", () => {
    render(createElement("div", null, createElement(Guard), createElement(DropTarget, { onFiles: vi.fn() })));
    const text = createEvent.dragOver(document.body, { dataTransfer: transfer(["text/plain"]) });
    fireEvent(document.body, text);
    expect(text.defaultPrevented).toBe(false);

    const zone = screen.getByTestId("zone");
    const dataTransfer = transfer(["Files"]);
    fireEvent.dragOver(zone, { dataTransfer });
    expect(dataTransfer.dropEffect).toBe("copy");
  });

  it("exempts a native file input", () => {
    render(createElement("div", null, createElement(Guard), createElement("input", { type: "file", "data-testid": "native" })));
    const input = screen.getByTestId("native");
    const over = createEvent.dragOver(input, { dataTransfer: transfer(["Files"]) });
    fireEvent(input, over);
    expect(over.defaultPrevented).toBe(false);
  });

  it("stops listening after unmount", () => {
    const view = render(createElement(Guard));
    view.unmount();
    const over = createEvent.dragOver(document.body, { dataTransfer: transfer(["Files"]) });
    fireEvent(document.body, over);
    expect(over.defaultPrevented).toBe(false);
  });
});
