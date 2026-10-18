import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "DOR101 — Dorchester 101";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function TwitterImage() {
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
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 4 }}>
          <div style={{ fontSize: 66, lineHeight: 1.06, fontWeight: 800, color: "#14304F", letterSpacing: -1.6 }}>
            Your neighborhood. Your rights. Your future.
          </div>
          <div style={{ fontSize: 27, color: "#3C4757", lineHeight: 1.35 }}>
            Free housing, food, and community resources for Dorchester residents — in nine languages.
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
