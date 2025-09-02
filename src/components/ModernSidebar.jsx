import React, { useState, useCallback } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import { useSidebar } from '../contexts/SidebarContext.jsx'
import { sispacLogo } from '../assets'
import { 
  LogOut, 
  Settings, 
  Database, 
  BarChart3, 
  Home,
  FileText,
  User,
  ChevronDown,
  ChevronRight,
  Users,
  Shield,
  Menu,
  X,
  Bell,
  Search,
  Plus,
  Zap,
  Target,
  TrendingUp,
  Activity
} from 'lucide-react'
import { cn } from '../lib/utils'
import { Button, Badge, Separator } from './ui'
import { ThemeDropdown } from './ThemeDropdown.jsx'

export function ModernSidebar() {
  const { user, role, signOut } = useAuth()
  const { isCollapsed, isMobile, toggleSidebar } = useSidebar()
  const navigate = useNavigate()
  const location = useLocation()
  const [expandedItems, setExpandedItems] = useState(new Set())
  
  const handleSignOut = useCallback(async () => {
    try {
      await signOut()
      navigate('/')
    } catch (err) {
      console.error('Erro no logout:', err)
    }
  }, [signOut, navigate])

  const toggleExpanded = useCallback((item) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(item)) {
        newSet.delete(item)
      } else {
        newSet.add(item)
      }
      return newSet
    })
  }, [])

  const isActive = useCallback((path) => {
    return location.pathname === path
  }, [location.pathname])

  const navigationItems = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      path: '/',
      badge: null
    },
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: BarChart3,
      path: '/dashboard',
      badge: null
    },
    {
      id: 'candidates',
      label: 'Candidatos',
      icon: Users,
      path: '/dashboard',
      badge: null,
      children: [
        {
          id: 'all-candidates',
          label: 'Todos os Candidatos',
          path: '/dashboard'
        },
        {
          id: 'new-candidate',
          label: 'Novo Candidato',
          path: '/form'
        }
      ]
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: TrendingUp,
      path: '/dashboard',
      badge: null
    },
    {
      id: 'admin',
      label: 'Administração',
      icon: Shield,
      path: '/config',
      badge: role === 'admin' ? 'ADMIN' : null,
      children: role === 'admin' ? [
        {
          id: 'settings',
          label: 'Configurações',
          path: '/config'
        },
        {
          id: 'api-panel',
          label: 'Painel API',
          path: '/api'
        }
      ] : null
    }
  ]

  return (
    <div 
      className={cn(
        "fixed left-0 top-0 z-50 h-screen bg-card/95 backdrop-blur-sm border-r-2 border-border/30 transition-all duration-300 ease-in-out",
        isCollapsed ? "w-16" : "w-80",
        isMobile && !isCollapsed && "shadow-2xl"
      )}
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        height: '100vh',
        zIndex: 50,
        width: isCollapsed ? '4rem' : '20rem'
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/50">
        {!isCollapsed && (
          <div className="flex items-center space-x-3">
            <div className="relative">
              <img src={sispacLogo} alt="SisPAC Logo" className="w-8 h-8" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-pulse" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">SisPAC</h1>
              <p className="text-xs text-muted-foreground">Sistema de Avaliação</p>
            </div>
          </div>
        )}
        {isCollapsed && (
          <div className="flex items-center justify-center w-full">
            <div className="relative">
              <img src={sispacLogo} alt="SisPAC Logo" className="w-8 h-8" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-pulse" />
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="h-8 w-8 hover:bg-accent/50 transition-all duration-200 hover:scale-110"
        >
          {isCollapsed ? <Menu size={16} /> : <X size={16} />}
        </Button>
      </div>

      {/* User Info */}
      {user && !isCollapsed && (
        <div className="p-4 border-b border-border/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center border border-primary/20">
              <User size={20} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-foreground text-sm truncate">{user.email}</div>
              {role === 'admin' && (
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  Administrador
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon
          const hasChildren = item.children && item.children.length > 0
          const isExpanded = expandedItems.has(item.id)
          const isItemActive = isActive(item.path)

          return (
            <div key={item.id}>
              <div
                className={cn(
                  "flex items-center justify-between p-3 rounded-xl transition-all duration-200 cursor-pointer group transform-gpu",
                  isItemActive 
                    ? "bg-primary/10 text-primary border border-primary/20 shadow-sm" 
                    : "hover:bg-accent/50 text-muted-foreground hover:text-foreground hover:shadow-md"
                )}
                onClick={() => {
                  if (hasChildren && !isCollapsed) {
                    toggleExpanded(item.id)
                  } else {
                    navigate(item.path)
                  }
                }}
                title={isCollapsed ? item.label : undefined}
              >
                <div className="flex items-center space-x-3">
                  <Icon size={20} className="group-hover:scale-110 transition-transform duration-200" />
                  {!isCollapsed && (
                    <>
                      <span className="font-medium">{item.label}</span>
                      {item.badge && (
                        <Badge variant="secondary" className="ml-auto bg-primary/20 text-primary border-primary/30 text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </>
                  )}
                </div>
                {hasChildren && !isCollapsed && (
                  <ChevronRight 
                    size={16} 
                    className={cn(
                      "transition-transform duration-200",
                      isExpanded && "rotate-90"
                    )}
                  />
                )}
              </div>

              {/* Submenu */}
              {hasChildren && isExpanded && !isCollapsed && (
                <div className="ml-6 mt-2 space-y-1">
                  {item.children.map((child) => (
                    <Link
                      key={child.id}
                      to={child.path}
                      className={cn(
                        "flex items-center p-2 rounded-lg text-sm transition-all duration-200 transform-gpu",
                        isActive(child.path)
                          ? "bg-primary/5 text-primary font-medium shadow-sm"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent/30 hover:shadow-sm"
                      )}
                    >
                      <div className="w-2 h-2 bg-current rounded-full mr-3 opacity-50" />
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* Footer Actions */}
      <div className="p-4 border-t border-border/50 space-y-3">
        {/* Theme Dropdown */}
        {!isCollapsed && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Tema</span>
            <ThemeDropdown />
          </div>
        )}
        
        {isCollapsed && (
          <div className="flex justify-center">
            <ThemeDropdown />
          </div>
        )}
        
        {/* Sign Out Button */}
        {!isCollapsed && (
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 transition-all duration-200"
            onClick={handleSignOut}
          >
            <LogOut size={16} className="mr-2" />
            Sair
          </Button>
        )}
        
        {isCollapsed && (
          <Button
            variant="ghost"
            size="icon"
            className="w-full hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
            onClick={handleSignOut}
            title="Sair"
          >
            <LogOut size={16} />
          </Button>
        )}
      </div>
    </div>
  )
}
