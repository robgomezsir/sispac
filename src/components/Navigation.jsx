import React, { useState, useCallback, useMemo } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import { ThemeToggle } from './ThemeToggle.jsx'
import { sispacLogo } from '../assets'
import { 
  LogOut, 
  Settings, 
  Database, 
  BarChart3, 
  Menu, 
  X,
  Home,
  FileText,
  User,
  ChevronDown
} from 'lucide-react'
import { cn } from '../lib/utils'
import { Button, Badge, Separator } from './ui'

export function Navigation() {
  const { user, role, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  // Debug: logar o estado atual
  console.log('🔍 [Navigation] Estado atual:', { user: !!user, role, isAdmin: role === 'admin' })
  
  const handleSignOut = useCallback(async () => {
    try {
      await signOut()
      navigate('/')
      setIsMobileMenuOpen(false)
    } catch (err) {
      console.error('Erro no logout:', err)
    }
  }, [signOut, navigate])
  
  const navLinks = useMemo(() => {
    const links = [
      { to: "/", label: "Início", icon: Home, isActive: location.pathname === "/" },
      { to: "/form", label: "Formulário", icon: FileText, isActive: location.pathname === "/form" },
      ...(user ? [{ 
        to: "/dashboard", 
        label: "Dashboard", 
        icon: BarChart3, 
        isActive: location.pathname === "/dashboard" 
      }] : [])
    ]
    
    // Adicionar links admin se aplicável
    if (role === 'admin') {
      console.log('🔍 [Navigation] Adicionando links admin para role:', role)
      links.push(
        { 
          to: "/config", 
          label: "Configurações", 
          icon: Settings, 
          isActive: location.pathname === "/config",
          isAdmin: true 
        },
        { 
          to: "/api", 
          label: "API Panel", 
          icon: Database, 
          isActive: location.pathname === "/api",
          isAdmin: true 
        }
      )
    } else {
      console.log('🔍 [Navigation] Role não é admin:', role)
    }
    
    console.log('🔍 [Navigation] Links finais:', links.map(l => ({ to: l.to, label: l.label, isAdmin: l.isAdmin })))
    return links
  }, [user, role, location.pathname])
  
  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }, [isMobileMenuOpen])
  
  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false)
  }, [])
  
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-3 text-xl font-bold text-primary hover:text-primary/80 transition-all duration-300 hover:scale-105"
            onClick={closeMobileMenu}
          >
            <div className="relative">
              <img src={sispacLogo} alt="SisPAC Logo" className="w-8 h-8 drop-shadow-sm" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-pulse" />
            </div>
            <span className="hidden sm:inline bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              SisPAC
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {navLinks.map(({ to, label, icon: Icon, isActive, isAdmin }) => (
              <Link
                key={to}
                to={to}
                className={cn(
                  "flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 relative group",
                  isActive
                    ? "bg-primary/10 text-primary shadow-md"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50 hover:shadow-sm",
                  isAdmin && "bg-primary/10 text-primary hover:bg-primary/20"
                )}
              >
                <Icon size={16} className="group-hover:scale-110 transition-transform duration-200" />
                <span>{label}</span>
                {isAdmin && (
                  <Badge variant="secondary" className="ml-2 bg-primary/20 text-primary border-primary/30 text-xs">
                    ADMIN
                  </Badge>
                )}
                {isActive && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
                )}
              </Link>
            ))}
          </div>
          
          {/* Right side - Theme toggle and user menu */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            
            {user && (
              <div className="hidden md:flex items-center space-x-4">
                <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-accent/50 transition-colors duration-200">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center border border-primary/20">
                    <User size={16} className="text-primary" />
                  </div>
                  <div className="hidden lg:block">
                    <div className="font-medium text-foreground text-sm">{user.email}</div>
                    {role === 'admin' && (
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <div className="w-2 h-2 bg-primary rounded-full" />
                        Administrador
                      </div>
                    )}
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                  className="flex items-center space-x-2 hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-all duration-200"
                >
                  <LogOut size={16} />
                  <span className="hidden sm:inline">Sair</span>
                </Button>
              </div>
            )}
            
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMobileMenu}
              className="md:hidden"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navLinks.map(({ to, label, icon: Icon, isActive, isAdmin }) => (
                <Link
                  key={to}
                  to={to}
                  className={cn(
                    "flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary/10 text-primary shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
                    isAdmin && "bg-primary/10 text-primary hover:bg-primary/20"
                  )}
                  onClick={closeMobileMenu}
                >
                  <Icon size={20} className="group-hover:scale-110 transition-transform duration-200" />
                  <span>{label}</span>
                  {isAdmin && (
                    <Badge variant="secondary" className="ml-auto bg-primary/20 text-primary border-primary/30 text-xs">
                      ADMIN
                    </Badge>
                  )}
                </Link>
              ))}
              
              {user && (
                <>
                  <Separator className="my-4" />
                  <div className="px-4 py-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center border border-primary/20">
                        <User size={20} className="text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-foreground">{user.email}</div>
                        {role === 'admin' && (
                          <div className="text-sm text-muted-foreground flex items-center gap-2">
                            <div className="w-2 h-2 bg-primary rounded-full" />
                            Administrador
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    className="w-full justify-start px-4 py-3 h-auto hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-all duration-200"
                    onClick={handleSignOut}
                  >
                    <LogOut size={20} className="mr-3" />
                    <span>Sair</span>
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
