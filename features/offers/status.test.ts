import { describe, expect, it } from "vitest";
import {
  canDeleteOffer,
  canEditOffer,
  canSubmitOffer,
} from "@/features/offers/status";
import type { OfferStatus } from "@/types";

const statuses: OfferStatus[] = [
  "draft",
  "pending",
  "approved",
  "taken_down",
  "expired",
];

describe("offer status rules", () => {
  it("allows edits and submission only for a draft", () => {
    for (const status of statuses) {
      expect(canEditOffer(status)).toBe(status === "draft");
      expect(canSubmitOffer(status)).toBe(status === "draft");
    }
  });

  it("allows deletion until the folder has expired", () => {
    for (const status of statuses) {
      expect(canDeleteOffer(status)).toBe(status !== "expired");
    }
  });
});
