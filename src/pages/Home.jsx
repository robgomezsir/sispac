import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'
import { useNavigate } from 'react-router-dom'
import { 
  LogIn, 
  CheckCircle,
  Sparkles,
  Shield,
  Zap,
  Heart
} from 'lucide-react'
import { 
  Button, 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter,
  Input,
  Label
} from '../components/ui'

export default function Home(){
  const { user, signIn, isLoading, authError, clearError, retryConnection } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState(null)
  const navigate = useNavigate()
  const hasRedirected = useRef(false)

  // Debug logs
  useEffect(() => {
    console.log('🔍 [Home] Componente Home renderizado')
    console.log('🔍 [Home] Estado atual:', { user: !!user, isLoading, loading, authError })
  }, [user, isLoading, loading, authError])

  // Redirecionar automaticamente se já estiver logado - SEM dependências circulares
  useEffect(() => {
    console.log('🔍 [Home] Verificando redirecionamento...')
    if (user && !isLoading && !hasRedirected.current) {
      console.log("🚀 [Home] Usuário já logado, redirecionando para dashboard...")
      hasRedirected.current = true
      navigate('/dashboard', { replace: true })
    }
  }, [user, isLoading]) // Removida dependência navigate

  async function onSubmit(e){
    e.preventDefault()
    console.log("🔐 [Home] Iniciando processo de login...")
    setErr(null)
    setLoading(true)
    
    try{
      console.log("🔐 [Home] Chamando signIn...")
      await signIn(email, password)
      console.log("✅ [Home] Login bem-sucedido")
      
      // O redirecionamento será feito automaticamente pelo useAuth
      // Não precisamos fazer nada aqui
      
    }catch(e){
      console.error("❌ [Home] Erro no login:", e)
      console.error("❌ [Home] Mensagem de erro:", e.message)
      setErr(e.message)
    }finally{ 
      setLoading(false)
      console.log("🔐 [Home] Processo de login finalizado")
    }
  }

  // Se ainda estiver carregando, mostrar loading
  if (isLoading) {
    console.log('🔍 [Home] Mostrando tela de carregamento...')
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-pastel relative overflow-hidden">
        {/* Elementos decorativos de fundo */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl animate-float"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-secondary/20 to-transparent rounded-full blur-3xl animate-float" style={{animationDelay: '1s'}}></div>
        </div>
        
        <div className="text-center relative z-10">
          <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-primary/20 shadow-glow">
            <div className="w-10 h-10 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
          <p className="text-muted-foreground text-lg font-medium">Carregando sistema...</p>
          <p className="text-xs text-muted-foreground/60 mt-2">Debug: isLoading=true, user={user ? 'sim' : 'não'}</p>
        </div>
      </div>
    )
  }

  // Se já estiver logado, mostrar loading de redirecionamento
  if (user) {
    console.log('🔍 [Home] Usuário logado, mostrando tela de redirecionamento...')
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-pastel relative overflow-hidden">
        {/* Elementos decorativos de fundo */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-success/20 to-transparent rounded-full blur-3xl animate-float"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-info/20 to-transparent rounded-full blur-3xl animate-float" style={{animationDelay: '1s'}}></div>
        </div>
        
        <div className="text-center relative z-10">
          <div className="w-20 h-20 bg-gradient-to-br from-success/20 to-success/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-success/20 shadow-glow-success">
            <div className="w-10 h-10 border-3 border-success/30 border-t-success rounded-full animate-spin" />
          </div>
          <p className="text-muted-foreground text-lg font-medium">Redirecionando para o dashboard...</p>
          <p className="text-xs text-muted-foreground/60 mt-2">Debug: user=sim, role={user?.role || 'não definido'}</p>
        </div>
      </div>
    )
  }

  console.log('🔍 [Home] Mostrando formulário de login...')

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-pastel relative overflow-hidden p-4">
      {/* Elementos decorativos de fundo */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-secondary/20 to-transparent rounded-full blur-3xl animate-float" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-accent/10 to-transparent rounded-full blur-3xl animate-pulse-soft"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Título Principal com design moderno */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-3xl mb-4 border border-primary/20 shadow-glow">
            <Sparkles size={32} className="text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent mb-3">
            SisPAC
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground font-medium">
            Sistema Propósito de Avaliação Comportamental
          </p>
          
          {/* Características do sistema */}
          <div className="flex items-center justify-center gap-6 mt-6 text-sm text-muted-foreground/70">
            <div className="flex items-center gap-2">
              <Shield size={16} className="text-success" />
              <span>Seguro</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap size={16} className="text-warning" />
              <span>Rápido</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart size={16} className="text-info" />
              <span>Intuitivo</span>
            </div>
          </div>
        </div>

        {/* Formulário de Login com design moderno */}
        <Card className="card-modern border-0 shadow-2xl backdrop-blur-sm">
          <CardHeader className="text-center space-y-4 pb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-3xl flex items-center justify-center mx-auto border border-primary/20 shadow-glow">
              <LogIn size={32} className="text-primary" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl font-bold">Acesso ao Sistema</CardTitle>
              <CardDescription className="text-base text-muted-foreground/80">
                Faça login para acessar o painel administrativo
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="pb-6">
            <form onSubmit={onSubmit} className="space-y-5">
              <div className="space-y-3">
                <Label htmlFor="email" className="text-sm font-medium text-foreground">Email</Label>
                <div className="relative">
                  <Input 
                    id="email"
                    type="email"
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    required
                    placeholder="seu@email.com"
                    className="input-modern h-12 text-base pl-4 pr-4"
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="password" className="text-sm font-medium text-foreground">Senha</Label>
                <div className="relative">
                  <Input 
                    id="password"
                    type="password" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    required
                    placeholder="••••••••"
                    className="input-modern h-12 text-base pl-4 pr-4"
                  />
                </div>
              </div>
              
              <Button 
                type="submit"
                className="btn-primary-modern w-full h-12 text-base font-semibold mt-4" 
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-3 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    <span>Entrando...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <LogIn size={18} />
                    <span>Entrar no Sistema</span>
                  </div>
                )}
              </Button>
            </form>
          </CardContent>

          {/* Exibir erros de autenticação com design moderno */}
          {authError && (
            <CardFooter className="pt-0 pb-6">
              <div className="w-full p-4 bg-gradient-to-r from-destructive/10 to-destructive/5 border border-destructive/20 text-destructive rounded-xl text-sm backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-destructive/20 rounded-full flex items-center justify-center">
                    <svg className="h-3 w-3 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="flex-1 font-medium">{authError}</span>
                  <button
                    onClick={clearError}
                    className="text-destructive/70 hover:text-destructive transition-colors duration-200 p-1 rounded-lg hover:bg-destructive/10"
                    title="Fechar"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                {retryConnection && (
                  <button
                    onClick={retryConnection}
                    disabled={isLoading}
                    className="mt-3 text-xs text-destructive/80 hover:text-destructive underline transition-colors duration-200 font-medium"
                  >
                    Tentar novamente
                  </button>
                )}
              </div>
            </CardFooter>
          )}

          {/* Exibir erros de formulário com design moderno */}
          {err && (
            <CardFooter className="pt-0 pb-6">
              <div className="w-full p-4 bg-gradient-to-r from-destructive/10 to-destructive/5 border border-destructive/20 text-destructive rounded-xl text-sm backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-destructive/20 rounded-full flex items-center justify-center">
                    <svg className="h-3 w-3 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="font-medium">{err}</span>
                </div>
              </div>
            </CardFooter>
          )}
        </Card>

        {/* Footer com informações adicionais */}
        <div className="text-center mt-8">
          <p className="text-xs text-muted-foreground/60">
            © 2024 SisPAC - Sistema de Avaliação Comportamental
          </p>
          <p className="text-xs text-muted-foreground/40 mt-1">
            Desenvolvido com ❤️ para facilitar a avaliação de candidatos
          </p>
        </div>
      </div>
    </div>
  )
}
