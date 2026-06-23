import { useState, useRef, useEffect } from "react";
import { XMark, GuessRing } from "./InkMarks";

interface AnswerInputProps {
  onSubmit: (guess: string) => void;
  guessCount: number;
  maxGuesses: number;
  disabled: boolean;
  lastGuessWrong: boolean;
  lastWrongGuess?: string;
  onGiveUp: () => void;
}

export function AnswerInput({
  onSubmit,
  guessCount,
  maxGuesses,
  disabled,
  lastGuessWrong,
  lastWrongGuess,
  onGiveUp,
}: AnswerInputProps) {
  const [value, setValue] = useState("");
  const [showError, setShowError] = useState(false);
  const [giveUpOpen, setGiveUpOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (lastGuessWrong) {
      setShowError(true);
      setValue("");
      inputRef.current?.focus();
    }
  }, [lastGuessWrong, guessCount]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setValue(e.target.value);
    if (showError) setShowError(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSubmit(trimmed);
  }

  function handleConfirmGiveUp() {
    setGiveUpOpen(false);
    onGiveUp();
  }

  const guessesLeft = maxGuesses - guessCount;
  const guessesLeftWord = guessesLeft === 1 ? "one" : guessesLeft === 2 ? "two" : "three";
  const guessesLeftLabel = guessesLeft === 1 ? "one guess" : `${guessesLeftWord} guesses`;

  const caption =
    guessCount === 0 && !showError ? "three guesses" : `guess ${guessCount + 1} of ${maxGuesses}`;

  const underlineColor = showError ? "#b4532f" : "#20201c";

  const guessesLeftDesc =
    guessesLeft === maxGuesses
      ? "All three guesses still unused."
      : guessesLeft === 1
        ? "One guess still left."
        : `${guessesLeftWord.charAt(0).toUpperCase() + guessesLeftWord.slice(1)} guesses still left.`;

  return (
    <div>
      {showError && lastWrongGuess && (
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 12 }}>
          <XMark size={18} color="#b4532f" />
          <span
            style={{
              font: "italic 500 16px/1 'Newsreader', serif",
              color: "#b4532f",
            }}
          >
            Not "{lastWrongGuess}" — {guessesLeftLabel} left.
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", alignItems: "flex-end", gap: 14 }}>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleChange}
          placeholder="Type your answer"
          disabled={disabled}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="words"
          spellCheck={false}
          className="fibole-input"
          style={{
            flex: 1,
            minWidth: 0,
            border: "none",
            borderBottom: `1.5px solid ${underlineColor}`,
            paddingBottom: 10,
            background: "transparent",
            font: "italic 400 18px/1 'Newsreader', serif",
            color: "#20201c",
            transition: "border-color 0.15s",
          }}
        />
        <button
          type="submit"
          disabled={disabled || !value.trim()}
          style={{
            border: "none",
            background: "#20201c",
            color: "#f6f1e7",
            padding: "13px 26px",
            borderRadius: 4,
            font: "600 15px/1 'Hanken Grotesk', sans-serif",
            letterSpacing: "0.04em",
            cursor: !disabled && value.trim() ? "pointer" : "default",
            opacity: disabled || !value.trim() ? 0.45 : 1,
            transition: "opacity 0.15s",
            flexShrink: 0,
          }}
        >
          Guess
        </button>
      </form>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: 20,
        }}
      >
        <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
          <span
            style={{
              font: "600 17px/1 'Caveat', cursive",
              color: "#a39a87",
              whiteSpace: "nowrap",
            }}
          >
            {caption}
          </span>
          <span style={{ display: "inline-flex", gap: 6 }}>
            {[0, 1, 2].map((i) => (
              <GuessRing key={i} index={i} spent={i < guessCount} />
            ))}
          </span>
        </span>
        <button
          type="button"
          onClick={() => setGiveUpOpen(true)}
          style={{
            border: "none",
            background: "transparent",
            padding: "13px 14px",
            margin: "-13px 0",
            font: "600 19px/1 'Caveat', cursive",
            color: "#b09c7c",
            cursor: "pointer",
            whiteSpace: "nowrap",
            textDecoration: "underline",
            textUnderlineOffset: 3,
            textDecorationColor: "#d8cbb4",
          }}
        >
          give up?
        </button>
      </div>

      {giveUpOpen && (
        <>
          <div
            onClick={() => setGiveUpOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(28,27,24,0.42)",
              zIndex: 40,
            }}
          />
          <div
            style={{
              position: "fixed",
              left: 0,
              right: 0,
              bottom: 0,
              background: "#f9f4ea",
              borderRadius: "24px 24px 0 0",
              padding: "34px 30px 48px",
              boxShadow: "0 -18px 50px -20px rgba(28,27,24,0.5)",
              zIndex: 41,
            }}
          >
            <div
              style={{
                width: 40,
                height: 4,
                borderRadius: 2,
                background: "#ddd2bd",
                margin: "0 auto 24px",
              }}
            />
            <div style={{ position: "relative", display: "inline-block" }}>
              <div
                style={{
                  font: "400 28px/1.2 'Libre Caslon Display', serif",
                  color: "#20201c",
                }}
              >
                Give up this round?
              </div>
              <svg
                width="186"
                height="10"
                viewBox="0 0 186 10"
                fill="none"
                style={{ position: "absolute", left: 0, bottom: -7, display: "block" }}
              >
                <path
                  d="M3 6C40 2.5 96 7.5 132 4.5C152 2.8 170 4.5 183 6"
                  stroke="#b4532f"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div
              style={{
                font: "400 16px/1.55 'Hanken Grotesk', sans-serif",
                color: "#5f5a4f",
                marginTop: 22,
              }}
            >
              You&apos;ll see the answer, but score{" "}
              <b style={{ fontWeight: 600, color: "#2a2823" }}>no points</b>. You&apos;ll still have
              a chance to identify the fib.
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 16 }}>
              <span style={{ display: "inline-flex", gap: 5 }}>
                {[0, 1, 2].map((i) => (
                  <GuessRing key={i} index={i} spent={i < guessCount} />
                ))}
              </span>
              <span
                style={{
                  font: "italic 400 14px/1.3 'Newsreader', serif",
                  color: "#8a8472",
                }}
              >
                {guessesLeftDesc}
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 28 }}>
              <button
                onClick={handleConfirmGiveUp}
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
                }}
              >
                Reveal the answer
              </button>
              <button
                onClick={() => setGiveUpOpen(false)}
                style={{
                  width: "100%",
                  border: "none",
                  background: "transparent",
                  color: "#6b6659",
                  padding: 8,
                  font: "600 15px/1 'Hanken Grotesk', sans-serif",
                  letterSpacing: "0.02em",
                  cursor: "pointer",
                }}
              >
                Keep trying
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
