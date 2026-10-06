import Avatar from "@/components/_ui/avatar";
import Button from "@/components/_ui/button";
import { TableCell, TableRow } from "@/components/_ui/table";
import Money from "@/components/_common/money";
import { ownerByName } from "@/data/companies";
import { formatQ1Coverage, type Q1Rep } from "@/lib/q1-forecast";
import { cn } from "@/lib/utils";
import {
  REP_CELL_CLASS,
  REP_ROW_CLASS,
  repColumnClass,
  type RepColumnKey,
} from "./rep-columns";

type RepRowProps = {
  rep: Q1Rep;
  total?: boolean;
  onOpenOwner?: () => void;
};

function cellClass(key: RepColumnKey) {
  return cn(REP_CELL_CLASS, repColumnClass(key));
}

export default function RepRow({ rep, total, onOpenOwner }: RepRowProps) {
  const owner = total ? null : ownerByName(rep.owner);

  return (
    <TableRow
      role="row"
      className={cn(REP_ROW_CLASS, total && "bg-card text-foreground")}
    >
      <TableCell role="cell" className={cellClass("owner")}>
        {owner ? (
          <Button
            variant="ghost"
            size="none"
            onClick={onOpenOwner}
            aria-label={`Open ${owner.name} profile`}
            className="text-foreground -mx-1.5 gap-1.5 px-1.5 py-1 font-normal"
          >
            <Avatar src={owner.avatar} alt="" />
            <span className="flex flex-col items-start gap-1">
              {owner.name}
              <span className="caption-style text-muted-foreground">
                {owner.team}
              </span>
            </span>
          </Button>
        ) : (
          "Team total"
        )}
      </TableCell>
      <TableCell role="cell" className={cellClass("quota")}>
        {rep.quota > 0 ? (
          <Money value={rep.quota} />
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </TableCell>
      <TableCell role="cell" className={cellClass("commit")}>
        <Money value={rep.commit} />
      </TableCell>
      <TableCell role="cell" className={cellClass("bestCase")}>
        <Money value={rep.bestCase} />
      </TableCell>
      <TableCell role="cell" className={cellClass("pipeline")}>
        <Money value={rep.pipeline} />
      </TableCell>
      <TableCell role="cell" className={cellClass("weighted")}>
        <Money value={rep.weighted} />
      </TableCell>
      <TableCell role="cell" className={cellClass("coverage")}>
        {formatQ1Coverage(rep.openCoverage)}
      </TableCell>
    </TableRow>
  );
}
