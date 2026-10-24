import { expect, test } from "@playwright/test";
import { bizEmail, login, logout } from "./helpers/auth";

/**
 * Soft gate is enabled in playwright.config (AUTH_SOFT_GATE=1) because
 * localhost shares the Sanctum session cookie across ports.
 * Production must leave the gate off unless SESSION_DOMAIN shares cookies.
 */

test("soft gate redirects guests before the dashboard shell paints", async ({
  page,
}) => {
  const admin = await page.goto("/admin/offers");
  expect(admin?.status()).toBeLessThan(400);
  await expect(page).toHaveURL(/\/login\?next=/);
  // Soft redirect should land on login without needing client /me first.
  await expect(page.getByRole("button", { name: "Hyr" })).toBeVisible();

  await page.goto("/biz/profile");
  await expect(page).toHaveURL(/\/login\?next=/);
});

test("soft gate still allows password-recovery routes without a session", async ({
  page,
}) => {
  for (const path of ["/biz/forgot-password", "/biz/reset-password", "/login"]) {
    const response = await page.goto(path);
    expect(response?.ok()).toBeTruthy();
    await expect(page).toHaveURL(new RegExp(path.replace(/\//g, "\\/")));
  }

  for (const path of ["/biz/login", "/admin/login"]) {
    const response = await page.goto(path);
    expect(response?.ok()).toBeTruthy();
    await expect(page).toHaveURL(/\/login/);
  }
});

test("session cookie lets soft gate through; client still enforces roles", async ({
  page,
}) => {
  await login(page, "/login", bizEmail, /\/biz$/);
  await page.goto("/biz/offers");
  await expect(page).toHaveURL(/\/biz\/offers/);
  await expect(page.getByText("Diçka shkoi keq")).toHaveCount(0);

  // Soft gate only checks cookie presence. Client auth then sends a business
  // session away from the admin panel (login screen or straight to /biz).
  await page.goto("/admin/offers");
  await expect(page).toHaveURL(/\/(login|biz)/);

  await logout(page);
});

test("clearing the session cookie re-engages the soft gate", async ({
  page,
  context,
}) => {
  await login(page, "/login", bizEmail, /\/biz$/);
  await context.clearCookies();
  await page.goto("/biz/offers");
  await expect(page).toHaveURL(/\/login/);
});
