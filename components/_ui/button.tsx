import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-full font-medium leading-none outline-none select-none transition-[background-color,color,box-shadow,scale] duration-fast ease-power3-out active:scale-[0.96] motion-reduce:active:scale-100 focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground shadow-brand hover:bg-primary-hover",
        secondary:
          "bg-secondary text-secondary-foreground shadow-raised hover:bg-muted",
        muted: "bg-muted text-foreground shadow-raised hover:bg-muted-hover",
        subtle: "bg-raised text-foreground shadow-hairline hover:bg-muted",
        ghost: "text-fg-tertiary hover:bg-overlay-2 hover:text-foreground",
        nav: "w-full justify-start rounded-lg active:scale-100 text-sidebar-foreground hover:text-foreground data-[active=true]:bg-sidebar-primary data-[active=true]:text-foreground data-[active=true]:shadow-raised",
        item: "w-full active:scale-100 items-start justify-start gap-3 rounded-lg text-left font-normal whitespace-normal text-foreground hover:bg-overlay-1",
        link: "rounded-none active:scale-100 text-foreground underline decoration-from-font underline-offset-2 hover:text-fg-secondary",
      },
      size: {
        xs: "h-control-sm px-2 text-xs leading-none font-normal",
        sm: "p-2.25 text-xs leading-none",
        control: "h-control-md text-xs leading-none",
        avatar:
          "h-control-md gap-1.5 py-1.25 pr-1.75 pl-1.25 text-xs leading-none font-normal",
        inline: "-mx-1.5 gap-1.5 px-1.5 py-1 font-normal",
        md: "p-2 text-sm leading-none",
        icon: "relative size-control-md p-0 pointer-coarse:after:absolute pointer-coarse:after:-inset-2 pointer-coarse:after:content-['']",
        "icon-xs":
          "relative size-control-xs p-0 after:absolute after:-inset-1.5 after:content-['']",
        "icon-sm":
          "relative size-control-sm p-0 pointer-coarse:after:absolute pointer-coarse:after:-inset-2.5 pointer-coarse:after:content-['']",
        none: "p-0",
      },
    },
    defaultVariants: {
      variant: "secondary",
      size: "sm",
    },
  },
);

type ButtonProps = VariantProps<typeof buttonVariants> &
  ComponentProps<"button"> & {
    href?: ComponentProps<typeof Link>["href"];
    loading?: boolean;
  };

export default function Button({
  variant,
  size,
  className,
  href,
  children,
  type = "button",
  loading = false,
  disabled,
  ...props
}: ButtonProps) {
  const classes = cn(buttonVariants({ variant, size }), className);

  if (href) {
    return (
      <Link
        href={href}
        className={classes}
        {...(props as Omit<ComponentProps<typeof Link>, "href" | "className">)}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={cn(classes, loading && "relative disabled:opacity-100")}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <>
          <span className="inline-flex items-center [gap:inherit] opacity-0">
            {children}
          </span>
          <span
            aria-hidden
            className="absolute inset-0 flex items-center justify-center"
          >
            <span className="size-3.5 animate-spin rounded-full border-[1.5px] border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          </span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
