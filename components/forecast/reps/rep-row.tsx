import Avatar from "@/components/_ui/avatar";
import Button from "@/components/_ui/button";
import { TableCell, TableRow } from "@/components/_ui/table";
import Money from "@/components/_common/money";
import SegmentBar from "@/components/_common/segment-bar";
import { ownerByName } from "@/data/companies";
import { formatCoverage, type Rollup } from "@/lib/forecast";
import { cn } from "@/lib/utils";
import {
  REP_CELL_CLASS,
  REP_ROW_CLASS,
  repColumnClass,
  type RepColumnKey,
} from "./rep-columns";

type RepRowProps = {
  rollup: Rollup;
  total?: boolean;
  onOpenOwner?: () => void;
};

function cellClass(key: RepColumnKey) {
  return cn(REP_CELL_CLASS, repColumnClass(key));
}

export default function RepRow({ rollup, total, onOpenOwner }: RepRowProps) {
  return (
    <TableRow
      role="row"
      className={cn(REP_ROW_CLASS, total && "bg-card text-foreground")}
    >
      <TableCell role="cell" className={cellClass("owner")}>
        {total ? (
          "Team total"
        ) : (
          <Button
            variant="ghost"
            size="none"
            onClick={onOpenOwner}
            aria-label={`Open ${rollup.owner} profile`}
            className="text-foreground -mx-1.5 gap-1.5 px-1.5 py-1 font-normal"
          >
            <Avatar src={ownerByName(rollup.owner).avatar} alt="" />
            {rollup.owner}
          </Button>
        )}
      </TableCell>
      <TableCell role="cell" className={cellClass("quota")}>
        <Money value={rollup.quota} />
      </TableCell>
      <TableCell role="cell" className={cellClass("closed")}>
        <Money value={rollup.closed} />
      </TableCell>
      <TableCell role="cell" className={cellClass("commit")}>
        <Money value={rollup.commit} />
      </TableCell>
      <TableCell role="cell" className={cellClass("bestCase")}>
        <Money value={rollup.bestCase} />
      </TableCell>
      <TableCell role="cell" className={cellClass("pipeline")}>
        <Money value={rollup.pipeline} />
      </TableCell>
      <TableCell role="cell" className={cellClass("attainment")}>
        <span className="flex items-center gap-2">
          <SegmentBar percent={rollup.attainment} className="w-[74px]" />
          <span className="w-[4ch] text-right">{rollup.attainment}%</span>
        </span>
      </TableCell>
      <TableCell role="cell" className={cellClass("coverage")}>
        {formatCoverage(rollup)}
      </TableCell>
    </TableRow>
  );
}
