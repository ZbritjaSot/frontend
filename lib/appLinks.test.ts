import { describe, expect, it } from "vitest";
import { androidAssetLinks, androidFingerprintsFromEnv, appleAppSiteAssociation } from "@/lib/appLinks";

describe("app link association files", () => {
  it("builds the Apple file for public paths only", () => {
    const file = appleAppSiteAssociation("ABCDE12345");
    expect(file?.applinks.details[0]?.appIDs).toEqual(["ABCDE12345.com.zbritjasot.app"]);
    expect(file?.applinks.details[0]?.components).toEqual([
      { "/": "/offers/*" },
      { "/": "/dosje/*" },
      { "/": "/biznese/*" },
      { "/": "/buletini/caktivizo" },
    ]);
    expect(appleAppSiteAssociation("  ")).toBeNull();
  });

  it("builds the Android file from certificate fingerprints", () => {
    expect(androidFingerprintsFromEnv(" AA:BB , , CC:DD ")).toEqual(["AA:BB", "CC:DD"]);
    const file = androidAssetLinks(["AA:BB"]);
    expect(file?.[0]?.target.package_name).toBe("com.zbritjasot.app");
    expect(file?.[0]?.target.sha256_cert_fingerprints).toEqual(["AA:BB"]);
    expect(androidAssetLinks([])).toBeNull();
  });
});
