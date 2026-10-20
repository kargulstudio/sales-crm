"use client";

import {
  useRef,
  useSyncExternalStore,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import {
  SIDEBAR_DEFAULT_WIDTH,
  SIDEBAR_MAX_WIDTH,
  SIDEBAR_MIN_WIDTH,
  SIDEBAR_WIDTH_STORAGE_KEY,
  SIDEBAR_WIDTH_VAR,
  clampSidebarWidth,
} from "@/lib/sidebar";

const KEYBOARD_STEP = 10;

const listeners = new Set<() => void>();
let currentWidth: number | null = null;

function readWidth() {
  if (currentWidth === null) {
    const value = parseInt(
      getComputedStyle(document.documentElement).getPropertyValue(
        SIDEBAR_WIDTH_VAR,
      ),
      10,
    );
    currentWidth = Number.isNaN(value)
      ? SIDEBAR_DEFAULT_WIDTH
      : clampSidebarWidth(value);
  }
  return currentWidth;
}

function applyWidth(width: number) {
  currentWidth = clampSidebarWidth(width);
  document.documentElement.style.setProperty(
    SIDEBAR_WIDTH_VAR,
    `${currentWidth}px`,
  );
  listeners.forEach((listener) => listener());
}

function saveWidth() {
  try {
    localStorage.setItem(SIDEBAR_WIDTH_STORAGE_KEY, String(readWidth()));
  } catch {}
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export default function SidebarResizer() {
  const width = useSyncExternalStore(
    subscribe,
    readWidth,
    () => SIDEBAR_DEFAULT_WIDTH,
  );
  const drag = useRef<{ startX: number; startWidth: number } | null>(null);

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { startX: event.clientX, startWidth: readWidth() };
    document.documentElement.dataset.sidebarResizing = "";
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!drag.current) return;
    applyWidth(drag.current.startWidth + event.clientX - drag.current.startX);
  }

  function handlePointerEnd(event: PointerEvent<HTMLDivElement>) {
    if (!drag.current) return;
    drag.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    delete document.documentElement.dataset.sidebarResizing;
    saveWidth();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const next: Record<string, number> = {
      ArrowLeft: width - KEYBOARD_STEP,
      ArrowRight: width + KEYBOARD_STEP,
      Home: SIDEBAR_MIN_WIDTH,
      End: SIDEBAR_MAX_WIDTH,
    };
    if (!(event.key in next)) return;
    event.preventDefault();
    applyWidth(next[event.key]);
    saveWidth();
  }

  function handleReset() {
    applyWidth(SIDEBAR_DEFAULT_WIDTH);
    saveWidth();
  }

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize sidebar"
      aria-valuemin={SIDEBAR_MIN_WIDTH}
      aria-valuemax={SIDEBAR_MAX_WIDTH}
      aria-valuenow={width}
      tabIndex={0}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      onDoubleClick={handleReset}
      onKeyDown={handleKeyDown}
      className="group z-sticky absolute inset-y-0 -right-1 w-2 cursor-col-resize touch-none outline-none select-none"
    >
      <span
        aria-hidden
        className="duration-fast ease-power3-out group-hover:bg-line-strong group-focus-visible:bg-fg-tertiary group-active:bg-fg-tertiary absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-transparent transition-[background-color]"
      />
    </div>
  );
}
