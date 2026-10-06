"use client";

import {
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";
import Asset from "@/components/_ui/asset";
import Button from "@/components/_ui/button";
import { cn } from "@/lib/utils";
import BuildingIcon from "@/assets/icons/companies/sidebar/building.svg?react";

const MAX_BYTES = 128 * 1024;
const ACCEPTED = ["image/png", "image/jpeg", "image/webp"];

type LogoUploadProps = {
  value: string | null;
  companyName: string;
  onChange: (value: string | null) => void;
};

export default function LogoUpload({
  value,
  companyName,
  onChange,
}: LogoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const hintId = useId();
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  function readFile(file: File | undefined) {
    if (!file) return;
    if (!ACCEPTED.includes(file.type)) {
      setError("Use a PNG, JPG or WebP image.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("Keep the image under 128 KB.");
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
      className="ease-power3-out data-[dragging=true]:border-line-strong flex items-center gap-4 rounded-xl border border-dashed border-transparent transition-[border-color,background-color] duration-150 data-[dragging=true]:bg-white/3"
    >
      <span className="bg-muted flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-[14px] shadow-[0px_6px_6px_0px_rgba(15,15,15,0.24),0px_0px_0px_1.5px_#232323]">
        {value ? (
          <Asset
            type="image"
            src={value}
            alt="Company logo preview"
            width={1}
            height={1}
            fit="contain"
            className="size-9"
          />
        ) : initial ? (
          <span className="h2-style text-soft">{initial}</span>
        ) : (
          <BuildingIcon aria-hidden className="text-subtle size-5" />
        )}
      </span>

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
            "caption-style block",
            error ? "text-danger" : "text-subtle",
          )}
        >
          {error ??
            "PNG, JPG or WebP up to 128 KB. You can also drop a file here."}
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
