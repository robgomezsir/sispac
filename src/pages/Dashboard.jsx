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
  MoreHorizontal,
  Activity,
  Target,
  Award,
  Calendar
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
  TabsContent
} from '../components/ui'

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

  const getStatusBadge = (status) => {
    switch (status) {
      case 'SUPEROU A EXPECTATIVA':
        return <Badge variant="default" className="bg-green-100 text-green-800 border-green-200 hover:bg-green-200">Excelente</Badge>
      case 'ACIMA DA EXPECTATIVA':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200">Muito Bom</Badge>
      case 'DENTRO DA EXPECTATIVA':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200">Bom</Badge>
      default:
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">Regular</Badge>
    }
  }

  return (
    <div className="space-y-8">
      {/* Header do Dashboard */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
              <BarChart3 size={28} className="text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                Dashboard de Candidatos
              </h1>
              <p className="text-muted-foreground text-lg">
                Gerencie e visualize os resultados dos testes comportamentais
              </p>
            </div>
          </div>
        </div>
        
        {/* Ações rápidas para admin */}
        {role === 'admin' && (
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" asChild>
              <Link to="/config">
                <Settings size={16} className="mr-2" />
                Configurações
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/api">
                <BarChart3 size={16} className="mr-2" />
                API Panel
              </Link>
            </Button>
          </div>
        )}
      </div>

      {/* Estatísticas rápidas */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="group hover:shadow-xl transition-all duration-500 hover:-translate-y-1 border-0 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Candidatos</p>
                <p className="text-3xl font-bold text-foreground">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center border border-primary/20 group-hover:scale-110 transition-transform duration-300">
                <Users size={24} className="text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="group hover:shadow-xl transition-all duration-500 hover:-translate-y-1 border-0 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Superaram Expectativa</p>
                <p className="text-3xl font-bold text-green-600">{stats.superou}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-50 rounded-xl flex items-center justify-center border border-green-200 group-hover:scale-110 transition-transform duration-300">
                <TrendingUp size={24} className="text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="group hover:shadow-xl transition-all duration-500 hover:-translate-y-1 border-0 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Acima da Expectativa</p>
                <p className="text-3xl font-bold text-blue-600">{stats.acima}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl flex items-center justify-center border border-blue-200 group-hover:scale-110 transition-transform duration-300">
                <TrendingUp size={24} className="text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="group hover:shadow-xl transition-all duration-500 hover:-translate-y-1 border-0 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Dentro da Expectativa</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.dentro}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-100 to-yellow-50 rounded-xl flex items-center justify-center border border-yellow-200 group-hover:scale-110 transition-transform duration-300">
                <Minus size={24} className="text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controles de busca e exportação */}
      <Card className="border-0 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm shadow-xl">
        <CardHeader className="pb-6">
          <CardTitle className="flex items-center gap-2">
            <Search size={20} className="text-primary" />
            Controles de Busca e Exportação
          </CardTitle>
          <CardDescription>
            Busque candidatos e exporte dados em diferentes formatos
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input 
                  className="pl-10 h-12 text-base" 
                  placeholder="Buscar candidatos..." 
                  value={q} 
                  onChange={handleSearchChange}
                />
              </div>
              <Button 
                variant="outline"
                onClick={load} 
                disabled={loading}
                className="h-12 px-6"
              >
                {loading ? (
                  <RefreshCw size={16} className="animate-spin mr-2" />
                ) : (
                  <RefreshCw size={16} className="mr-2" />
                )}
                Atualizar
              </Button>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex items-center gap-2">
                <Label className="text-sm">Colunas para exportar:</Label>
                <select 
                  multiple 
                  className="h-24 min-w-[200px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" 
                  value={columnsToExport}
                  onChange={handleColumnsChange}
                >
                  {['id','name','email','score','status','created_at'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <Button 
                onClick={exportAll}
                disabled={filtered.length === 0}
                className="h-12 px-6 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Download size={16} className="mr-2" />
                Exportar Todos (XLSX)
              </Button>
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
                <Card 
                  key={row.id} 
                  className="group hover:shadow-xl transition-all duration-500 hover:-translate-y-2 border-0 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm"
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">{row.name}</CardTitle>
                        <CardDescription className="mb-3">{row.email}</CardDescription>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(row.status)}
                          <Badge variant="outline" className="text-xs">
                            <Calendar size={12} className="mr-1" />
                            {new Date(row.created_at).toLocaleDateString('pt-BR')}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-primary group-hover:scale-110 transition-transform duration-300">
                          {row.score}
                        </div>
                        <div className="text-xs text-muted-foreground">Pontuação</div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardFooter className="pt-0">
                    <div className="flex gap-2 w-full">
                      <Button 
                        variant="outline" 
                        className="flex-1" 
                        onClick={() => openModal(row)}
                      >
                        <Eye size={16} className="mr-2" />
                        Detalhar
                      </Button>
                      <Button 
                        className="flex-1 shadow-lg hover:shadow-xl transition-all duration-300" 
                        onClick={() => exportOne(row)}
                      >
                        <Download size={16} className="mr-2" />
                        Download
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity size={20} className="text-primary" />
            Detalhes da Avaliação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="whitespace-pre-wrap text-sm bg-muted p-3 rounded-md">{details.details}</pre>
        </CardContent>
      </Card>
      
      {details.score && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target size={20} className="text-primary" />
              Pontuação Final
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary text-center">{details.score}</div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
