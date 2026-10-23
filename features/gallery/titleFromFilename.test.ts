import { describe, expect, it } from "vitest";
import { titleFromFilename } from "@/features/gallery/titleFromFilename";

describe("titleFromFilename", () => {
  it("uses the file stem as the product title", () => {
    expect(titleFromFilename("Qumesht 1L.jpg")).toBe("Qumesht 1L");
    expect(titleFromFilename("Kafe Latte.PNG")).toBe("Kafe Latte");
  });

  it("strips a path and keeps only the last extension", () => {
    expect(titleFromFilename("photos\\foo.bar.webp")).toBe("foo.bar");
    expect(titleFromFilename("/tmp/buke.png")).toBe("buke");
  });

  it("trims whitespace and caps at 160 characters", () => {
    expect(titleFromFilename("  milk.jpg  ")).toBe("milk");
    expect(titleFromFilename(`${"a".repeat(200)}.png`)).toHaveLength(160);
  });

  it("returns empty when there is no usable name", () => {
    expect(titleFromFilename(".jpg")).toBe("");
    expect(titleFromFilename("   ")).toBe("");
  });
});
