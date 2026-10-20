"use client";

import {
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";
import CompanyLogo from "@/components/companies/company-logo";
import Button from "@/components/_ui/button";
import { cn } from "@/lib/utils";
import BuildingIcon from "@/public/assets/images/companies/sidebar/building.svg";

const MAX_BYTES = 2 * 1024 * 1024;
const ACCEPTED = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];

type LogoUploadProps = {
  value: string | null;
  companyName: string;
  domain: string | null;
  onChange: (value: string | null) => void;
};

export default function LogoUpload({
  value,
  companyName,
  domain,
  onChange,
}: LogoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const hintId = useId();
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  function readFile(file: File | undefined) {
    if (!file) return;
    if (!ACCEPTED.includes(file.type)) {
      setError("Use a PNG, JPG, WebP or SVG image.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("Keep the image under 2 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setError(null);
      onChange(typeof reader.result === "string" ? reader.result : null);
    };
    reader.readAsDataURL(file);
  }

  function handleInput(event: ChangeEvent<HTMLInputElement>) {
    readFile(event.target.files?.[0]);
    event.target.value = "";
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    readFile(event.dataTransfer.files?.[0]);
  }

  const initial = companyName.trim().slice(0, 1).toUpperCase();

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      data-dragging={dragging}
      className="ease-power3-out data-[dragging=true]:border-line-strong duration-fast data-[dragging=true]:bg-overlay-1 flex items-center gap-4 rounded-xl border border-dashed border-transparent transition-[border-color,background-color]"
    >
      {value || domain || initial ? (
        <CompanyLogo
          company={{
            name: companyName || "?",
            logo: value ?? undefined,
            domain: domain ?? undefined,
          }}
          size="xl"
        />
      ) : (
        <span className="bg-muted shadow-tile flex size-14 shrink-0 items-center justify-center rounded-xl">
          <BuildingIcon aria-hidden className="text-fg-tertiary size-5" />
        </span>
      )}

      <div className="flex min-w-0 flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => inputRef.current?.click()}
            aria-describedby={hintId}
          >
            {value ? "Replace logo" : "Upload logo"}
          </Button>
          {value && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setError(null);
                onChange(null);
              }}
            >
              Remove
            </Button>
          )}
        </div>
        <span
          id={hintId}
          role={error ? "alert" : undefined}
          className={cn(
            "caption-style block leading-snug",
            error ? "text-danger" : "text-fg-tertiary",
          )}
        >
          {error ??
            (domain && !value
              ? "Using the logo from the website. Upload one to replace it."
              : "PNG, JPG, WebP or SVG up to 2 MB. You can also drop a file here.")}
        </span>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(",")}
        onChange={handleInput}
        className="sr-only"
        tabIndex={-1}
        aria-hidden
      />
    </div>
  );
}
