import { appleAppSiteAssociation } from "@/lib/appLinks";

export function GET() {
  const body = appleAppSiteAssociation(process.env.APPLE_TEAM_ID);
  if (!body) {
    return new Response(null, { status: 404, headers: { "Cache-Control": "no-store" } });
  }

  return Response.json(body, {
    headers: { "Cache-Control": "public, max-age=3600" },
  });
}
