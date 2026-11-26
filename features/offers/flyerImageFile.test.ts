import { describe, expect, it } from "vitest";
import { flyerImageFileError } from "@/features/offers/flyerImageFile";

const jpeg = { name: "flyer.jpg", type: "image/jpeg", size: 200_000 };

describe("flyerImageFileError", () => {
  it("accepts a landscape photo at the recommended size", () => {
    expect(flyerImageFileError(jpeg, { width: 2700, height: 1080 })).toBeNull();
  });

  it("rejects a file that is not a photo", () => {
    expect(flyerImageFileError({ name: "notes.txt", type: "text/plain", size: 20 })).toMatch(/JPEG/);
  });

  it("rejects a file over 8 MB", () => {
    expect(flyerImageFileError({ ...jpeg, size: 9 * 1024 * 1024 }, { width: 2700, height: 1080 })).toMatch(/8 MB/);
  });

  it("rejects a portrait photo", () => {
    expect(flyerImageFileError(jpeg, { width: 1080, height: 1920 })).toMatch(/e gjerë/);
  });

  it("rejects a photo below 1350 × 540", () => {
    expect(flyerImageFileError(jpeg, { width: 1280, height: 512 })).toMatch(/1350/);
  });
});
