import { FakeOval, NumberPenCircle, PencilStrike } from "./InkMarks";

type FactMode = "reading" | "selecting" | "revealed";

interface FactListProps {
  facts: string[];
  mode: FactMode;
  selectedIndex?: number | null;
  correctIndex?: number;
  fakeSubject?: string;
  onSelect?: (index: number) => void;
}

export function FactList({
  facts,
  mode,
  selectedIndex,
  correctIndex,
  fakeSubject,
  onSelect,
}: FactListProps) {
  const isRevealed = mode === "revealed";
  const isSelecting = mode === "selecting";

  return (
    <div>
      {facts.map((fact, i) => {
        const isLast = i === facts.length - 1;
        const isCorrectFake = isRevealed && correctIndex === i;
        const isUserWrongPick =
          isRevealed && selectedIndex != null && selectedIndex === i && !isCorrectFake;
        const isSelected = isSelecting && selectedIndex === i;

        const dividerColor = isRevealed ? "#e8e0d1" : "#e2d9c6";
        const borderBottom = isLast ? `1px solid ${dividerColor}` : undefined;

        if (isCorrectFake) {
          const label = selectedIndex != null && selectedIndex === i ? "fake!" : "the fake";
          return (
            <div
              key={i}
              style={{
                padding: "12px 0",
                borderTop: `1px solid ${dividerColor}`,
                borderBottom,
              }}
            >
              <div style={{ position: "relative" }}>
                <FakeOval />
                <div style={{ display: "flex", gap: 16 }}>
                  <span
                    style={{
                      font: "italic 400 15px/1.4 'Newsreader', serif",
                      color: "#b4532f",
                      minWidth: 22,
                      flexShrink: 0,
                    }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    style={{
                      font: "400 14px/1.42 'Hanken Grotesk', sans-serif",
                      color: "#7a3a22",
                      paddingRight: 52,
                    }}
                  >
                    {fact}
                  </span>
                </div>
                <span
                  style={{
                    position: "absolute",
                    top: -4,
                    right: 4,
                    font: "700 23px/1 'Caveat', cursive",
                    color: "#b4532f",
                    transform: "rotate(-7deg)",
                  }}
                >
                  {label}
                </span>
              </div>
              {fakeSubject && (
                <div
                  style={{
                    font: "italic 400 13px/1.3 'Newsreader', serif",
                    color: "#a86a4e",
                    marginTop: 9,
                    paddingLeft: 38,
                  }}
                >
                  Actually true of {fakeSubject}.
                </div>
              )}
            </div>
          );
        }

        if (isUserWrongPick) {
          return (
            <div
              key={i}
              style={{
                position: "relative",
                padding: "12px 0",
                borderTop: `1px solid ${dividerColor}`,
                borderBottom,
              }}
            >
              <PencilStrike />
              <div style={{ display: "flex", gap: 16 }}>
                <span
                  style={{
                    font: "italic 400 15px/1.4 'Newsreader', serif",
                    color: "#aaa191",
                    minWidth: 22,
                    flexShrink: 0,
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span
                  style={{
                    font: "400 14px/1.42 'Hanken Grotesk', sans-serif",
                    color: "#9a9080",
                    paddingRight: 64,
                  }}
                >
                  {fact}
                </span>
              </div>
              <span
                style={{
                  position: "absolute",
                  top: 6,
                  right: 4,
                  font: "600 17px/1 'Caveat', cursive",
                  color: "#9a9080",
                  transform: "rotate(-5deg)",
                }}
              >
                your pick
              </span>
            </div>
          );
        }

        if (isRevealed) {
          return (
            <div
              key={i}
              style={{
                display: "flex",
                gap: 16,
                padding: "12px 0",
                borderTop: `1px solid ${dividerColor}`,
                borderBottom,
              }}
            >
              <span
                style={{
                  font: "italic 400 15px/1.4 'Newsreader', serif",
                  color: "#bdb4a2",
                  minWidth: 22,
                  flexShrink: 0,
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span
                style={{
                  font: "400 14px/1.42 'Hanken Grotesk', sans-serif",
                  color: "#6f6a5e",
                }}
              >
                {fact}
              </span>
            </div>
          );
        }

        return (
          <div
            key={i}
            role={isSelecting ? "button" : undefined}
            tabIndex={isSelecting ? 0 : undefined}
            onClick={isSelecting ? () => onSelect?.(i) : undefined}
            onKeyDown={
              isSelecting
                ? (e) => {
                    if (e.key === "Enter" || e.key === " ") onSelect?.(i);
                  }
                : undefined
            }
            style={{
              display: "flex",
              gap: 16,
              padding: "14px 0",
              borderTop: `1px solid ${dividerColor}`,
              borderBottom,
              cursor: isSelecting ? "pointer" : "default",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            <div style={{ position: "relative", minWidth: 22, flexShrink: 0 }}>
              <span
                style={{
                  font: "italic 400 16px/1.4 'Newsreader', serif",
                  color: isSelected ? "#20201c" : "#b4532f",
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              {isSelected && <NumberPenCircle />}
            </div>
            <span
              style={{
                font: "400 15px/1.45 'Hanken Grotesk', sans-serif",
                color: "#38362f",
              }}
            >
              {fact}
            </span>
          </div>
        );
      })}
    </div>
  );
}
