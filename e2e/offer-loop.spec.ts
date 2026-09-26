import { expect, type Page, test } from "@playwright/test";

const password = process.env.E2E_PASSWORD ?? "password";
const bizEmail = process.env.E2E_BIZ_EMAIL ?? "viva@test.com";
const adminEmail = process.env.E2E_ADMIN_EMAIL ?? "admin@test.com";
const apiUrl = process.env.E2E_API_URL ?? "http://localhost:8001";

async function login(page: Page, path: string, email: string, home: RegExp) {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    await page.goto(path);
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Fjalëkalimi").fill(password);
    await page.getByRole("button", { name: "Hyr" }).click({ timeout: 15_000 });

    const outcome = await Promise.race([
      page.waitForURL(home).then(() => "ok" as const),
      page.locator("p[role='alert']").waitFor().then(async () => {
        const text = await page.locator("p[role='alert']").innerText();
        return text.includes("Too Many Attempts") ? ("throttled" as const) : text;
      }),
    ]);

    if (outcome === "ok") {
      return;
    }

    if (outcome !== "throttled") {
      throw new Error(outcome);
    }

    await page.waitForTimeout(61_000);
  }

  throw new Error(`Login did not reach ${home}`);
}

async function createAndSubmit(
  page: Page,
  title: string,
  product: string,
  window: "live" | "expired",
) {
  await page.goto("/biz/offers/new");
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
  await page.getByRole("button", { name: "Kategoria e produktit 1" }).click();
  await page.getByRole("option", { name: "Kafene" }).click();

  const price = page.getByLabel("Çmimi origjinal i produktit 1");
  await price.press("2");
  await price.press("0");
  await price.press("0");
  await page.getByLabel("Zbritja në përqindje e produktit 1").fill("30");

  await page.getByRole("button", { name: "Ruaj draft" }).click();
  await page.waitForURL("**/biz/offers");

  const folderLink = page.getByRole("link", { name: title, exact: true });
  const href = await folderLink.getAttribute("href");
  const id = href?.split("/").pop();
  expect(id).toBeTruthy();

  await page.getByRole("button", { name: `Dërgo ${title}` }).click();
  await expect(page.getByRole("button", { name: `Dërgo ${title}` })).toHaveCount(0);

  return id as string;
}

async function logout(page: Page) {
  const button = page.getByRole("button", { name: "Dil" });
  if ((await button.count()) === 0) {
    await page.goto("/admin");
  }

  await button.waitFor();
  await button.click();
  await page.waitForURL(/\/(admin|biz)\/login/);
}

async function deleteFolder(page: Page, id: string) {
  await page.request.get(`${apiUrl}/sanctum/csrf-cookie`);
  const cookies = await page.context().cookies(apiUrl);
  const xsrf = cookies.find((cookie) => cookie.name === "XSRF-TOKEN");
  const response = await page.request.delete(`${apiUrl}/api/v1/biz/offer-bundles/${id}`, {
    headers: {
      Accept: "application/json",
      Referer: "http://localhost:3001",
      "X-XSRF-TOKEN": decodeURIComponent(xsrf?.value ?? ""),
    },
  });
  expect(response.ok() || response.status() === 404).toBe(true);
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
  test.setTimeout(180_000);
  const stamp = Date.now();
  const liveTitle = `E2E live ${stamp}`;
  const liveProduct = `E2E espresso ${stamp}`;
  const expiredTitle = `E2E expired ${stamp}`;
  const expiredProduct = `E2E skaduar ${stamp}`;
  const created: string[] = [];

  try {
    await login(page, "/biz/login", bizEmail, /\/biz$/);
    created.push(await createAndSubmit(page, liveTitle, liveProduct, "live"));
    created.push(await createAndSubmit(page, expiredTitle, expiredProduct, "expired"));

    await page.getByRole("button", { name: "Dil" }).click();
    await page.waitForURL("**/biz/login");

    await login(page, "/admin/login", adminEmail, /\/admin$/);
    await approve(page, created[0]);
    await approve(page, created[1]);

    await page.goto(`/?q=${encodeURIComponent(liveProduct)}`);
    await expect(page.getByRole("link", { name: liveProduct })).toBeVisible();

    await page.goto(`/?q=${encodeURIComponent(expiredProduct)}`);
    await expect(page.getByRole("heading", { name: "Nuk u gjet asgjë" })).toBeVisible();
    await expect(page.getByRole("link", { name: expiredProduct })).toHaveCount(0);
  } finally {
    if (created.length > 0) {
      await logout(page);
      await login(page, "/biz/login", bizEmail, /\/biz$/);
      for (const id of created) {
        await deleteFolder(page, id);
      }
    }
  }
});
