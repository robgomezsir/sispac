import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'
import { useNavigate } from 'react-router-dom'
import { 
  LogIn, 
  CheckCircle
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-secondary/5">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
          <p className="text-muted-foreground">Carregando sistema...</p>
          <p className="text-xs text-muted-foreground mt-2">Debug: isLoading=true, user={user ? 'sim' : 'não'}</p>
        </div>
      </div>
    )
  }

  // Se já estiver logado, mostrar loading de redirecionamento
  if (user) {
    console.log('🔍 [Home] Usuário logado, mostrando tela de redirecionamento...')
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-secondary/5">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
          <p className="text-muted-foreground">Redirecionando para o dashboard...</p>
          <p className="text-xs text-muted-foreground mt-2">Debug: user=sim, role={user?.role || 'não definido'}</p>
        </div>
      </div>
    )
  }

  console.log('🔍 [Home] Mostrando formulário de login...')

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-secondary/5 p-4">
      <div className="w-full max-w-md">
        {/* Título Principal */}
        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
            SisPAC
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mt-2">
            Sistema Propósito de Avaliação Comportamental
          </p>
        </div>

        {/* Formulário de Login */}
        <Card className="shadow-2xl border-0 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
          <CardHeader className="text-center space-y-3 pb-4">
            <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <LogIn size={28} className="text-primary" />
            </div>
            <div className="space-y-1">
              <CardTitle className="text-xl">Acesso ao Sistema</CardTitle>
              <CardDescription className="text-sm">
                Faça login para acessar o painel administrativo
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="pb-4">
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm">Email</Label>
                <Input 
                  id="email"
                  type="email"
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  required
                  placeholder="seu@email.com"
                  className="h-11 text-sm"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm">Senha</Label>
                <Input 
                  id="password"
                  type="password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  required
                  placeholder="••••••••"
                  className="h-11 text-sm"
                />
              </div>
              
              <Button 
                type="submit"
                className="w-full h-11 text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300 mt-2" 
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Entrando...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <LogIn size={16} />
                    Entrar no Sistema
                  </div>
                )}
              </Button>
            </form>
          </CardContent>

          {/* Exibir erros de autenticação de forma discreta */}
          {authError && (
            <CardFooter className="pt-0 pb-4">
              <div className="w-full p-3 bg-destructive/5 border border-destructive/20 text-destructive rounded-lg text-sm">
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="flex-1">{authError}</span>
                  <button
                    onClick={clearError}
                    className="text-destructive/70 hover:text-destructive transition-colors"
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
                    className="mt-2 text-xs text-destructive/80 hover:text-destructive underline transition-colors"
                  >
                    Tentar novamente
                  </button>
                )}
              </div>
            </CardFooter>
          )}

          {/* Exibir erros de formulário de forma discreta */}
          {err && (
            <CardFooter className="pt-0 pb-4">
              <div className="w-full p-3 bg-destructive/5 border border-destructive/20 text-destructive rounded-lg text-sm">
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{err}</span>
                </div>
              </div>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  )
}
