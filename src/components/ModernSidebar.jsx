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
  Bell,
  Search,
  Plus,
  Zap,
  Target,
  TrendingUp,
  Activity,
  ArrowLeft,
  Menu,
  X,
  Globe
} from 'lucide-react'
import { cn } from '../lib/utils'
import { Button, Badge, Separator } from './ui'
import { ThemeDropdown } from './ThemeDropdown.jsx'

export function ModernSidebar({ isOpen = true, onClose }) {
  const { user, role, signOut } = useAuth()
  const { isMobile } = useSidebar()
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
      label: 'Dashboard',
      icon: Home,
      path: '/dashboard',
      badge: null
    },
    {
      label: 'Formulário',
      icon: FileText,
      path: '/form',
      badge: null
    },
    {
      label: 'Configurações',
      icon: Settings,
      path: '/config',
      badge: null,
      adminOnly: false
    },
    {
      label: 'API Panel',
      icon: Database,
      path: '/api',
      badge: null,
      adminOnly: true
    },
    {
      label: 'Integração Gupy',
      icon: Globe,
      path: '/integracao-gupy',
      badge: null,
      adminOnly: true
    }
  ]



  return (
    <div 
      className={cn(
        "fixed left-0 top-0 z-50 h-screen w-80 bg-card/95 backdrop-blur-sm border-r-2 border-border/30 transition-transform duration-300",
        isMobile && !isOpen && "-translate-x-full",
        isMobile && isOpen && "translate-x-0"
      )}
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        height: '100vh',
        width: '20rem',
        zIndex: 50
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/50">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
              <img src={sispacLogo} alt="SisPAC" className="w-6 h-6" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-card"></div>
          </div>
          <div>
            <h2 className="font-semibold text-foreground">SisPAC</h2>
            <p className="text-xs text-muted-foreground">Sistema de Avaliação</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {!isMobile && (
            <>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Bell size={16} />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Search size={16} />
              </Button>
            </>
          )}
          {isMobile && onClose && (
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onClose}>
              <X size={16} />
            </Button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        <div className="space-y-1">
          {navigationItems.map((item) => {
            if (item.adminOnly && role !== 'admin') return null
            
            const Icon = item.icon
            const active = isActive(item.path)
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                  active 
                    ? "bg-primary text-primary-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                )}
              >
                <div className="flex items-center space-x-3">
                  <Icon size={18} className="flex-shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <Badge variant="secondary" className="text-xs">
                    {item.badge}
                  </Badge>
                )}
              </Link>
            )
          })}
        </div>

        <Separator className="my-4" />

        {/* Quick Actions */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Ações Rápidas
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" className="h-10 text-xs">
              <Plus size={14} className="mr-1" />
              Novo
            </Button>
            <Button variant="outline" size="sm" className="h-10 text-xs">
              <Zap size={14} className="mr-1" />
              Relatório
            </Button>
          </div>
        </div>


      </div>

      {/* Footer */}
      <div className="border-t border-border/50 p-4 space-y-3">
        {/* Theme Selector */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Tema</span>
          <ThemeDropdown />
        </div>

        {/* User Info */}
        <div className="flex items-center space-x-3 p-2 rounded-lg bg-gradient-to-r from-muted/20 to-muted/10">
          <div className="w-8 h-8 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center">
            <User size={16} className="text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {user?.user_metadata?.full_name || user?.email || 'Usuário'}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {role === 'admin' ? 'Administrador' : 'Usuário'}
            </p>
          </div>
        </div>

        {/* Logout Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
          className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-accent/50"
        >
          <LogOut size={16} className="mr-2" />
          Sair
        </Button>
      </div>
    </div>
  )
}