import { cn } from "@/lib/utils";

type FactMode = "reading" | "selecting" | "revealed";

interface FactListProps {
  facts: string[];
  mode: FactMode;
  selectedIndex?: number | null;
  correctIndex?: number;
  onSelect?: (index: number) => void;
}

export function FactList({
  facts,
  mode,
  selectedIndex,
  correctIndex,
  onSelect,
}: FactListProps) {
  return (
    <ol className="space-y-2">
      {facts.map((fact, i) => {
        const isSelected = selectedIndex === i;
        const isCorrect = correctIndex === i;
        const isSelectable = mode === "selecting";

        let cardStyle = "border-slate-200 bg-white";
        let numberStyle = "bg-slate-100 text-slate-500";
        let indicator: string | null = null;

        if (mode === "revealed") {
          if (isCorrect) {
            cardStyle = "border-red-200 bg-red-50";
            numberStyle = "bg-red-100 text-red-600";
            indicator = "FAKE";
          } else if (isSelected && !isCorrect) {
            cardStyle = "border-amber-200 bg-amber-50";
            numberStyle = "bg-amber-100 text-amber-600";
          }
        }

        return (
          <li key={i}>
            <button
              onClick={() => isSelectable && onSelect?.(i)}
              disabled={!isSelectable}
              className={cn(
                "w-full text-left flex items-start gap-3 rounded-xl border p-4 transition-colors",
                cardStyle,
                isSelectable &&
                  "cursor-pointer active:scale-[0.98] transition-transform hover:border-slate-400 hover:bg-slate-50"
              )}
            >
              <span
                className={cn(
                  "flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold",
                  numberStyle
                )}
              >
                {i + 1}
              </span>
              <span className="flex-1 text-sm text-slate-700 leading-relaxed pt-0.5">
                {fact}
              </span>
              {indicator && (
                <span className="flex-shrink-0 text-xs font-bold text-red-500 pt-0.5">
                  {indicator}
                </span>
              )}
            </button>
          </li>
        );
      })}
    </ol>
  );
}
