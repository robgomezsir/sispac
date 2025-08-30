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
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-card text-card-foreground rounded-lg border shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-6">Configurações do Sistema</h1>
        
        {/* Adicionar Usuário */}
        <div className="space-y-4 mb-8">
          <h2 className="text-xl font-semibold">Adicionar Usuário</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Nome completo"
              value={name}
              onChange={e => setName(e.target.value)}
              className="p-3 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground"
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="p-3 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground"
            />
            <select
              value={roleSelect}
              onChange={e => setRoleSelect(e.target.value)}
              className="p-3 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground"
            >
              <option value="rh">RH</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button
            onClick={handleAddUser}
            disabled={loading}
            className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition disabled:opacity-50"
          >
            {loading ? 'Adicionando...' : 'Adicionar Usuário'}
          </button>
        </div>

        {/* Remover Usuário */}
        <div className="space-y-4 mb-8">
          <h2 className="text-xl font-semibold">Remover Usuário</h2>
          <div className="flex gap-4">
            <input
              type="email"
              placeholder="Email do usuário"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="flex-1 p-3 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground"
            />
            <button
              onClick={handleDeleteUser}
              disabled={loading}
              className="bg-destructive text-destructive-foreground px-6 py-3 rounded-lg hover:bg-destructive/90 transition disabled:opacity-50"
            >
              {loading ? 'Removendo...' : 'Remover Usuário'}
            </button>
          </div>
        </div>

        {/* Operações do Sistema */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Operações do Sistema</h2>
          <div className="flex gap-4">
            <button
              onClick={handleBackup}
              disabled={loading}
              className="bg-secondary text-secondary-foreground px-6 py-3 rounded-lg hover:bg-secondary/80 transition disabled:opacity-50"
            >
              {loading ? 'Fazendo backup...' : 'Fazer Backup'}
            </button>
            <button
              onClick={handlePurge}
              disabled={loading}
              className="bg-destructive text-destructive-foreground px-6 py-3 rounded-lg hover:bg-destructive/90 transition disabled:opacity-50"
            >
              {loading ? 'Limpando...' : 'Limpar Dados'}
            </button>
          </div>
        </div>

        {/* Mensagens */}
        {message && (
          <div className={`mt-6 p-4 rounded-lg border ${
            messageType === 'error' 
              ? 'bg-destructive/10 border-destructive/20 text-destructive' 
              : 'bg-green-100 border-green-200 text-green-800'
          }`}>
            {message}
          </div>
        )}
      </div>
    </div>
  )
}
