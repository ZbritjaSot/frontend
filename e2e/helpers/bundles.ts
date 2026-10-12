import { expect, type Page } from "@playwright/test";
import { apiUrl } from "./auth";

async function apiHeaders(page: Page): Promise<Record<string, string>> {
  await page.request.get(`${apiUrl}/sanctum/csrf-cookie`);
  const cookies = await page.context().cookies(apiUrl);
  const xsrf = cookies.find((cookie) => cookie.name === "XSRF-TOKEN");
  return {
    Accept: "application/json",
    Referer: "http://localhost:3001",
    "X-XSRF-TOKEN": decodeURIComponent(xsrf?.value ?? ""),
  };
}

export async function listBundleIds(
  page: Page,
  catalog: "flyers" | "offers",
  status = "draft",
): Promise<string[]> {
  const headers = await apiHeaders(page);
  const response = await page.request.get(
    `${apiUrl}/api/v1/biz/offer-bundles?kind=${catalog}&status=${status}&per_page=50`,
    { headers },
  );
  expect(response.ok()).toBeTruthy();
  const body = (await response.json()) as { data: Array<{ id: string }> };
  return body.data.map((row) => row.id);
}

/** Create a draft flyer or standalone offer batch via the biz UI, return its id. */
export async function createDraftBundle(
  page: Page,
  catalog: "flyers" | "offers",
  title: string,
  product: string,
): Promise<string> {
  const before = new Set(await listBundleIds(page, catalog, "draft"));
  const path = catalog === "flyers" ? "/biz/flyers/new" : "/biz/offers/new";

  await page.goto(path);
  if (catalog === "flyers") {
    await expect(page.getByLabel("Titulli i fletushkës")).toBeVisible({
      timeout: 30_000,
    });
    await page.getByLabel("Titulli i fletushkës").fill(title);
  } else {
    await expect(page.getByLabel("Emri i produktit 1")).toBeVisible({
      timeout: 30_000,
    });
  }

  await page.getByLabel("Emri i produktit 1").fill(product);
  await page.getByRole("button", { name: "Kategoritë e produktit 1" }).click();
  await page.getByRole("option", { name: "Kafene" }).click();

  const price = page.getByLabel("Çmimi origjinal i produktit 1");
  await price.press("2");
  await price.press("0");
  await price.press("0");
  await page.getByLabel("Zbritja në përqindje e produktit 1").fill("25");

  await page.getByRole("button", { name: "Ruaj draft" }).click();
  await page.waitForURL(`**/biz/${catalog}`);

  let created: string | undefined;
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const after = await listBundleIds(page, catalog, "draft");
    created = after.find((id) => !before.has(id));
    if (created) {
      break;
    }
    await page.waitForTimeout(500);
  }
  expect(created).toBeTruthy();
  return created as string;
}

export async function submitBundle(page: Page, title: string): Promise<void> {
  await page.getByRole("button", { name: `Dërgo ${title}` }).click();
  await expect(page.getByRole("button", { name: `Dërgo ${title}` })).toHaveCount(
    0,
  );
}

export async function deleteBundle(page: Page, id: string): Promise<void> {
  const headers = await apiHeaders(page);
  const response = await page.request.delete(
    `${apiUrl}/api/v1/biz/offer-bundles/${id}`,
    { headers },
  );
  expect(response.ok() || response.status() === 404).toBe(true);
}

export async function firstAdminBusinessId(page: Page): Promise<string> {
  await page.goto("/admin/businesses");
  const link = page.locator('a[href^="/admin/businesses/"]').first();
  await expect(link).toBeVisible({ timeout: 20_000 });
  const href = await link.getAttribute("href");
  const id = href?.split("/").filter(Boolean).pop();
  expect(id && id !== "pending-locations" && id !== "pending-branches").toBeTruthy();
  return id as string;
}
