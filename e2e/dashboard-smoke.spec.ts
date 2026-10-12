import { expect, test } from "@playwright/test";
import {
  adminEmail,
  bizEmail,
  login,
  logout,
  managerEmail,
} from "./helpers/auth";

test("business dashboard areas load after login", async ({ page }) => {
  await login(page, "/biz/login", bizEmail, /\/biz$/);
  await expect(page.getByRole("navigation", { name: "Biznes" })).toBeVisible();

  for (const path of [
    "/biz",
    "/biz/flyers",
    "/biz/flyers/new",
    "/biz/offers",
    "/biz/offers/new",
    "/biz/profile",
    "/biz/profile/address",
    "/biz/profile/password",
    "/biz/shops",
  ]) {
    await page.goto(path);
    await expect(page).toHaveURL(new RegExp(path.replace(/\//g, "\\/")));
    await expect(page.getByText("Diçka shkoi keq")).toHaveCount(0);
  }

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/biz/offers");
  await expect(page.getByRole("button", { name: "Hap menynë" })).toBeVisible();
  await page.getByRole("button", { name: "Hap menynë" }).click();
  await expect(page.getByRole("button", { name: "Dil" })).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Kalo te përmbajtja" }),
  ).toBeAttached();

  await logout(page);
});

test("admin dashboard areas load after login", async ({ page }) => {
  await login(page, "/admin/login", adminEmail, /\/admin$/);
  await expect(page.getByText("Diçka shkoi keq")).toHaveCount(0);

  for (const path of [
    "/admin",
    "/admin/offers",
    "/admin/businesses",
    "/admin/categories",
    "/admin/gallery",
    "/admin/home",
    "/admin/exclusive",
    "/admin/managers",
    "/admin/newsletter",
    "/admin/subscriptions",
    "/admin/audit",
    "/admin/profile",
    "/admin/profile/password",
  ]) {
    await page.goto(path);
    await expect(page).toHaveURL(new RegExp(path.replace(/\//g, "\\/")));
    await expect(page.getByText("Diçka shkoi keq")).toHaveCount(0);
  }

  await logout(page);
});

test("manager review area loads after login", async ({ page }) => {
  await login(page, "/biz/login", managerEmail, /\/biz$/);
  await page.goto("/biz/review/new");
  await expect(page).toHaveURL(/\/biz\/review/);
  await expect(page.getByText("Diçka shkoi keq")).toHaveCount(0);
  await page.goto("/biz/profile");
  await expect(page).toHaveURL(/\/biz\/profile/);
  await expect(page.getByText("Menaxher")).toBeVisible();
  await expect(page.getByRole("link", { name: /Ndrysho fjalëkalimin/i })).toBeVisible();
  await logout(page);
});
