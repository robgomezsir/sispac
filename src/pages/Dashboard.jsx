import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import { downloadXlsx } from '../utils/download'
import Modal from '../components/Modal.jsx'
import { AdvancedFilters } from '../components/AdvancedFilters.jsx'
import StatusProfileStats from '../components/StatusProfileStats.jsx'
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
  BarChart4,
  PieChart,
  LineChart,
  TrendingUp2,
  Users2,
  Target2,
  Award2,
  Clock2,
  Star2
} from 'lucide-react'
import { cn } from '../lib/utils'
import { 
  Button, 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter,
  Input,
  Label,
  Badge,
  Separator,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem
} from '../components/ui'

export default function Dashboard(){
  const { user, role } = useAuth()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [initialLoad, setInitialLoad] = useState(false)
  const [error, setError] = useState(null)
  const [q, setQ] = useState('')
  const [current, setCurrent] = useState(null)
  


  const [columnsToExport, setColumnsToExport] = useState(['name','email','score','status','behavioral_profile'])
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
  const exportAll = useCallback(() => {
    downloadXlsx('candidatos.xlsx', sortedData, columnsToExport)
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
    <div className="min-h-screen bg-gradient-pastel relative overflow-hidden">
      {/* Elementos decorativos de fundo aprimorados */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-secondary/20 to-transparent rounded-full blur-3xl animate-float" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-accent/10 to-transparent rounded-full blur-3xl animate-pulse-soft"></div>
        
        {/* Elementos flutuantes adicionais */}
        <div className="absolute top-20 right-20 w-16 h-16 bg-gradient-to-br from-info/20 to-transparent rounded-full blur-2xl animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-20 left-20 w-20 h-20 bg-gradient-to-br from-warning/20 to-transparent rounded-full blur-2xl animate-float" style={{animationDelay: '3s'}}></div>
        <div className="absolute top-1/3 left-1/4 w-12 h-12 bg-gradient-to-br from-success/20 to-transparent rounded-full blur-xl animate-float" style={{animationDelay: '1.5s'}}></div>
      </div>

      <div className="space-y-8 p-6 relative z-10">
        {/* Header do Dashboard aprimorado */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/10 rounded-3xl flex items-center justify-center border border-primary/20 shadow-glow animate-bounce-soft">
                <BarChart3 size={40} className="text-primary" />
              </div>
              <div className="space-y-2">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
                  Dashboard de Candidatos
                </h1>
                <p className="text-xl text-muted-foreground font-medium">
                  Gerencie e visualize os resultados dos testes comportamentais
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground/70">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse-soft"></div>
                    <span>Sistema Ativo</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock2 size={14} />
                    <span>Última atualização: {new Date().toLocaleTimeString('pt-BR')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Ações rápidas para admin */}
          {role === 'admin' && (
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" asChild className="btn-secondary-modern group">
                <Link to="/config">
                  <Settings size={18} className="mr-2 group-hover:rotate-180 transition-transform duration-500" />
                  Configurações
                </Link>
              </Button>
              <Button variant="outline" asChild className="btn-secondary-modern group">
                <Link to="/api">
                  <BarChart3 size={18} className="mr-2 group-hover:scale-110 transition-transform duration-300" />
                  API Panel
                </Link>
              </Button>
            </div>
          )}
        </div>

        {/* Estatísticas rápidas com design moderno aprimorado */}
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card className="card-modern group hover:shadow-2xl transition-all duration-700 hover:-translate-y-3 animate-slide-in-from-top" style={{animationDelay: '0.1s'}}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Total de Candidatos</p>
                  <p className="text-4xl font-bold text-foreground">{stats.total}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground/70">
                    <TrendingUp2 size={12} className="text-success" />
                    <span>Registros no sistema</span>
                  </div>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-3xl flex items-center justify-center border border-primary/20 group-hover:scale-110 transition-transform duration-500 group-hover:rotate-12">
                  <Users2 size={32} className="text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="card-modern group hover:shadow-2xl transition-all duration-700 hover:-translate-y-3 animate-slide-in-from-top" style={{animationDelay: '0.2s'}}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Superaram Expectativa</p>
                  <p className="text-4xl font-bold text-success">{stats.superou}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground/70">
                    <Star2 size={12} className="text-success" />
                    <span>Resultado excelente</span>
                  </div>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-success/20 to-success/10 rounded-3xl flex items-center justify-center border border-success/20 group-hover:scale-110 transition-transform duration-500 group-hover:rotate-12">
                  <Star size={32} className="text-success" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="card-modern group hover:shadow-2xl transition-all duration-700 hover:-translate-y-3 animate-slide-in-from-top" style={{animationDelay: '0.3s'}}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Acima da Expectativa</p>
                  <p className="text-4xl font-bold text-info">{stats.acima}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground/70">
                    <TrendingUp size={12} className="text-info" />
                    <span>Muito bom desempenho</span>
                  </div>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-info/20 to-info/10 rounded-3xl flex items-center justify-center border border-info/20 group-hover:scale-110 transition-transform duration-500 group-hover:rotate-12">
                  <TrendingUp size={32} className="text-info" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="card-modern group hover:shadow-2xl transition-all duration-700 hover:-translate-y-3 animate-slide-in-from-top" style={{animationDelay: '0.4s'}}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Dentro da Expectativa</p>
                  <p className="text-4xl font-bold text-warning">{stats.dentro}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground/70">
                    <Target2 size={12} className="text-warning" />
                    <span>Desempenho adequado</span>
                  </div>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-warning/20 to-warning/10 rounded-3xl flex items-center justify-center border border-warning/20 group-hover:scale-110 transition-transform duration-500 group-hover:rotate-12">
                  <CheckCircle size={32} className="text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="card-modern group hover:shadow-2xl transition-all duration-700 hover:-translate-y-3 animate-slide-in-from-top" style={{animationDelay: '0.5s'}}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Abaixo da Expectativa</p>
                  <p className="text-4xl font-bold text-muted-foreground">{stats.abaixo}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground/70">
                    <TrendingDown size={12} className="text-muted-foreground" />
                    <span>Precisa de desenvolvimento</span>
                  </div>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-muted-foreground/20 to-muted-foreground/10 rounded-3xl flex items-center justify-center border border-muted-foreground/20 group-hover:scale-110 transition-transform duration-500 group-hover:rotate-12">
                  <TrendingDown size={32} className="text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Abas de Análise aprimoradas */}
        <Tabs defaultValue="candidates" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 p-2 bg-white/50 backdrop-blur-sm border border-white/20 rounded-2xl">
            <TabsTrigger value="candidates" className="text-base py-4 px-6 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300">
              <Users size={20} className="mr-3" />
              Candidatos
            </TabsTrigger>
            <TabsTrigger value="profiles" className="text-base py-4 px-6 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300">
              <Target size={20} className="mr-3" />
              Análise de Perfis
            </TabsTrigger>
          </TabsList>

          {/* Aba: Análise de Perfis */}
          <TabsContent value="profiles" className="space-y-6 animate-slide-in-from-bottom">
            <StatusProfileStats candidates={rows} />
          </TabsContent>

          {/* Aba: Candidatos */}
          <TabsContent value="candidates" className="space-y-6 animate-slide-in-from-bottom">
            {/* Filtros Avançados */}
            <AdvancedFilters 
              filters={advancedFilters}
              onFiltersChange={handleAdvancedFiltersChange}
            />

            {/* Controles de busca e exportação aprimorados */}
            <Card className="card-modern">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center border border-primary/20">
                    <Search size={24} className="text-primary" />
                  </div>
                  Controles de Busca e Exportação
                </CardTitle>
                <CardDescription className="text-lg">
                  Busque candidatos e exporte dados em diferentes formatos
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-8">
                <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
                  <div className="flex flex-col sm:flex-row gap-4 flex-1">
                    <div className="relative flex-1 max-w-md">
                      <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                      <Input 
                        className="input-modern pl-12 h-16 text-base" 
                        placeholder="Buscar candidatos..." 
                        value={q} 
                        onChange={handleSearchChange}
                      />
                    </div>
                    <Button 
                      variant="outline"
                      onClick={load} 
                      disabled={loading}
                      className="btn-secondary-modern h-16 px-8 group"
                    >
                      {loading ? (
                        <RefreshCw size={20} className="animate-spin mr-2" />
                      ) : (
                        <RefreshCw size={20} className="mr-2 group-hover:rotate-180 transition-transform duration-500" />
                      )}
                      Atualizar
                    </Button>
                  </div>
                  
                  {/* Exibição de erro aprimorada */}
                  {error && (
                    <div className="w-full p-4 bg-gradient-to-r from-destructive/10 to-destructive/5 border border-destructive/20 text-destructive rounded-2xl flex items-center gap-3">
                      <AlertCircle size={20} />
                      <span className="font-medium">{error}</span>
                    </div>
                  )}
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex items-center gap-3">
                      <Label className="text-sm font-medium">Colunas para exportar:</Label>
                      <select 
                        multiple 
                        className="input-modern h-32 min-w-[200px]" 
                        value={columnsToExport}
                        onChange={handleColumnsChange}
                      >
                        {[
                          {value: 'id', label: 'ID'},
                          {value: 'name', label: 'Nome'},
                          {value: 'email', label: 'Email'},
                          {value: 'score', label: 'Pontuação'},
                          {value: 'status', label: 'Status'},
                          {value: 'behavioral_profile', label: 'Análise de Perfil Comportamental (Completa)'},
                          {value: 'created_at', label: 'Data de Criação'}
                        ].map(c => (
                          <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                      </select>
                    </div>
                    <Button 
                      onClick={exportAll}
                      disabled={filtered.length === 0}
                      className="btn-primary-modern h-16 px-8 shadow-lg hover:shadow-xl transition-all duration-300 group"
                    >
                      <Download size={20} className="mr-2 group-hover:scale-110 transition-transform duration-300" />
                      Exportar Todos (XLSX)
                    </Button>
                  </div>
                </div>

                {/* Seletor de visualização aprimorado */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Label className="text-sm font-medium">Visualização:</Label>
                    <div className="flex rounded-2xl border border-border/50 overflow-hidden bg-white/50 backdrop-blur-sm">
                      <Button
                        variant={viewMode === 'cards' ? 'default' : 'ghost'}
                        size="lg"
                        onClick={() => setViewMode('cards')}
                        className="rounded-r-none px-8 py-4 transition-all duration-300"
                      >
                        <FileText size={20} className="mr-2" />
                        Cartões
                      </Button>
                      <Button
                        variant={viewMode === 'table' ? 'default' : 'ghost'}
                        size="lg"
                        onClick={() => setViewMode('table')}
                        className="rounded-l-none px-8 py-4 transition-all duration-300"
                      >
                        <BarChart3 size={20} className="mr-2" />
                        Tabela
                      </Button>
                    </div>
                  </div>
                  
                  <div className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                    <Users2 size={16} />
                    {filtered.length} candidato{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
                  </div>
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
                      <Button 
                        variant="outline" 
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
                        className="mt-4 btn-secondary-modern"
                      >
                        <FilterX size={16} className="mr-2" />
                        Limpar Filtros
                      </Button>
                    )}
                  </div>
                ) : viewMode === 'cards' ? (
                  // Visualização em cartões com design moderno aprimorado
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sortedData.map((row, index) => (
                      <Card 
                        key={row.id} 
                        className="card-modern group hover:shadow-2xl transition-all duration-700 hover:-translate-y-3 animate-slide-in-from-bottom"
                        style={{animationDelay: `${index * 0.1}s`}}
                      >
                        <CardHeader className="pb-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-lg font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                                {row.name}
                              </CardTitle>
                              <CardDescription className="text-muted-foreground group-hover:text-muted-foreground/80 transition-colors duration-300">
                                {row.email}
                              </CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(row.status)}
                              {getStatusBadge(row.status)}
                            </div>
                          </div>
                        </CardHeader>
                        
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-muted-foreground">Pontuação:</span>
                            <span className={`text-3xl font-bold ${getStatusColor(row.status)}`}>
                              {row.score}
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-muted-foreground">Data:</span>
                            <span className="text-sm text-muted-foreground">
                              {new Date(row.created_at).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                          
                          <Separator />
                          
                          <div className="flex items-center justify-between gap-3">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setCurrent(row)}
                              className="btn-secondary-modern flex-1 group"
                            >
                              <Eye size={16} className="mr-2 group-hover:scale-110 transition-transform duration-300" />
                              Ver Detalhes
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleDeleteCandidate(row)}
                              className="btn-destructive flex-1 group"
                            >
                              <Trash2 size={16} className="mr-2 group-hover:scale-110 transition-transform duration-300" />
                              Excluir
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  // Visualização em tabela aprimorada
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nome</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Pontuação</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Data</TableHead>
                          <TableHead>Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sortedData.map(row => (
                          <TableRow key={row.id} className="hover:bg-muted/30 transition-all duration-300">
                            <TableCell className="font-medium">{row.name}</TableCell>
                            <TableCell>{row.email}</TableCell>
                            <TableCell className={getStatusColor(row.status)}>
                              {row.score}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {getStatusIcon(row.status)}
                                {getStatusBadge(row.status)}
                              </div>
                            </TableCell>
                            <TableCell>
                              {new Date(row.created_at).toLocaleDateString('pt-BR')}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => setCurrent(row)}
                                  className="btn-secondary-modern"
                                >
                                  <Eye size={16} className="mr-2" />
                                  Ver
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleDeleteCandidate(row)}
                                  className="btn-destructive"
                                >
                                  <Trash2 size={16} className="mr-2" />
                                  Excluir
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

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
      <Card className="card-modern">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
              <User size={20} className="text-primary" />
            </div>
            Informações do Candidato
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Nome</Label>
              <div className="text-foreground font-medium">{details.name}</div>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Email</Label>
              <div className="text-foreground font-medium">{details.email}</div>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Data de Criação</Label>
              <div className="text-foreground font-medium">
                {new Date(details.created_at).toLocaleDateString('pt-BR')}
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Status</Label>
              <div className="flex items-center gap-2">
                {getStatusBadge(details.status)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pontuação */}
      {details.score !== undefined && (
        <Card className="card-modern">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-success/20 to-success/10 rounded-xl flex items-center justify-center border border-success/20">
                <Target size={20} className="text-success" />
              </div>
              Pontuação Final
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-6xl font-bold text-success mb-2">{details.score}</div>
              <div className="text-muted-foreground">pontos de 100</div>
                             {finalStatusProfile && (
                 <div className="mt-4 p-3 bg-muted/30 rounded-xl border border-border/50">
                   <div className="text-sm font-medium text-foreground mb-1">Faixa de Pontuação</div>
                   <div className="text-sm text-muted-foreground">{finalStatusProfile.faixa}</div>
                 </div>
               )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Análise de Perfil */}
      {finalStatusProfile && (
        <Card className="card-modern">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-info/20 to-info/10 rounded-xl flex items-center justify-center border border-info/20">
                <BarChart3 size={20} className="text-info" />
              </div>
              Análise de Perfil Comportamental
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
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
          </CardContent>
        </Card>
      )}

      {/* Respostas */}
      {details.answers && (
        <Card className="card-modern">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-warning/20 to-warning/10 rounded-xl flex items-center justify-center border border-warning/20">
                <FileText size={20} className="text-warning" />
              </div>
              Respostas do Questionário
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(details.answers).map(([questionId, answers]) => (
                <div key={questionId} className="p-4 bg-muted/30 rounded-xl border border-border/50">
                  <div className="font-medium text-foreground mb-2">
                    Questão {questionId.replace('question_', '')}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {Array.isArray(answers) ? answers.join(', ') : answers}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resultados Detalhados por Questão */}
      {results.length > 0 && (
        <Card className="card-modern">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-info/20 to-info/10 rounded-xl flex items-center justify-center border border-info/20">
                <BarChart3 size={20} className="text-info" />
              </div>
              Análise Detalhada por Questão
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.map((result, index) => (
                <div key={result.id} className="p-4 bg-muted/30 rounded-xl border border-border/50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-medium text-foreground">
                      Questão {result.question_id}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {result.score_question || 0} pts
                      </Badge>
                      {result.is_correct && (
                        <Badge variant="secondary" className="text-xs bg-success/20 text-success">
                          ✓ Correta
                        </Badge>
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
          </CardContent>
        </Card>
      )}

      {/* Dados Brutos (para debug) */}
      {process.env.NODE_ENV === 'development' && (
        <Card className="card-modern">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-warning/20 to-warning/10 rounded-xl flex items-center justify-center border border-warning/20">
                <Code size={20} className="text-warning" />
              </div>
              Dados Brutos (Dev)
            </CardTitle>
          </CardHeader>
          <CardContent>
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
                <pre className="whitespace-pre-wrap text-xs bg-muted/30 p-4 rounded-xl border border-border/50 overflow-auto max-h-32">
                  {JSON.stringify(details, null, 2)}
                </pre>
              </div>
              
              {results.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">📋 Resultados Detalhados:</h4>
                  <pre className="whitespace-pre-wrap text-xs bg-muted/30 p-4 rounded-xl border border-border/50 overflow-auto max-h-32">
                    {JSON.stringify(results, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
