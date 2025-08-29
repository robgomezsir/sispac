import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import { downloadXlsx } from '../utils/download'
import Modal from '../components/Modal.jsx'
import { useDebounce } from '../hooks/useDebounce.js'
import { useAuth } from '../hooks/useAuth.jsx'
import { Link } from 'react-router-dom'
import { Settings, BarChart3, Users, FileText } from 'lucide-react'

export default function Dashboard(){
  const { user, role } = useAuth()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [initialLoad, setInitialLoad] = useState(false)
  const [q, setQ] = useState('')
  const [current, setCurrent] = useState(null)
  const [columnsToExport, setColumnsToExport] = useState(['name','email','score','status'])
  
  // Usar hook de debounce personalizado
  const debouncedQuery = useDebounce(q, 300)

  // Memoizar dados filtrados para evitar re-renders
  const filtered = useMemo(() => {
    if (!debouncedQuery.trim()) return rows
    
    return rows.filter(r => {
      const searchText = (r.name + ' ' + r.email + ' ' + r.status).toLowerCase()
      return searchText.includes(debouncedQuery.toLowerCase())
    })
  }, [rows, debouncedQuery])

  // Função de carregamento otimizada
  const load = useCallback(async () => {
    if (loading) return // Evitar múltiplas chamadas simultâneas
    
    setLoading(true)
    
    try {
      const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (!error) {
        setRows(data || [])
        setInitialLoad(true)
      } else {
        console.error("❌ [Dashboard] Erro ao carregar dados:", error)
      }
    } catch (err) {
      console.error("❌ [Dashboard] Exceção ao carregar dados:", err)
    } finally {
      setLoading(false)
    }
  }, [loading])

  // Carregar dados apenas na primeira visita
  useEffect(() => {
    if (!initialLoad) {
      load()
    }
  }, [initialLoad, load])

  // Funções de export otimizadas
  const exportAll = useCallback(() => {
    downloadXlsx('candidatos.xlsx', filtered, columnsToExport)
  }, [filtered, columnsToExport])

  const exportOne = useCallback((row) => {
    downloadXlsx(`candidato_${row.id}.xlsx`, [row], columnsToExport)
  }, [columnsToExport])

  // Função de busca otimizada
  const handleSearchChange = useCallback((e) => {
    setQ(e.target.value)
  }, [])

  // Função de atualizar colunas otimizada
  const handleColumnsChange = useCallback((e) => {
    setColumnsToExport(Array.from(e.target.selectedOptions).map(o => o.value))
  }, [])

  // Função de abrir modal otimizada
  const openModal = useCallback((row) => {
    setCurrent(row)
  }, [])

  // Função de fechar modal otimizada
  const closeModal = useCallback(() => {
    setCurrent(null)
  }, [])

  return (
    <div className="space-y-6">
      {/* Header do Dashboard */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            📊 Dashboard de Candidatos
          </h1>
          <p className="text-gray-600">Gerencie e visualize os resultados dos testes comportamentais</p>
        </div>
        
        {/* Ações rápidas para admin */}
        {role === 'admin' && (
          <div className="flex items-center gap-3">
            <Link 
              to="/config"
              className="btn-secondary flex items-center gap-2 hover:bg-blue-50 hover:text-blue-600 transition-colors"
            >
              <Settings size={16} />
              ⚙️ Configurações
            </Link>
            <Link 
              to="/api"
              className="btn-secondary flex items-center gap-2 hover:bg-green-50 hover:text-green-600 transition-colors"
            >
              <BarChart3 size={16} />
              📊 API Panel
            </Link>
          </div>
        )}
      </div>

      {/* Estatísticas rápidas */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="card text-center">
          <div className="text-2xl font-bold text-blue-600">{filtered.length}</div>
          <div className="text-sm text-gray-600">Total de Candidatos</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-green-600">
            {filtered.filter(r => r.status === 'SUPEROU A EXPECTATIVA').length}
          </div>
          <div className="text-sm text-gray-600">Superaram Expectativa</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {filtered.filter(r => r.status === 'ACIMA DA EXPECTATIVA').length}
          </div>
          <div className="text-sm text-gray-600">Acima da Expectativa</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-gray-600">
            {filtered.filter(r => r.status === 'DENTRO DA EXPECTATIVA').length}
          </div>
          <div className="text-sm text-gray-600">Dentro da Expectativa</div>
        </div>
      </div>

      {/* Controles de busca e exportação */}
      <div className="card">
        <div className="flex items-end justify-between mb-4">
          <div className="flex gap-2">
            <input 
              className="input" 
              placeholder="Buscar candidatos..." 
              value={q} 
              onChange={handleSearchChange}
            />
            <button 
              className="btn-secondary" 
              onClick={load} 
              disabled={loading}
            >
              {loading ? 'Carregando...' : '🔄 Atualizar'}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <label className="label">Exportar colunas:</label>
            <select 
              multiple 
              className="input h-24" 
              value={columnsToExport}
              onChange={handleColumnsChange}
            >
              {['id','name','email','score','status','created_at'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <button 
              className="btn-primary" 
              onClick={exportAll}
              disabled={filtered.length === 0}
            >
              📥 Download consolidado (XLSX)
            </button>
          </div>
        </div>

        {/* Conteúdo dos candidatos */}
        {!initialLoad ? (
          <div className="text-center py-8">
            <div className="text-gray-500">Clique em "Atualizar" para carregar os dados</div>
          </div>
        ) : loading ? (
          <div className="text-center py-8">
            <div className="text-gray-500">Carregando candidatos...</div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-500">
              {q ? 'Nenhum candidato encontrado para esta busca' : 'Nenhum candidato cadastrado'}
            </div>
          </div>
        ) : (
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
                  <button 
                    className="btn-secondary" 
                    onClick={() => openModal(row)}
                  >
                    👁️ Detalhar
                  </button>
                  <button 
                    className="btn-primary" 
                    onClick={() => exportOne(row)}
                  >
                    📥 Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal 
        open={!!current} 
        onClose={closeModal} 
        title="Detalhamento do Candidato"
      >
        {current ? <CandidateDetails id={current.id} /> : null}
      </Modal>
    </div>
  )
}

// Componente otimizado para detalhes do candidato
function CandidateDetails({ id }){
  const [details, setDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  useEffect(() => {
    let isMounted = true
    
    const fetchDetails = async () => {
      if (!id) return
      
      setLoading(true)
      setError(null)
      
      try {
        const { data, error: fetchError } = await supabase
          .from('results')
          .select('*')
          .eq('candidate_id', id)
          .single()
        
        if (!isMounted) return
        
        if (fetchError) {
          setError(fetchError.message)
        } else {
          setDetails(data)
        }
      } catch (err) {
        if (!isMounted) return
        setError('Erro ao buscar detalhes do candidato')
        console.error("Erro ao buscar detalhes:", err)
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }
    
    fetchDetails()
    
    return () => {
      isMounted = false
    }
  }, [id])
  
  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500">Carregando detalhes...</div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500">❌ {error}</div>
      </div>
    )
  }
  
  if (!details) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500">Nenhum detalhe encontrado</div>
      </div>
    )
  }
  
  return (
    <div className="space-y-4">
      <div className="bg-gray-50 p-4 rounded-xl">
        <h4 className="font-semibold mb-2">Detalhes da Avaliação</h4>
        <pre className="whitespace-pre-wrap text-sm">{details.details}</pre>
      </div>
      
      {details.score && (
        <div className="bg-blue-50 p-4 rounded-xl">
          <h4 className="font-semibold mb-2">Pontuação</h4>
          <div className="text-2xl font-bold text-blue-600">{details.score}</div>
        </div>
      )}
    </div>
  )
}
