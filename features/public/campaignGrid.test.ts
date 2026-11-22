import { describe, expect, it } from "vitest";
import {
  CAMPAIGN_CARD_COLUMNS,
  CAMPAIGN_CARD_IMAGE_SIZES,
  CAMPAIGN_GRID_CLASS,
  CAMPAIGN_GRID_COLUMNS,
} from "@/features/public/campaignGrid";

describe("campaign grid", () => {
  it("goes 1 / 2 / 3 columns and keeps phones and tablets as before", () => {
    expect(CAMPAIGN_GRID_CLASS).toContain("grid-cols-1");
    expect(CAMPAIGN_GRID_CLASS).toContain("sm:grid-cols-2");
    expect(CAMPAIGN_GRID_CLASS).toContain("xl:grid-cols-3");
    expect(CAMPAIGN_GRID_CLASS).not.toContain("lg:grid-cols-3");
    expect(CAMPAIGN_GRID_CLASS).toContain(CAMPAIGN_GRID_COLUMNS);
  });

  it("shrinks the card image column three-up and requests a matching image size", () => {
    expect(CAMPAIGN_CARD_COLUMNS).toContain("xl:grid-cols-[11rem_minmax(0,1fr)]");
    expect(CAMPAIGN_CARD_IMAGE_SIZES).toBe("(max-width: 640px) 38vw, (max-width: 1279px) 240px, 176px");
  });
});
