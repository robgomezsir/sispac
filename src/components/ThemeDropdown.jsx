import React from 'react'
import { useTheme } from '../contexts/ThemeContext.jsx'
import { Sun, Moon, Monitor, ChevronDown } from 'lucide-react'
import { Button } from './ui'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui'
import { cn } from '../lib/utils'

export function ThemeDropdown() {
  const { theme, setTheme, resolvedTheme } = useTheme()

  const themes = [
    { value: 'light', label: 'Claro', icon: Sun },
    { value: 'dark', label: 'Escuro', icon: Moon },
    { value: 'system', label: 'Sistema', icon: Monitor }
  ]

  const currentTheme = themes.find(t => t.value === theme) || themes[0]
  const Icon = currentTheme.icon

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-8 px-3 transition-all duration-200 justify-between min-w-[100px]",
            "hover:bg-accent/50 text-muted-foreground hover:text-foreground"
          )}
        >
          <div className="flex items-center gap-2">
            <Icon size={16} />
            <span className="text-xs">{currentTheme.label}</span>
          </div>
          <ChevronDown size={14} className="opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {themes.map(({ value, label, icon: ThemeIcon }) => (
          <DropdownMenuItem
            key={value}
            onClick={() => setTheme(value)}
            className={cn(
              "flex items-center gap-2 cursor-pointer",
              theme === value && "bg-accent"
            )}
          >
            <ThemeIcon size={16} />
            <span className="text-sm">{label}</span>
            {theme === value && (
              <div className="ml-auto w-2 h-2 bg-primary rounded-full" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
