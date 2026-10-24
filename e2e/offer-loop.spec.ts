import { expect, type Page, test } from "@playwright/test";
import { adminEmail, bizEmail, login, logout, password } from "./helpers/auth";
import { deleteBundle } from "./helpers/bundles";
import { clearLaravelCache, setPassword } from "./helpers/laravel";

async function createAndSubmit(
  page: Page,
  title: string,
  product: string,
  window: "live" | "expired",
) {
  await page.goto("/biz/flyers/new");
  await expect(page.getByLabel("Titulli i fletushkës")).toBeVisible({
    timeout: 30_000,
  });
  await page.getByLabel("Titulli i fletushkës").fill(title);

  if (window === "expired") {
    await page.getByRole("button", { name: "Fillon" }).click();
    const startCalendar = page.getByRole("dialog", { name: "Kalendari" });
    await startCalendar.getByRole("button", { name: "Muaji i kaluar" }).click();
    await startCalendar.getByRole("button", { name: "Muaji i kaluar" }).click();
    await startCalendar.getByRole("button", { name: "1", exact: true }).click();

    await page.getByRole("button", { name: "Skadon" }).click();
    const endCalendar = page.getByRole("dialog", { name: "Kalendari" });
    await endCalendar.getByRole("button", { name: "Muaji i kaluar" }).click();
    await endCalendar.getByRole("button", { name: "15", exact: true }).click();
  }

  await page.getByLabel("Emri i produktit 1").fill(product);
  await page.getByRole("button", { name: "Kategoritë e produktit 1" }).click();
  await page.getByRole("option", { name: "Kafene" }).click();

  const price = page.getByLabel("Çmimi origjinal i produktit 1");
  await price.press("2");
  await price.press("0");
  await price.press("0");
  await page.getByLabel("Zbritja në përqindje e produktit 1").fill("30");

  await page.getByRole("button", { name: "Ruaj draft" }).click();
  await page.waitForURL("**/biz/flyers");

  const folderLink = page.getByRole("link", { name: title, exact: true });
  const href = await folderLink.getAttribute("href");
  const id = href?.split("/").pop();
  expect(id).toBeTruthy();

  await page.getByRole("button", { name: `Dërgo ${title}` }).click();
  await expect(page.getByRole("button", { name: `Dërgo ${title}` })).toHaveCount(
    0,
  );

  return id as string;
}

async function approve(page: Page, id: string) {
  await page.goto(`/admin/offers/${id}`);
  await page.getByRole("button", { name: "Aprovo" }).click();
  await page
    .getByRole("dialog", { name: "Aprovo dosjen" })
    .getByRole("button", { name: "Aprovo" })
    .click();
  await page.waitForURL("**/admin/offers");
}

test("a shop offer appears in public after approval, and an expired one stays hidden", async ({
  page,
}) => {
  test.setTimeout(360_000);
  const stamp = Date.now();
  const liveTitle = `E2E live ${stamp}`;
  const liveProduct = `E2E espresso ${stamp}`;
  const expiredTitle = `E2E expired ${stamp}`;
  const expiredProduct = `E2E skaduar ${stamp}`;
  const created: string[] = [];

  try {
    clearLaravelCache();
    setPassword(bizEmail, password);
    await login(page, "/login", bizEmail, /\/biz$/);
    created.push(await createAndSubmit(page, liveTitle, liveProduct, "live"));
    created.push(
      await createAndSubmit(page, expiredTitle, expiredProduct, "expired"),
    );

    await logout(page);

    await login(page, "/login", adminEmail, /\/admin$/);
    await approve(page, created[0]);
    await approve(page, created[1]);

    await page.goto(`/?q=${encodeURIComponent(liveProduct)}`);
    await expect(page.getByRole("link", { name: liveProduct })).toBeVisible();

    await page.goto(`/?q=${encodeURIComponent(expiredProduct)}`);
    await expect(
      page.getByRole("heading", { name: "Nuk u gjet asgjë" }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: expiredProduct })).toHaveCount(
      0,
    );
  } finally {
    if (created.length > 0 && !page.isClosed()) {
      clearLaravelCache();
      await logout(page).catch(() => undefined);
      await login(page, "/login", bizEmail, /\/biz$/);
      for (const id of created) {
        await deleteBundle(page, id);
      }
    }
  }
});
