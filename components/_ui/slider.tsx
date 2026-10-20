"use client";

import type { ComponentProps } from "react";
import { Slider as SliderPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";

function Slider({
  className,
  ...props
}: ComponentProps<typeof SliderPrimitive.Root>) {
  return (
    <SliderPrimitive.Root
      data-slot="slider"
      className={cn(
        "relative flex h-5 w-full touch-none items-center select-none data-[disabled]:opacity-50",
        className,
      )}
      {...props}
    >
      <SliderPrimitive.Track className="bg-track relative h-1.5 grow overflow-hidden rounded-full">
        <SliderPrimitive.Range className="bg-fg-secondary absolute h-full rounded-full" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb
        aria-label={props["aria-label"]}
        className="bg-foreground ease-power3-out duration-fast shadow-raised focus-visible:ring-ring block size-4 cursor-grab rounded-full transition-[box-shadow] outline-none focus-visible:ring-2 active:cursor-grabbing"
      />
    </SliderPrimitive.Root>
  );
}

export { Slider };
