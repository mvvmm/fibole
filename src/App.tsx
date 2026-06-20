import { useEffect, useState } from "react";
import type { QuestionsData } from "./types";
import { Game } from "./components/Game";

function todayDate(): string {
  return new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD in local time
}

type Status = "loading" | "loaded" | "error" | "no-questions";

export function App() {
  const [status, setStatus] = useState<Status>("loading");
  const [data, setData] = useState<QuestionsData | null>(null);
  const [error, setError] = useState<string>("");
  const date = todayDate();

  useEffect(() => {
    fetch(`/api/questions?date=${date}`)
      .then((r) => {
        if (r.status === 404) throw new Error("no-questions");
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<QuestionsData>;
      })
      .then((d) => {
        setData(d);
        setStatus("loaded");
      })
      .catch((e: Error) => {
        if (e.message === "no-questions") {
          setStatus("no-questions");
        } else {
          setError(e.message);
          setStatus("error");
        }
      });
  }, [date]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 px-4 py-4 text-center">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          Fibole
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">Daily facts challenge</p>
      </header>

      <main className="flex-1 px-4 py-6 max-w-lg mx-auto w-full">
        {status === "loading" && (
          <div className="flex flex-col items-center gap-3 py-16 text-slate-400">
            <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
            <p className="text-sm">Loading today's challenge…</p>
          </div>
        )}

        {status === "error" && (
          <div className="text-center py-16 text-slate-500">
            <p className="text-lg font-semibold">Something went wrong</p>
            <p className="text-sm mt-1 text-slate-400">{error}</p>
          </div>
        )}

        {status === "no-questions" && (
          <div className="text-center py-16 text-slate-500">
            <p className="text-lg font-semibold">No challenge today</p>
            <p className="text-sm mt-1 text-slate-400">
              Check back tomorrow!
            </p>
          </div>
        )}

        {status === "loaded" && data && <Game data={data} />}
      </main>
    </div>
  );
}
