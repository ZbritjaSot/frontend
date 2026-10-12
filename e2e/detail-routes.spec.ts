import { expect, test } from "@playwright/test";
import {
  adminEmail,
  bizEmail,
  login,
  logout,
  managerEmail,
  password,
} from "./helpers/auth";
import {
  createDraftBundle,
  deleteBundle,
  firstAdminBusinessId,
  submitBundle,
} from "./helpers/bundles";
import { clearLaravelCache, setPassword } from "./helpers/laravel";

test.beforeEach(() => {
  clearLaravelCache();
  // Recover if a previous interrupted password test left the seed user mutated.
  setPassword(bizEmail, password);
  setPassword(managerEmail, password);
});

test("biz flyer and offer detail/edit routes load for drafts", async ({
  page,
}) => {
  test.setTimeout(240_000);
  const stamp = Date.now();
  const flyerTitle = `E2E draft flyer ${stamp}`;
  const flyerProduct = `E2E flyer product ${stamp}`;
  const offerProduct = `E2E offer product ${stamp}`;
  const created: string[] = [];

  try {
    await login(page, "/biz/login", bizEmail, /\/biz$/);

    const flyerId = await createDraftBundle(
      page,
      "flyers",
      flyerTitle,
      flyerProduct,
    );
    created.push(flyerId);

    await page.goto(`/biz/flyers/${flyerId}`);
    await expect(page.getByText("Diçka shkoi keq")).toHaveCount(0);
    await expect(page.getByRole("heading", { name: flyerTitle })).toBeVisible();

    await page.goto(`/biz/flyers/${flyerId}/edit`);
    await expect(page.getByText("Diçka shkoi keq")).toHaveCount(0);
    await expect(page.getByLabel("Titulli i fletushkës")).toHaveValue(flyerTitle);

    const offerId = await createDraftBundle(
      page,
      "offers",
      "unused",
      offerProduct,
    );
    created.push(offerId);

    await page.goto(`/biz/offers/${offerId}`);
    await expect(page.getByText("Diçka shkoi keq")).toHaveCount(0);
    await expect(
      page.getByRole("paragraph").filter({ hasText: offerProduct }),
    ).toBeVisible();

    await page.goto(`/biz/offers/${offerId}/edit`);
    await expect(page.getByText("Diçka shkoi keq")).toHaveCount(0);
    await expect(page.getByLabel("Emri i produktit 1")).toHaveValue(offerProduct);
  } finally {
    if (created.length > 0 && !page.isClosed()) {
      clearLaravelCache();
      await logout(page).catch(() => undefined);
      await login(page, "/biz/login", bizEmail, /\/biz$/);
      for (const id of created) {
        await deleteBundle(page, id);
      }
    }
  }
});

test("admin business detail/address and pending offer edit load", async ({
  page,
}) => {
  test.setTimeout(300_000);
  const stamp = Date.now();
  const title = `E2E admin edit ${stamp}`;
  const product = `E2E admin product ${stamp}`;
  let created: string | null = null;

  try {
    await login(page, "/biz/login", bizEmail, /\/biz$/);
    created = await createDraftBundle(page, "flyers", title, product);
    await page.goto("/biz/flyers");
    await submitBundle(page, title);
    await logout(page);

    clearLaravelCache();
    await login(page, "/admin/login", adminEmail, /\/admin$/);

    const businessId = await firstAdminBusinessId(page);
    await page.goto(`/admin/businesses/${businessId}`);
    await expect(page.getByText("Diçka shkoi keq")).toHaveCount(0);
    await expect(page.getByRole("heading").first()).toBeVisible();

    await page.goto(`/admin/businesses/${businessId}/address`);
    await expect(page.getByText("Diçka shkoi keq")).toHaveCount(0);

    await page.goto(`/admin/offers/${created}`);
    await expect(page.getByText("Diçka shkoi keq")).toHaveCount(0);
    await expect(page.getByRole("heading", { name: title })).toBeVisible();

    await page.goto(`/admin/offers/${created}/edit`);
    await expect(page.getByText("Diçka shkoi keq")).toHaveCount(0);
    await expect(
      page.getByRole("heading", { name: "Ndrysho dosjen" }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Përditëso" })).toBeVisible();
  } finally {
    if (created && !page.isClosed()) {
      clearLaravelCache();
      await logout(page).catch(() => undefined);
      await login(page, "/biz/login", bizEmail, /\/biz$/);
      await deleteBundle(page, created);
    }
  }
});

test("manager review detail and edit load for a pending flyer", async ({
  page,
}) => {
  test.setTimeout(300_000);
  const stamp = Date.now();
  const title = `E2E manager review ${stamp}`;
  const product = `E2E manager product ${stamp}`;
  let created: string | null = null;

  try {
    await login(page, "/biz/login", bizEmail, /\/biz$/);
    created = await createDraftBundle(page, "flyers", title, product);
    await page.goto("/biz/flyers");
    await submitBundle(page, title);
    await logout(page);

    clearLaravelCache();
    await login(page, "/biz/login", managerEmail, /\/biz$/);
    await page.goto(`/biz/review/${created}`);
    await expect(page.getByText("Diçka shkoi keq")).toHaveCount(0);
    await expect(page.getByRole("heading", { name: title })).toBeVisible();
    await expect(page.getByRole("link", { name: "Ndrysho" })).toBeVisible();

    await page.goto(`/biz/review/${created}/edit`);
    await expect(page.getByText("Diçka shkoi keq")).toHaveCount(0);
    await expect(page.getByLabel("Titulli i fletushkës")).toHaveValue(title);
  } finally {
    if (created && !page.isClosed()) {
      clearLaravelCache();
      await logout(page).catch(() => undefined);
      await login(page, "/biz/login", bizEmail, /\/biz$/);
      await deleteBundle(page, created);
    }
  }
});
