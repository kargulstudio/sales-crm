import { contactInitials } from "@/lib/contacts";
import { cn } from "@/lib/utils";

type ContactInitialsProps = {
  name: string;
  size?: "sm" | "lg";
  className?: string;
};

export default function ContactInitials({
  name,
  size = "sm",
  className,
}: ContactInitialsProps) {
  return (
    <span
      aria-hidden
      className={cn(
        "bg-muted text-soft flex shrink-0 items-center justify-center rounded-full outline-1 -outline-offset-1 outline-white/10",
        size === "lg" ? "h2-style size-[50px]" : "caption-style size-8",
        className,
      )}
    >
      {contactInitials(name)}
    </span>
  );
}
