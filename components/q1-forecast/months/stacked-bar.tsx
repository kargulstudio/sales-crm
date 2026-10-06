import { cn } from "@/lib/utils";

export type StackedPart = {
  key: string;
  value: number;
  className: string;
};

type StackedBarProps = {
  parts: StackedPart[];
  segments?: number;
  label: string;
  className?: string;
};

function allocate(parts: StackedPart[], segments: number) {
  const total = parts.reduce((sum, part) => sum + part.value, 0);
  if (total <= 0) return parts.map(() => 0);
  const exact = parts.map((part) => (part.value / total) * segments);
  const counts = exact.map(Math.floor);
  let left = segments - counts.reduce((sum, count) => sum + count, 0);
  const order = exact
    .map((value, index) => ({ index, rest: value - Math.floor(value) }))
    .sort((a, b) => b.rest - a.rest);
  for (const { index } of order) {
    if (left <= 0) break;
    if (parts[index].value > 0) {
      counts[index] += 1;
      left -= 1;
    }
  }
  return counts;
}

export default function StackedBar({
  parts,
  segments = 24,
  label,
  className,
}: StackedBarProps) {
  const counts = allocate(parts, segments);
  const cells = parts.flatMap((part, index) =>
    Array.from({ length: counts[index] }, (_, offset) => ({
      id: `${part.key}-${offset}`,
      className: part.className,
    })),
  );
  const empty = segments - cells.length;

  return (
    <span
      role="img"
      aria-label={label}
      className={cn(
        "flex h-[14px] items-center gap-[2px] overflow-hidden rounded-[2px] bg-white/8 px-[2px]",
        className,
      )}
    >
      {cells.map((cell) => (
        <span
          key={cell.id}
          className={cn(
            "h-[10px] min-w-px flex-1 rounded-[1px]",
            cell.className,
          )}
        />
      ))}
      {Array.from({ length: empty }, (_, index) => (
        <span
          key={`empty-${index}`}
          className="bg-track h-[10px] min-w-px flex-1 rounded-[1px]"
        />
      ))}
    </span>
  );
}
