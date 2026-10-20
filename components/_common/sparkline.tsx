import { TREND_PATTERN } from "@/data/companies";
import { cn } from "@/lib/utils";

type SparklineProps = {
  values: number[];
  className?: string;
};

const HEIGHT_CLASS: Record<number, string> = {
  1: "h-px",
  2: "h-0.5",
  3: "h-0.75",
  4: "h-1",
  5: "h-1.25",
  6: "h-1.5",
  7: "h-1.75",
  8: "h-2",
  9: "h-2.25",
  10: "h-2.5",
  11: "h-2.75",
  12: "h-3",
  13: "h-3.25",
  14: "h-3.5",
};

export default function Sparkline({ values, className }: SparklineProps) {
  return (
    <span aria-hidden className={cn("flex h-3.5 items-end gap-px", className)}>
      {values.map((value, index) => (
        <span
          key={index}
          className={cn(
            "w-1 shrink-0 rounded-xs",
            HEIGHT_CLASS[Math.min(14, Math.max(1, Math.round(value)))],
            TREND_PATTERN[index % TREND_PATTERN.length]
              ? "bg-trend"
              : "bg-trend-muted",
          )}
        />
      ))}
    </span>
  );
}
