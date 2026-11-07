import { expect, test } from "@playwright/test";
import { adminEmail, login } from "./helpers/auth";

const TINY_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
  "base64",
);

test("bulk gallery upload tracks every file, keeps a failure from blocking the rest, and retry does not duplicate successes", async ({
  page,
}) => {
  await login(page, "/login", adminEmail, /\/admin$/);
  await page.goto("/admin/gallery");

  await page.getByRole("button", { name: "Shto foto" }).click();
  const dialog = page.getByRole("dialog", { name: "Shto foto në platformë" });
  await expect(dialog).toBeVisible();

  await dialog.locator('input[type="file"]').setInputFiles([
    { name: "ok-1.png", mimeType: "image/png", buffer: TINY_PNG },
    { name: "ok-2.png", mimeType: "image/png", buffer: TINY_PNG },
    {
      name: "broken-photo.png",
      mimeType: "image/png",
      buffer: Buffer.from("not actually an image"),
    },
  ]);

  await dialog.getByRole("button", { name: "Ruaj" }).click();

  // The batch settles with 2 successes and 1 real failure — the bad file
  // must not have aborted the other two (the original "77 -> 60" bug).
  await expect(dialog.getByText(/2 nga 3 foto u ngarkuan\. 1 dështuan\./)).toBeVisible({
    timeout: 30_000,
  });
  await expect(
    dialog.getByText("The image field must be a file of type"),
  ).toBeVisible();

  // Retrying only resubmits the failed file (same validation error again,
  // since the file is still not a real image) and must not touch the two
  // already-successful uploads.
  await dialog.getByRole("button", { name: /Provo përsëri/ }).click();
  await expect(dialog.getByText(/2 nga 3 foto u ngarkuan\. 1 dështuan\./)).toBeVisible({
    timeout: 30_000,
  });

  await dialog.getByText("Mbyll", { exact: true }).click();
  await expect(dialog).toBeHidden();

  await expect(page.getByText("ok-1", { exact: true })).toHaveCount(1);
  await expect(page.getByText("ok-2", { exact: true })).toHaveCount(1);
});
