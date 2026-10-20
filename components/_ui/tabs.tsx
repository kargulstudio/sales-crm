"use client";

import { createContext, useContext, useId, type ComponentProps } from "react";
import { motion } from "motion/react";
import { Tabs as TabsPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";

const TabsContext = createContext<{ value?: string; id: string }>({ id: "" });

function Tabs({
  className,
  value,
  ...props
}: ComponentProps<typeof TabsPrimitive.Root>) {
  const id = useId();
  return (
    <TabsContext.Provider value={{ value, id }}>
      <TabsPrimitive.Root
        data-slot="tabs"
        value={value}
        className={cn("flex flex-col", className)}
        {...props}
      />
    </TabsContext.Provider>
  );
}

function TabsList({
  className,
  ...props
}: ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn("flex items-center gap-4", className)}
      {...props}
    />
  );
}

function TabsTrigger({
  className,
  children,
  value,
  ...props
}: ComponentProps<typeof TabsPrimitive.Trigger>) {
  const tabs = useContext(TabsContext);
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "group caption-style text-fg-tertiary duration-fast ease-power3-out hover:text-fg-secondary focus-visible:text-foreground focus-visible:decoration-ring data-[state=active]:text-foreground relative grid cursor-pointer py-4 text-center transition-[color] outline-none select-none focus-visible:underline focus-visible:underline-offset-4",
        className,
      )}
      value={value}
      {...props}
    >
      {tabs.value === value && (
        <motion.span
          aria-hidden
          layoutId={`${tabs.id}-indicator`}
          transition={{ type: "spring", duration: 0.3, bounce: 0 }}
          className="bg-foreground absolute inset-x-0 bottom-0 h-px"
        />
      )}
      <span
        aria-hidden
        className="invisible col-start-1 row-start-1 font-medium"
      >
        {children}
      </span>
      <span className="col-start-1 row-start-1 group-data-[state=active]:font-medium">
        {children}
      </span>
    </TabsPrimitive.Trigger>
  );
}

function TabsContent({
  className,
  ...props
}: ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("outline-none", className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
