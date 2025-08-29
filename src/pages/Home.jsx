import React, { useState } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'
import { Link, useNavigate } from 'react-router-dom'

export default function Home(){
  const { user, signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState(null)
  const navigate = useNavigate()

  async function onSubmit(e){
    e.preventDefault()
    setErr(null); setLoading(true)
    try{
      await signIn(email, password)
      navigate('/dashboard')
    }catch(e){
      setErr(e.message)
    }finally{ setLoading(false) }
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6 items-center">
      <div className="card">
        <h1 className="text-2xl font-bold mb-2">Bem-vindo ao SisPAC</h1>
        <p className="text-gray-600 mb-6">
          Sistema de avaliação comportamental. Faça login para acessar o Dashboard do RH.
        </p>
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="label">Email</label>
            <input className="input" value={email} onChange={e=>setEmail(e.target.value)} required/>
          </div>
          <div>
            <label className="label">Senha</label>
            <input type="password" className="input" value={password} onChange={e=>setPassword(e.target.value)} required/>
          </div>
          <button className="btn-primary w-full" disabled={loading}>
            {loading? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="mt-6 text-sm text-gray-600">
          Não tem acesso ao dashboard? Você pode <Link className="text-blue-600" to="/form">realizar o teste</Link>.
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold mb-2">Acesso rápido</h2>
        <ul className="list-disc list-inside text-gray-700 space-y-1">
          <li>ADMIN GERAL: <b>robgomez.sir@gmail.com</b></li>
          <li>Senha inicial: <b>admin1630</b> (configure no Supabase)</li>
          <li>Ou acesse apenas o formulário sem login.</li>
        </ul>
      </div>
    </div>
  )
}
