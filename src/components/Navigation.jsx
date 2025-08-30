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
  User
} from 'lucide-react'
import { cn } from '../lib/utils'

export function Navigation() {
  const { user, role, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  const handleSignOut = useCallback(async () => {
    try {
      await signOut()
      navigate('/')
      setIsMobileMenuOpen(false)
    } catch (err) {
      console.error('Erro no logout:', err)
    }
  }, [signOut, navigate])
  
  const navLinks = useMemo(() => [
    { to: "/", label: "Início", icon: Home, isActive: location.pathname === "/" },
    { to: "/form", label: "Formulário", icon: FileText, isActive: location.pathname === "/form" },
    ...(user ? [{ 
      to: "/dashboard", 
      label: "Dashboard", 
      icon: BarChart3, 
      isActive: location.pathname === "/dashboard" 
    }] : []),
    ...(role === 'admin' ? [
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
    ] : [])
  ], [user, role, location.pathname])
  
  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }, [isMobileMenuOpen])
  
  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false)
  }, [])
  
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-3 text-xl font-bold text-primary hover:text-primary/80 transition-colors"
            onClick={closeMobileMenu}
          >
            <img src={sispacLogo} alt="SisPAC Logo" className="w-8 h-8" />
            <span className="hidden sm:inline">SisPAC</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map(({ to, label, icon: Icon, isActive, isAdmin }) => (
              <Link
                key={to}
                to={to}
                className={cn(
                  "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
                  isAdmin && "bg-primary/10 text-primary hover:bg-primary/20"
                )}
              >
                <Icon size={16} />
                <span>{label}</span>
                {isAdmin && (
                  <span className="ml-1 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                    ADMIN
                  </span>
                )}
              </Link>
            ))}
          </div>
          
          {/* Right side - Theme toggle and user menu */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            
            {user && (
              <div className="hidden md:flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <User size={16} className="text-primary" />
                  </div>
                  <div className="hidden lg:block">
                    <div className="font-medium text-foreground">{user.email}</div>
                    {role === 'admin' && (
                      <div className="text-xs text-muted-foreground">Administrador</div>
                    )}
                  </div>
                </div>
                
                <button
                  onClick={handleSignOut}
                  className="btn-outline flex items-center space-x-2"
                >
                  <LogOut size={16} />
                  <span className="hidden sm:inline">Sair</span>
                </button>
              </div>
            )}
            
            {/* Mobile menu button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
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
                    "flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium transition-colors",
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
                    isAdmin && "bg-primary/10 text-primary hover:bg-primary/20"
                  )}
                  onClick={closeMobileMenu}
                >
                  <Icon size={20} />
                  <span>{label}</span>
                  {isAdmin && (
                    <span className="ml-auto text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                      ADMIN
                    </span>
                  )}
                </Link>
              ))}
              
              {user && (
                <>
                  <div className="border-t pt-4 mt-4">
                    <div className="px-3 py-2 text-sm text-muted-foreground">
                      <div className="font-medium text-foreground">{user.email}</div>
                      {role === 'admin' && (
                        <div className="text-xs">Administrador</div>
                      )}
                    </div>
                  </div>
                  
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  >
                    <LogOut size={20} />
                    <span>Sair</span>
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
