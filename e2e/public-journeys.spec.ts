import { expect, test } from "@playwright/test";

test("public cards open offer, flyer, and shop pages", async ({ page }) => {
  await page.goto("/oferta");
  await expect(page.getByText("Diçka shkoi keq")).toHaveCount(0);

  const offerLink = page.locator('a[href^="/offers/"]').first();
  await expect(offerLink).toBeVisible({ timeout: 20000 });
  await offerLink.click();
  await expect(page).toHaveURL(/\/offers\//);
  await expect(page.getByText("Oferta nuk u gjet")).toHaveCount(0);
  await expect(page.getByText(/Kurse|Deri më|€/).first()).toBeVisible();

  await page.goto("/fletushka");
  const flyerLink = page.locator('a[href^="/dosje/"]').first();
  await expect(flyerLink).toBeVisible({ timeout: 20000 });
  await flyerLink.click();
  await expect(page).toHaveURL(/\/dosje\//);
  await expect(page.getByText("Fletushka nuk u gjet")).toHaveCount(0);

  await page.goto("/biznese");
  const shopLink = page.locator('a[href^="/biznese/"]').first();
  await expect(shopLink).toBeVisible({ timeout: 20000 });
  await shopLink.click();
  await expect(page).toHaveURL(/\/biznese\//);
  await expect(page.getByText("Dyqani nuk u gjet")).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Shiko lokacionin" }).first()).toBeVisible();
});

test("city filter comes before sort on the phone catalog", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/oferta");
  const city = page.getByText("Qyteti", { exact: true }).first();
  const sort = page.getByText("Rendit", { exact: true }).first();
  await expect(city).toBeVisible({ timeout: 20000 });
  await expect(sort).toBeVisible();
  const cityBox = await city.boundingBox();
  const sortBox = await sort.boundingBox();
  expect(cityBox).not.toBeNull();
  expect(sortBox).not.toBeNull();
  expect(cityBox!.y).toBeLessThanOrEqual(sortBox!.y);
});
