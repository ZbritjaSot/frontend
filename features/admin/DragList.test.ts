/** @vitest-environment jsdom */
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createElement, useEffect, useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { DragList } from "@/features/admin/DragList";

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

/** Lets the live region's delayed announcement land. */
const flush = () => act(() => void vi.advanceTimersByTime(100));

type Row = { id: string; name: string };
const rows: Row[] = ["A", "B", "C"].map((name) => ({ id: name.toLowerCase(), name }));

function Harness({ onReorder }: { onReorder: (ids: string[]) => void }) {
  const [items, setItems] = useState(rows);
  // eslint-disable-next-line react/no-children-prop
  return createElement(DragList<Row>, {
    items,
    label: (row) => row.name,
    onReorder: (ids) => {
      onReorder(ids);
      setItems(ids.map((id) => items.find((row) => row.id === id) as Row));
    },
    children: (row) => createElement("span", null, row.name),
  });
}

function order() {
  return screen.getAllByRole("listitem").map((li) => li.querySelector("span")?.textContent);
}

describe("DragList move buttons", () => {
  it("disables up on the first item and down on the last", () => {
    render(createElement(Harness, { onReorder: vi.fn() }));
    expect((screen.getByLabelText("Zhvendos lart: A") as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByLabelText("Zhvendos poshtë: C") as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByLabelText("Zhvendos poshtë: A") as HTMLButtonElement).disabled).toBe(false);
  });

  it("calls onReorder, announces the position and keeps focus on the moved item", () => {
    const onReorder = vi.fn();
    render(createElement(Harness, { onReorder }));
    const down = screen.getByLabelText("Zhvendos poshtë: A");
    down.focus();
    fireEvent.click(down);
    expect(onReorder).toHaveBeenCalledWith(["b", "a", "c"]);
    expect(order()).toEqual(["B", "A", "C"]);
    flush();
    expect(screen.getByRole("status").textContent).toBe("A u zhvendos në pozicionin 2 nga 3");
    expect(document.activeElement).toBe(screen.getByLabelText("Zhvendos poshtë: A"));
  });

  it("moves focus to the sibling button when the item reaches an end", () => {
    render(createElement(Harness, { onReorder: vi.fn() }));
    fireEvent.click(screen.getByLabelText("Zhvendos poshtë: A"));
    fireEvent.click(screen.getByLabelText("Zhvendos poshtë: A"));
    flush();
    expect(screen.getByRole("status").textContent).toBe("A u zhvendos në pozicionin 3 nga 3");
    expect((screen.getByLabelText("Zhvendos poshtë: A") as HTMLButtonElement).disabled).toBe(true);
    expect(document.activeElement).toBe(screen.getByLabelText("Zhvendos lart: A"));
  });

  it("keeps the drag handle", () => {
    render(createElement(Harness, { onReorder: vi.fn() }));
    expect(screen.getByLabelText("Rendit A").getAttribute("draggable")).toBe("true");
  });
});

type Api = { setIds: { current: (ids: string[]) => void }; onReorder: Mock<(ids: string[]) => void> };

/** Items are controlled from the outside to simulate optimistic updates, rollbacks and slow saves. */
function Controlled({
  api,
  register,
  applyOnReorder,
}: {
  api: Api;
  register: (set: (ids: string[]) => void) => void;
  applyOnReorder: boolean;
}) {
  const [ids, setIds] = useState(rows.map((row) => row.id));
  useEffect(() => {
    register(setIds);
  }, [register]);
  const items = ids.map((id) => rows.find((row) => row.id === id) as Row);
  // eslint-disable-next-line react/no-children-prop
  return createElement(DragList<Row>, {
    items,
    label: (row) => row.name,
    onReorder: (next) => {
      api.onReorder(next);
      if (applyOnReorder) setIds(next);
    },
    children: (row) => createElement("span", null, row.name),
  });
}

function setup(applyOnReorder: boolean) {
  const api: Api = { setIds: { current: () => undefined }, onReorder: vi.fn<(ids: string[]) => void>() };
  render(
    createElement(Controlled, {
      api,
      applyOnReorder,
      register: (set) => {
        api.setIds.current = set;
      },
    }),
  );
  return api;
}

const status = () => screen.getByRole("status").textContent;

describe("DragList pending move handling", () => {
  it("announces a rollback when an optimistic move returns to the original order", () => {
    const api = setup(true);
    fireEvent.click(screen.getByLabelText("Zhvendos poshtë: A"));
    flush();
    expect(status()).toBe("A u zhvendos në pozicionin 2 nga 3");
    act(() => api.setIds.current(["a", "b", "c"]));
    flush();
    expect(status()).toBe("Renditja nuk u ruajt; A mbeti në pozicionin 1");
    // The failed move is no longer pending: a retry is accepted.
    fireEvent.click(screen.getByLabelText("Zhvendos poshtë: A"));
    expect(api.onReorder).toHaveBeenCalledTimes(2);
  });

  it("announces an identical retry again by clearing the region first", () => {
    const api = setup(true);
    fireEvent.click(screen.getByLabelText("Zhvendos poshtë: A"));
    flush();
    act(() => api.setIds.current(["a", "b", "c"]));
    flush();
    fireEvent.click(screen.getByLabelText("Zhvendos poshtë: A"));
    expect(status()).toBe("");
    flush();
    expect(status()).toBe("A u zhvendos në pozicionin 2 nga 3");
  });

  it("ignores a click while a move is still pending", () => {
    const api = setup(false);
    fireEvent.click(screen.getByLabelText("Zhvendos poshtë: A"));
    fireEvent.click(screen.getByLabelText("Zhvendos poshtë: B"));
    expect(api.onReorder).toHaveBeenCalledTimes(1);
  });

  it("does not fire a stale pending move after an unrelated reorder", () => {
    const api = setup(false);
    fireEvent.click(screen.getByLabelText("Zhvendos poshtë: A"));
    // Save failed silently; then something unrelated reorders the list.
    act(() => api.setIds.current(["c", "b", "a"]));
    act(() => api.setIds.current(["b", "a", "c"]));
    flush();
    expect(status()).toBe("");
    expect(document.activeElement).toBe(document.body);
  });
});
