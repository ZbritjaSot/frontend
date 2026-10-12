import { expect, test } from "@playwright/test";

test("guests are sent to login for dashboard areas", async ({ page }) => {
  await page.goto("/admin/offers");
  await expect(page).toHaveURL(/\/admin\/login/);
  await expect(page.url()).toContain("next=");
  await expect(page.getByRole("button", { name: "Hyr" })).toBeVisible();

  await page.goto("/biz/flyers");
  await expect(page).toHaveURL(/\/biz\/login/);
  await expect(page.url()).toContain("next=");
  await expect(page.getByRole("button", { name: "Hyr" })).toBeVisible();
});

test("wrong-role login does not keep a session on the admin form", async ({
  page,
}) => {
  const bizEmail = process.env.E2E_BIZ_EMAIL ?? "viva@test.com";
  const password = process.env.E2E_PASSWORD ?? "password";

  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(bizEmail);
  await page.getByLabel("Fjalëkalimi").fill(password);
  await page.getByRole("button", { name: "Hyr" }).click();
  await expect(
    page.locator("p[role='alert']"),
  ).toContainText(/nuk është llogari admini/i);

  await page.goto("/admin/offers");
  await expect(page).toHaveURL(/\/admin\/login/);
});

test("auth public pages stay reachable without a session", async ({ page }) => {
  for (const path of [
    "/biz/login",
    "/admin/login",
    "/biz/forgot-password",
    "/biz/reset-password",
  ]) {
    const response = await page.goto(path);
    expect(response?.ok()).toBeTruthy();
    await expect(page.getByText("Diçka shkoi keq")).toHaveCount(0);
  }
});

test("login pages keep focusable email fields", async ({ page }) => {
  await page.goto("/biz/login");
  await page.getByLabel("Email").focus();
  await expect(page.getByLabel("Email")).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByLabel("Fjalëkalimi")).toBeFocused();
});
