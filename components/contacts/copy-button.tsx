"use client";

import { useEffect, useRef, useState } from "react";
import Button from "@/components/_ui/button";
import CopyIcon from "@/public/assets/images/contacts/copy.svg";
import CheckIcon from "@/public/assets/images/companies/table/check-square.svg";

const COPIED_MS = 1500;

type CopyButtonProps = {
  value: string;
  label: string;
  variant?: "ghost" | "secondary";
  size?: "icon" | "icon-sm";
};

export default function CopyButton({
  value,
  label,
  variant = "ghost",
  size = "icon-sm",
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  async function copy() {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      return;
    }
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), COPIED_MS);
  }

  const Icon = copied ? CheckIcon : CopyIcon;

  return (
    <Button
      variant={variant}
      size={size}
      onClick={copy}
      disabled={!value}
      aria-label={label}
      title={value ? (copied ? "Copied" : label) : "Nothing to copy"}
    >
      <Icon aria-hidden className="size-4" />
      <span role="status" aria-live="polite" className="sr-only">
        {copied ? "Copied" : ""}
      </span>
    </Button>
  );
}
