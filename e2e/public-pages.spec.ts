import { expect, test, type ConsoleMessage } from "@playwright/test";

const pages = [
  { path: "/", heading: /Zbritjet e ditës/ },
  { path: "/oferta", heading: /Zbritjet|Ofertat/ },
  { path: "/fletushka", heading: /Fletushkat/ },
  { path: "/biznese", heading: /Partnerët/ },
  { path: "/ekskluzive", heading: /Ekskluzive|Përfito tani/ },
  { path: "/cilesimet", heading: /Cilësimet/ },
  { path: "/preferuarat", heading: /Të preferuarat/ },
  { path: "/privatesia", heading: /Privatësia/ },
  { path: "/kushtet", heading: /Kushtet/ },
];

function isHydrationConsoleMessage(message: ConsoleMessage): boolean {
  if (message.type() !== "error") {
    return false;
  }
  const text = message.text();
  return (
    text.includes("Hydration") ||
    text.includes("hydrated") ||
    text.includes("did not match") ||
    text.includes("hydration-mismatch")
  );
}

test("public pages render", async ({ page }) => {
  for (const entry of pages) {
    const response = await page.goto(entry.path);
    expect(response?.ok()).toBeTruthy();
    await expect(page.getByRole("heading", { name: entry.heading }).first()).toBeVisible();
    await expect(page.getByText("Diçka shkoi keq")).toHaveCount(0);
  }
});

test("catalogue cards hydrate without mismatch warnings", async ({ page }) => {
  const hydrationErrors: string[] = [];
  page.on("console", (message) => {
    if (isHydrationConsoleMessage(message)) {
      hydrationErrors.push(message.text());
    }
  });
  page.on("pageerror", (error) => {
    if (/hydrat/i.test(error.message)) {
      hydrationErrors.push(error.message);
    }
  });

  for (const path of ["/oferta", "/fletushka", "/"]) {
    await page.goto(path);
    await expect(page.getByText("Diçka shkoi keq")).toHaveCount(0);
    // Cards (and shop initials / expiry dates) must be in the first paint.
    await expect(
      page.locator('a[href^="/offers/"], a[href^="/dosje/"]').first(),
    ).toBeVisible({ timeout: 20000 });
  }

  expect(hydrationErrors).toEqual([]);
});

test("legacy katalog query redirects to dedicated catalogue routes", async ({ page }) => {
  await page.goto("/?katalog=oferta&category=ushqim");
  await expect(page).toHaveURL(/\/oferta(\?|$)/);
  expect(page.url()).toContain("category=ushqim");
  await page.goto("/?katalog=fletushka");
  await expect(page).toHaveURL(/\/fletushka\/?$/);
});

test("the exclusive mark stays on a phone", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Hap menynë" }).click();
  const mark = page.getByRole("navigation", { name: "Kryesore" }).getByRole("link", { name: "Ekskluzive" });
  await expect(mark).toBeVisible();
  const box = await mark.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.x).toBeGreaterThan(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(390);
});
