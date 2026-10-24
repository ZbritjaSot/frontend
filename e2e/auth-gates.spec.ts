import { expect, test } from "@playwright/test";

test("guests are sent to login for dashboard areas", async ({ page }) => {
  await page.goto("/admin/offers");
  await expect(page).toHaveURL(/\/login/);
  await expect(page.url()).toContain("next=");
  await expect(page.getByText("Login", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Hyr" })).toBeVisible();

  await page.goto("/biz/flyers");
  await expect(page).toHaveURL(/\/login/);
  await expect(page.url()).toContain("next=");
  await expect(page.getByRole("button", { name: "Hyr" })).toBeVisible();
});

test("legacy login URLs land on the unified login page", async ({ page }) => {
  await page.goto("/admin/login?next=%2Fadmin%2Foffers");
  await expect(page).toHaveURL(/\/login/);
  await expect(page.url()).toContain("next=");
  await expect(page.getByText("Login", { exact: true })).toBeVisible();

  await page.goto("/biz/login?next=%2Fbiz%2Fflyers");
  await expect(page).toHaveURL(/\/login/);
  await expect(page.url()).toContain("next=");
  await expect(page.getByText("Login", { exact: true })).toBeVisible();
});

test("invalid credentials stay on login", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill("nobody@test.com");
  await page.getByLabel("Fjalëkalimi").fill("wrong-password");
  await page.getByRole("button", { name: "Hyr" }).click();
  await expect(page.locator("p[role='alert']")).toBeVisible();
  await expect(page).toHaveURL(/\/login/);
});

test("business credentials keep the session and open the business panel", async ({
  page,
}) => {
  const bizEmail = process.env.E2E_BIZ_EMAIL ?? "viva@test.com";
  const password = process.env.E2E_PASSWORD ?? "password";

  await page.goto("/login");
  await page.getByLabel("Email").fill(bizEmail);
  await page.getByLabel("Fjalëkalimi").fill(password);
  await page.getByRole("button", { name: "Hyr" }).click();
  await expect(page).toHaveURL(/\/biz$/);

  await page.goto("/admin/offers");
  await expect(page).toHaveURL(/\/biz/);
});

test("admin credentials open the admin panel", async ({ page }) => {
  const adminEmail = process.env.E2E_ADMIN_EMAIL ?? "admin@test.com";
  const password = process.env.E2E_PASSWORD ?? "password";

  await page.goto("/login");
  await page.getByLabel("Email").fill(adminEmail);
  await page.getByLabel("Fjalëkalimi").fill(password);
  await page.getByRole("button", { name: "Hyr" }).click();
  await expect(page).toHaveURL(/\/admin$/);

  await page.goto("/biz/offers");
  await expect(page).toHaveURL(/\/admin/);
});

test("auth public pages stay reachable without a session", async ({ page }) => {
  for (const path of [
    "/login",
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
  await page.goto("/login");
  await page.getByLabel("Email").focus();
  await expect(page.getByLabel("Email")).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByLabel("Fjalëkalimi")).toBeFocused();
});
