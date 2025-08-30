import React from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { Sun, Moon, Monitor } from 'lucide-react'
import { cn } from '../lib/utils'

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()

  const themes = [
    { value: 'light', label: 'Claro', icon: Sun },
    { value: 'dark', label: 'Escuro', icon: Moon },
    { value: 'system', label: 'Sistema', icon: Monitor }
  ]

  return (
    <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
      {themes.map(({ value, label, icon: Icon }) => {
        const isActive = theme === value
        return (
          <button
            key={value}
            onClick={() => setTheme(value)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200",
              isActive
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-background/50"
            )}
            title={`Tema ${label}`}
          >
            <Icon size={16} />
            <span className="hidden sm:inline">{label}</span>
          </button>
        )
      })}
    </div>
  )
}
