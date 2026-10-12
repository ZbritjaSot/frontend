import { expect, test } from "@playwright/test";
import { bizEmail, login, logout, password } from "./helpers/auth";
import {
  clearLaravelCache,
  createResetToken,
  restoreUser,
  setMustChangePassword,
  setPassword,
  snapshotUser,
} from "./helpers/laravel";

test.describe.configure({ mode: "serial" });

test.beforeEach(() => {
  clearLaravelCache();
  setPassword(bizEmail, password);
});

test("must_change_password gate blocks the panel until password is changed", async ({
  page,
}) => {
  test.setTimeout(300_000);
  const snapshot = snapshotUser(bizEmail);
  const nextPassword = `TempGate-${Date.now()}!`;

  try {
    setMustChangePassword(bizEmail, true);

    await login(page, "/biz/login", bizEmail, /\/biz$/);
    await expect(
      page.getByRole("heading", { name: "Ndrysho fjalëkalimin" }),
    ).toBeVisible({ timeout: 20_000 });
    await expect(page.getByRole("navigation", { name: "Biznes" })).toHaveCount(
      0,
    );

    await page.goto("/biz/offers");
    await expect(
      page.getByRole("heading", { name: "Ndrysho fjalëkalimin" }),
    ).toBeVisible();

    await page.getByLabel("Fjalëkalimi i ri").fill("short");
    await page.getByLabel("Përsërit fjalëkalimin e ri").fill("short");
    await page.getByRole("button", { name: "Ruaj fjalëkalimin" }).click();
    await expect(page.locator("p[role='alert']")).toContainText(/8 karaktere/);

    await page.getByLabel("Fjalëkalimi i ri").fill(nextPassword);
    await page.getByLabel("Përsërit fjalëkalimin e ri").fill("mismatch-xx");
    await page.getByRole("button", { name: "Ruaj fjalëkalimin" }).click();
    await expect(page.locator("p[role='alert']")).toContainText(/përputhen/);

    await page.getByLabel("Fjalëkalimi i ri").fill(password);
    await page.getByLabel("Përsërit fjalëkalimin e ri").fill(password);
    await page.getByRole("button", { name: "Ruaj fjalëkalimin" }).click();
    await expect(page.locator("p[role='alert']")).toContainText(/i ndryshëm/);

    await page.getByLabel("Fjalëkalimi i ri").fill(nextPassword);
    await page.getByLabel("Përsërit fjalëkalimin e ri").fill(nextPassword);
    await page.getByRole("button", { name: "Ruaj fjalëkalimin" }).click();

    await expect(page.getByRole("navigation", { name: "Biznes" })).toBeVisible({
      timeout: 20_000,
    });
    await page.goto("/biz/offers");
    await expect(page.getByText("Diçka shkoi keq")).toHaveCount(0);
    await expect(
      page.getByRole("heading", { name: "Ndrysho fjalëkalimin" }),
    ).toHaveCount(0);
  } finally {
    restoreUser(snapshot);
    clearLaravelCache();
    await logout(page).catch(() => undefined);
  }
});

test("voluntary password change validates and persists", async ({ page }) => {
  test.setTimeout(300_000);
  const snapshot = snapshotUser(bizEmail);
  const nextPassword = `TempVol-${Date.now()}!`;

  try {
    await login(page, "/biz/login", bizEmail, /\/biz$/);
    await page.goto("/biz/profile/password");
    await expect(
      page.getByRole("heading", { name: "Ndrysho fjalëkalimin" }),
    ).toBeVisible();

    await page.getByLabel("Fjalëkalimi aktual").fill("wrong-password");
    await page.getByLabel("Fjalëkalimi i ri").fill(nextPassword);
    await page.getByLabel("Përsërit fjalëkalimin e ri").fill(nextPassword);
    await page.getByRole("button", { name: "Ruaj fjalëkalimin" }).click();
    await expect(page.locator("p[role='alert']")).toContainText(/aktual nuk është/);

    await page.getByLabel("Fjalëkalimi aktual").fill(password);
    await page.getByLabel("Fjalëkalimi i ri").fill("short");
    await page.getByLabel("Përsërit fjalëkalimin e ri").fill("short");
    await page.getByRole("button", { name: "Ruaj fjalëkalimin" }).click();
    await expect(page.locator("p[role='alert']")).toContainText(/8 karaktere/);

    await page.getByLabel("Fjalëkalimi aktual").fill(password);
    await page.getByLabel("Fjalëkalimi i ri").fill(nextPassword);
    await page.getByLabel("Përsërit fjalëkalimin e ri").fill(nextPassword);
    await page.getByRole("button", { name: "Ruaj fjalëkalimin" }).click();
    await expect(page.getByText("Fjalëkalimi u ndryshua.")).toBeVisible();

    await logout(page);
    clearLaravelCache();
    await page.goto("/biz/login");
    await page.getByLabel("Email").fill(bizEmail);
    await page.getByLabel("Fjalëkalimi").fill(nextPassword);
    await page.getByRole("button", { name: "Hyr" }).click();
    await expect(page).toHaveURL(/\/biz$/);
  } finally {
    restoreUser(snapshot);
    clearLaravelCache();
    await logout(page).catch(() => undefined);
  }
});

test("password reset submission works with a broker token", async ({ page }) => {
  test.setTimeout(300_000);
  const snapshot = snapshotUser(bizEmail);
  const nextPassword = `TempReset-${Date.now()}!`;

  try {
    await page.goto("/biz/forgot-password");
    await page.getByLabel("Email").fill(bizEmail);
    await page.getByRole("button", { name: "Dërgo email-in" }).click();
    await expect(
      page.getByText(/Nëse kjo llogari ekziston, të dërguam një email/),
    ).toBeVisible();

    const { token } = createResetToken(bizEmail);
    const url = `/biz/reset-password?${new URLSearchParams({
      email: bizEmail,
      token,
    }).toString()}`;

    await page.goto(url);
    await expect(page.getByRole("button", { name: "Ruaj fjalëkalimin" })).toBeVisible();

    await page.getByLabel("Fjalëkalimi i ri").fill("short");
    await page.getByLabel("Përsërit fjalëkalimin").fill("short");
    await page.getByRole("button", { name: "Ruaj fjalëkalimin" }).click();
    await expect(page.locator("p[role='alert']")).toBeVisible();

    await page.getByLabel("Fjalëkalimi i ri").fill(nextPassword);
    await page.getByLabel("Përsërit fjalëkalimin").fill(nextPassword);
    await page.getByRole("button", { name: "Ruaj fjalëkalimin" }).click();
    await expect(page.getByText(/Fjalëkalimi u ruajt/)).toBeVisible();

    clearLaravelCache();
    await page.goto("/biz/login");
    await page.getByLabel("Email").fill(bizEmail);
    await page.getByLabel("Fjalëkalimi").fill(nextPassword);
    await page.getByRole("button", { name: "Hyr" }).click();
    await expect(page).toHaveURL(/\/biz$/);
  } finally {
    restoreUser(snapshot);
    clearLaravelCache();
    await logout(page).catch(() => undefined);
  }
});
