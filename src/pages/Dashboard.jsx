import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import { downloadXlsx } from '../utils/download'
import Modal from '../components/Modal.jsx'
import { useDebounce } from '../hooks/useDebounce.js'
import { useAuth } from '../hooks/useAuth.jsx'
import { Link } from 'react-router-dom'
import { 
  Settings, 
  BarChart3, 
  Users, 
  FileText, 
  Search,
  RefreshCw,
  Download,
  Eye,
  TrendingUp,
  TrendingDown,
  Minus,
  Filter,
  MoreHorizontal
} from 'lucide-react'
import { cn } from '../lib/utils'

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

  // Estatísticas calculadas
  const stats = useMemo(() => {
    const total = filtered.length
    const superou = filtered.filter(r => r.status === 'SUPEROU A EXPECTATIVA').length
    const acima = filtered.filter(r => r.status === 'ACIMA DA EXPECTATIVA').length
    const dentro = filtered.filter(r => r.status === 'DENTRO DA EXPECTATIVA').length
    
    return { total, superou, acima, dentro }
  }, [filtered])

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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'SUPEROU A EXPECTATIVA':
        return <TrendingUp size={16} className="text-green-600" />
      case 'ACIMA DA EXPECTATIVA':
        return <TrendingUp size={16} className="text-blue-600" />
      case 'DENTRO DA EXPECTATIVA':
        return <Minus size={16} className="text-yellow-600" />
      default:
        return <Minus size={16} className="text-gray-600" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'SUPEROU A EXPECTATIVA':
        return 'bg-green-50 text-green-700 border-green-200'
      case 'ACIMA DA EXPECTATIVA':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'DENTRO DA EXPECTATIVA':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  return (
    <div className="space-y-8">
      {/* Header do Dashboard */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <BarChart3 size={32} className="text-primary" />
            Dashboard de Candidatos
          </h1>
          <p className="text-muted-foreground text-lg">
            Gerencie e visualize os resultados dos testes comportamentais
          </p>
        </div>
        
        {/* Ações rápidas para admin */}
        {role === 'admin' && (
          <div className="flex flex-wrap gap-3">
            <Link 
              to="/config"
              className="btn-outline flex items-center gap-2"
            >
              <Settings size={16} />
              Configurações
            </Link>
            <Link 
              to="/api"
              className="btn-outline flex items-center gap-2"
            >
              <BarChart3 size={16} />
              API Panel
            </Link>
          </div>
        )}
      </div>

      {/* Estatísticas rápidas */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total de Candidatos</p>
              <p className="text-3xl font-bold text-foreground">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Users size={24} className="text-primary" />
            </div>
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Superaram Expectativa</p>
              <p className="text-3xl font-bold text-green-600">{stats.superou}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp size={24} className="text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Acima da Expectativa</p>
              <p className="text-3xl font-bold text-blue-600">{stats.acima}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp size={24} className="text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Dentro da Expectativa</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.dentro}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Minus size={24} className="text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Controles de busca e exportação */}
      <div className="card p-6">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <input 
                className="input pl-10" 
                placeholder="Buscar candidatos..." 
                value={q} 
                onChange={handleSearchChange}
              />
            </div>
            <button 
              className="btn-outline flex items-center gap-2" 
              onClick={load} 
              disabled={loading}
            >
              {loading ? (
                <RefreshCw size={16} className="animate-spin" />
              ) : (
                <RefreshCw size={16} />
              )}
              Atualizar
            </button>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center gap-2">
              <label className="label text-sm">Colunas para exportar:</label>
              <select 
                multiple 
                className="input h-24 min-w-[200px]" 
                value={columnsToExport}
                onChange={handleColumnsChange}
              >
                {['id','name','email','score','status','created_at'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <button 
              className="btn-primary flex items-center gap-2" 
              onClick={exportAll}
              disabled={filtered.length === 0}
            >
              <Download size={16} />
              Exportar Todos (XLSX)
            </button>
          </div>
        </div>

        {/* Conteúdo dos candidatos */}
        {!initialLoad ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground text-lg">Clique em "Atualizar" para carregar os dados</div>
          </div>
        ) : loading ? (
          <div className="text-center py-12">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <RefreshCw size={20} className="animate-spin" />
              Carregando candidatos...
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground text-lg">
              {q ? 'Nenhum candidato encontrado para esta busca' : 'Nenhum candidato cadastrado'}
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(row => (
              <div key={row.id} className="card p-6 hover:shadow-lg transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{row.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{row.email}</p>
                    <div className={cn(
                      "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border",
                      getStatusColor(row.status)
                    )}>
                      {getStatusIcon(row.status)}
                      {row.status}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">{row.score}</div>
                    <div className="text-xs text-muted-foreground">Pontuação</div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button 
                    className="btn-outline flex-1 flex items-center justify-center gap-2" 
                    onClick={() => openModal(row)}
                  >
                    <Eye size={16} />
                    Detalhar
                  </button>
                  <button 
                    className="btn-primary flex-1 flex items-center justify-center gap-2" 
                    onClick={() => exportOne(row)}
                  >
                    <Download size={16} />
                    Download
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
        <div className="text-muted-foreground">Carregando detalhes...</div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-destructive">❌ {error}</div>
      </div>
    )
  }
  
  if (!details) {
    return (
      <div className="text-center py-8">
        <div className="text-muted-foreground">Nenhum detalhe encontrado</div>
      </div>
    )
  }
  
  return (
    <div className="space-y-4">
      <div className="card p-4">
        <h4 className="font-semibold mb-2">Detalhes da Avaliação</h4>
        <pre className="whitespace-pre-wrap text-sm bg-muted p-3 rounded-md">{details.details}</pre>
      </div>
      
      {details.score && (
        <div className="card p-4">
          <h4 className="font-semibold mb-2">Pontuação</h4>
          <div className="text-2xl font-bold text-primary">{details.score}</div>
        </div>
      )}
    </div>
  )
}
