import React, { useState, useCallback, useMemo } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
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
  
  // Links de navegação removidos - agora estão no menu lateral
  
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
          
          {/* Desktop Navigation removida - agora está no menu lateral */}
          
          {/* Right side - User menu */}
          <div className="flex items-center space-x-4">
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
                

              </div>
            )}
            
            {/* Mobile menu button removido - navegação agora está no menu lateral */}
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
                  

                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
