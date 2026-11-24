import { ImageResponse } from "next/og";

export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#722F37",
          borderRadius: "7px",
          border: "1px solid rgba(215, 167, 177, 0.4)",
          color: "#F8F4E7",
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontWeight: 900,
          fontSize: 20,
          position: "relative",
          letterSpacing: "-0.5px",
        }}
      >
        <span style={{ transform: "translateY(-1px)" }}>É</span>
        <div
          style={{
            position: "absolute",
            bottom: "3px",
            right: "3px",
            width: "3.5px",
            height: "3.5px",
            borderRadius: "50%",
            backgroundColor: "#D7A7B1",
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  );
}
