import { formatMoney } from "@/lib/companies";

type MoneyProps = {
  value: number;
};

export default function Money({ value }: MoneyProps) {
  return (
    <span className="flex items-center gap-1">
      <span className="text-muted-foreground">$</span>
      {formatMoney(Math.round(value))}
    </span>
  );
}
