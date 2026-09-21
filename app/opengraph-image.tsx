import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/site";

export const alt = SITE_NAME;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const logo = await readFile(
    join(process.cwd(), "public/media/logo-price-tag.png"),
  );
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          background: "#0B0F0E",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <img alt="" src={logoSrc} width={220} height={220} />
        <div
          style={{
            display: "flex",
            marginTop: 8,
            fontSize: 72,
            fontWeight: 700,
            letterSpacing: -2,
          }}
        >
          <span style={{ color: "#F5F5F5" }}>Zbritja</span>
          <span style={{ color: "#A8FF00" }}>Sot</span>
        </div>
        <div
          style={{
            marginTop: 28,
            color: "#6B7280",
            fontSize: 22,
            fontWeight: 600,
            letterSpacing: 6,
            textTransform: "uppercase",
          }}
        >
          {SITE_TAGLINE}
        </div>
      </div>
    ),
    { ...size },
  );
}
