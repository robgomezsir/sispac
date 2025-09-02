import React from 'react'
import { useTheme } from '../contexts/ThemeContext.jsx'
import { Sun, Moon, Monitor } from 'lucide-react'
import { Button } from './ui'
import { cn } from '../lib/utils'

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()

  const themes = [
    { value: 'light', label: 'Claro', icon: Sun },
    { value: 'dark', label: 'Escuro', icon: Moon },
    { value: 'system', label: 'Sistema', icon: Monitor }
  ]

  return (
    <div className="flex items-center gap-1 bg-muted/30 rounded-xl p-1">
      {themes.map(({ value, label, icon: Icon }) => (
        <Button
          key={value}
          variant={theme === value ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setTheme(value)}
          className={cn(
            "h-8 px-3 transition-all duration-200",
            theme === value 
              ? "bg-primary text-primary-foreground shadow-sm" 
              : "hover:bg-accent/50 text-muted-foreground hover:text-foreground"
          )}
          title={label}
        >
          <Icon size={16} className="mr-1" />
          <span className="hidden sm:inline text-xs">{label}</span>
        </Button>
      ))}
    </div>
  )
}