import { useEffect, useState } from "react";
import type { QuestionsData } from "./types";
import { Game } from "./components/Game";

function todayDate(): string {
  return new Date().toLocaleDateString("en-CA");
}

type Status = "loading" | "loaded" | "error" | "no-questions";

const shell: React.CSSProperties = {
  minHeight: "100svh",
  background: "#f6f1e7",
  fontFamily: "'Hanken Grotesk', sans-serif",
};

const inner: React.CSSProperties = {
  maxWidth: 430,
  margin: "0 auto",
  padding: "36px 28px 56px",
};

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
    <div style={shell}>
      <div style={inner}>
        {status === "loading" && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
              paddingTop: 80,
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                border: "2px solid #e2d9c6",
                borderTopColor: "#b4532f",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
              }}
            />
            <p
              style={{ font: "italic 400 16px/1 'Newsreader', serif", color: "#a39a87", margin: 0 }}
            >
              Loading today's challenge…
            </p>
          </div>
        )}

        {status === "error" && (
          <div style={{ textAlign: "center", paddingTop: 80 }}>
            <p
              style={{
                font: "400 28px/1.1 'Libre Caslon Display', serif",
                color: "#20201c",
                margin: "0 0 8px",
              }}
            >
              Something went wrong
            </p>
            <p
              style={{
                font: "400 14px/1.4 'Hanken Grotesk', sans-serif",
                color: "#a39a87",
                margin: 0,
              }}
            >
              {error}
            </p>
          </div>
        )}

        {status === "no-questions" && (
          <div style={{ textAlign: "center", paddingTop: 80 }}>
            <p
              style={{
                font: "400 28px/1.1 'Libre Caslon Display', serif",
                color: "#20201c",
                margin: "0 0 8px",
              }}
            >
              No challenge today
            </p>
            <p
              style={{ font: "italic 400 15px/1 'Newsreader', serif", color: "#a39a87", margin: 0 }}
            >
              Check back tomorrow!
            </p>
          </div>
        )}

        {status === "loaded" && data && <Game data={data} />}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
