import Asset from "@/components/_ui/asset";
import type { Company } from "@/data/companies";
import { cn } from "@/lib/utils";

type CompanyMarkProps = {
  company: Company | undefined;
  className?: string;
};

export default function CompanyMark({ company, className }: CompanyMarkProps) {
  return (
    <span
      className={cn(
        "bg-muted flex size-8 shrink-0 items-center justify-center rounded-lg",
        className,
      )}
    >
      {company?.logo ? (
        <Asset
          type="image"
          src={company.logo}
          alt=""
          width={1}
          height={1}
          fit="contain"
          className="size-5"
        />
      ) : (
        <span className="caption-style text-soft">
          {(company?.name ?? "?").slice(0, 1)}
        </span>
      )}
    </span>
  );
}
