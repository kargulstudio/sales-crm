"use client";

import Button from "@/components/_ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/_ui/dropdown-menu";
import Tooltip from "@/components/_ui/tooltip";
import {
  setThemePreference,
  useThemePreference,
  type ThemePreference,
} from "@/lib/theme";
import SunIcon from "@/public/assets/images/companies/header/sun.svg";
import MoonIcon from "@/public/assets/images/companies/header/moon.svg";
import MonitorIcon from "@/public/assets/images/companies/header/monitor.svg";

const OPTIONS = [
  { value: "light", label: "Light", icon: SunIcon },
  { value: "dark", label: "Dark", icon: MoonIcon },
  { value: "system", label: "System", icon: MonitorIcon },
] as const;

export default function ThemeMenu() {
  const preference = useThemePreference();
  const current =
    OPTIONS.find((option) => option.value === preference) ?? OPTIONS[1];

  return (
    <DropdownMenu>
      <Tooltip content="Theme">
        <DropdownMenuTrigger asChild>
          <Button
            variant="secondary"
            size="icon"
            aria-label={`Theme: ${current.label}`}
            className="data-[state=open]:bg-muted"
          >
            <current.icon aria-hidden className="size-3.5" />
          </Button>
        </DropdownMenuTrigger>
      </Tooltip>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Theme</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={preference}
          onValueChange={(value) =>
            setThemePreference(value as ThemePreference)
          }
        >
          {OPTIONS.map((option) => (
            <DropdownMenuRadioItem key={option.value} value={option.value}>
              <option.icon aria-hidden className="size-3.5" />
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
