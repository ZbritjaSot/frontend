import { androidAssetLinks, androidFingerprintsFromEnv } from "@/lib/appLinks";

export function GET() {
  const body = androidAssetLinks(androidFingerprintsFromEnv(process.env.ANDROID_SHA256_CERT_FINGERPRINTS));
  if (!body) {
    return new Response(null, { status: 404, headers: { "Cache-Control": "no-store" } });
  }

  return Response.json(body, {
    headers: { "Cache-Control": "public, max-age=3600" },
  });
}
