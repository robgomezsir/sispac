import React, { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'
import { useNavigate } from 'react-router-dom'

export default function Configuracoes(){
  const { user, role } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [roleSelect, setRoleSelect] = useState('rh')
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

  async function callApi(route, body){
    setLoading(true)
    setMessage(null)
    
    try {
      const res = await fetch(`/api/${route}`, {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify(body || {})
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Erro na operação')
      }
      
      setMessage(data.message || 'Operação realizada com sucesso!')
      setMessageType('success')
      
      // Limpar campos após sucesso
      if (route === 'addUser') {
        setEmail('')
        setName('')
        setRoleSelect('rh')
      }
      
    } catch (e) {
      setMessage('Erro: ' + e.message)
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  const handleAddUser = () => {
    if (!email.trim() || !name.trim()) {
      setMessage('Por favor, preencha todos os campos obrigatórios.')
      setMessageType('error')
      return
    }
    
    if (!email.includes('@')) {
      setMessage('Por favor, insira um email válido.')
      setMessageType('error')
      return
    }
    
    callApi('addUser', { name: name.trim(), email: email.trim().toLowerCase(), role: roleSelect })
  }

  const handleDeleteUser = () => {
    if (!email.trim()) {
      setMessage('Por favor, insira o email do usuário a ser removido.')
      setMessageType('error')
      return
    }
    
    if (confirm(`Tem certeza que deseja remover o usuário ${email}?`)) {
      callApi('deleteUser', { email: email.trim().toLowerCase() })
    }
  }

  const handleBackup = () => {
    callApi('backup', {})
  }

  const handlePurge = () => {
    if (confirm('⚠️ ATENÇÃO: Esta operação irá APAGAR TODOS os dados do sistema. Esta ação não pode ser desfeita. Tem certeza?')) {
      if (confirm('Digite "CONFIRMAR" para prosseguir:')) {
        callApi('purge', {})
      }
    }
  }

  const handleCheckSupabaseConfig = () => {
    callApi('checkSupabaseConfig', {})
  }

  if (role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">🚫</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Acesso Negado</h2>
          <p className="text-gray-600 mb-4">Você não tem permissão para acessar esta página.</p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="btn-primary"
          >
            Voltar ao Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">⚙️ Painel de Configurações</h1>
          <p className="text-gray-600">Gerencie usuários e configurações do sistema</p>
        </div>
        <div className="text-sm text-gray-500">
          Logado como: <span className="font-medium">{user?.email}</span>
        </div>
      </div>

      {/* Mensagens */}
      {message && (
        <div className={`p-4 rounded-lg border ${
          messageType === 'success' 
            ? 'bg-green-50 border-green-200 text-green-700' 
            : messageType === 'error'
            ? 'bg-red-50 border-red-200 text-red-700'
            : 'bg-blue-50 border-blue-200 text-blue-700'
        }`}>
          {message}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Gerenciar Usuários */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            👥 Gerenciar Usuários do Dashboard
          </h3>
          
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <label className="label">Nome Completo *</label>
                <input 
                  className="input" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  placeholder="Nome do usuário"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="label">Email *</label>
                <input 
                  className="input" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  placeholder="email@exemplo.com"
                  type="email"
                  disabled={loading}
                />
              </div>
            </div>
            
            <div>
              <label className="label">Papel/Função</label>
              <select 
                className="input" 
                value={roleSelect} 
                onChange={e => setRoleSelect(e.target.value)}
                disabled={loading}
              >
                <option value="rh">👤 Usuário RH</option>
                <option value="admin">👑 ADMIN GERAL</option>
              </select>
            </div>
            
            <div className="flex gap-2 flex-wrap">
              <button 
                className="btn-primary flex-1" 
                disabled={loading || !email.trim() || !name.trim()} 
                onClick={handleAddUser}
              >
                {loading ? '⏳ Adicionando...' : '➕ Adicionar Usuário'}
              </button>
              <button 
                className="btn-danger" 
                disabled={loading || !email.trim()} 
                onClick={handleDeleteUser}
              >
                {loading ? '⏳ Removendo...' : '🗑️ Remover Usuário'}
              </button>
            </div>
          </div>
        </div>

        {/* Configuração do Supabase */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            🔧 Configuração do Supabase
          </h3>
          
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-700">
                <strong>⚠️ Importante:</strong> Se os convites estão redirecionando para o Vercel em vez do SisPAC, verifique a configuração de URLs.
              </p>
            </div>
            
            <div className="flex gap-2 flex-wrap">
              <button 
                className="btn-secondary flex-1" 
                disabled={loading} 
                onClick={handleCheckSupabaseConfig}
              >
                {loading ? '⏳ Verificando...' : '🔍 Verificar Configuração'}
              </button>
            </div>
            
            <div className="text-xs text-gray-600">
              <p><strong>URLs que devem estar configuradas:</strong></p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Site URL: https://sispac-kfs8jdgkd-rob-gomezs-projects.vercel.app</li>
                <li>Redirect URL: https://sispac-kfs8jdgkd-rob-gomezs-projects.vercel.app/welcome</li>
                <li className="text-yellow-600 font-medium">⚠️ Use /welcome ou /join em vez de /auth/confirm</li>
                <li className="text-green-600 font-medium">🆕 Teste: /welcome ou /join</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Manutenção de Dados */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          🛠️ Manutenção de Dados
        </h3>
        
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-700">
              <strong>💡 Dica:</strong> Faça backup antes de executar operações de manutenção.
            </p>
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <button 
              className="btn-secondary flex-1" 
              disabled={loading} 
              onClick={handleBackup}
            >
              {loading ? '⏳ Preparando...' : '💾 Download Backup'}
            </button>
            <button 
              className="btn-danger" 
              disabled={loading} 
              onClick={handlePurge}
            >
              {loading ? '⏳ Limpando...' : '⚠️ Limpar Tudo'}
            </button>
          </div>
        </div>
      </div>

      {/* Informações do Sistema */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            ℹ️ Informações do Sistema
          </h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Usuário Atual:</span>
            <p className="text-gray-600">{user?.email}</p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Função:</span>
            <p className="text-gray-600">{role === 'admin' ? '👑 Administrador' : '👤 Usuário RH'}</p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Status:</span>
            <p className="text-green-600">✅ Ativo</p>
          </div>
        </div>
      </div>
    </div>
  )
}
