import React, { useState, useCallback } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'
import { useTheme } from '../contexts/ThemeContext.jsx'
import { 
  Menu, 
  Search,
  Bell,
  Sun,
  Moon,
  Monitor,
  Plus,
  User,
  LogOut,
  Settings
} from 'lucide-react'
import { cn } from '../lib/utils'
import { Button, Badge, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from './ui'

export function Navigation({ onSidebarToggle }) {
  const { user, role, signOut } = useAuth()
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [notifications] = useState(3) // Mock notifications

  const handleSignOut = useCallback(async () => {
    try {
      await signOut()
    } catch (err) {
      console.error('Erro no logout:', err)
    }
  }, [signOut])

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light')
  }, [theme, setTheme])

  const getThemeIcon = () => {
    if (theme === 'system') return Monitor
    return resolvedTheme === 'dark' ? Sun : Moon
  }

  const ThemeIcon = getThemeIcon()

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/50 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Left side - Menu toggle and search */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden h-9 w-9 p-0"
            onClick={onSidebarToggle}
          >
            <Menu size={18} />
          </Button>

          <div className="hidden md:flex items-center gap-2">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar..."
                className="pl-10 pr-4 py-2 w-64 bg-muted/30 border border-border/50 rounded-xl text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300"
              />
            </div>
          </div>
        </div>

        {/* Right side - Actions and user menu */}
        <div className="flex items-center gap-3">
          {/* Create button */}
          <Button size="sm" className="hidden sm:flex items-center gap-2">
            <Plus size={16} />
            <span className="hidden lg:inline">Criar</span>
          </Button>

          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative h-9 w-9 p-0">
            <Bell size={18} />
            {notifications > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                {notifications}
              </Badge>
            )}
          </Button>

          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0"
            onClick={toggleTheme}
            title={`Tema: ${theme === 'system' ? 'Sistema' : theme === 'dark' ? 'Escuro' : 'Claro'}`}
          >
            <ThemeIcon size={18} />
          </Button>

          {/* User menu */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-3 h-9 px-3">
                  <div className="w-7 h-7 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center border border-primary/20">
                    <User size={14} className="text-primary" />
                  </div>
                  <div className="hidden lg:block text-left">
                    <div className="text-sm font-medium text-foreground truncate max-w-32">
                      {user.email}
                    </div>
                    {role === 'admin' && (
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                        Admin
                      </div>
                    )}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem>
                  <User size={14} className="mr-2" />
                  Perfil
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings size={14} className="mr-2" />
                  Configurações
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                  <LogOut size={14} className="mr-2" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  )
}
