import Image from "next/image";
import { cn } from "@/lib/utils";
import { assetMediaClass } from "./asset-frame";
import type { AssetFit } from "./asset-types";

type AssetPosterProps = {
  src: string;
  alt?: string;
  fit?: AssetFit;
  visible?: boolean;
  className?: string;
};

function AssetPoster({
  src,
  alt = "",
  fit,
  visible = true,
  className,
}: AssetPosterProps) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes="100vw"
      unoptimized={src.startsWith("data:")}
      className={assetMediaClass(
        fit,
        cn(
          "ease-power3-in z-sticky duration-panel pointer-events-none transition-opacity",
          visible ? "opacity-100" : "opacity-0",
          className,
        ),
      )}
    />
  );
}

export default AssetPoster;
