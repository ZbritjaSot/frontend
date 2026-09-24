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
  "rejected",
  "expired",
];

describe("offer status rules", () => {
  it("allows edits and submission only for a draft or a rejected folder", () => {
    for (const status of statuses) {
      const allowed = status === "draft" || status === "rejected";
      expect(canEditOffer(status)).toBe(allowed);
      expect(canSubmitOffer(status)).toBe(allowed);
    }
  });

  it("allows deletion until the folder has expired", () => {
    for (const status of statuses) {
      expect(canDeleteOffer(status)).toBe(status !== "expired");
    }
  });
});
