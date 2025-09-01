import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import { ThemeToggle } from './ThemeToggle.jsx'
import { 
  Menu, 
  X, 
  Settings, 
  BarChart3, 
  LogOut,
  ChevronRight,
  User,
  Shield,
  RefreshCw,
  Download,
  FileText,
  Table,
  Home,
  Database
} from 'lucide-react'
import { cn } from '../lib/utils'
import { Button, Badge } from './ui'

export function Sidebar({ 
  onRefresh, 
  onExport, 
  loading, 
  viewMode, 
  setViewMode, 
  filteredLength 
}) {
  const { user, role, signOut } = useAuth()
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)

  const handleSignOut = async () => {
    try {
      await signOut()
      setIsOpen(false)
    } catch (err) {
      console.error('Erro no logout:', err)
    }
  }

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  const closeSidebar = () => {
    setIsOpen(false)
  }



  return (
    <>
      {/* Botão do menu hambúrguer */}
      <Button
        variant="outline"
        size="icon"
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-lg hover:shadow-xl transition-all duration-300"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </Button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed top-0 left-0 h-full w-80 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-r border-border/50 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Header do sidebar */}
          <div className="flex items-center justify-between p-6 border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center border border-primary/20">
                <Shield size={20} className="text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Menu Admin</h2>
                <p className="text-sm text-muted-foreground">Ferramentas administrativas</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={closeSidebar}
              className="hover:bg-accent/50"
            >
              <X size={18} />
            </Button>
          </div>

          {/* Conteúdo do sidebar */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Informações do usuário */}
            {user && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-muted/30 border border-border/50">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center border border-primary/20">
                    <User size={20} className="text-primary" />
                  </div>
                  <div className="flex-1">
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

            {/* Links de navegação */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Navegação</h3>
              <div className="space-y-2">
                <Link
                  to="/"
                  onClick={closeSidebar}
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-2xl transition-all duration-200 group",
                    location.pathname === "/"
                      ? "bg-primary/10 text-primary border border-primary/20 shadow-sm"
                      : "hover:bg-accent/50 text-muted-foreground hover:text-foreground"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200",
                    location.pathname === "/"
                      ? "bg-primary/20 border border-primary/20"
                      : "bg-muted/50 group-hover:bg-primary/10"
                  )}>
                    <Home size={18} className={location.pathname === "/" ? "text-primary" : "text-muted-foreground group-hover:text-primary"} />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">Início</div>
                    <div className="text-xs text-muted-foreground">Página inicial</div>
                  </div>
                </Link>

                <Link
                  to="/form"
                  onClick={closeSidebar}
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-2xl transition-all duration-200 group",
                    location.pathname === "/form"
                      ? "bg-primary/10 text-primary border border-primary/20 shadow-sm"
                      : "hover:bg-accent/50 text-muted-foreground hover:text-foreground"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200",
                    location.pathname === "/form"
                      ? "bg-primary/20 border border-primary/20"
                      : "bg-muted/50 group-hover:bg-primary/10"
                  )}>
                    <FileText size={18} className={location.pathname === "/form" ? "text-primary" : "text-muted-foreground group-hover:text-primary"} />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">Formulário</div>
                    <div className="text-xs text-muted-foreground">Teste comportamental</div>
                  </div>
                </Link>

                {user && (
                  <Link
                    to="/dashboard"
                    onClick={closeSidebar}
                    className={cn(
                      "flex items-center gap-3 p-4 rounded-2xl transition-all duration-200 group",
                      location.pathname === "/dashboard"
                        ? "bg-primary/10 text-primary border border-primary/20 shadow-sm"
                        : "hover:bg-accent/50 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200",
                      location.pathname === "/dashboard"
                        ? "bg-primary/20 border border-primary/20"
                        : "bg-muted/50 group-hover:bg-primary/10"
                    )}>
                      <BarChart3 size={18} className={location.pathname === "/dashboard" ? "text-primary" : "text-muted-foreground group-hover:text-primary"} />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">Dashboard</div>
                      <div className="text-xs text-muted-foreground">Análise de candidatos</div>
                    </div>
                  </Link>
                )}
              </div>
            </div>

            {/* Opções de tema */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Aparência</h3>
              <div className="p-4 rounded-2xl bg-muted/30 border border-border/50">
                <ThemeToggle />
              </div>
            </div>

            {/* Ações do Dashboard */}
            {location.pathname === '/dashboard' && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Ações</h3>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      onRefresh?.()
                      closeSidebar()
                    }}
                    disabled={loading}
                    className="w-full justify-start gap-3 h-12 hover:bg-accent/50 transition-all duration-200"
                  >
                    {loading ? (
                      <RefreshCw size={18} className="animate-spin" />
                    ) : (
                      <RefreshCw size={18} />
                    )}
                    <span>Atualizar Dados</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => {
                      onExport?.()
                      closeSidebar()
                    }}
                    disabled={filteredLength === 0}
                    className="w-full justify-start gap-3 h-12 hover:bg-accent/50 transition-all duration-200"
                  >
                    <Download size={18} />
                    <span>Exportar (XLSX)</span>
                  </Button>
                </div>
              </div>
            )}



            {/* Links administrativos */}
            {role === 'admin' && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Administração</h3>
                <div className="space-y-2">
                  <Link
                    to="/config"
                    onClick={closeSidebar}
                    className={cn(
                      "flex items-center gap-3 p-4 rounded-2xl transition-all duration-200 group",
                      location.pathname === "/config"
                        ? "bg-primary/10 text-primary border border-primary/20 shadow-sm"
                        : "hover:bg-accent/50 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200",
                      location.pathname === "/config"
                        ? "bg-primary/20 border border-primary/20"
                        : "bg-muted/50 group-hover:bg-primary/10"
                    )}>
                      <Settings size={18} className={location.pathname === "/config" ? "text-primary" : "text-muted-foreground group-hover:text-primary"} />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">Configurações</div>
                      <div className="text-xs text-muted-foreground">Configurações do sistema</div>
                    </div>
                    <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30 text-xs">
                      ADMIN
                    </Badge>
                  </Link>

                  <Link
                    to="/api"
                    onClick={closeSidebar}
                    className={cn(
                      "flex items-center gap-3 p-4 rounded-2xl transition-all duration-200 group",
                      location.pathname === "/api"
                        ? "bg-primary/10 text-primary border border-primary/20 shadow-sm"
                        : "hover:bg-accent/50 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200",
                      location.pathname === "/api"
                        ? "bg-primary/20 border border-primary/20"
                        : "bg-muted/50 group-hover:bg-primary/10"
                    )}>
                      <Database size={18} className={location.pathname === "/api" ? "text-primary" : "text-muted-foreground group-hover:text-primary"} />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">API Panel</div>
                      <div className="text-xs text-muted-foreground">Documentação da API</div>
                    </div>
                    <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30 text-xs">
                      ADMIN
                    </Badge>
                  </Link>
                </div>
              </div>
            )}

            {/* Botão de logout */}
            <div className="pt-4 border-t border-border/50">
              <Button
                variant="outline"
                onClick={handleSignOut}
                className="w-full justify-start gap-3 h-12 hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-all duration-200"
              >
                <LogOut size={18} />
                <span>Sair do Sistema</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
