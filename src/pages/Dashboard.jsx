import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import { downloadXlsx } from '../utils/download'
import Modal from '../components/Modal.jsx'
import { AdvancedFilters } from '../components/AdvancedFilters.jsx'

import { useDebounce } from '../hooks/useDebounce.js'
import { useAuth } from '../hooks/useAuth.jsx'
import { Link } from 'react-router-dom'
import { getStatusProfile } from '../config/statusProfiles.js'
import { classify } from '../utils/scoring.js'
import { getStatusBadge, getStatusIcon, getStatusColor } from '../utils/statusUtils.jsx'
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
  MoreHorizontal,
  Activity,
  Target,
  Award,
  Calendar,
  Plus,
  Filter as FilterIcon,
  ChevronDown,
  ArrowUpDown,
  FileSpreadsheet,
  Sparkles,
  Zap,
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Info,
  Trash2,
  User,
  Code,
  ArrowRight,
  FilterX,
} from 'lucide-react'
import { cn } from '../lib/utils'
import { ModernCard, ModernCardContent, ModernCardHeader, ModernStatCard } from '../ui/ModernCard.jsx'
// Usando elementos HTML padrão temporariamente

export default function Dashboard(){
  const { user, role } = useAuth()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [initialLoad, setInitialLoad] = useState(false)
  const [error, setError] = useState(null)
  const [q, setQ] = useState('')
  const [current, setCurrent] = useState(null)
  


  const [columnsToExport, setColumnsToExport] = useState(['name','email','score','status','behavioral_profile','answers'])
  const [viewMode, setViewMode] = useState('cards') // 'cards' ou 'table'
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' })
  const [advancedFilters, setAdvancedFilters] = useState({
    status: '',
    scoreMin: '',
    scoreMax: '',
    dateFrom: '',
    dateTo: '',
    sortBy: 'created_at'
  })
  const [showExportModal, setShowExportModal] = useState(false)


  
  // Usar hook de debounce personalizado
  const debouncedQuery = useDebounce(q, 300)

  // Memoizar dados filtrados e ordenados para evitar re-renders
  const filtered = useMemo(() => {
    let filteredData = rows

    // Aplicar busca por texto
    if (debouncedQuery.trim()) {
      filteredData = filteredData.filter(r => {
        const searchText = (r.name + ' ' + r.email + ' ' + r.status).toLowerCase()
        return searchText.includes(debouncedQuery.toLowerCase())
      })
    }

    // Aplicar filtros avançados
    if (advancedFilters.status) {
      filteredData = filteredData.filter(r => r.status === advancedFilters.status)
    }

    if (advancedFilters.scoreMin) {
      filteredData = filteredData.filter(r => r.score >= parseInt(advancedFilters.scoreMin))
    }

    if (advancedFilters.scoreMax) {
      filteredData = filteredData.filter(r => r.score <= parseInt(advancedFilters.scoreMax))
    }

    if (advancedFilters.dateFrom) {
      filteredData = filteredData.filter(r => new Date(r.created_at) >= new Date(advancedFilters.dateFrom))
    }

    if (advancedFilters.dateTo) {
      filteredData = filteredData.filter(r => new Date(r.created_at) <= new Date(advancedFilters.dateTo))
    }

    return filteredData
  }, [rows, debouncedQuery, advancedFilters.status, advancedFilters.scoreMin, advancedFilters.scoreMax, advancedFilters.dateFrom, advancedFilters.dateTo])

  const sortedData = useMemo(() => {
    const sorted = [...filtered].sort((a, b) => {
      const aValue = a[sortConfig.key]
      const bValue = b[sortConfig.key]
      
      if (sortConfig.key === 'created_at') {
        return sortConfig.direction === 'asc' 
          ? new Date(aValue) - new Date(bValue)
          : new Date(bValue) - new Date(aValue)
      }
      
      if (typeof aValue === 'string') {
        return sortConfig.direction === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      }
      
      return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue
    })
    
    return sorted
  }, [filtered, sortConfig.key, sortConfig.direction])

  // Estatísticas calculadas
  const stats = useMemo(() => {
    const total = filtered.length
    const superou = filtered.filter(r => r.status === 'SUPEROU A EXPECTATIVA').length
    const acima = filtered.filter(r => r.status === 'ACIMA DA EXPECTATIVA').length
    const dentro = filtered.filter(r => r.status === 'DENTRO DA EXPECTATIVA').length
    const abaixo = filtered.filter(r => r.status === 'ABAIXO DA EXPECTATIVA').length
    
    return { total, superou, acima, dentro, abaixo }
  }, [filtered])

  // Função de carregamento otimizada
  const load = useCallback(async () => {
    if (loading) return // Evitar múltiplas chamadas simultâneas
    
    setLoading(true)
    
    try {
      // Obter token de sessão atual
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        throw new Error('Sessão expirada. Faça login novamente.')
      }
      
      // Usar a API que inclui o perfil comportamental
      const res = await fetch('/api/candidates', {
        headers: { 
          'Authorization': `Bearer ${session.access_token}`
        }
      })
      
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Erro ao carregar dados')
      }
      
      const data = await res.json()
      
      console.log("✅ [Dashboard] Dados carregados com sucesso:", data?.length || 0, "registros")
      console.log("🔍 [Dashboard] Primeiro registro:", data?.[0])
      setRows(data || [])
      setInitialLoad(true)
      setError(null) // Limpar erro anterior
    } catch (err) {
      console.error("❌ [Dashboard] Exceção ao carregar dados:", err)
      setError(`Erro inesperado: ${err.message}`)
      setRows([])
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
  const openExportModal = useCallback(() => {
    setShowExportModal(true)
  }, [])

  const exportAll = useCallback(() => {
    downloadXlsx('candidatos.xlsx', sortedData, columnsToExport)
    setShowExportModal(false)
  }, [sortedData, columnsToExport])

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

  // Função de ordenação
  const handleSort = useCallback((key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }, [])

  // Função para lidar com mudanças nos filtros avançados
  const handleAdvancedFiltersChange = useCallback((newFilters) => {
    setAdvancedFilters(newFilters)
    // Atualizar ordenação se necessário
    if (newFilters.sortBy && newFilters.sortBy !== sortConfig.key) {
      setSortConfig({ key: newFilters.sortBy, direction: 'desc' })
    }
  }, [sortConfig.key])


  // Função para remover candidato
  const handleDeleteCandidate = useCallback(async (candidate) => {
    if (!confirm(`Tem certeza que deseja remover o candidato "${candidate.name}" (${candidate.email})? Esta ação não pode ser desfeita.`)) {
      return
    }

    try {
      setLoading(true)
      
      // Obter token de sessão atual
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        throw new Error('Sessão expirada. Faça login novamente.')
      }
      
      const res = await fetch('/api/deleteCandidate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ email: candidate.email })
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao remover candidato')
      }
      
      // Remover candidato da lista local
      setRows(prevRows => prevRows.filter(r => r.id !== candidate.id))
      
      // Mostrar mensagem de sucesso
      console.log(`Candidato "${candidate.name}" removido com sucesso!`)
      
      // Opcional: mostrar uma notificação mais elegante
      // Você pode implementar um sistema de notificações toast aqui
      
    } catch (error) {
      console.error('Erro ao remover candidato:', error)
      alert(`Erro ao remover candidato: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }, [])

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="space-y-8 p-6 relative z-10">
        {/* Header moderno inspirado nas referências */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Candidatos</h1>
            <p className="text-muted-foreground">Gerencie e visualize os resultados dos testes comportamentais</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={load}
              disabled={loading}
              className="btn-modern-primary inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50">
              <RefreshCw size={16} className={cn("mr-2", loading && "animate-spin")} />
              Atualizar
            </button>
          </div>
        </div>

                        {/* Estatísticas modernas e compactas */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                  <ModernStatCard
                    title="Total"
                    value={stats.total}
                    icon={<Users size={20} className="text-primary" />}
                  />
          
          <ModernStatCard
            title="Superaram"
            value={stats.superou}
            icon={<Star size={20} className="text-success" />}
          />
          
          <ModernStatCard
            title="Acima"
            value={stats.acima}
            icon={<TrendingUp size={20} className="text-info" />}
          />
          
          <ModernStatCard
            title="Dentro"
            value={stats.dentro}
            icon={<Target size={20} className="text-warning" />}
          />
          
          <ModernStatCard
            title="Abaixo"
            value={stats.abaixo}
            icon={<TrendingDown size={20} className="text-muted-foreground" />}
          />
        </div>

        {/* Separador moderno e suave */}
        <div className="w-full mb-8">
          <div className="line-modern-smooth-thick"></div>
        </div>

        {/* Conteúdo principal */}
        <div className="space-y-6 animate-slide-in-from-bottom">
            {/* Filtros Avançados */}
            <AdvancedFilters 
              filters={advancedFilters}
              onFiltersChange={handleAdvancedFiltersChange}
            />

            {/* Controles modernos de busca e filtros */}
            <div className="clay-card mb-6">
              <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-4 flex-1">
                  <div className="relative flex-1 max-w-md">
                    <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                    <input 
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-10 h-10 clay-input" 
                      placeholder="Buscar candidatos..." 
                      value={q} 
                      onChange={handleSearchChange}
                    />
                  </div>
                  
                  <div className="flex rounded-lg border border-border/50 overflow-hidden">
                    <button
                      variant={viewMode === 'cards' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('cards')}
                      className="rounded-r-none"
                    >
                      <FileText size={16} className="mr-2" />
                      Cartões
                    </button>
                    <button
                      variant={viewMode === 'table' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('cards')}
                      className="rounded-l-none"
                    >
                      <BarChart3 size={16} className="mr-2" />
                      Tabela
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="text-sm text-muted-foreground">
                    {filtered.length} candidato{filtered.length !== 1 ? 's' : ''}
                  </div>
                  <button 
                    onClick={openExportModal}
                    disabled={filtered.length === 0}
                    className="btn-modern-primary inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50">
                    <Download size={16} className="mr-2" />
                    Exportar
                  </button>
                </div>
              </div>
              
              {/* Exibição de erro */}
              {error && (
                <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg flex items-center gap-2">
                  <AlertCircle size={16} />
                  <span className="text-sm">{error}</span>
                </div>
              )}
            </div>

            {/* Conteúdo dos candidatos */}
            {!initialLoad ? (
              <div className="text-center py-20">
                <div className="w-24 h-24 bg-gradient-to-br from-muted/30 to-muted/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-border/50 animate-pulse-soft">
                  <Zap size={48} className="text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Pronto para começar</h3>
                <div className="text-muted-foreground text-lg">Clique em "Atualizar" para carregar os dados</div>
              </div>
            ) : loading ? (
              <div className="text-center py-20">
                <div className="flex items-center justify-center gap-4 text-muted-foreground">
                  <RefreshCw size={32} className="animate-spin" />
                  <div className="text-left">
                    <div className="text-lg font-medium">Carregando candidatos...</div>
                    <div className="text-sm text-muted-foreground/70">Aguarde enquanto buscamos os dados</div>
                  </div>
                </div>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-24 h-24 bg-gradient-to-br from-muted/30 to-muted/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-border/50">
                  <Search size={48} className="text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Nenhum resultado encontrado</h3>
                <div className="text-muted-foreground text-lg">
                  {q || Object.values(advancedFilters).some(v => v !== '') 
                    ? 'Tente ajustar os filtros ou termos de busca' 
                    : 'Nenhum candidato cadastrado no sistema'}
                </div>
                {(q || Object.values(advancedFilters).some(v => v !== '')) && (
                  <button 
                    onClick={() => {
                      setQ('')
                      setAdvancedFilters({
                        status: '',
                        scoreMin: '',
                        scoreMax: '',
                        dateFrom: '',
                        dateTo: '',
                        sortBy: 'created_at'
                      })
                    }}
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors border border-input bg-background hover:bg-accent hover:text-accent-foreground mt-4 btn-secondary-modern"
                  >
                    <FilterX size={16} className="mr-2" />
                    Limpar Filtros
                  </button>
                )}
              </div>
            ) : viewMode === 'cards' ? (
              // Visualização em cartões moderna e compacta
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {sortedData.map((row, index) => (
                  <ModernCard 
                    key={row.id} 
                    interactive={true}
                    className="group"
                  >
                    <ModernCardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                            {row.name}
                          </h3>
                        </div>
                        <div className="flex items-center gap-1 ml-2">
                          {getStatusIcon(row.status)}
                        </div>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Pontuação</span>
                          <span className={`text-lg font-bold ${getStatusColor(row.status)}`}>
                            {row.score}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Data</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(row.created_at).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setViewMode('cards')}
                          className="flex-1 h-8 text-xs btn-modern-outline"
                        >
                          <Eye size={14} className="mr-1" />
                          Ver
                        </button>
                        <button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setViewMode('cards')}
                          className="flex-1 h-8 text-xs btn-modern-secondary"
                        >
                          <Download size={14} className="mr-1" />
                          Download
                        </button>
                        <button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setViewMode('cards')}
                          className="flex-1 h-8 text-xs text-destructive hover:text-destructive-foreground hover:bg-destructive hover:border-destructive transition-all duration-200"
                        >
                          <Trash2 size={14} className="mr-1" />
                          Excluir
                        </button>
                      </div>
                    </ModernCardContent>
                  </ModernCard>
                ))}
              </div>
            ) : (
              // Visualização em tabela moderna
              <div className="clay-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border/50">
                        <th className="text-left p-4 font-semibold">Nome</th>
                        <th className="text-left p-4 font-semibold">Email</th>
                        <th className="text-left p-4 font-semibold">Pontuação</th>
                        <th className="text-left p-4 font-semibold">Status</th>
                        <th className="text-left p-4 font-semibold">Data</th>
                        <th className="text-left p-4 font-semibold">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedData.map(row => (
                        <tr key={row.id} className="hover:bg-primary/5 transition-all duration-200 border-b border-border/30 hover:shadow-sm transform-gpu">
                          <td className="p-4 font-medium">{row.name}</td>
                          <td className="p-4 text-muted-foreground">{row.email}</td>
                          <td className="p-4">
                            <span className={`font-bold ${getStatusColor(row.status)}`}>
                              {row.score}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(row.status)}
                              {getStatusBadge(row.status)}
                            </div>
                          </td>
                          <td className="p-4 text-muted-foreground">
                            {new Date(row.created_at).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => setViewMode('cards')}
                                className="h-8 px-3 btn-modern-outline"
                              >
                                <Eye size={14} className="mr-1" />
                                Ver
                              </button>
                              <button 
                                onClick={() => setViewMode('cards')}
                                className="h-8 px-3 btn-modern-secondary"
                              >
                                <Download size={14} className="mr-1" />
                                Download
                              </button>
                              <button 
                                onClick={() => setViewMode('cards')}
                                className="h-8 px-3 text-destructive hover:text-destructive-foreground hover:bg-destructive hover:border-destructive transition-all duration-200"
                              >
                                <Trash2 size={14} className="mr-1" />
                                Excluir
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
        </div>

        {/* Modal de detalhes do candidato */}
        {current && (
          <Modal
            open={!!current}
            onClose={() => setCurrent(null)}
            title="Detalhes do Candidato"
            size="4xl"
          >
            <CandidateDetails id={current.id} onClose={() => setCurrent(null)} />
          </Modal>
        )}

        {/* Modal de Exportação */}
        {showExportModal && (
          <Modal 
            open={showExportModal}
            onClose={() => setShowExportModal(false)}
            title="Exportar Dados"
            size="md"
          >
            <div className="w-full max-w-md mx-auto">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primary/20">
                  <Download size={32} className="text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Exportar Dados</h2>
                <p className="text-muted-foreground">
                  Selecione as colunas que deseja incluir na exportação
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-3 block text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Colunas para exportar:
                  </label>
                  <div className="space-y-2 max-h-64 overflow-y-auto border border-border/50 rounded-xl p-4">
                    {[
                      {value: 'id', label: 'ID'},
                      {value: 'name', label: 'Nome'},
                      {value: 'email', label: 'Email'},
                      {value: 'score', label: 'Pontuação'},
                      {value: 'status', label: 'Status'},
                      {value: 'behavioral_profile', label: 'Análise de Perfil Comportamental (Completa)'},
                      {value: 'answers', label: 'Respostas do Questionário'},
                      {value: 'created_at', label: 'Data de Criação'}
                    ].map(column => (
                      <label key={column.value} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-accent/50 transition-colors duration-200 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={columnsToExport.includes(column.value)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setColumnsToExport(prev => [...prev, column.value])
                            } else {
                              setColumnsToExport(prev => prev.filter(col => col !== column.value))
                            }
                          }}
                          className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-2"
                        />
                        <span className="text-sm font-medium text-foreground">{column.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                  <div className="text-sm text-muted-foreground">
                    {filtered.length} candidato{filtered.length !== 1 ? 's' : ''} será{filtered.length !== 1 ? 'ão' : ''} exportado{filtered.length !== 1 ? 's' : ''}
                  </div>
                  <div className="flex gap-3">
                    <button
                      variant="outline"
                      onClick={() => setViewMode('cards')}
                      className="px-6"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={exportAll}
                      disabled={columnsToExport.length === 0}
                      className="btn-modern-primary px-6 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50">
                      <Download size={16} className="mr-2" />
                      Exportar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </div>
  )
}

// Componente otimizado para detalhes do candidato
function CandidateDetails({ id }){
  const [details, setDetails] = useState(null)
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  useEffect(() => {
    let isMounted = true
    
    const fetchDetails = async () => {
      if (!id) return
      
      setLoading(true)
      setError(null)
      
      try {
        // Buscar dados do candidato da tabela candidates
        const { data: candidateData, error: candidateError } = await supabase
          .from('candidates')
          .select('*')
          .eq('id', id)
          .single()
        
        if (!isMounted) return
        
        if (candidateError) {
          console.error("❌ Erro ao buscar detalhes do candidato:", candidateError)
          setError(candidateError.message)
          return
        }

        // Buscar resultados individuais da tabela results
        const { data: resultsData, error: resultsError } = await supabase
          .from('results')
          .select('*')
          .eq('candidate_id', id)
          .order('question_id', { ascending: true })
        
        if (!isMounted) return
        
        if (resultsError) {
          console.warn("⚠️ Erro ao buscar resultados individuais:", resultsError)
          // Não falhar se não conseguir buscar resultados, apenas logar warning
        } else {
          console.log("✅ Resultados individuais carregados:", resultsData)
          setResults(resultsData || [])
        }

        console.log("✅ Detalhes do candidato carregados:", candidateData)
        setDetails(candidateData)
        
      } catch (err) {
        if (!isMounted) return
        console.error("❌ Exceção ao buscar detalhes:", err)
        setError('Erro ao buscar detalhes do candidato: ' + err.message)
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
        <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primary/20">
          <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
        <div className="text-muted-foreground font-medium">Carregando detalhes...</div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gradient-to-br from-destructive/20 to-destructive/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-destructive/20">
          <XCircle size={32} className="text-destructive" />
        </div>
        <div className="text-destructive font-medium">❌ {error}</div>
        <div className="text-sm text-muted-foreground mt-2">
          Erro ao processar dados do candidato
        </div>
      </div>
    )
  }
  
  if (!details) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gradient-to-br from-muted/30 to-muted/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-border/50">
          <Info size={32} className="text-muted-foreground" />
        </div>
        <div className="text-muted-foreground font-medium">Nenhum detalhe encontrado</div>
      </div>
    )
  }

  const statusProfile = getStatusProfile(details.status)
  
  // Debug: verificar se o perfil está sendo obtido corretamente
  console.log('🔍 [CandidateDetails] Debug perfilamento:', {
    candidateId: id,
    candidateStatus: details.status,
    candidateScore: details.score,
    statusProfile: statusProfile,
    hasProfile: !!statusProfile,
    profileKeys: statusProfile ? Object.keys(statusProfile) : null
  })

  // Verificação adicional: se não há perfil, tentar obter pelo score
  const finalStatusProfile = statusProfile || (details.score !== undefined ? getStatusProfile(classify(details.score)) : null)

  return (
    <div className="space-y-6">
      {/* Informações Básicas */}
      <ModernCard>
        <ModernCardHeader
          icon={<User size={20} className="text-primary" />}
          title="Informações do Candidato"
        />
        <ModernCardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Nome</label>
              <div className="text-foreground font-medium">{details.name}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Email</label>
              <div className="text-foreground font-medium">{details.email}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Data de Criação</label>
              <div className="text-foreground font-medium">
                {new Date(details.created_at).toLocaleDateString('pt-BR')}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Status</label>
              <div className="flex items-center gap-2">
                {getStatusBadge(details.status)}
              </div>
            </div>
          </div>
        </ModernCardContent>
      </ModernCard>

      {/* Pontuação */}
      {details.score !== undefined && (
        <ModernCard>
          <ModernCardHeader
            icon={<Target size={20} className="text-success" />}
            title="Pontuação Final"
          />
          <ModernCardContent>
            <div className="text-center">
              <div className="text-6xl font-bold text-success mb-2">{details.score}</div>
              <div className="text-muted-foreground">pontos de 100</div>
                             {finalStatusProfile && (
                 <div className="mt-4 p-3 bg-gradient-to-r from-success/10 to-success/5 rounded-xl border border-success/20">
                   <div className="text-sm font-medium text-foreground mb-1">Faixa de Pontuação</div>
                   <div className="text-sm text-muted-foreground">{finalStatusProfile.faixa}</div>
                 </div>
               )}
            </div>
          </ModernCardContent>
        </ModernCard>
      )}

      {/* Análise de Perfil */}
      {finalStatusProfile && (
        <ModernCard>
          <ModernCardHeader
            icon={<BarChart3 size={20} className="text-info" />}
            title="Análise de Perfil Comportamental"
          />
          <ModernCardContent className="space-y-6">
            {/* Perfil */}
            <div className="space-y-3">
              <h4 className="text-lg font-semibold text-foreground">Perfil</h4>
              <p className="text-muted-foreground leading-relaxed">{finalStatusProfile.perfil}</p>
            </div>

            {/* Comportamento */}
            <div className="space-y-3">
              <h4 className="text-lg font-semibold text-foreground">Comportamento</h4>
              <p className="text-muted-foreground leading-relaxed">{finalStatusProfile.comportamento}</p>
            </div>

            {/* Competências */}
            <div className="space-y-3">
              <h4 className="text-lg font-semibold text-foreground">Competências</h4>
              <p className="text-muted-foreground leading-relaxed">{finalStatusProfile.competencias}</p>
            </div>

            {/* Liderança */}
            <div className="space-y-3">
              <h4 className="text-lg font-semibold text-foreground">Liderança</h4>
              <p className="text-muted-foreground leading-relaxed">{finalStatusProfile.lideranca}</p>
            </div>

            {/* Áreas de Desenvolvimento */}
            <div className="space-y-3">
              <h4 className="text-lg font-semibold text-foreground">Áreas de Desenvolvimento</h4>
              <ul className="space-y-2">
                {finalStatusProfile.areas_desenvolvimento.map((area, index) => (
                  <li key={index} className="flex items-start gap-2 text-muted-foreground">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <span>{area}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recomendações */}
            <div className="space-y-3">
              <h4 className="text-lg font-semibold text-foreground">Recomendações</h4>
              <p className="text-muted-foreground leading-relaxed">{finalStatusProfile.recomendacoes}</p>
            </div>
          </ModernCardContent>
        </ModernCard>
      )}

      {/* Respostas */}
      {details.answers && (
        <ModernCard>
          <ModernCardHeader
            icon={<FileText size={20} className="text-warning" />}
            title="Respostas do Questionário"
          />
          <ModernCardContent>
            <div className="space-y-4">
              {Object.entries(details.answers).map(([questionId, answers]) => (
                <div key={questionId} className="p-4 bg-gradient-to-r from-info/10 to-info/5 rounded-xl border border-info/20">
                  <div className="font-medium text-foreground mb-2">
                    Questão {questionId.replace('question_', '')}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {Array.isArray(answers) ? answers.join(', ') : answers}
                  </div>
                </div>
              ))}
            </div>
          </ModernCardContent>
        </ModernCard>
      )}

      {/* Resultados Detalhados por Questão */}
      {results.length > 0 && (
        <ModernCard>
          <ModernCardHeader
            icon={<BarChart3 size={20} className="text-info" />}
            title="Análise Detalhada por Questão"
          />
          <ModernCardContent>
            <div className="space-y-4">
              {results.map((result, index) => (
                <div key={result.id} className="p-4 bg-gradient-to-r from-warning/10 to-warning/5 rounded-xl border border-warning/20">
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-medium text-foreground">
                      Questão {result.question_id}
                    </div>
                    <div className="flex items-center gap-2">
                      <span variant="outline" className="text-xs inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                        {result.score_question || 0} pts
                      </span>
                      {result.is_correct && (
                        <span variant="secondary" className="text-xs bg-success/20 text-success inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                          ✓ Correta
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-sm text-muted-foreground mb-2">
                    {result.question_title}
                  </div>
                  
                  <div className="text-sm text-foreground">
                    <strong>Respostas selecionadas:</strong>
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {Array.isArray(result.selected_answers) 
                      ? result.selected_answers.join(', ') 
                      : result.selected_answers}
                  </div>
                  
                  {result.question_category && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      Categoria: {result.question_category}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ModernCardContent>
        </ModernCard>
      )}

      {/* Dados Brutos (para debug) */}
      {process.env.NODE_ENV === 'development' && (
        <ModernCard>
          <ModernCardHeader
            icon={<Code size={20} className="text-warning" />}
            title="Dados Brutos (Dev)"
          />
          <ModernCardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">📊 Status dos Dados:</h4>
                <div className="text-sm space-y-1">
                  <div>• Candidato ID: {details.id}</div>
                  <div>• Respostas antigas (candidates.answers): {Object.keys(details.answers || {}).length} questões</div>
                  <div>• Resultados detalhados (results): {results.length} registros</div>
                  <div>• Tem dados detalhados: {results.length > 0 ? '✅ SIM' : '❌ NÃO'}</div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">🔍 Dados do Candidato:</h4>
                <pre className="whitespace-pre-wrap text-xs bg-gradient-to-r from-muted/20 to-muted/10 p-4 rounded-xl border border-border/30 overflow-auto max-h-32">
                  {JSON.stringify(details, null, 2)}
                </pre>
              </div>
              
              {results.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">📋 Resultados Detalhados:</h4>
                  <pre className="whitespace-pre-wrap text-xs bg-gradient-to-r from-muted/20 to-muted/10 p-4 rounded-xl border border-border/30 overflow-auto max-h-32">
                    {JSON.stringify(results, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </ModernCardContent>
        </ModernCard>
      )}


    </div>
  )
}
