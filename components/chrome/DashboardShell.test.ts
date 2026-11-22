/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

const route = { pathname: "/admin/offers" };
let desktop = false;
const mediaListeners = new Set<() => void>();

vi.mock("next/navigation", () => ({
  usePathname: () => route.pathname,
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    onClick,
    className,
    ...rest
  }: {
    href: string;
    children: ReactNode;
    onClick?: () => void;
    className?: string;
  }) => createElement("a", { href, onClick, className, ...rest }, children),
}));

const { DashboardShell, groupNav } = await import("@/components/chrome/DashboardShell");

function installMatchMedia() {
  window.matchMedia = ((query: string) => ({
    get matches() {
      return query === "(min-width: 1024px)" ? desktop : false;
    },
    media: query,
    onchange: null,
    addEventListener: (_type: string, listener: () => void) => {
      mediaListeners.add(listener);
    },
    removeEventListener: (_type: string, listener: () => void) => {
      mediaListeners.delete(listener);
    },
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

function renderShell() {
  return render(
    createElement(
      DashboardShell,
      {
        area: "admin",
        nav: [
          { href: "/admin", label: "Paneli" },
          { href: "/admin/offers", label: "Në pritje" },
          { href: "/admin/businesses", label: "Bizneset" },
        ],
      },
      createElement("a", { href: "/admin/offers/1" }, "Oferta e hapur"),
    ),
  );
}

function pressTab(shiftKey = false) {
  const target = document.activeElement instanceof HTMLElement ? document.activeElement : document.body;
  fireEvent.keyDown(target, { key: "Tab", shiftKey });
}

function menuButton() {
  const button = document.querySelector("header button");
  if (!(button instanceof HTMLButtonElement)) {
    throw new Error("Missing menu button");
  }
  return button;
}

afterEach(() => {
  cleanup();
  desktop = false;
  mediaListeners.clear();
});

describe("DashboardShell mobile drawer", () => {
  it("keeps a closed drawer out of the tab order and marks the current page", () => {
    installMatchMedia();
    renderShell();

    const drawer = document.getElementById("dash-nav");
    expect(drawer?.hasAttribute("inert")).toBe(true);
    expect(drawer?.getAttribute("aria-hidden")).toBe("true");
    expect(screen.getByRole("link", { name: "Në pritje", hidden: true }).tabIndex).toBe(-1);
    expect(screen.getByRole("link", { name: "Paneli", hidden: true }).hasAttribute("aria-current")).toBe(
      false,
    );
    expect(screen.getByRole("link", { name: "Në pritje", hidden: true }).getAttribute("aria-current")).toBe(
      "page",
    );
    expect(
      screen.getByRole("link", { name: "Në pritje", hidden: true }).className,
    ).toContain("focus-visible:outline-focus");
    expect(document.querySelector("[class*='min-[860px]']")).toBeNull();

    const menu = screen.getByRole("button", { name: "Hap menynë" });
    menu.focus();
    fireEvent.click(menu);
    expect(document.activeElement).not.toBe(screen.getByRole("link", { name: "Oferta e hapur" }));
    expect(drawer?.contains(document.activeElement)).toBe(true);
  });

  it("cycles Tab inside the open drawer and returns focus to the hamburger", () => {
    installMatchMedia();
    renderShell();

    const menu = menuButton();
    menu.focus();
    fireEvent.keyDown(menu, { key: "Enter" });
    fireEvent.click(menu);

    const mainLink = screen.getByRole("link", { name: "Oferta e hapur" });
    expect(document.getElementById("dash-nav")?.contains(document.activeElement)).toBe(true);

    const seen: string[] = [];
    for (let step = 0; step < 8 && document.activeElement !== menuButton(); step += 1) {
      seen.push(document.activeElement?.textContent?.replace(/\s+/g, " ").trim() ?? "");
      pressTab();
      expect(document.activeElement).not.toBe(mainLink);
    }
    expect(document.activeElement).toBe(menuButton());
    expect(seen.some((text) => text.includes("Në pritje"))).toBe(true);

    pressTab(true);
    expect(document.activeElement?.textContent).toContain("Faqja publike");
    pressTab();
    expect(document.activeElement).toBe(menuButton());

    fireEvent.keyDown(menuButton(), { key: "Enter" });
    fireEvent.click(menuButton());
    expect(document.activeElement).toBe(menuButton());
    expect(document.getElementById("dash-nav")?.hasAttribute("inert")).toBe(true);

    fireEvent.click(menuButton());
    fireEvent.keyDown(document.activeElement ?? document.body, { key: "Escape" });
    expect(document.activeElement).toBe(menuButton());
    expect(screen.getByRole("link", { name: "Oferta e hapur" }).tabIndex).toBe(0);
  });

  it("leaves the sidebar in the tab order on a wide screen", () => {
    desktop = true;
    installMatchMedia();
    renderShell();

    const drawer = document.getElementById("dash-nav");
    expect(drawer?.hasAttribute("inert")).toBe(false);
    expect(screen.getByRole("link", { name: "Në pritje" }).tabIndex).toBe(0);
    expect(screen.getByRole("link", { name: "Në pritje" }).getAttribute("aria-current")).toBe("page");
  });
});

describe("DashboardShell grouped nav", () => {
  const nav = [
    { href: "/admin", label: "Paneli" },
    { href: "/admin/offers", label: "Në pritje", group: "Moderimi" },
    { href: "/admin/audit", label: "Historiku", group: "Moderimi" },
    { href: "/admin/businesses", label: "Bizneset", group: "Katalogu" },
  ];

  it("groups consecutive items by section label and keeps ungrouped items first", () => {
    const sections = groupNav(nav);
    expect(sections.map((section) => section.label)).toEqual([undefined, "Moderimi", "Katalogu"]);
    expect(sections[1].items.map((item) => item.href)).toEqual(["/admin/offers", "/admin/audit"]);
  });

  it("renders labelled groups with unchanged hrefs and aria-current", () => {
    installMatchMedia();
    desktop = true;
    render(createElement(DashboardShell, { area: "admin", nav }, createElement("p", null, "x")));

    const moderation = screen.getByRole("group", { name: "Moderimi" });
    expect(moderation.querySelectorAll("a")).toHaveLength(2);
    expect(screen.getByRole("group", { name: "Katalogu" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Historiku" }).getAttribute("href")).toBe("/admin/audit");
    expect(screen.getByRole("link", { name: "Në pritje" }).getAttribute("aria-current")).toBe("page");
  });
});

describe("DashboardShell identity block and layout", () => {
  const nav = [{ href: "/admin", label: "Paneli" }];

  it("shows name, role and extra rows above Logout, truncating long values", () => {
    installMatchMedia();
    desktop = true;
    render(
      createElement(
        DashboardShell,
        {
          area: "biz",
          nav,
          identity: { name: "Një Emër Shumë i Gjatë Përdoruesi", roleLabel: "Menaxher" },
          identityExtra: createElement("p", null, "Dyqani: Albi Mall"),
        },
        createElement("p", null, "x"),
      ),
    );
    const block = document.querySelector("[data-dash-identity]") as HTMLElement;
    expect(block.textContent).toContain("Një Emër Shumë i Gjatë Përdoruesi");
    expect(block.textContent).toContain("Menaxher");
    expect(block.textContent).toContain("Dyqani: Albi Mall");
    expect(screen.getByText("Menaxher").className).toContain("truncate");
    expect(screen.getByText("Një Emër Shumë i Gjatë Përdoruesi").className).toContain("truncate");
  });

  it("renders no identity block without a user", () => {
    installMatchMedia();
    render(createElement(DashboardShell, { area: "admin", nav }, createElement("p", null, "x")));
    expect(document.querySelector("[data-dash-identity]")).toBeNull();
  });

  it("scrolls with the document and flags the public link as opening a new tab", () => {
    installMatchMedia();
    desktop = true;
    render(createElement(DashboardShell, { area: "admin", nav }, createElement("p", null, "x")));
    const main = document.getElementById("dash-main") as HTMLElement;
    expect(main.className).not.toContain("overflow");
    expect(document.getElementById("dash-nav")?.className).toContain("lg:sticky");
    expect(document.querySelector("header")?.className).toContain("sticky");
    const link = screen.getByRole("link", { name: /Faqja publike/ });
    expect(link.getAttribute("rel")).toBe("noopener noreferrer");
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.textContent).toContain("(hapet në skedë të re)");
  });
});
