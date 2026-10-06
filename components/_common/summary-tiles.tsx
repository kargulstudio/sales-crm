import SegmentBar from "./segment-bar";
import { cn } from "@/lib/utils";

export type SummaryTile = {
  key: string;
  label: string;
  value: string;
  note?: string;
  percent?: number;
  percentLabel?: string;
};

type SummaryTileCardProps = {
  tile: SummaryTile;
  className?: string;
};

type SummaryTilesProps = {
  tiles: SummaryTile[];
  className?: string;
};

const COLUMNS: Record<number, string> = {
  4: "sm:grid-cols-4",
  5: "sm:grid-cols-3 xl:grid-cols-5",
  6: "sm:grid-cols-3 xl:grid-cols-6",
  8: "sm:grid-cols-4",
};

export function SummaryTileCard({ tile, className }: SummaryTileCardProps) {
  return (
    <div
      className={cn(
        "border-line-strong flex min-w-0 flex-col gap-3 rounded-lg border p-[11px]",
        className,
      )}
    >
      <span className="caption-style text-soft block truncate">
        {tile.label}
      </span>
      <span className="lead-style block truncate tabular-nums">
        {tile.value}
      </span>
      {tile.percent !== undefined ? (
        <span className="flex items-center gap-2">
          <SegmentBar
            percent={Math.min(100, tile.percent)}
            segments={12}
            className="min-w-0 flex-1"
          />
          {tile.percentLabel && (
            <span className="caption-style text-soft tabular-nums">
              {tile.percentLabel}
            </span>
          )}
        </span>
      ) : (
        <span className="caption-style text-soft block truncate">
          {tile.note}
        </span>
      )}
    </div>
  );
}

export default function SummaryTiles({ tiles, className }: SummaryTilesProps) {
  const odd = tiles.length % 2 === 1;

  return (
    <div
      className={cn(
        "grid shrink-0 grid-cols-2 gap-2 px-4 pb-4",
        COLUMNS[tiles.length],
        className,
      )}
    >
      {tiles.map((tile, index) => (
        <SummaryTileCard
          key={tile.key}
          tile={tile}
          className={cn(
            odd && index === tiles.length - 1 && "col-span-2 sm:col-span-1",
          )}
        />
      ))}
    </div>
  );
}
