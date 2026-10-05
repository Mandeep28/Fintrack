"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-2xl bg-secondary/80 border border-border" />
    )
  }

  const isDark = resolvedTheme === "dark"

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="p-2.5 bg-secondary hover:bg-secondary/80 text-foreground rounded-2xl transition-all border border-border flex items-center justify-center w-10 h-10 cursor-pointer shadow-sm active:scale-95"
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
      aria-label="Toggle theme"
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-amber-400 transition-transform rotate-0" />
      ) : (
        <Moon className="h-4 w-4 text-slate-700 transition-transform rotate-0" />
      )}
      <span className="sr-only">Toggle theme</span>
    </button>
  )
}
