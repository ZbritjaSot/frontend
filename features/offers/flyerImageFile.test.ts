import { describe, expect, it } from "vitest";
import { flyerImageFileError } from "@/features/offers/flyerImageFile";

const jpeg = { name: "flyer.jpg", type: "image/jpeg", size: 200_000 };

describe("flyerImageFileError", () => {
  it("accepts a landscape photo at the recommended size", () => {
    expect(flyerImageFileError(jpeg, { width: 1920, height: 1080 })).toBeNull();
  });

  it("rejects a file that is not a photo", () => {
    expect(flyerImageFileError({ name: "notes.txt", type: "text/plain", size: 20 })).toMatch(/JPEG/);
  });

  it("rejects a file over 8 MB", () => {
    expect(flyerImageFileError({ ...jpeg, size: 9 * 1024 * 1024 }, { width: 1920, height: 1080 })).toMatch(/8 MB/);
  });

  it("rejects a portrait photo", () => {
    expect(flyerImageFileError(jpeg, { width: 1080, height: 1920 })).toMatch(/e gjerë/);
  });

  it("rejects a photo below 1280 × 720", () => {
    expect(flyerImageFileError(jpeg, { width: 800, height: 450 })).toMatch(/1280/);
  });
});
