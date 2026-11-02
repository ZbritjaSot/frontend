const BUNDLE_ID = "com.zbritjasot.app";

export function appleAppSiteAssociation(teamId: string | undefined) {
  const team = teamId?.trim();
  if (!team) {
    return null;
  }

  return {
    applinks: {
      apps: [],
      details: [
        {
          appIDs: [`${team}.${BUNDLE_ID}`],
          components: [
            { "/": "/offers/*" },
            { "/": "/dosje/*" },
            { "/": "/biznese/*" },
            { "/": "/buletini/caktivizo" },
          ],
        },
      ],
    },
  };
}

export function androidAssetLinks(fingerprints: string[]) {
  const sha256 = fingerprints.map((item) => item.trim()).filter((item) => item !== "");
  if (sha256.length === 0) {
    return null;
  }

  return [
    {
      relation: ["delegate_permission/common.handle_all_urls"],
      target: {
        namespace: "android_app",
        package_name: BUNDLE_ID,
        sha256_cert_fingerprints: sha256,
      },
    },
  ];
}

export function androidFingerprintsFromEnv(value: string | undefined): string[] {
  return (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item !== "");
}
