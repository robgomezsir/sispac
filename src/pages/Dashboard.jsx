import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { downloadXlsx } from '../utils/download'
import Modal from '../components/Modal.jsx'

export default function Dashboard(){
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [current, setCurrent] = useState(null)
  const [columnsToExport, setColumnsToExport] = useState(['name','email','score','status'])

  async function load(){
    console.log("📊 [Dashboard] Carregando dados...")
    setLoading(true)
    
    try {
      const { data, error } = await supabase.from('candidates').select('*').order('created_at', { ascending: false })
      console.log("📊 [Dashboard] Resultado da consulta:", { data, error, count: data?.length })
      
      if(!error) {
        setRows(data || [])
        console.log("✅ [Dashboard] Dados carregados com sucesso:", data?.length, "registros")
      } else {
        console.error("❌ [Dashboard] Erro ao carregar dados:", error)
      }
    } catch(err) {
      console.error("❌ [Dashboard] Exceção ao carregar dados:", err)
    } finally {
      setLoading(false)
      console.log("📊 [Dashboard] Carregamento finalizado")
    }
  }
  useEffect(()=>{ load() }, [])

  const filtered = rows.filter(r => {
    const s = (r.name + ' ' + r.email + ' ' + r.status).toLowerCase()
    return s.includes(q.toLowerCase())
  })

  function exportAll(){
    downloadXlsx('candidatos.xlsx', filtered, columnsToExport)
  }
  function exportOne(row){
    downloadXlsx(`candidato_${row.id}.xlsx`, [row], columnsToExport)
  }

  return (
    <div>
      <div className="flex items-end justify-between mb-4">
        <div className="flex gap-2">
          <input className="input" placeholder="Buscar..." value={q} onChange={e=>setQ(e.target.value)}/>
          <button className="btn-secondary" onClick={load}>Atualizar</button>
        </div>
        <div className="flex items-center gap-2">
          <label className="label">Exportar colunas:</label>
          <select multiple className="input h-24" value={columnsToExport}
            onChange={(e)=> setColumnsToExport(Array.from(e.target.selectedOptions).map(o=>o.value))}>
            {['id','name','email','score','status','created_at'].map(c=>(
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <button className="btn-primary" onClick={exportAll}>Download consolidado (XLSX)</button>
        </div>
      </div>

      {loading ? <div className="card">Carregando...</div> : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(row => (
            <div key={row.id} className="card">
              <div className="flex justify-between">
                <div>
                  <div className="font-semibold">{row.name}</div>
                  <div className="text-sm text-gray-600">{row.email}</div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold">{row.score}</div>
                  <div className="text-xs text-gray-600">{row.status}</div>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <button className="btn-secondary" onClick={()=>setCurrent(row)}>Detalhar</button>
                <button className="btn-primary" onClick={()=>exportOne(row)}>Download</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!current} onClose={()=>setCurrent(null)} title="Detalhamento do Candidato">
        {current ? <CandidateDetails id={current.id}/> : null}
      </Modal>
    </div>
  )
}

function CandidateDetails({ id }){
  const [details, setDetails] = React.useState(null)
  React.useEffect(()=>{
    (async ()=>{
      const { data, error } = await 
        (await import('../lib/supabase')).supabase
          .from('results').select('*').eq('candidate_id', id).single()
      if(!error) setDetails(data)
    })()
  }, [id])
  if(!details) return <div>Carregando...</div>
  return (
    <pre className="bg-gray-50 p-4 rounded-xl whitespace-pre-wrap">{details.details}</pre>
  )
}
