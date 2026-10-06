"use client";

import { useEffect, useRef, type ComponentProps } from "react";
import { cn } from "@/lib/utils";

const FADE_SIZE = 24;

type ScrollAreaProps = ComponentProps<"div"> & {
  orientation?: "vertical" | "horizontal" | "both";
  viewportClassName?: string;
  fade?: boolean;
};

function ScrollArea({
  className,
  viewportClassName,
  orientation = "vertical",
  fade = false,
  children,
  ...props
}: ScrollAreaProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const isVertical = orientation !== "horizontal";
  const isHorizontal = orientation !== "vertical";

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!fade || !viewport) return;

    function update() {
      if (!viewport) return;
      if (isVertical) {
        const remaining =
          viewport.scrollHeight - viewport.clientHeight - viewport.scrollTop;
        viewport.style.setProperty(
          "--fade-y-start",
          `${Math.max(0, Math.min(viewport.scrollTop, FADE_SIZE))}px`,
        );
        viewport.style.setProperty(
          "--fade-y-end",
          `${Math.max(0, Math.min(remaining, FADE_SIZE))}px`,
        );
      }
      if (isHorizontal) {
        const remaining =
          viewport.scrollWidth - viewport.clientWidth - viewport.scrollLeft;
        viewport.style.setProperty(
          "--fade-x-start",
          `${Math.max(0, Math.min(viewport.scrollLeft, FADE_SIZE))}px`,
        );
        viewport.style.setProperty(
          "--fade-x-end",
          `${Math.max(0, Math.min(remaining, FADE_SIZE))}px`,
        );
      }
    }

    update();
    viewport.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(viewport);
    Array.from(viewport.children).forEach((child) => observer.observe(child));

    return () => {
      viewport.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, [fade, isVertical, isHorizontal]);

  return (
    <div
      data-slot="scroll-area"
      className={cn("relative overflow-hidden", className)}
      {...props}
    >
      <div
        ref={viewportRef}
        data-slot="scroll-area-viewport"
        className={cn(
          "size-full rounded-[inherit] outline-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          isVertical ? "overflow-y-auto" : "overflow-y-hidden",
          isHorizontal ? "overflow-x-auto" : "overflow-x-hidden",
          fade &&
            orientation === "vertical" &&
            "[mask-image:linear-gradient(to_bottom,transparent,#000_var(--fade-y-start,0px),#000_calc(100%_-_var(--fade-y-end,0px)),transparent)]",
          fade &&
            orientation === "horizontal" &&
            "[mask-image:linear-gradient(to_right,transparent,#000_var(--fade-x-start,0px),#000_calc(100%_-_var(--fade-x-end,0px)),transparent)]",
          fade &&
            orientation === "both" &&
            "[mask-image:linear-gradient(to_bottom,transparent,#000_var(--fade-y-start,0px),#000_calc(100%_-_var(--fade-y-end,0px)),transparent),linear-gradient(to_right,transparent,#000_var(--fade-x-start,0px),#000_calc(100%_-_var(--fade-x-end,0px)),transparent)] [mask-composite:intersect] [-webkit-mask-composite:source-in]",
          viewportClassName,
        )}
      >
        {children}
      </div>
    </div>
  );
}

export { ScrollArea };
