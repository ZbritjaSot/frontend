import { describe, expect, it } from "vitest";
import { flyerPhoto } from "@/features/public/flyerPhoto";

describe("flyerPhoto", () => {
  it("uses the dedicated image when the flyer has one", () => {
    expect(
      flyerPhoto({
        title: "Nëntor",
        image: { thumb_url: "https://cdn/thumb.webp", detail_url: "https://cdn/detail.webp" },
        cover: { name: "Kafe", thumb_url: "https://cdn/cover.webp", detail_url: "https://cdn/cover-lg.webp" },
      }),
    ).toEqual({
      thumbUrl: "https://cdn/thumb.webp",
      detailUrl: "https://cdn/detail.webp",
      name: "Nëntor",
    });
  });

  it("keeps the product cover when the flyer has no image", () => {
    expect(
      flyerPhoto({
        title: "Nëntor",
        image: null,
        cover: { name: "Kafe", thumb_url: "https://cdn/cover.webp", detail_url: "https://cdn/cover-lg.webp" },
      }),
    ).toEqual({
      thumbUrl: "https://cdn/cover.webp",
      detailUrl: "https://cdn/cover-lg.webp",
      name: "Kafe",
    });
  });
});
