"use client";

import type { ComponentProps, ReactNode } from "react";
import { Command as CommandPrimitive } from "cmdk";
import { Dialog as DialogPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/_ui/scroll-area";
import SearchIcon from "@/assets/icons/_common/search.svg?react";

type CommandDialogProps = ComponentProps<typeof DialogPrimitive.Root> & {
  title: string;
  description: string;
  className?: string;
  onCloseAutoFocus?: ComponentProps<
    typeof DialogPrimitive.Content
  >["onCloseAutoFocus"];
};

function CommandDialog({
  title,
  description,
  className,
  children,
  onCloseAutoFocus,
  ...props
}: CommandDialogProps) {
  return (
    <DialogPrimitive.Root data-slot="command-dialog" {...props}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:ease-power3-in data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:ease-power3-out fixed inset-0 z-50 bg-black/60 backdrop-blur-[6px] duration-200 data-[state=closed]:duration-150" />
        <DialogPrimitive.Content
          onCloseAutoFocus={onCloseAutoFocus}
          className={cn(
            "border-line-strong bg-popover text-popover-foreground data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-[0.98] data-[state=closed]:ease-power3-in data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-[0.98] data-[state=open]:ease-power3-out shadow-overlay fixed top-[12dvh] left-1/2 z-50 w-[calc(100%-2rem)] max-w-[560px] -translate-x-1/2 overflow-hidden rounded-xl border duration-200 outline-none data-[state=closed]:duration-150",
            className,
          )}
        >
          <DialogPrimitive.Title className="sr-only">
            {title}
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            {description}
          </DialogPrimitive.Description>
          {children}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

function Command({
  className,
  ...props
}: ComponentProps<typeof CommandPrimitive>) {
  return (
    <CommandPrimitive
      data-slot="command"
      loop
      className={cn("flex flex-col", className)}
      {...props}
    />
  );
}

type CommandInputProps = ComponentProps<typeof CommandPrimitive.Input> & {
  trailing?: ReactNode;
};

function CommandInput({ className, trailing, ...props }: CommandInputProps) {
  return (
    <div
      data-slot="command-input-wrapper"
      className="border-line-strong flex h-12 items-center gap-2.5 border-b px-4"
    >
      <SearchIcon aria-hidden className="text-subtle size-3.5 shrink-0" />
      <CommandPrimitive.Input
        data-slot="command-input"
        className={cn(
          "text-foreground placeholder:text-subtle h-full min-w-0 flex-1 bg-transparent text-[14px] leading-none outline-none",
          className,
        )}
        {...props}
      />
      {trailing}
    </div>
  );
}

function CommandList({
  className,
  children,
  ...props
}: ComponentProps<typeof CommandPrimitive.List>) {
  return (
    <ScrollArea viewportClassName="max-h-[min(360px,50dvh)]">
      <CommandPrimitive.List
        data-slot="command-list"
        className={cn("p-1.5", className)}
        {...props}
      >
        {children}
      </CommandPrimitive.List>
    </ScrollArea>
  );
}

function CommandEmpty({
  className,
  ...props
}: ComponentProps<typeof CommandPrimitive.Empty>) {
  return (
    <CommandPrimitive.Empty
      data-slot="command-empty"
      className={cn("caption-style text-subtle py-10 text-center", className)}
      {...props}
    />
  );
}

function CommandGroup({
  className,
  ...props
}: ComponentProps<typeof CommandPrimitive.Group>) {
  return (
    <CommandPrimitive.Group
      data-slot="command-group"
      className={cn(
        "[&_[cmdk-group-heading]]:text-faint [&_[cmdk-group-heading]]:px-2.5 [&_[cmdk-group-heading]]:pt-2 [&_[cmdk-group-heading]]:pb-1.5 [&_[cmdk-group-heading]]:text-[12px] [&_[cmdk-group-heading]]:leading-none [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:tracking-[1px] [&_[cmdk-group-heading]]:uppercase",
        className,
      )}
      {...props}
    />
  );
}

function CommandItem({
  className,
  ...props
}: ComponentProps<typeof CommandPrimitive.Item>) {
  return (
    <CommandPrimitive.Item
      data-slot="command-item"
      className={cn(
        "text-soft ease-power3-out data-[selected=true]:text-foreground relative flex h-10 cursor-pointer items-center gap-3 rounded-lg px-2.5 text-[14px] leading-none transition-colors duration-150 outline-none select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 data-[selected=true]:bg-white/6",
        className,
      )}
      {...props}
    />
  );
}

function CommandSeparator({
  className,
  ...props
}: ComponentProps<typeof CommandPrimitive.Separator>) {
  return (
    <CommandPrimitive.Separator
      data-slot="command-separator"
      className={cn("bg-line-strong -mx-1.5 my-1.5 h-px", className)}
      {...props}
    />
  );
}

function CommandFooter({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="command-footer"
      className={cn(
        "caption-style border-line-strong text-subtle flex h-10 items-center gap-4 border-t px-4",
        className,
      )}
      {...props}
    />
  );
}

function Kbd({ className, ...props }: ComponentProps<"kbd">) {
  return (
    <kbd
      data-slot="kbd"
      className={cn(
        "caption-style border-line-strong bg-muted text-soft inline-flex h-5 min-w-5 items-center justify-center rounded-md border px-1.5 font-sans",
        className,
      )}
      {...props}
    />
  );
}

export {
  CommandDialog,
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  CommandFooter,
  Kbd,
};
