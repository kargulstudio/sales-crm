"use client";

import type { ComponentProps, ReactNode } from "react";
import { Command as CommandPrimitive } from "cmdk";
import { Dialog as DialogPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/_ui/scroll-area";
import SearchIcon from "@/public/assets/images/_common/search.svg";

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
        <DialogPrimitive.Overlay className="data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:ease-power3-in data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:ease-power3-out z-overlay bg-scrim duration-base data-[state=closed]:duration-fast fixed inset-0 backdrop-blur-[6px]" />
        <DialogPrimitive.Content
          onCloseAutoFocus={onCloseAutoFocus}
          className={cn(
            "border-line-strong bg-popover text-popover-foreground data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-[0.98] data-[state=closed]:ease-power3-in data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-[0.98] data-[state=open]:ease-power3-out z-overlay shadow-overlay duration-base data-[state=closed]:duration-fast fixed top-[12dvh] left-1/2 w-[calc(100%-2rem)] max-w-140 -translate-x-1/2 overflow-hidden rounded-xl border outline-none",
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
      <SearchIcon aria-hidden className="text-fg-tertiary size-3.5 shrink-0" />
      <CommandPrimitive.Input
        data-slot="command-input"
        className={cn(
          "text-foreground placeholder:text-fg-tertiary h-full min-w-0 flex-1 bg-transparent text-sm leading-none outline-none",
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
      className={cn(
        "caption-style text-fg-tertiary py-10 text-center",
        className,
      )}
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
        "[&_[cmdk-group-heading]]:text-fg-tertiary [&_[cmdk-group-heading]]:px-2.5 [&_[cmdk-group-heading]]:pt-2 [&_[cmdk-group-heading]]:pb-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:leading-none [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:tracking-[1px] [&_[cmdk-group-heading]]:uppercase",
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
        "text-fg-secondary ease-power3-out data-[selected=true]:text-foreground duration-fast data-[selected=true]:bg-overlay-2 relative flex h-10 cursor-pointer items-center gap-3 rounded-md px-2.5 text-sm leading-none transition-colors outline-none select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50",
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
        "caption-style border-line-strong text-fg-tertiary flex h-10 items-center gap-4 border-t px-4",
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
};
