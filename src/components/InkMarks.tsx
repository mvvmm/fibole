import type { CSSProperties } from "react";

export function BrandSwash({ style }: { style?: CSSProperties }) {
  return (
    <svg width="118" height="13" viewBox="0 0 118 13" fill="none" style={style}>
      <path
        d="M4 8.5C26 4 46 10.5 67 6.5C84 3.2 100 6 114 8.5"
        stroke="#b4532f"
        strokeWidth="2.1"
        strokeLinecap="round"
      />
      <path
        d="M9 11C24 8.5 40 11.5 58 9.5"
        stroke="#b4532f"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.5"
      />
    </svg>
  );
}

export function LongUnderline({ style }: { style?: CSSProperties }) {
  return (
    <svg width="232" height="11" viewBox="0 0 232 11" fill="none" style={style}>
      <path
        d="M3 6.5C45 2.5 92 8.5 138 5C168 2.8 200 5 229 7"
        stroke="#b4532f"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function MediumUnderline({ style }: { style?: CSSProperties }) {
  return (
    <svg width="150" height="10" viewBox="0 0 150 10" fill="none" style={style}>
      <path
        d="M3 6C30 2.5 70 7.5 100 4.5C118 2.8 134 4.5 147 6"
        stroke="#b4532f"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ShortUnderline({ style }: { style?: CSSProperties }) {
  return (
    <svg width="118" height="10" viewBox="0 0 118 10" fill="none" style={style}>
      <path
        d="M3 6C26 2.5 60 7.5 86 4.5C100 2.8 110 4.5 115 6"
        stroke="#b4532f"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function TopicSpark() {
  return (
    <svg width="14" height="14" viewBox="0 0 15 15" fill="none" style={{ flexShrink: 0 }}>
      <path
        d="M7.5 1.5V13.5M1.5 7.5H13.5"
        stroke="#b4532f"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M3.4 3.4L11.6 11.6M11.6 3.4L3.4 11.6"
        stroke="#b4532f"
        strokeWidth="1.1"
        strokeLinecap="round"
        opacity="0.7"
      />
    </svg>
  );
}

export function CheckMark({ size = 26 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={Math.round((size * 24) / 26)}
      viewBox="0 0 26 24"
      fill="none"
      style={{ flexShrink: 0 }}
    >
      <path
        d="M3 12C6 14.5 8 17 10 21.5C13.5 12 18 6 24 2.5"
        stroke="#46734a"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function XMark({ size = 18, color = "#b4532f" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0 }}>
      <path
        d="M4 4L14 14M14 4L4 14"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

const RING_PATHS = [
  "M10 2.4C5.2 2.2 2.3 5.4 2.6 9.8C2.9 14.2 6.6 17.8 11 17.4C15.1 17 17.9 13.2 17.3 9C16.8 5.2 13.6 2.6 9.6 2.6",
  "M10.2 2.5C5.4 2.4 2.4 5.6 2.7 10C3 14.4 6.7 17.7 11.1 17.3C15.2 16.9 18 13 17.4 8.8C16.9 5 13.7 2.5 9.7 2.6",
  "M9.8 2.6C5 2.5 2.2 5.7 2.6 10.1C3 14.4 6.8 17.6 11.2 17.2C15.1 16.8 17.8 13.1 17.3 8.9C16.8 5.1 13.5 2.4 9.5 2.7",
];

export function GuessRing({ index = 0, spent = false }: { index?: number; spent?: boolean }) {
  const path = RING_PATHS[index % 3];
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      {spent ? (
        <>
          <path
            d={path}
            stroke="#b4532f"
            strokeWidth="1.7"
            strokeLinecap="round"
            fill="rgba(180,83,47,0.10)"
          />
          <path d="M7 7L13 13M13 7L7 13" stroke="#b4532f" strokeWidth="1.6" strokeLinecap="round" />
        </>
      ) : (
        <path d={path} stroke="#cdbfa3" strokeWidth="1.7" strokeLinecap="round" />
      )}
    </svg>
  );
}

export function NumberPenCircle() {
  return (
    <svg
      width="38"
      height="34"
      viewBox="0 0 38 34"
      fill="none"
      style={{ position: "absolute", left: -8, top: -6, pointerEvents: "none" }}
    >
      <path
        d="M21 4C10 2.5 3 8 4 18C5 27 14 32 24 29C33 26 35 15 29 8C25.5 4 20 3 14 4.5"
        stroke="#b4532f"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function FakeOval() {
  return (
    <svg
      viewBox="0 0 320 56"
      fill="none"
      preserveAspectRatio="none"
      style={{
        position: "absolute",
        left: -6,
        top: -5,
        width: "calc(100% + 14px)",
        height: "calc(100% + 10px)",
        pointerEvents: "none",
      }}
    >
      <path
        d="M34 8C140 0 286 2 305 16C320 25 312 47 280 51C168 60 58 56 22 44C4 36 8 11 50 7"
        stroke="#b4532f"
        strokeWidth="2"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export function PencilStrike() {
  return (
    <svg
      viewBox="0 0 320 50"
      fill="none"
      preserveAspectRatio="none"
      style={{
        position: "absolute",
        left: 0,
        top: 8,
        width: "100%",
        height: "calc(100% - 16px)",
        pointerEvents: "none",
      }}
    >
      <path
        d="M10 18C110 11 220 23 312 13"
        stroke="#9a9080"
        strokeWidth="1.6"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d="M14 30C120 38 230 28 308 36"
        stroke="#9a9080"
        strokeWidth="1.6"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export function ScoreCircle() {
  return (
    <svg
      width="220"
      height="130"
      viewBox="0 0 220 130"
      fill="none"
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        transform: "translate(-52%, -52%)",
        pointerEvents: "none",
      }}
    >
      <path
        d="M70 16C30 22 14 48 22 78C30 104 66 120 116 116C168 112 200 86 196 56C192 30 160 14 120 14"
        stroke="#b4532f"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ScoreUnderline() {
  return (
    <svg
      width="58"
      height="20"
      viewBox="0 0 58 20"
      fill="none"
      style={{ position: "absolute", left: -6, bottom: -10 }}
    >
      <path d="M3 11C18 5 40 5 55 9" stroke="#b4532f" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}
