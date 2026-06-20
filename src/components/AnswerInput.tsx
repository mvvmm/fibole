import { useState, useRef, useEffect } from "react";
import { XMark, GuessRing } from "./InkMarks";

interface AnswerInputProps {
  onSubmit: (guess: string) => void;
  guessCount: number;
  maxGuesses: number;
  disabled: boolean;
  lastGuessWrong: boolean;
  lastWrongGuess?: string;
}

export function AnswerInput({
  onSubmit,
  guessCount,
  maxGuesses,
  disabled,
  lastGuessWrong,
  lastWrongGuess,
}: AnswerInputProps) {
  const [value, setValue] = useState("");
  const [showError, setShowError] = useState(false);
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

  const guessesLeft = maxGuesses - guessCount;
  const guessesLeftWord =
    guessesLeft === 1 ? "one" : guessesLeft === 2 ? "two" : "three";
  const guessesLeftLabel =
    guessesLeft === 1 ? "one guess" : `${guessesLeftWord} guesses`;

  const caption =
    guessCount === 0 && !showError
      ? "three guesses"
      : `guess ${guessCount + 1} of ${maxGuesses}`;

  const underlineColor = showError ? "#b4532f" : "#20201c";

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

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", alignItems: "flex-end", gap: 14 }}
      >
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
          justifyContent: "center",
          gap: 10,
          marginTop: 20,
        }}
      >
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
      </div>
    </div>
  );
}
