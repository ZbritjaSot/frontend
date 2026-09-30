import { expect, test } from "@playwright/test";

const pages = [
  { path: "/", heading: /Zbritjet e ditës/ },
  { path: "/?katalog=oferta", heading: /Zbritjet|Ofertat/ },
  { path: "/?katalog=fletushka", heading: /Fletushkat/ },
  { path: "/biznese", heading: /Dyqanet/ },
  { path: "/ekskluzive", heading: /Ekskluzive|Përfito tani/ },
  { path: "/cilesimet", heading: /Cilësimet/ },
  { path: "/preferuarat", heading: /Të preferuarat/ },
  { path: "/privatesia", heading: /Privatësia/ },
  { path: "/kushtet", heading: /Kushtet/ },
];

test("public pages render", async ({ page }) => {
  for (const entry of pages) {
    const response = await page.goto(entry.path);
    expect(response?.ok()).toBeTruthy();
    await expect(page.getByRole("heading", { name: entry.heading }).first()).toBeVisible();
    await expect(page.getByText("Diçka shkoi keq")).toHaveCount(0);
  }
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
