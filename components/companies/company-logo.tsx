"use client";

import { useState } from "react";
import Image from "next/image";
import { cva, type VariantProps } from "class-variance-authority";
import type { Company } from "@/data/companies";
import { companyLogoSrc } from "@/lib/companies";
import { cn } from "@/lib/utils";

const tileVariants = cva(
  "bg-logo-tile text-logo-tile-fg shadow-hairline flex shrink-0 items-center justify-center overflow-hidden font-medium select-none",
  {
    variants: {
      size: {
        xs: "size-5 rounded-sm text-[10px]",
        sm: "size-6 rounded-md text-[11px]",
        md: "size-8 rounded-lg text-xs",
        lg: "shadow-tile size-12.5 rounded-xl text-base",
        xl: "shadow-tile size-14 rounded-xl text-base",
      },
    },
    defaultVariants: { size: "md" },
  },
);

const IMAGE_PX = { xs: 14, sm: 16, md: 20, lg: 32, xl: 36 } as const;

type CompanyLogoProps = VariantProps<typeof tileVariants> & {
  company: Pick<Company, "name" | "logo" | "domain">;
  className?: string;
};

export default function CompanyLogo({
  company,
  size = "md",
  className,
}: CompanyLogoProps) {
  const src = companyLogoSrc(company);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  const px = IMAGE_PX[size ?? "md"];
  const showImage = src && failedSrc !== src;

  return (
    <span className={cn(tileVariants({ size }), "relative", className)}>
      {loadedSrc !== src && (
        <span aria-hidden>{company.name.trim().slice(0, 1).toUpperCase()}</span>
      )}
      {showImage && (
        <Image
          src={src}
          alt=""
          width={px}
          height={px}
          unoptimized
          draggable={false}
          data-loaded={loadedSrc === src}
          className="duration-base absolute object-contain opacity-0 transition-opacity data-[loaded=true]:opacity-100"
          style={{ width: px, height: px }}
          onError={() => setFailedSrc(src)}
          onLoad={(event) => {
            // Google answers unknown domains with a 16px generic globe.
            if (!company.logo && event.currentTarget.naturalWidth <= 16) {
              setFailedSrc(src);
              return;
            }
            setLoadedSrc(src);
          }}
        />
      )}
    </span>
  );
}
