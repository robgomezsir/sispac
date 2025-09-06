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
        "fixed left-0 top-0 z-50 h-screen w-80 bg-sidebar/95 backdrop-blur-md border-r-2 border-sidebar-border/50 transition-all duration-500 ease-out shadow-2xl",
        isMobile && !isOpen && "-translate-x-full opacity-0",
        isMobile && isOpen && "translate-x-0 opacity-100",
        !isMobile && "translate-x-0 opacity-100"
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
      <div className="flex items-center justify-between p-6 border-b border-sidebar-border/50 bg-gradient-to-r from-sidebar-accent/10 to-transparent">
        <div className="flex items-center space-x-4">
          <div className="relative group">
            <div className="w-12 h-12 bg-gradient-to-br from-sidebar-primary/20 to-sidebar-primary/10 rounded-2xl flex items-center justify-center border-2 border-sidebar-primary/20 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
              <img src={sispacLogo} alt="SisPAC" className="w-7 h-7" />
            </div>
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-success to-success/80 rounded-full border-2 border-sidebar shadow-sm animate-pulse-soft"></div>
          </div>
          <div>
            <h2 className="font-bold text-sidebar-foreground text-lg">SisPAC</h2>
            <p className="text-sm text-sidebar-foreground/70 font-medium">Sistema de Avaliação</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {!isMobile && (
            <>
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-sidebar-accent/20 hover:scale-110 transition-all duration-300">
                <Bell size={18} className="text-sidebar-foreground/70" />
              </Button>
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-sidebar-accent/20 hover:scale-110 transition-all duration-300">
                <Search size={18} className="text-sidebar-foreground/70" />
              </Button>
            </>
          )}
          {isMobile && onClose && (
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-sidebar-accent/20 hover:scale-110 transition-all duration-300" onClick={onClose}>
              <X size={18} className="text-sidebar-foreground/70" />
            </Button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-6 space-y-3">
        <div className="space-y-2">
          {navigationItems.map((item, index) => {
            if (item.adminOnly && role !== 'admin') return null
            
            const Icon = item.icon
            const active = isActive(item.path)
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 group transform-gpu hover:scale-105",
                  active 
                    ? "bg-gradient-to-r from-sidebar-primary/20 to-sidebar-primary/10 text-sidebar-primary border-2 border-sidebar-primary/30 shadow-lg hover:shadow-xl" 
                    : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/20 hover:border-sidebar-accent/30 border-2 border-transparent hover:shadow-md"
                )}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center space-x-4">
                  <Icon size={20} className="flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                  <span className="font-medium">{item.label}</span>
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

        <Separator className="my-6 bg-sidebar-border/30" />

        {/* Quick Actions */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-sidebar-foreground/80 uppercase tracking-wider">
            Ações Rápidas
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" size="sm" className="h-12 text-xs rounded-xl hover:scale-105 transition-all duration-300">
              <Plus size={16} className="mr-2" />
              Novo
            </Button>
            <Button variant="outline" size="sm" className="h-12 text-xs rounded-xl hover:scale-105 transition-all duration-300">
              <Zap size={16} className="mr-2" />
              Relatório
            </Button>
          </div>
        </div>


      </div>

      {/* Footer */}
      <div className="border-t border-sidebar-border/50 p-6 space-y-4 bg-gradient-to-t from-sidebar-accent/5 to-transparent">
        {/* Theme Selector */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-sidebar-accent/10 border border-sidebar-accent/20">
          <span className="text-sm font-semibold text-sidebar-foreground/80">Tema</span>
          <ThemeDropdown />
        </div>

        {/* User Info */}
        <div className="flex items-center space-x-4 p-4 rounded-2xl bg-gradient-to-r from-sidebar-accent/20 to-sidebar-accent/10 border border-sidebar-accent/30 hover:from-sidebar-accent/30 hover:to-sidebar-accent/20 transition-all duration-300 group">
          <div className="w-10 h-10 bg-gradient-to-br from-sidebar-primary/20 to-sidebar-primary/10 rounded-xl flex items-center justify-center border-2 border-sidebar-primary/20 group-hover:scale-110 transition-transform duration-300">
            <User size={18} className="text-sidebar-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-sidebar-foreground truncate">
              {user?.user_metadata?.full_name || user?.email || 'Usuário'}
            </p>
            <p className="text-xs text-sidebar-foreground/70 truncate font-medium">
              {role === 'admin' ? 'Administrador' : 'Usuário'}
            </p>
          </div>
        </div>

        {/* Logout Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
          className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/20 rounded-xl h-12 font-semibold hover:scale-105 transition-all duration-300"
        >
          <LogOut size={18} className="mr-3" />
          Sair
        </Button>
      </div>
    </div>
  )
}