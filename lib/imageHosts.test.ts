import { afterEach, describe, expect, it } from "vitest";
import { imageRemoteHostnames } from "@/lib/imageHosts";

describe("imageRemoteHostnames", () => {
  afterEach(() => {
    delete process.env.NEXT_PUBLIC_IMAGE_HOSTS;
  });

  it("always includes the R2 wildcard", () => {
    expect(imageRemoteHostnames()).toContain("**.r2.dev");
  });

  it("merges and dedupes env hosts", () => {
    process.env.NEXT_PUBLIC_IMAGE_HOSTS = "cdn.example.com, **.r2.dev, images.zbritjasot.com";
    expect(imageRemoteHostnames()).toEqual([
      "**.r2.dev",
      "cdn.example.com",
      "images.zbritjasot.com",
    ]);
  });
});
