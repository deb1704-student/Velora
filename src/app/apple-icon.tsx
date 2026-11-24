import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#722F37",
          color: "#F8F4E7",
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontWeight: 900,
          position: "relative",
          borderRadius: "36px",
          border: "4px solid rgba(215, 167, 177, 0.35)",
        }}
      >
        <div
          style={{
            fontSize: 100,
            fontWeight: 900,
            lineHeight: 1,
            letterSpacing: "-2px",
            display: "flex",
            alignItems: "center",
          }}
        >
          É
        </div>
        <div
          style={{
            marginTop: 4,
            fontSize: 13,
            fontWeight: 800,
            fontFamily: "monospace",
            letterSpacing: "0.3em",
            color: "#D7A7B1",
          }}
        >
          ÉLAN
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
