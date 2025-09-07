import React, { useState, useRef, useEffect } from 'react'
import { useTheme } from '../contexts/ThemeContext.jsx'
import { Sun, Moon, Monitor, ChevronDown, Check } from 'lucide-react'
import { Button } from './ui'
import { cn } from '../lib/utils'

export function ThemeDropdown() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const dropdownRef = useRef(null)
  const triggerRef = useRef(null)

  const themes = [
    { value: 'light', label: 'Claro', icon: Sun, description: 'Tema claro' },
    { value: 'dark', label: 'Escuro', icon: Moon, description: 'Tema escuro' },
    { value: 'system', label: 'Sistema', icon: Monitor, description: 'Segue o sistema' }
  ]

  const currentTheme = themes.find(t => t.value === theme) || themes[0]
  const Icon = currentTheme.icon

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) && 
          triggerRef.current && !triggerRef.current.contains(event.target)) {
        handleClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  const handleEscape = (event) => {
    if (event.key === 'Escape') {
      handleClose()
    }
  }

  const handleOpen = () => {
    setIsAnimating(true)
    setIsOpen(true)
    setTimeout(() => setIsAnimating(false), 150)
  }

  const handleClose = () => {
    setIsAnimating(true)
    setTimeout(() => {
      setIsOpen(false)
      setIsAnimating(false)
    }, 150)
  }

  const handleThemeSelect = (themeValue) => {
    setTheme(themeValue)
    handleClose()
  }

  return (
    <div className="relative">
      {/* Trigger Button */}
      <Button
        ref={triggerRef}
        variant="outline"
        size="sm"
        onClick={handleOpen}
        className={cn(
          "h-8 px-3 transition-all duration-200 justify-between min-w-[100px] btn-modern-outline",
          "hover:bg-accent/50 text-muted-foreground hover:text-foreground",
          "border-border/50 hover:border-border",
          isOpen && "bg-accent/30 border-border"
        )}
      >
        <div className="flex items-center gap-2">
          <Icon size={16} className="transition-transform duration-200" />
          <span className="text-xs font-medium">{currentTheme.label}</span>
        </div>
        <ChevronDown 
          size={14} 
          className={cn(
            "opacity-50 transition-transform duration-200",
            isOpen && "rotate-180"
          )} 
        />
      </Button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className={cn(
            "absolute top-full right-0 mt-2 w-48 bg-popover border border-border rounded-lg shadow-lg z-50 glass-modern-smooth",
            "transition-all duration-200 ease-out",
            isAnimating 
              ? "opacity-0 scale-95 translate-y-[-8px]" 
              : "opacity-100 scale-100 translate-y-0"
          )}
          style={{
            animation: isAnimating ? 'none' : 'dropdownIn 0.2s ease-out'
          }}
        >
          {/* Header */}
          <div className="px-3 py-2 border-b border-border/50">
            <p className="text-xs font-medium text-muted-foreground">Escolher tema</p>
          </div>

          {/* Theme Options */}
          <div className="p-1">
            {themes.map(({ value, label, icon: ThemeIcon, description }, index) => {
              const isSelected = theme === value
              
              return (
                <button
                  key={value}
                  onClick={() => handleThemeSelect(value)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-all duration-150",
                    "hover:bg-accent/50 focus:bg-accent/50 focus:outline-none",
                    "group relative overflow-hidden",
                    isSelected && "bg-accent/30"
                  )}
                  style={{
                    animationDelay: `${index * 50}ms`
                  }}
                >
                  {/* Background Animation */}
                  <div className={cn(
                    "absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/10",
                    "opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  )} />
                  
                  {/* Icon */}
                  <div className={cn(
                    "relative z-10 p-1.5 rounded-md transition-all duration-200",
                    isSelected 
                      ? "bg-primary/10 text-primary" 
                      : "bg-muted/50 text-muted-foreground group-hover:bg-primary/5 group-hover:text-primary"
                  )}>
                    <ThemeIcon size={16} />
                  </div>

                  {/* Content */}
                  <div className="relative z-10 flex-1 text-left">
                    <div className="flex items-center justify-between">
                      <span className={cn(
                        "font-medium transition-colors duration-200",
                        isSelected ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                      )}>
                        {label}
                      </span>
                      {isSelected && (
                        <div className="flex items-center justify-center w-5 h-5 bg-primary rounded-full">
                          <Check size={12} className="text-primary-foreground" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {description}
                    </p>
                  </div>

                  {/* Selection Indicator */}
                  {isSelected && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
                  )}
                </button>
              )
            })}
          </div>

          {/* Footer */}
          <div className="px-3 py-2 border-t border-border/50">
            <p className="text-xs text-muted-foreground">
              Tema atual: <span className="font-medium text-foreground">{currentTheme.label}</span>
            </p>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/5 backdrop-blur-[1px]"
          onClick={handleClose}
        />
      )}

      <style jsx>{`
        @keyframes dropdownIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-8px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
