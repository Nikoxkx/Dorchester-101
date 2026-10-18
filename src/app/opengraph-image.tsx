import { ImageResponse } from "next/og";

// Vercel will cache this OG image on the edge (60s CDN TTL).
// Exported from src/app/opengraph-image.tsx per Next file-based metadata convention.
export const runtime = "nodejs";
export const alt = "DOR101 — Free housing, food, transit and legal help for Dorchester";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
  // Same design as src/app/api/og/route.tsx — keep in sync manually;
  // this file is the Next.js auto-detected OG image for the home route,
  // while /api/og allows per-page ?title= variants.
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#F3EFE7",
          padding: 56,
          gap: 28,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 92,
              height: 92,
              borderRadius: 16,
              background: "#14304F",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: 32,
              fontWeight: 800,
            }}
          >
            D
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 40, fontWeight: 700, color: "#14304F", letterSpacing: -0.5 }}>DOR101</div>
            <div style={{ fontSize: 19, color: "#54606E", letterSpacing: 2.4 }}>DORCHESTER · BOSTON</div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
            <div style={{ background: "#14304F", color: "#fff", fontSize: 18, padding: "8px 14px", borderRadius: 999 }}>9 languages</div>
            <div style={{ background: "#C8102E", color: "#fff", fontSize: 18, padding: "8px 14px", borderRadius: 999 }}>No account, no ads</div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 4 }}>
          <div style={{ fontSize: 66, lineHeight: 1.06, fontWeight: 800, color: "#14304F", letterSpacing: -1.6 }}>
            Your neighborhood. Your rights. Your future.
          </div>
          <div style={{ fontSize: 27, color: "#3C4757", lineHeight: 1.35 }}>
            Free housing, food, and community resources for Dorchester residents.
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: "auto" }}>
          <div style={{ display: "flex", gap: 6 }}>
            {["EN", "ES", "HT", "PT", "VI", "ZH", "AR", "SO", "KEA"].map((code) => (
              <div
                key={code}
                style={{
                  fontSize: 16,
                  color: "#14304F",
                  border: "2px solid #14304F",
                  borderRadius: 8,
                  padding: "4px 8px",
                  fontWeight: 700,
                }}
              >
                {code}
              </div>
            ))}
          </div>
          <div style={{ marginLeft: "auto", fontSize: 21, color: "#54606E" }}>Open source · built in Dorchester</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
