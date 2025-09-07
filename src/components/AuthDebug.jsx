import React, { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'
import { useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
// Componentes customizados serão criados

export default function AuthDebug() {
  const { user, role, isLoading, signIn, authError, isInvitePending, needsPasswordReset } = useAuth()
  const location = useLocation()
  const [testEmail, setTestEmail] = useState('robgomez.sir@gmail.com')
  const [testPassword, setTestPassword] = useState('')
  const [testResult, setTestResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [logs, setLogs] = useState([])
  
  useEffect(() => {
    const log = {
      timestamp: new Date().toLocaleTimeString(),
      path: location.pathname,
      user: user ? user.email : 'Não logado',
      role: role || 'Não definido',
      isLoading,
      authError: authError || 'Nenhum'
    }
    
    setLogs(prev => [log, ...prev.slice(0, 9)]) // Manter apenas os últimos 10 logs
  }, [user, role, isLoading, authError, location.pathname])

  const testConnection = async () => {
    setLoading(true)
    setTestResult(null)
    
    try {
      // Testar conexão básica
      const { data, error } = await supabase.auth.getSession()
      
      if (error) {
        setTestResult({ type: 'error', message: `Erro na conexão: ${error.message}` })
        return
      }
      
      setTestResult({ 
        type: 'success', 
        message: `Conexão OK! Sessão: ${data.session ? 'Ativa' : 'Inativa'}` 
      })
      
      // Testar login
      if (testEmail && testPassword) {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: testEmail,
          password: testPassword
        })
        
        if (authError) {
          setTestResult({ 
            type: 'error', 
            message: `Erro no login: ${authError.message}` 
          })
        } else {
          setTestResult({ 
            type: 'success', 
            message: `Login OK! Usuário: ${authData.user?.email}` 
          })
        }
      }
      
    } catch (err) {
      setTestResult({ type: 'error', message: `Exceção: ${err.message}` })
    } finally {
      setLoading(false)
    }
  }

  const testSignOut = async () => {
    try {
      await supabase.auth.signOut()
      setTestResult({ type: 'success', message: 'Logout realizado com sucesso!' })
    } catch (err) {
      setTestResult({ type: 'error', message: `Erro no logout: ${err.message}` })
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>🔍 Debug de Autenticação</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Atual */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
          <div>
            <strong>Usuário:</strong> {user ? user.email : 'Nenhum'}
          </div>
          <div>
            <strong>Role:</strong> {role || 'Nenhum'}
          </div>
          <div>
            <strong>Loading:</strong> {isLoading ? 'Sim' : 'Não'}
          </div>
          <div>
            <strong>ID:</strong> {user?.id || 'Nenhum'}
          </div>
          <div>
            <strong>Convite Pendente:</strong> {isInvitePending ? 'Sim' : 'Não'}
          </div>
          <div>
            <strong>Precisa Resetar Senha:</strong> {needsPasswordReset ? 'Sim' : 'Não'}
          </div>
          <div>
            <strong>Erro:</strong> {authError || 'Nenhum'}
          </div>
          <div>
            <strong>Rota Atual:</strong> {location.pathname}
          </div>
        </div>

        {/* Teste de Conexão */}
        <div className="space-y-2">
          <Button onClick={testConnection} disabled={loading} className="w-full">
            {loading ? 'Testando...' : '🧪 Testar Conexão e Login'}
          </Button>
          
          {testResult && (
            <div className={`p-3 rounded-lg ${
              testResult.type === 'error' 
                ? 'bg-destructive/10 text-destructive border border-destructive/20' 
                : 'bg-green-100 text-green-800 border border-green-200'
            }`}>
              {testResult.message}
            </div>
          )}
        </div>

        {/* Campos de Teste */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email de Teste:</label>
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              className="w-full p-2 border rounded-md"
              placeholder="Email para teste"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Senha de Teste:</label>
            <input
              type="password"
              value={testPassword}
              onChange={(e) => setTestPassword(e.target.value)}
              className="w-full p-2 border rounded-md"
              placeholder="Senha para teste"
            />
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex gap-2">
          <Button onClick={testSignOut} variant="outline" className="flex-1">
            🚪 Testar Logout
          </Button>
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline" 
            className="flex-1"
          >
            🔄 Recarregar Página
          </Button>
        </div>

        {/* Histórico de Mudanças */}
        <div className="p-4 bg-muted rounded-lg">
          <h4 className="font-semibold mb-2">📈 Histórico de Mudanças:</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {logs.map((log, index) => (
              <div key={index} className="text-sm p-2 bg-background rounded border">
                <div className="font-mono text-xs text-muted-foreground">{log.timestamp}</div>
                <div><strong>Rota:</strong> {log.path}</div>
                <div><strong>Usuário:</strong> {log.user}</div>
                <div><strong>Role:</strong> {log.role}</div>
                <div><strong>Carregando:</strong> {log.isLoading ? 'Sim' : 'Não'}</div>
                {log.authError !== 'Nenhum' && (
                  <div className="text-destructive"><strong>Erro:</strong> {log.authError}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Informações do Supabase */}
        <div className="p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold mb-2">📊 Informações do Supabase:</h4>
          <div className="text-sm space-y-1">
            <div><strong>URL:</strong> {import.meta.env.VITE_SUPABASE_URL}</div>
            <div><strong>Anon Key:</strong> {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Configurada' : '❌ Não configurada'}</div>
            <div><strong>Service Key:</strong> {import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY ? '✅ Configurada' : '❌ Não configurada'}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
