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
  Copy,
  Eye,
  EyeOff,
  ChevronDown,
  RefreshCw,
  Calendar,
  Clock
} from 'lucide-react'
// Componentes customizados serão criados

export default function Configuracoes(){
  const { user, role } = useAuth()
  const navigate = useNavigate()
  
  // Estados para usuários
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [roleSelect, setRoleSelect] = useState('rh')
  const [temporaryPassword, setTemporaryPassword] = useState('')
  const [showTemporaryPassword, setShowTemporaryPassword] = useState(false)
  
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
  
  // Estados para lista de usuários
  const [users, setUsers] = useState([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [usersExpanded, setUsersExpanded] = useState(false)

  // Verificar se o usuário tem permissão (admin ou rh)
  useEffect(() => {
    if (role !== 'admin' && role !== 'rh') {
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

  // Função para buscar usuários cadastrados
  const loadUsers = async () => {
    setUsersLoading(true)
    
    try {
      console.log('🔍 [Configurações] Buscando usuários cadastrados...')
      
      // Buscar usuários da tabela profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (profilesError) {
        throw new Error(`Erro ao buscar usuários: ${profilesError.message}`)
      }
      
      console.log('✅ [Configurações] Usuários carregados:', profilesData?.length || 0)
      setUsers(profilesData || [])
      
    } catch (error) {
      console.error('❌ [Configurações] Erro ao buscar usuários:', error)
      showMessage(`Erro ao carregar usuários: ${error.message}`, 'error')
    } finally {
      setUsersLoading(false)
    }
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

  // Função para copiar senha temporária para área de transferência
  const copyPasswordToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(temporaryPassword)
      showMessage('Senha temporária copiada para a área de transferência!', 'success')
    } catch (error) {
      console.error('❌ [Configurações] Erro ao copiar senha:', error)
      showMessage('Erro ao copiar senha. Tente novamente.', 'error')
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
      
      // Capturar senha temporária se disponível
      if (result.temporaryPassword) {
        setTemporaryPassword(result.temporaryPassword)
        setShowTemporaryPassword(true)
        showMessage(result.message || `Usuário "${name.trim()}" criado com sucesso! Senha temporária gerada.`, 'success')
      } else {
        showMessage(result.message || `Usuário "${name.trim()}" criado com sucesso!`, 'success')
      }
      
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




  if (role !== 'admin' && role !== 'rh') {
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
            {role === 'admin' ? (
              <Settings size={40} className="text-primary" />
            ) : (
              <Users size={40} className="text-primary" />
            )}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
            {role === 'admin' ? 'Configurações do Sistema' : 'Gerenciamento de Candidatos'}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {role === 'admin' 
              ? 'Gerencie usuários, candidatos de teste e operações do sistema de forma segura e intuitiva'
              : 'Gerencie candidatos de teste para avaliações comportamentais'
            }
          </p>
        </div>
        
        {/* Adicionar Usuário - Admin apenas */}
        {role === 'admin' && (
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
                <div className="select-container">
                  <select
                    value={roleSelect}
                    onChange={e => setRoleSelect(e.target.value)}
                    className="input-modern h-12 text-sm sm:text-base align-top"
                    style={{ fontSize: 'clamp(0.875rem, 2.5vw, 1rem)' }}
                  >
                    <option value="rh">RH</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
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

            {/* Exibir senha temporária */}
            {showTemporaryPassword && temporaryPassword && (
              <div className="mt-6 p-6 bg-gradient-to-r from-warning/10 to-warning/5 border border-warning/20 rounded-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-warning/20 rounded-lg flex items-center justify-center">
                    <AlertTriangle size={16} className="text-warning" />
                  </div>
                  <h4 className="font-semibold text-warning">Senha Temporária Gerada</h4>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-background/50 rounded-lg border border-border/50">
                    <p className="text-sm text-muted-foreground mb-2">Senha temporária para o usuário:</p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 p-3 bg-muted/50 rounded-lg border border-border/30">
                        <p className="text-lg font-mono text-foreground">
                          {showTemporaryPassword ? temporaryPassword : '••••••'}
                        </p>
                      </div>
                      <button
                        onClick={() => setShowTemporaryPassword(!showTemporaryPassword)}
                        className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/50"
                        title={showTemporaryPassword ? "Ocultar senha" : "Mostrar senha"}
                      >
                        {showTemporaryPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={copyPasswordToClipboard}
                      className="btn-info-modern px-4 py-2 text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <Copy size={16} />
                        <span>Copiar Senha</span>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        setShowTemporaryPassword(false)
                        setTemporaryPassword('')
                      }}
                      className="btn-secondary-modern px-4 py-2 text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <XCircle size={16} />
                        <span>Fechar</span>
                      </div>
                    </button>
                  </div>
                  <div className="p-3 bg-info/10 border border-info/20 rounded-lg">
                    <p className="text-sm text-info">
                      <strong>Importante:</strong> Esta é uma senha temporária. O usuário será redirecionado para redefinir a senha no primeiro login.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Lista de Usuários Cadastrados - Admin apenas */}
        {role === 'admin' && (
          <div className="card-modern p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-info/20 to-info/10 rounded-2xl flex items-center justify-center border border-info/20">
                  <Users size={24} className="text-info" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Usuários Cadastrados</h2>
                  <p className="text-muted-foreground">Visualize todos os usuários do sistema</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  onClick={loadUsers}
                  disabled={usersLoading}
                  className="btn-info-modern px-4 py-2"
                >
                  {usersLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-info-foreground/30 border-t-info-foreground rounded-full animate-spin" />
                      <span>Carregando...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <RefreshCw size={16} />
                      <span>Atualizar</span>
                    </div>
                  )}
                </Button>
                <Button
                  onClick={() => setUsersExpanded(!usersExpanded)}
                  className="btn-secondary-modern px-4 py-2"
                >
                  <div className="flex items-center gap-2">
                    <ChevronDown size={16} className={`transition-transform duration-300 ${usersExpanded ? 'rotate-180' : ''}`} />
                    <span>{usersExpanded ? 'Ocultar' : 'Mostrar'}</span>
                  </div>
                </Button>
              </div>
            </div>

            {/* Conteúdo expansível */}
            {usersExpanded && (
              <div className="mt-6 animate-slide-in-from-top">
                {usersLoading ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-info/20 to-info/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-info/20">
                      <div className="w-8 h-8 border-3 border-info/30 border-t-info rounded-full animate-spin" />
                    </div>
                    <div className="text-muted-foreground font-medium">Carregando usuários...</div>
                  </div>
                ) : users.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-muted/30 to-muted/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-border/50">
                      <Users size={32} className="text-muted-foreground" />
                    </div>
                    <div className="text-muted-foreground font-medium">Nenhum usuário cadastrado</div>
                    <div className="text-sm text-muted-foreground mt-2">Clique em "Atualizar" para carregar os usuários</div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-sm text-muted-foreground mb-4">
                      {users.length} usuário{users.length !== 1 ? 's' : ''} cadastrado{users.length !== 1 ? 's' : ''}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {users.map((user) => (
                        <div 
                          key={user.id} 
                          className="bg-gradient-to-br from-card/80 to-card/40 border border-border/50 rounded-xl p-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-foreground truncate">
                                {user.full_name || 'Nome não informado'}
                              </h3>
                              <p className="text-sm text-muted-foreground truncate">
                                {user.email}
                              </p>
                            </div>
                            <div className="ml-2">
                              <Badge 
                                variant={user.role === 'admin' ? 'default' : 'secondary'}
                                className={user.role === 'admin' ? 'bg-primary/20 text-primary border-primary/30' : ''}
                              >
                                {user.role === 'admin' ? 'Admin' : 'RH'}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="space-y-2 text-xs text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Calendar size={12} />
                              <span>
                                Criado em {new Date(user.created_at).toLocaleDateString('pt-BR')}
                              </span>
                            </div>
                            
                            {user.last_sign_in_at && (
                              <div className="flex items-center gap-2">
                                <Clock size={12} />
                                <span>
                                  Último acesso em {new Date(user.last_sign_in_at).toLocaleDateString('pt-BR')}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Remover Usuário - Desabilitado para RH */}
        {role === 'admin' && (
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
        )}

        {/* Gerenciamento de Candidatos */}
        <div className="card-modern p-8 space-y-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-info/20 to-info/10 rounded-2xl flex items-center justify-center border border-info/20">
              <Users size={24} className="text-info" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                {role === 'admin' ? 'Gerenciamento de Candidatos' : 'Gerenciar Candidatos de Teste'}
              </h2>
              <p className="text-muted-foreground">
                {role === 'admin' 
                  ? 'Adicione e remova candidatos para testes do sistema'
                  : 'Adicione e remova candidatos para avaliações comportamentais'
                }
              </p>
            </div>
          </div>
          
          {/* Adicionar Candidato de Teste */}
          <div className="space-y-6 p-6 border border-border/50 rounded-2xl bg-gradient-to-br from-muted/30 to-muted/10 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-success/20 to-success/10 rounded-xl flex items-center justify-center border border-success/20">
                <Plus size={20} className="text-success" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Adicionar Candidato</h3>
              <p className="text-sm text-muted-foreground">Apenas nome e email são necessários.</p>
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
                  <span>Adicionar Candidato</span>
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
              <h3 className="text-xl font-semibold text-foreground">Remover Candidato</h3>
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
                      <span>Remover Candidato</span>
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Seções desabilitadas para usuários RH */}
        {role === 'rh' && (
          <>
            {/* Adicionar Usuário - Desabilitado para RH */}
            <div className="card-modern p-8 space-y-6 opacity-50 pointer-events-none">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-muted/20 to-muted/10 rounded-2xl flex items-center justify-center border border-muted/20">
                  <UserPlus size={24} className="text-muted-foreground" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-muted-foreground">Adicionar Usuário</h2>
                  <p className="text-muted-foreground">Funcionalidade disponível apenas para administradores</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Nome completo</label>
                  <input
                    type="text"
                    placeholder="Digite o nome completo"
                    disabled
                    className="input-modern w-full h-12 bg-muted/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <input
                    type="email"
                    placeholder="exemplo@email.com"
                    disabled
                    className="input-modern w-full h-12 bg-muted/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Função</label>
                  <div className="select-container">
                    <select
                      disabled
                      className="input-modern h-12 text-sm sm:text-base align-top bg-muted/50"
                      style={{ fontSize: 'clamp(0.875rem, 2.5vw, 1rem)' }}
                    >
                      <option value="rh">RH</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <button
                disabled
                className="btn-primary-modern px-8 py-3 opacity-50 cursor-not-allowed"
              >
                <div className="flex items-center gap-3">
                  <UserPlus size={18} />
                  <span>Adicionar Usuário</span>
                </div>
              </button>
            </div>

            {/* Remover Usuário - Desabilitado para RH */}
            <div className="card-modern p-8 space-y-6 opacity-50 pointer-events-none">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-muted/20 to-muted/10 rounded-2xl flex items-center justify-center border border-muted/20">
                  <UserMinus size={24} className="text-muted-foreground" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-muted-foreground">Remover Usuário</h2>
                  <p className="text-muted-foreground">Funcionalidade disponível apenas para administradores</p>
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Email do usuário</label>
                  <input
                    type="email"
                    placeholder="exemplo@email.com"
                    disabled
                    className="input-modern w-full h-12 bg-muted/50"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    disabled
                    className="btn-warning-modern px-8 py-3 h-12 opacity-50 cursor-not-allowed"
                  >
                    <div className="flex items-center gap-3">
                      <UserMinus size={18} />
                      <span>Remover Usuário</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Operações do Sistema - Desabilitado para RH */}
            <div className="card-modern p-8 space-y-6 opacity-50 pointer-events-none">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-muted/20 to-muted/10 rounded-2xl flex items-center justify-center border border-muted/20">
                  <Database size={24} className="text-muted-foreground" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-muted-foreground">Operações do Sistema</h2>
                  <p className="text-muted-foreground">Funcionalidade disponível apenas para administradores</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4">
                <button
                  disabled
                  className="btn-info-modern px-6 py-3 opacity-50 cursor-not-allowed"
                >
                  <div className="flex items-center gap-3">
                    <Database size={18} />
                    <span>Fazer Backup</span>
                  </div>
                </button>
                
                <button
                  disabled
                  className="btn-destructive px-6 py-3 opacity-50 cursor-not-allowed"
                >
                  <div className="flex items-center gap-3">
                    <Trash2 size={18} />
                    <span>Limpar Dados</span>
                  </div>
                </button>
              </div>
            </div>
          </>
        )}

        {/* Operações do Sistema - Admin apenas */}
        {role === 'admin' && (
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
        )}

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
