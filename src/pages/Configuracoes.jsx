import React, { useState } from 'react'

export default function Configuracoes(){
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState('rh')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)

  async function callApi(route, body){
    setLoading(true); setMessage(null)
    try{
      const res = await fetch(`/api/${route}`, {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify(body||{})
      })
      const data = await res.json()
      if(!res.ok) throw new Error(data.error || 'Erro')
      setMessage(data.message || 'OK')
    }catch(e){
      setMessage('Erro: ' + e.message)
    }finally{
      setLoading(false)
    }
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="card">
        <h3 className="font-semibold mb-3">Gerenciar Usuários do Dashboard</h3>
        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <label className="label">Nome</label>
            <input className="input" value={name} onChange={e=>setName(e.target.value)} placeholder="Nome do usuário"/>
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input" value={email} onChange={e=>setEmail(e.target.value)} placeholder="email@exemplo.com"/>
          </div>
        </div>
        <div className="mt-3">
          <label className="label">Papel</label>
          <select className="input" value={role} onChange={e=>setRole(e.target.value)}>
            <option value="rh">Usuário RH</option>
            <option value="admin">ADMIN GERAL</option>
          </select>
        </div>
        <div className="mt-4 flex gap-2">
          <button className="btn-primary" disabled={loading} onClick={()=>callApi('addUser', { name, email, role })}>Adicionar</button>
          <button className="btn-danger" disabled={loading} onClick={()=>callApi('deleteUser', { email })}>Remover</button>
        </div>
      </div>

      <div className="card">
        <h3 className="font-semibold mb-3">Manutenção de Dados</h3>
        <div className="flex gap-2 flex-wrap">
          <button className="btn-secondary" disabled={loading} onClick={()=>callApi('backup', {})}>Download backup</button>
          <button className="btn-danger" disabled={loading} onClick={()=>callApi('purge', {})}>Limpar tudo</button>
        </div>
      </div>

      {message && <div className="card col-span-full">{message}</div>}
    </div>
  )
}
