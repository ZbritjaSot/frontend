/** @vitest-environment jsdom */
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createElement, useEffect } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ToastProvider, useToast } from "@/components/ui/Toast";

type ShowToast = ReturnType<typeof useToast>["showToast"];

/** Grabs `showToast` out of context so tests can call it directly. */
function Harness({ onReady }: { onReady: (showToast: ShowToast) => void }) {
  const { showToast } = useToast();
  useEffect(() => {
    onReady(showToast);
  }, [onReady, showToast]);
  return null;
}

function renderProvider() {
  let showToast: ShowToast = () => {};
  render(
    createElement(
      ToastProvider,
      null,
      createElement(Harness, { onReady: (fn) => (showToast = fn) }),
    ),
  );
  return (...args: Parameters<ShowToast>) => act(() => showToast(...args));
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("ToastProvider", () => {
  it("renders a single aria-live region and announces the toast message", () => {
    const showToast = renderProvider();
    showToast("U dërgua për aprovim");

    const regions = document.querySelectorAll('[aria-live="polite"]');
    expect(regions).toHaveLength(1);
    expect(screen.getByText("U dërgua për aprovim")).toBeTruthy();
  });

  it("auto-dismisses after the default duration", () => {
    const showToast = renderProvider();
    showToast("U ruajt");
    expect(screen.getByText("U ruajt")).toBeTruthy();

    act(() => {
      vi.advanceTimersByTime(4999);
    });
    expect(screen.getByText("U ruajt")).toBeTruthy();

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(screen.queryByText("U ruajt")).toBeNull();
  });

  it("gives error toasts a longer duration so the failure reason stays readable", () => {
    const showToast = renderProvider();
    showToast("Nuk mundëm ta ruajmë ofertën.", { tone: "error" });

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.getByText("Nuk mundëm ta ruajmë ofertën.")).toBeTruthy();

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.queryByText("Nuk mundëm ta ruajmë ofertën.")).toBeNull();
  });

  it("dismisses immediately when the close button is clicked", () => {
    const showToast = renderProvider();
    showToast("U fshi oferta");

    fireEvent.click(screen.getByRole("button", { name: /^Mbyll njoftimin/ }));
    expect(screen.queryByText("U fshi oferta")).toBeNull();
  });

  it("dismisses on Escape while focus is inside the toast", () => {
    const showToast = renderProvider();
    showToast("U ruajt");

    const toast = screen.getByText("U ruajt").parentElement as HTMLElement;
    fireEvent.keyDown(toast, { key: "Escape" });
    expect(screen.queryByText("U ruajt")).toBeNull();
  });

  it("runs the action callback and dismisses when its button is clicked", () => {
    const onUndo = vi.fn();
    const showToast = renderProvider();
    showToast("U hoq nga të preferuarat", {
      action: { label: "Zhbëj", onClick: onUndo },
    });

    fireEvent.click(screen.getByRole("button", { name: /^Zhbëj/ }));
    expect(onUndo).toHaveBeenCalledTimes(1);
    expect(screen.queryByText("U hoq nga të preferuarat")).toBeNull();
  });

  it("stacks rapid toasts instead of replacing the previous one", () => {
    const showToast = renderProvider();
    showToast("U aprovua · Shiko në faqe #1");
    showToast("U aprovua · Shiko në faqe #2");
    showToast("U aprovua · Shiko në faqe #3");

    expect(screen.getByText("U aprovua · Shiko në faqe #1")).toBeTruthy();
    expect(screen.getByText("U aprovua · Shiko në faqe #2")).toBeTruthy();
    expect(screen.getByText("U aprovua · Shiko në faqe #3")).toBeTruthy();
  });

  it("caps simultaneous toasts by dropping the oldest once the cap is exceeded", () => {
    const showToast = renderProvider();
    for (let i = 1; i <= 5; i += 1) {
      showToast(`Njoftim ${i}`);
    }

    expect(screen.queryByText("Njoftim 1")).toBeNull();
    expect(screen.getByText("Njoftim 2")).toBeTruthy();
    expect(screen.getByText("Njoftim 5")).toBeTruthy();
  });
});
