import { useEffect, useState } from "react";

const STORAGE_KEY = "tutorialSeen";

export function hasTutorialBeenSeen(): boolean {
  return !!localStorage.getItem(STORAGE_KEY);
}

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() => window.matchMedia("(min-width: 640px)").matches);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 640px)");
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return isDesktop;
}

const SCRIB_A = "M2 5C42 1 72 8 104 4C134 1 166 8 198 4";
const SCRIB_B = "M2 5C44 8 74 1 106 5C136 8 168 2 198 5";

function Scribble({
  widthPct,
  pattern = "a",
  color = "#bcb09a",
}: {
  widthPct: number;
  pattern?: "a" | "b";
  color?: string;
}) {
  return (
    <svg
      viewBox="0 0 200 8"
      preserveAspectRatio="none"
      style={{ width: `${widthPct}%`, height: 7, display: "block" }}
    >
      <path
        d={pattern === "a" ? SCRIB_A : SCRIB_B}
        stroke={color}
        strokeWidth="2.4"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

const rowBase: React.CSSProperties = {
  display: "flex",
  gap: 13,
  alignItems: "flex-start",
  padding: "11px 0",
  borderTop: "1px solid #ece3d0",
};

const numStyle: React.CSSProperties = {
  minWidth: 18,
  font: "italic 400 14px/1.3 'Newsreader', serif",
  color: "#b4532f",
};

const colStyle: React.CSSProperties = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  gap: 7,
  paddingTop: 4,
};

const cardStyle: React.CSSProperties = {
  background: "#fbf8f1",
  border: "1px solid #ece3d0",
  borderRadius: 13,
  padding: "16px 18px",
};

function FibCircle() {
  return (
    <span
      style={{
        position: "relative",
        display: "inline-block",
        minWidth: 18,
        font: "italic 400 14px/1.3 'Newsreader', serif",
        color: "#b4532f",
      }}
    >
      <span style={{ position: "relative", zIndex: 1 }}>02</span>
      <svg
        width="36"
        height="32"
        viewBox="0 0 36 32"
        fill="none"
        style={{ position: "absolute", left: -9, top: -7, zIndex: 0 }}
      >
        <path
          d="M20 4C10 2.5 3 8 4 17C5 25 13 30 22 27C30 24 33 14 27 8C23.5 4.5 18 3 13 4.5"
          stroke="#b4532f"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

function PremiseCard() {
  return (
    <div style={cardStyle}>
      <div style={{ ...rowBase, borderTop: "none" }}>
        <span style={numStyle}>01</span>
        <div style={colStyle}>
          <Scribble widthPct={100} pattern="a" />
          <Scribble widthPct={64} pattern="b" />
        </div>
      </div>
      <div style={{ ...rowBase, alignItems: "center" }}>
        <FibCircle />
        <div style={{ flex: 1 }}>
          <Scribble widthPct={100} pattern="a" color="#cda08a" />
        </div>
        <span
          style={{
            font: "700 17px/1 'Caveat', cursive",
            color: "#b4532f",
            transform: "rotate(-7deg)",
            whiteSpace: "nowrap",
            alignSelf: "center",
          }}
        >
          the fib
        </span>
      </div>
      <div style={rowBase}>
        <span style={numStyle}>03</span>
        <div style={colStyle}>
          <Scribble widthPct={100} pattern="b" />
          <Scribble widthPct={54} pattern="a" />
        </div>
      </div>
      <div style={{ ...rowBase, borderBottom: "1px solid #ece3d0" }}>
        <span style={numStyle}>04</span>
        <div style={colStyle}>
          <Scribble widthPct={88} pattern="a" />
        </div>
      </div>
    </div>
  );
}

function AnswerCard() {
  return (
    <div style={cardStyle}>
      <div style={{ ...rowBase, borderTop: "none" }}>
        <span style={numStyle}>01</span>
        <div style={colStyle}>
          <Scribble widthPct={100} pattern="a" />
          <Scribble widthPct={60} pattern="b" />
        </div>
      </div>
      <div style={{ ...rowBase, borderBottom: "1px solid #ece3d0" }}>
        <span style={numStyle}>02</span>
        <div style={colStyle}>
          <Scribble widthPct={92} pattern="a" />
        </div>
      </div>
      <div
        style={{
          marginTop: 18,
          display: "flex",
          alignItems: "flex-end",
          gap: 12,
        }}
      >
        <div
          style={{
            flex: 1,
            borderBottom: "1.5px solid #20201c",
            paddingBottom: 8,
          }}
        >
          <Scribble widthPct={56} pattern="a" color="#c4b7a0" />
        </div>
        <span
          style={{
            background: "#20201c",
            color: "#f6f1e7",
            padding: "11px 20px",
            borderRadius: 4,
            font: "600 13px/1 'Hanken Grotesk', sans-serif",
          }}
        >
          Guess
        </span>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 9,
          marginTop: 16,
        }}
      >
        <span style={{ font: "600 16px/1 'Caveat', cursive", color: "#a39a87" }}>three tries</span>
        <span style={{ display: "inline-flex", gap: 5 }}>
          {[0, 1, 2].map((i) => (
            <svg key={i} width="17" height="17" viewBox="0 0 20 20" fill="none">
              <path
                d="M10 2.4C5.2 2.2 2.3 5.4 2.6 9.8C2.9 14.2 6.6 17.8 11 17.4C15.1 17 17.9 13.2 17.3 9C16.8 5.2 13.6 2.6 9.6 2.6"
                stroke="#cdbfa3"
                strokeWidth="1.7"
                strokeLinecap="round"
              />
            </svg>
          ))}
        </span>
      </div>
    </div>
  );
}

function SpotFibCard() {
  return (
    <div style={cardStyle}>
      <div style={{ ...rowBase, borderTop: "none" }}>
        <span style={numStyle}>01</span>
        <div style={colStyle}>
          <Scribble widthPct={100} pattern="a" />
          <Scribble widthPct={58} pattern="b" />
        </div>
      </div>
      <div style={{ ...rowBase, alignItems: "center" }}>
        <FibCircle />
        <div style={{ flex: 1 }}>
          <Scribble widthPct={100} pattern="a" color="#cda08a" />
        </div>
        <span
          style={{
            font: "700 17px/1 'Caveat', cursive",
            color: "#b4532f",
            transform: "rotate(-7deg)",
            whiteSpace: "nowrap",
            alignSelf: "center",
          }}
        >
          tap it!
        </span>
      </div>
      <div style={rowBase}>
        <span style={numStyle}>03</span>
        <div style={colStyle}>
          <Scribble widthPct={100} pattern="b" />
          <Scribble widthPct={52} pattern="a" />
        </div>
      </div>
      <div style={{ ...rowBase, borderBottom: "1px solid #ece3d0" }}>
        <span style={numStyle}>04</span>
        <div style={colStyle}>
          <Scribble widthPct={84} pattern="a" />
        </div>
      </div>
    </div>
  );
}

interface StepDef {
  title: string;
  titleDesktop: string;
  underlineMobile: { w: number; d: string };
  underlineDesktop: { w: number; d: string };
  body: string;
  card: () => React.ReactNode;
  cta: string;
}

const STEPS: StepDef[] = [
  {
    title: "Four facts.\nOne's a fib.",
    titleDesktop: "Four facts. One's a fib.",
    underlineMobile: { w: 118, d: "M3 7C26 3 56 8 82 5C98 3.2 110 5 116 7" },
    underlineDesktop: { w: 150, d: "M3 7C34 3 72 8 108 5C128 3.2 142 5 148 7" },
    body: "Each round shows four facts about one hidden answer. Three are true — one is quietly made up.",
    card: () => <PremiseCard />,
    cta: "Next",
  },
  {
    title: "First, name\nthe answer.",
    titleDesktop: "First, name the answer.",
    underlineMobile: { w: 128, d: "M3 7C28 3 60 8 90 5C108 3.2 122 5 126 7" },
    underlineDesktop: { w: 158, d: "M3 7C36 3 76 8 114 5C134 3.2 150 5 156 7" },
    body: "Read the facts and guess who or what they all describe. You get three tries.",
    card: () => <AnswerCard />,
    cta: "Next",
  },
  {
    title: "Then, spot\nthe fib.",
    titleDesktop: "Then, spot the fib.",
    underlineMobile: { w: 96, d: "M3 7C22 3 46 8 66 5C80 3.2 90 5 94 7" },
    underlineDesktop: { w: 132, d: "M3 7C30 3 64 8 96 5C114 3.2 126 5 130 7" },
    body: "One fact is false. Tap the fib to lock in your pick — that's the round.",
    card: () => <SpotFibCard />,
    cta: "Got it — let's play",
  },
];

export function TutorialOverlay({
  onDismiss,
  onComplete,
}: {
  onDismiss: () => void;
  onComplete: () => void;
}) {
  const [step, setStep] = useState(0);
  const isDesktop = useIsDesktop();

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    onDismiss();
  };

  const advance = () => {
    if (step < 2) setStep((s) => s + 1);
    else {
      localStorage.setItem(STORAGE_KEY, "1");
      onComplete();
    }
  };

  const s = STEPS[step];
  const ul = isDesktop ? s.underlineDesktop : s.underlineMobile;
  const titleText = isDesktop ? s.titleDesktop : s.title;
  const titleSize = isDesktop ? 30 : 28;

  const panelContent = (
    <>
      {/* Eyebrow + dots */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            font: "700 11px/1 'Hanken Grotesk', sans-serif",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#b4532f",
          }}
        >
          How to play
        </span>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {[0, 1, 2].map((i) =>
            i === step ? (
              <span
                key={i}
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: "50%",
                  background: "#20201c",
                  display: "inline-block",
                }}
              />
            ) : (
              <span
                key={i}
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: "50%",
                  border: "1.6px solid #c9bca3",
                  display: "inline-block",
                }}
              />
            ),
          )}
        </div>
      </div>

      {/* Title with underline */}
      <div style={{ position: "relative", marginTop: 16, display: "block" }}>
        <div
          style={{
            font: `400 ${titleSize}px/1.12 'Libre Caslon Display', serif`,
            color: "#20201c",
            whiteSpace: "pre-line",
          }}
        >
          {titleText}
        </div>
        <svg
          width={ul.w}
          height="11"
          viewBox={`0 0 ${ul.w} 11`}
          fill="none"
          style={{ position: "absolute", left: 2, bottom: -8 }}
        >
          <path d={ul.d} stroke="#b4532f" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
      </div>

      {/* Body */}
      <div
        style={{
          font: "400 15.5px/1.5 'Hanken Grotesk', sans-serif",
          color: "#6b6659",
          marginTop: 18,
        }}
      >
        {s.body}
      </div>

      {/* Illustration card */}
      <div style={{ marginTop: 20 }}>{s.card()}</div>

      {/* CTA */}
      <button
        onClick={advance}
        style={{
          width: "100%",
          border: "none",
          background: "#20201c",
          color: "#f6f1e7",
          padding: 16,
          borderRadius: 4,
          font: "600 15px/1 'Hanken Grotesk', sans-serif",
          letterSpacing: "0.04em",
          cursor: "pointer",
          marginTop: 22,
        }}
      >
        {s.cta}
      </button>
    </>
  );

  if (isDesktop) {
    return (
      <div
        onClick={dismiss}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(28,27,24,0.46)",
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          animation: "tut-backdrop 0.2s ease",
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            width: 416,
            background: "#f7f2e8",
            borderRadius: 16,
            boxShadow: "0 24px 60px -16px rgba(28,27,24,0.55)",
            padding: "32px 34px 34px",
            animation: "tut-fade-in 0.22s ease",
          }}
        >
          {panelContent}
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={dismiss}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(28,27,24,0.52)",
        zIndex: 100,
        animation: "tut-backdrop 0.25s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          background: "#f7f2e8",
          borderRadius: "30px 30px 0 0",
          boxShadow: "0 -12px 44px rgba(28,27,24,0.30)",
          padding: "16px 28px 34px",
          animation: "tut-slide-up 0.3s ease",
        }}
      >
        {/* Handle */}
        <div
          style={{
            width: 42,
            height: 4,
            borderRadius: 3,
            background: "#d8cdb8",
            margin: "0 auto 22px",
          }}
        />
        {panelContent}
      </div>
    </div>
  );
}
