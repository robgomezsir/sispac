import React, { useState, useCallback } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import { sispacLogo } from '../assets'
import { 
  Home,
  BarChart3,
  Users,
  Handshake,
  DollarSign,
  Settings,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  User,
  LogOut,
  Bell,
  Search,
  Plus,
  X,
  Menu,
  Database,
  FileText,
  Shield,
  Zap
} from 'lucide-react'
import { cn } from '../lib/utils'
import { Button, Badge, Separator, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from './ui'

export function Sidebar({ isOpen, onToggle }) {
  const { user, role, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [expandedItems, setExpandedItems] = useState(new Set())
  const [showPromo, setShowPromo] = useState(true)

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

  const navigationItems = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      path: '/',
      isActive: location.pathname === '/'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      path: '/dashboard',
      isActive: location.pathname === '/dashboard'
    },
    {
      id: 'customers',
      label: 'Customers',
      icon: Users,
      path: '/customers',
      isActive: location.pathname.startsWith('/customers'),
      badge: '6',
      badgeColor: 'success',
      children: [
        { label: 'All Customers', path: '/customers' },
        { label: 'New Customers', path: '/customers/new' },
        { label: 'VIP Customers', path: '/customers/vip' }
      ]
    },
    {
      id: 'partners',
      label: 'Partners',
      icon: Handshake,
      path: '/partners',
      isActive: location.pathname.startsWith('/partners'),
      badge: 'New',
      badgeColor: 'primary'
    },
    {
      id: 'payouts',
      label: 'Payouts',
      icon: DollarSign,
      path: '/payouts',
      isActive: location.pathname.startsWith('/payouts')
    }
  ]

  const adminItems = [
    {
      id: 'config',
      label: 'Configurações',
      icon: Settings,
      path: '/config',
      isActive: location.pathname === '/config'
    },
    {
      id: 'api',
      label: 'API Panel',
      icon: Database,
      path: '/api',
      isActive: location.pathname === '/api'
    }
  ]

  const bottomItems = [
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      path: '/settings',
      isActive: location.pathname === '/settings'
    },
    {
      id: 'help',
      label: 'Help Center',
      icon: HelpCircle,
      path: '/help',
      isActive: location.pathname === '/help'
    }
  ]

  const NavItem = ({ item, level = 0 }) => {
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedItems.has(item.id)
    const Icon = item.icon

    return (
      <div className="w-full">
        <Link
          to={item.path}
          className={cn(
            "group flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 relative",
            "hover:bg-accent/50 hover:scale-[1.02] active:scale-[0.98]",
            item.isActive 
              ? "bg-primary/10 text-primary shadow-sm border border-primary/20" 
              : "text-muted-foreground hover:text-foreground",
            level > 0 && "ml-6 text-xs"
          )}
        >
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2 rounded-lg transition-all duration-300",
              item.isActive 
                ? "bg-primary/20 text-primary" 
                : "bg-muted/50 text-muted-foreground group-hover:bg-accent group-hover:text-foreground"
            )}>
              <Icon size={16} />
            </div>
            <span className="truncate">{item.label}</span>
          </div>
          
          <div className="flex items-center gap-2">
            {item.badge && (
              <Badge 
                variant={item.badgeColor === 'success' ? 'default' : 'secondary'}
                className={cn(
                  "text-xs px-2 py-1",
                  item.badgeColor === 'success' && "bg-green-500/20 text-green-600 border-green-500/30",
                  item.badgeColor === 'primary' && "bg-primary/20 text-primary border-primary/30"
                )}
              >
                {item.badge}
              </Badge>
            )}
            {hasChildren && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-transparent"
                onClick={(e) => {
                  e.preventDefault()
                  toggleExpanded(item.id)
                }}
              >
                {isExpanded ? (
                  <ChevronDown size={14} className="text-muted-foreground" />
                ) : (
                  <ChevronRight size={14} className="text-muted-foreground" />
                )}
              </Button>
            )}
          </div>
        </Link>

        {hasChildren && isExpanded && (
          <div className="mt-2 space-y-1 animate-in slide-in-from-top-2 duration-300">
            {item.children.map((child, index) => (
              <Link
                key={index}
                to={child.path}
                className={cn(
                  "group flex items-center gap-3 px-4 py-2 ml-6 rounded-lg text-xs font-medium transition-all duration-300",
                  "hover:bg-accent/30 hover:scale-[1.01]",
                  location.pathname === child.path
                    ? "bg-primary/5 text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 group-hover:bg-primary/60 transition-colors duration-300" />
                <span className="truncate">{child.label}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      {/* Overlay para mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed left-0 top-0 z-50 h-full w-80 bg-background/95 backdrop-blur-md border-r border-border/50 shadow-2xl transition-all duration-500 ease-in-out",
        "lg:translate-x-0 lg:static lg:z-auto",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-border/50">
            <div className="flex items-center justify-between">
              <Link 
                to="/" 
                className="flex items-center gap-3 group"
                onClick={() => isOpen && onToggle()}
              >
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                    <img src={sispacLogo} alt="SisPAC" className="w-6 h-6" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background animate-pulse" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                    SisPAC
                  </h1>
                  <p className="text-xs text-muted-foreground">Sistema de Avaliação</p>
                </div>
              </Link>
              
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden h-8 w-8 p-0"
                onClick={onToggle}
              >
                <X size={16} />
              </Button>
            </div>

            {/* User Info */}
            {user && (
              <div className="mt-6 p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl border border-primary/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center border border-primary/20">
                    <User size={18} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground truncate">
                      {user.email}
                    </p>
                    {role === 'admin' && (
                      <div className="flex items-center gap-1 mt-1">
                        <div className="w-2 h-2 bg-primary rounded-full" />
                        <span className="text-xs text-muted-foreground">Administrador</span>
                      </div>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <ChevronDown size={14} />
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
                </div>
              </div>
            )}
          </div>

          {/* Link Integrations */}
          <div className="px-6 py-4">
            <div className="flex items-center gap-2 mb-3">
              <Zap size={16} className="text-primary" />
              <span className="text-sm font-medium text-foreground">Integrações</span>
            </div>
            <div className="flex gap-2">
              {[
                { icon: '🔗', color: 'bg-blue-500' },
                { icon: '🔥', color: 'bg-orange-500' },
                { icon: '💧', color: 'bg-cyan-500' },
                { icon: '⭐', color: 'bg-yellow-500' }
              ].map((integration, index) => (
                <div
                  key={index}
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm shadow-sm hover:scale-110 transition-all duration-300",
                    integration.color
                  )}
                >
                  {integration.icon}
                </div>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
            {navigationItems.map((item) => (
              <NavItem key={item.id} item={item} />
            ))}

            {/* Admin Section */}
            {role === 'admin' && (
              <>
                <Separator className="my-4" />
                <div className="px-2">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield size={14} className="text-primary" />
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Administração
                    </span>
                  </div>
                  {adminItems.map((item) => (
                    <NavItem key={item.id} item={item} />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Promo Card */}
          {showPromo && (
            <div className="p-4 mx-4 mb-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl border border-primary/20 relative">
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 h-6 w-6 p-0"
                onClick={() => setShowPromo(false)}
              >
                <X size={12} />
              </Button>
              <div className="pr-6">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30 text-xs">
                    Novo
                  </Badge>
                  <span className="text-sm font-medium text-foreground">Programa de Afiliados</span>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Execute seu próprio programa de afiliados com zero overhead.
                </p>
                <Button size="sm" className="w-full text-xs">
                  Experimentar
                  <ChevronRight size={12} className="ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* Bottom Navigation */}
          <div className="p-4 border-t border-border/50 space-y-1">
            {bottomItems.map((item) => (
              <NavItem key={item.id} item={item} />
            ))}
          </div>
        </div>
      </div>
    </>
  )
}