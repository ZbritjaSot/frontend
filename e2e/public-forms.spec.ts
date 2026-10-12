import { expect, test } from "@playwright/test";

test("settings and inquiry pages render forms", async ({ page }) => {
  await page.goto("/cilesimet");
  await expect(page.getByRole("heading", { name: /Cilësimet/ })).toBeVisible();

  await page.goto("/cilesimet/kontakt");
  await expect(page.getByRole("heading", { name: /Na Kontakto/ })).toBeVisible();
  await expect(page.getByLabel("Emri")).toBeVisible();
  await page.getByRole("button", { name: "Dërgo mesazhin" }).click();
  await expect(page.getByText("Shkruaj emrin.")).toBeVisible();

  await page.goto("/cilesimet/partner");
  await expect(page.getByRole("heading", { name: "Bëhu Partner" })).toBeVisible();
  await expect(page.getByText("Diçka shkoi keq")).toHaveCount(0);
});

test("newsletter unsubscribe page renders", async ({ page }) => {
  const response = await page.goto("/buletini/caktivizo");
  expect(response?.ok()).toBeTruthy();
  await expect(page.getByText("Diçka shkoi keq")).toHaveCount(0);
});

test("phone layout keeps settings usable", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/cilesimet");
  await expect(page.getByRole("heading", { name: /Cilësimet/ })).toBeVisible();
  const main = page.locator("main").first();
  await expect(main).toBeVisible();
});
