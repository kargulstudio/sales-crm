import Asset from "@/components/_ui/asset";
import { cn } from "@/lib/utils";

type AvatarProps = {
  src: string;
  alt: string;
  name?: string;
  className?: string;
};

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return (parts[0]?.[0] ?? "") + (parts.length > 1 ? parts.at(-1)![0] : "");
}

export default function Avatar({ src, alt, name, className }: AvatarProps) {
  if (!src) {
    return (
      <span
        role={alt ? "img" : undefined}
        aria-label={alt || undefined}
        aria-hidden={alt ? undefined : true}
        className={cn(
          "bg-primary text-primary-foreground [container-type:size] flex size-5 shrink-0 items-center justify-center overflow-hidden rounded-full leading-none font-medium uppercase select-none",
          className,
        )}
      >
        <span className="text-[40cqh]">{initials(name ?? alt)}</span>
      </span>
    );
  }
  return (
    <Asset
      type="image"
      src={src}
      alt={alt}
      width={1}
      height={1}
      sizes="48px"
      className={cn(
        "bg-avatar-placeholder size-5 shrink-0 rounded-full outline-1 -outline-offset-1 outline-(--image-outline)",
        className,
      )}
    />
  );
}
