"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, SunMedium, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = theme === "system" ? resolvedTheme : theme;
  const Icon =
    currentTheme === "dark" ? Moon : currentTheme === "light" ? SunMedium : Monitor;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 gap-2 rounded-full border-slate-200/80 bg-white/80 px-3 text-xs font-medium text-slate-700 shadow-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-400 dark:border-white/10 dark:bg-white/10 dark:text-slate-100 dark:focus-visible:ring-slate-600"
        >
          {mounted ? (
            <Icon className="h-4 w-4" />
          ) : (
            <span className="h-4 w-4 rounded-full bg-slate-400/50" />
          )}
          <span className="hidden sm:inline">Theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-40 rounded-xl border border-slate-200/70 bg-white p-1 text-sm shadow-lg dark:border-white/10 dark:bg-slate-900/95"
      >
        <DropdownMenuItem
          className="gap-2 rounded-lg px-3 py-2 text-slate-600 focus:bg-slate-100 dark:text-slate-200 dark:focus:bg-white/10"
          onClick={() => setTheme("light")}
        >
          <SunMedium className="h-4 w-4" />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem
          className="gap-2 rounded-lg px-3 py-2 text-slate-600 focus:bg-slate-100 dark:text-slate-200 dark:focus:bg-white/10"
          onClick={() => setTheme("dark")}
        >
          <Moon className="h-4 w-4" />
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem
          className="gap-2 rounded-lg px-3 py-2 text-slate-600 focus:bg-slate-100 dark:text-slate-200 dark:focus:bg-white/10"
          onClick={() => setTheme("system")}
        >
          <Monitor className="h-4 w-4" />
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
