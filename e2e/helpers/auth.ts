import { type Page } from "@playwright/test";

export const password = process.env.E2E_PASSWORD ?? "password";
export const bizEmail = process.env.E2E_BIZ_EMAIL ?? "viva@test.com";
export const adminEmail = process.env.E2E_ADMIN_EMAIL ?? "admin@test.com";
export const managerEmail = process.env.E2E_MANAGER_EMAIL ?? "manager@test.com";
export const apiUrl = process.env.E2E_API_URL ?? "http://localhost:8001";

export async function login(
  page: Page,
  path: string,
  email: string,
  home: RegExp,
) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    await page.goto(path);
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Fjalëkalimi").fill(password);
    await page.getByRole("button", { name: "Hyr" }).click({ timeout: 15_000 });

    const outcome = await Promise.race([
      page.waitForURL(home).then(() => "ok" as const),
      page
        .locator("p[role='alert']")
        .waitFor()
        .then(async () => {
          const text = await page.locator("p[role='alert']").innerText();
          return /too many|shumë tentativa/i.test(text)
            ? ("throttled" as const)
            : text;
        }),
    ]);

    if (outcome === "ok") {
      return;
    }

    if (outcome !== "throttled") {
      throw new Error(outcome);
    }

    // Clear the e2e API cache (same CACHE_STORE as serve-api.sh).
    try {
      const { clearLaravelCache } = await import("./laravel");
      clearLaravelCache();
      await page.waitForTimeout(1_000);
    } catch {
      await page.waitForTimeout(61_000);
    }
  }

  throw new Error(`Login did not reach ${home}`);
}

export async function logout(page: Page) {
  if (page.isClosed()) {
    return;
  }

  const openMenu = page.getByRole("button", { name: "Hap menynë" });
  if (await openMenu.isVisible().catch(() => false)) {
    await openMenu.click();
  }

  const button = page.getByRole("button", { name: "Dil" });
  if ((await button.count()) === 0) {
    await page.goto("/admin");
    if (await openMenu.isVisible().catch(() => false)) {
      await openMenu.click();
    }
  }

  await button.waitFor();
  await button.click();
  await page.waitForURL(/\/login/);
}
