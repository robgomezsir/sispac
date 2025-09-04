import React, { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
// Sidebar removido - usando LayoutWithSidebar no App.jsx
import { 
  Settings, 
  Users, 
  UserPlus, 
  UserMinus, 
  Database, 
  Trash2, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Plus,
  Minus,
  Copy
} from 'lucide-react'

export default function Configuracoes(){
  const { user, role } = useAuth()
  const navigate = useNavigate()
  
  // Estados para usuários
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [roleSelect, setRoleSelect] = useState('rh')
  
  // Estados para candidatos de teste
  const [testCandidateName, setTestCandidateName] = useState('')
  const [testCandidateEmail, setTestCandidateEmail] = useState('')
  const [generatedLink, setGeneratedLink] = useState('')
  
  // Estados para remoção de candidatos de teste
  const [removeTestCandidateEmail, setRemoveTestCandidateEmail] = useState('')
  
  // Estados gerais
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [messageType, setMessageType] = useState('info')

  // Verificar se o usuário tem permissão
  useEffect(() => {
    if (role !== 'admin') {
      navigate('/dashboard', { replace: true })
    }
  }, [role, navigate])

  // Limpar mensagens após 5 segundos
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null)
        setMessageType('info')
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [message])

  // Função para exibir mensagens
  const showMessage = (msg, type = 'info') => {
    setMessage(msg)
    setMessageType(type)
  }



  // Função para copiar link para área de transferência
  const copyLinkToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedLink)
      showMessage('Link copiado para a área de transferência!', 'success')
    } catch (error) {
      console.error('❌ [Configurações] Erro ao copiar link:', error)
      showMessage('Erro ao copiar link. Tente novamente.', 'error')
    }
  }

  // Função para adicionar usuário
  const handleAddUser = async () => {
    if (!email.trim() || !name.trim()) {
      showMessage('Por favor, preencha todos os campos obrigatórios.', 'error')
      return
    }
    
    if (!email.includes('@')) {
      showMessage('Por favor, insira um email válido.', 'error')
      return
    }
    
    setLoading(true)
    
    try {
      console.log('🔍 [Configurações] Iniciando criação de usuário:', { name: name.trim(), email: email.trim().toLowerCase(), role: roleSelect })
      
      // Usar a API do backend que tem service_role
      const response = await fetch('/api/addUser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          role: roleSelect
        })
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Erro ao criar usuário')
      }
      
      console.log('✅ [Configurações] Usuário criado com sucesso:', result)
      showMessage(result.message || `Usuário "${name.trim()}" criado com sucesso!`, 'success')
      
      // Limpar campos
      setEmail('')
      setName('')
      setRoleSelect('rh')
      
    } catch (error) {
      console.error('❌ [Configurações] Erro ao adicionar usuário:', error)
      showMessage(`Erro ao adicionar usuário: ${error.message}`, 'error')
    } finally {
      setLoading(false)
    }
  }

  // Função para remover usuário
  const handleDeleteUser = async () => {
    if (!email.trim()) {
      showMessage('Por favor, insira o email do usuário a ser removido.', 'error')
      return
    }
    
    if (!confirm(`Tem certeza que deseja remover o usuário ${email}?`)) {
      return
    }
    
    setLoading(true)
    
    try {
      // Usar a API do backend que tem service_role
      const response = await fetch('/api/deleteUser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase()
        })
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Erro ao remover usuário')
      }
      
      showMessage(result.message || `Usuário removido com sucesso!`, 'success')
      setEmail('')
      
    } catch (error) {
      console.error('Erro ao remover usuário:', error)
      showMessage(`Erro ao remover usuário: ${error.message}`, 'error')
    } finally {
      setLoading(false)
    }
  }

  // Função para adicionar candidato de teste
  const handleAddTestCandidate = async () => {
    if (!testCandidateName.trim() || !testCandidateEmail.trim()) {
      showMessage('Por favor, preencha todos os campos obrigatórios.', 'error')
      return
    }
    
    if (!testCandidateEmail.includes('@')) {
      showMessage('Por favor, insira um email válido.', 'error')
      return
    }
    
    setLoading(true)
    
    try {
      console.log('🔍 [Configurações] Iniciando criação de candidato:', { 
        name: testCandidateName.trim(), 
        email: testCandidateEmail.trim().toLowerCase() 
      })
      
      // Usar a API do backend que tem service_role
      const response = await fetch('/api/addCandidate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          name: testCandidateName.trim(),
          email: testCandidateEmail.trim().toLowerCase()
        })
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.message || 'Erro ao criar candidato')
      }
      
      // Definir link gerado
      setGeneratedLink(result.accessLink)
      
      console.log('✅ [Configurações] Candidato criado com sucesso:', result)
      showMessage(
        result.message || `Candidato "${testCandidateName.trim()}" adicionado com sucesso! Link de acesso gerado.`, 
        'success'
      )
      
      // Limpar campos
      setTestCandidateName('')
      setTestCandidateEmail('')
      
    } catch (error) {
      console.error('Erro ao adicionar candidato de teste:', error)
      showMessage(`Erro ao adicionar candidato de teste: ${error.message}`, 'error')
    } finally {
      setLoading(false)
    }
  }

  // Função para remover candidato de teste
  const handleRemoveTestCandidate = async () => {
    if (!removeTestCandidateEmail.trim()) {
      showMessage('Por favor, insira o email do candidato de teste a ser removido.', 'error')
      return
    }
    
    if (!confirm(`Tem certeza que deseja remover o candidato de teste ${removeTestCandidateEmail}?`)) {
      return
    }
    
    setLoading(true)
    
    try {
      console.log('🔍 [Configurações] Iniciando remoção de candidato:', removeTestCandidateEmail.trim().toLowerCase())
      
      // Usar a API do backend que tem service_role
      const response = await fetch('/api/deleteCandidate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          email: removeTestCandidateEmail.trim().toLowerCase()
        })
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.message || 'Erro ao remover candidato')
      }
      
      console.log('✅ [Configurações] Candidato removido com sucesso:', result)
      showMessage(result.message || `Candidato removido com sucesso!`, 'success')
      setRemoveTestCandidateEmail('')
      
    } catch (error) {
      console.error('❌ [Configurações] Erro ao remover candidato de teste:', error)
      showMessage(`Erro ao remover candidato de teste: ${error.message}`, 'error')
    } finally {
      setLoading(false)
    }
  }

  // Função para fazer backup
  const handleBackup = async () => {
    setLoading(true)
    
    try {
      // Buscar todos os dados
      const { data: candidates, error: candidatesError } = await supabase
        .from('candidates')
        .select('*')
      
      if (candidatesError) {
        throw new Error(`Erro ao buscar candidatos: ${candidatesError.message}`)
      }
      
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
      
      if (profilesError) {
        console.log('Erro ao buscar perfis:', profilesError.message)
      }
      
      // Criar objeto de backup
      const backupData = {
        timestamp: new Date().toISOString(),
        candidates: candidates || [],
        profiles: profiles || [],
        totalRecords: (candidates?.length || 0) + (profiles?.length || 0)
      }
      
      // Criar arquivo de download
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `backup_sispac_${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      showMessage(`Backup realizado com sucesso! ${backupData.totalRecords} registros exportados.`, 'success')
      
    } catch (error) {
      console.error('Erro ao fazer backup:', error)
      showMessage(`Erro ao fazer backup: ${error.message}`, 'error')
    } finally {
      setLoading(false)
    }
  }

  // Função para limpar dados
  const handlePurge = async () => {
    if (!confirm('⚠️ ATENÇÃO: Esta operação irá APAGAR TODOS os dados do sistema. Esta ação não pode ser desfeita. Tem certeza?')) {
      return
    }
    
    if (!confirm('Digite "CONFIRMAR" para prosseguir:')) {
      return
    }
    
    setLoading(true)
    
    try {
      // Remover todos os candidatos
      const { error: candidatesError } = await supabase
        .from('candidates')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000') // Deletar todos
      
      if (candidatesError) {
        throw new Error(`Erro ao limpar candidatos: ${candidatesError.message}`)
      }
      
      // Tentar limpar tabela results se existir
      try {
        await supabase
          .from('results')
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000')
      } catch (resultsError) {
        console.log('Tabela results não existe ou erro ao acessar:', resultsError.message)
      }
      
      showMessage('Todos os dados foram removidos com sucesso!', 'success')
      
    } catch (error) {
      console.error('Erro ao limpar dados:', error)
      showMessage(`Erro ao limpar dados: ${error.message}`, 'error')
    } finally {
      setLoading(false)
    }
  }

  // Função para verificar configuração do Supabase
  const handleCheckSupabaseConfig = async () => {
    setLoading(true)
    
    try {
      console.log('🔍 [Configurações] Verificando configuração do Supabase...')
      
      // Verificar sessão
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError || !session) {
        throw new Error('Sessão não encontrada')
      }
      console.log('✅ [Configurações] Sessão válida:', session.user.id)
      
      // Testar conexão com o banco
      const { data, error } = await supabase
        .from('candidates')
        .select('count')
        .limit(1)
      
      if (error) {
        throw new Error(`Erro de conexão: ${error.message}`)
      }
      console.log('✅ [Configurações] Conexão com banco OK')
      
      // Verificar permissões de leitura
      const { data: readTest, error: readError } = await supabase
        .from('candidates')
        .select('id, name, email')
        .limit(1)
      
      if (readError) {
        console.log('⚠️ [Configurações] Erro na leitura:', readError.message)
      } else {
        console.log('✅ [Configurações] Permissão de leitura OK')
      }
      
      // Verificar permissões de escrita (tentar inserir um registro de teste)
      const testData = {
        name: 'TESTE_PERMISSAO_' + Date.now(),
        email: 'teste_' + Date.now() + '@teste.com',
        score: 50,
        status: 'TESTE',
        created_at: new Date().toISOString()
      }
      
      const { data: insertTest, error: insertError } = await supabase
        .from('candidates')
        .insert([testData])
        .select()
      
      if (insertError) {
        console.log('⚠️ [Configurações] Erro na inserção (pode ser RLS):', insertError.message)
      } else {
        console.log('✅ [Configurações] Permissão de inserção OK')
        
        // Se conseguiu inserir, tentar remover
        if (insertTest && insertTest[0]) {
          const { error: deleteTestError } = await supabase
            .from('candidates')
            .delete()
            .eq('id', insertTest[0].id)
          
          if (deleteTestError) {
            console.log('⚠️ [Configurações] Erro na remoção (pode ser RLS):', deleteTestError.message)
          } else {
            console.log('✅ [Configurações] Permissão de remoção OK')
          }
        }
      }
      
      // Verificar variáveis de ambiente
      const config = {
        supabaseUrl: process.env.REACT_APP_SUPABASE_URL || 'Configurada',
        supabaseAnonKey: process.env.REACT_APP_SUPABASE_ANON_KEY ? 'Configurada' : 'Não configurada'
      }
      
      const message = `Configuração do Supabase: OK! URL: ${config.supabaseUrl}, Chave: ${config.supabaseAnonKey}`
      showMessage(message, 'success')
      
      console.log('🎉 [Configurações] Verificação concluída:', message)
      
    } catch (error) {
      console.error('❌ [Configurações] Erro na verificação:', error)
      showMessage(`Erro na configuração: ${error.message}`, 'error')
    } finally {
      setLoading(false)
    }
  }




  if (role !== 'admin') {
    return (
      <div className="min-h-[50vh] flex items-center justify-center relative overflow-hidden">
        <div className="text-center relative z-10">
          <div className="w-24 h-24 bg-gradient-to-br from-destructive/20 to-destructive/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-destructive/20 shadow-glow">
            <XCircle size={48} className="text-destructive" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-3">Acesso Negado</h2>
          <p className="text-muted-foreground text-lg mb-6">Você não tem permissão para acessar esta página.</p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="btn-primary-modern px-8 py-3"
          >
            Voltar ao Dashboard
          </button>
        </div>
      </div>
    )
  }

  const getMessageIcon = () => {
    switch (messageType) {
      case 'success':
        return <CheckCircle size={20} className="text-success" />
      case 'error':
        return <XCircle size={20} className="text-destructive" />
      case 'warning':
        return <AlertTriangle size={20} className="text-warning" />
      default:
        return <Info size={20} className="text-info" />
    }
  }

  const getMessageStyles = () => {
    switch (messageType) {
      case 'success':
        return 'bg-gradient-to-r from-success/10 to-success/5 border-success/20 text-success'
      case 'error':
        return 'bg-gradient-to-r from-destructive/10 to-destructive/5 border-destructive/20 text-destructive'
      case 'warning':
        return 'bg-gradient-to-r from-warning/10 to-warning/5 border-warning/20 text-warning'
      default:
        return 'bg-gradient-to-r from-info/10 to-info/5 border-info/20 text-info'
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Sidebar gerenciado pelo LayoutWithSidebar */}
      <div className="max-w-6xl mx-auto space-y-8 p-6 relative z-10">
        {/* Header da página */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/10 rounded-3xl mb-4 border border-primary/20 shadow-glow">
            <Settings size={40} className="text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
            Configurações do Sistema
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Gerencie usuários, candidatos de teste e operações do sistema de forma segura e intuitiva
          </p>
        </div>
        
        {/* Adicionar Usuário */}
        <div className="card-modern p-8 space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center border border-primary/20">
              <UserPlus size={24} className="text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Adicionar Usuário</h2>
              <p className="text-muted-foreground">Crie novos usuários com diferentes níveis de acesso</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Nome completo</label>
              <input
                type="text"
                placeholder="Digite o nome completo"
                value={name}
                onChange={e => setName(e.target.value)}
                className="input-modern w-full h-12"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email</label>
              <input
                type="email"
                placeholder="exemplo@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="input-modern w-full h-12"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Função</label>
              <select
                value={roleSelect}
                onChange={e => setRoleSelect(e.target.value)}
                className="input-modern w-full h-12 text-sm"
              >
                <option value="rh">RH</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
          </div>
          
          <button
            onClick={handleAddUser}
            disabled={loading}
            className="btn-primary-modern px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-3 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                <span>Adicionando...</span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <UserPlus size={18} />
                <span>Adicionar Usuário</span>
              </div>
            )}
          </button>
        </div>

        {/* Remover Usuário */}
        <div className="card-modern p-8 space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-destructive/20 to-destructive/10 rounded-2xl flex items-center justify-center border border-destructive/20">
              <UserMinus size={24} className="text-destructive" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Remover Usuário</h2>
              <p className="text-muted-foreground">Remova usuários do sistema de forma segura</p>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium text-foreground">Email do usuário</label>
              <input
                type="email"
                placeholder="exemplo@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="input-modern w-full h-12"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleDeleteUser}
                disabled={loading}
                className="btn-warning-modern px-8 py-3 h-12 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-3 border-warning-foreground/30 border-t-warning-foreground rounded-full animate-spin" />
                    <span>Removendo...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <UserMinus size={18} />
                    <span>Remover Usuário</span>
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Gerenciar Candidatos de Teste */}
        <div className="card-modern p-8 space-y-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-info/20 to-info/10 rounded-2xl flex items-center justify-center border border-info/20">
              <Users size={24} className="text-info" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Gerenciar Candidatos de Teste</h2>
              <p className="text-muted-foreground">Adicione e remova candidatos para testes do sistema</p>
            </div>
          </div>
          
          {/* Adicionar Candidato de Teste */}
          <div className="space-y-6 p-6 border border-border/50 rounded-2xl bg-gradient-to-br from-muted/30 to-muted/10 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-success/20 to-success/10 rounded-xl flex items-center justify-center border border-success/20">
                <Plus size={20} className="text-success" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Adicionar Candidato de Teste</h3>
              <p className="text-sm text-muted-foreground">Apenas nome e email são necessários. O candidato receberá um link para realizar o teste.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Nome completo</label>
                <input
                  type="text"
                  placeholder="Digite o nome completo"
                  value={testCandidateName}
                  onChange={e => setTestCandidateName(e.target.value)}
                  className="input-modern w-full h-11"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Email</label>
                <input
                  type="email"
                  placeholder="exemplo@email.com"
                  value={testCandidateEmail}
                  onChange={e => setTestCandidateEmail(e.target.value)}
                  className="input-modern w-full h-11"
                />
              </div>
            </div>
            
            <button
              onClick={handleAddTestCandidate}
              disabled={loading}
              className="btn-success-modern px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-3 border-success-foreground/30 border-t-success-foreground rounded-full animate-spin" />
                  <span>Adicionando...</span>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Plus size={18} />
                  <span>Adicionar Candidato de Teste</span>
                </div>
              )}
            </button>

            {/* Exibir link gerado */}
            {generatedLink && (
              <div className="mt-4 p-4 bg-gradient-to-r from-success/10 to-success/5 border border-success/20 rounded-xl">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-success/20 rounded-lg flex items-center justify-center">
                    <CheckCircle size={16} className="text-success" />
                  </div>
                  <h4 className="font-semibold text-success">Link de Acesso Gerado</h4>
                </div>
                <div className="space-y-3">
                  <div className="p-3 bg-background/50 rounded-lg border border-border/50">
                    <p className="text-sm text-muted-foreground mb-1">Link para o candidato:</p>
                    <p className="text-sm font-mono break-all text-foreground">{generatedLink}</p>
                  </div>
                  <button
                    onClick={copyLinkToClipboard}
                    className="btn-info-modern px-4 py-2 text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <Copy size={16} />
                      <span>Copiar Link</span>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Remover Candidato de Teste */}
          <div className="space-y-6 p-6 border border-border/50 rounded-2xl bg-gradient-to-br from-muted/30 to-muted/10 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-warning/20 to-warning/10 rounded-xl flex items-center justify-center border border-warning/20">
                <Minus size={20} className="text-warning" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Remover Candidato de Teste</h3>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 space-y-2">
                <label className="text-sm font-medium text-foreground">Email do candidato</label>
                <input
                  type="email"
                  placeholder="exemplo@email.com"
                  value={removeTestCandidateEmail}
                  onChange={e => setRemoveTestCandidateEmail(e.target.value)}
                  className="input-modern w-full h-11"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleRemoveTestCandidate}
                  disabled={loading}
                  className="btn-warning-modern px-6 py-3 h-11 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-3 border-warning-foreground/30 border-t-warning-foreground rounded-full animate-spin" />
                      <span>Removendo...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <Minus size={18} />
                      <span>Remover Candidato de Teste</span>
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Operações do Sistema */}
        <div className="card-modern p-8 space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-secondary/20 to-secondary/10 rounded-2xl flex items-center justify-center border border-secondary/20">
              <Database size={24} className="text-secondary-foreground" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Operações do Sistema</h2>
              <p className="text-muted-foreground">Execute operações de manutenção e backup do sistema</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <button
              onClick={handleBackup}
              disabled={loading}
              className="btn-info-modern px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-3 border-info-foreground/30 border-t-info-foreground rounded-full animate-spin" />
                  <span>Fazendo backup...</span>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Database size={18} />
                  <span>Fazer Backup</span>
                </div>
              )}
            </button>
            
            <button
              onClick={handlePurge}
              disabled={loading}
              className="btn-destructive px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-3 border-destructive-foreground/30 border-t-destructive-foreground rounded-full animate-spin" />
                  <span>Limpando...</span>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Trash2 size={18} />
                  <span>Limpar Dados</span>
                </div>
              )}
            </button>

          </div>
        </div>

        {/* Mensagens de feedback */}
        {message && (
          <div className={`p-6 rounded-2xl border backdrop-blur-sm ${getMessageStyles()}`}>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-current/20 rounded-xl flex items-center justify-center">
                {getMessageIcon()}
              </div>
              <div className="flex-1">
                <p className="font-medium text-lg">{message}</p>
              </div>
              <button
                onClick={() => setMessage(null)}
                className="text-current/70 hover:text-current transition-colors duration-200 p-2 rounded-lg hover:bg-current/10"
                title="Fechar"
              >
                <XCircle size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
