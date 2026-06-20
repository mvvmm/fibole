import { useState, useRef, useEffect } from "react";

interface AnswerInputProps {
  onSubmit: (guess: string) => void;
  guessCount: number;
  maxGuesses: number;
  disabled: boolean;
  lastGuessWrong: boolean;
}

export function AnswerInput({
  onSubmit,
  guessCount,
  maxGuesses,
  disabled,
  lastGuessWrong,
}: AnswerInputProps) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (lastGuessWrong) {
      setValue("");
      inputRef.current?.focus();
    }
  }, [lastGuessWrong, guessCount]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSubmit(trimmed);
  }

  const guessesLeft = maxGuesses - guessCount;

  return (
    <div className="space-y-3">
      {lastGuessWrong && (
        <p className="text-sm text-red-500 font-medium text-center animate-shake">
          Incorrect — {guessesLeft} guess{guessesLeft !== 1 ? "es" : ""} remaining
        </p>
      )}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Type your answer…"
          disabled={disabled}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="words"
          spellCheck={false}
          className="flex-1 min-w-0 rounded-lg border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={disabled || !value.trim()}
          className="rounded-lg bg-slate-900 px-5 py-3 text-base font-semibold text-white disabled:opacity-40 active:scale-95 transition-transform"
        >
          Guess
        </button>
      </form>
      <p className="text-xs text-slate-500 text-center">
        Guess {guessCount + 1} of {maxGuesses}
      </p>
    </div>
  );
}
