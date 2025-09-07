import React, { useState, useEffect, useMemo } from 'react'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from './ui/chart'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { Loader2, AlertCircle } from 'lucide-react'

export function CandidatesChart() {
  const { user } = useAuth()
  const [candidates, setCandidates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Buscar dados dos candidatos
  useEffect(() => {
    const fetchCandidates = async () => {
      if (!user) return
      
      setLoading(true)
      setError(null)
      
      try {
        // Obter token de sessão atual
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session?.access_token) {
          throw new Error('Sessão expirada. Faça login novamente.')
        }
        
        // Buscar candidatos da API
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
        setCandidates(data || [])
      } catch (err) {
        console.error('❌ [CandidatesChart] Erro ao carregar dados:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchCandidates()
  }, [user])

  // Processar dados para o gráfico
  const chartData = useMemo(() => {
    if (!candidates.length) return []

    // Agrupar candidatos por mês
    const monthlyData = {}
    
    candidates.forEach(candidate => {
      const date = new Date(candidate.created_at)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const monthName = date.toLocaleDateString('pt-BR', { month: 'short' })
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthName,
          candidatos: 0,
          aprovados: 0,
          superou: 0,
          acima: 0,
          dentro: 0,
          abaixo: 0
        }
      }
      
      monthlyData[monthKey].candidatos++
      
      // Contar por status
      switch (candidate.status) {
        case 'SUPEROU A EXPECTATIVA':
          monthlyData[monthKey].superou++
          monthlyData[monthKey].aprovados++
          break
        case 'ACIMA DA EXPECTATIVA':
          monthlyData[monthKey].acima++
          monthlyData[monthKey].aprovados++
          break
        case 'DENTRO DA EXPECTATIVA':
          monthlyData[monthKey].dentro++
          monthlyData[monthKey].aprovados++
          break
        case 'ABAIXO DA EXPECTATIVA':
          monthlyData[monthKey].abaixo++
          break
      }
    })

    // Converter para array e ordenar por data
    return Object.values(monthlyData).sort((a, b) => {
      const aDate = new Date(Object.keys(monthlyData).find(key => monthlyData[key] === a))
      const bDate = new Date(Object.keys(monthlyData).find(key => monthlyData[key] === b))
      return aDate - bDate
    })
  }, [candidates])

  // Calcular estatísticas gerais
  const stats = useMemo(() => {
    const total = candidates.length
    const aprovados = candidates.filter(c => 
      ['SUPEROU A EXPECTATIVA', 'ACIMA DA EXPECTATIVA', 'DENTRO DA EXPECTATIVA'].includes(c.status)
    ).length
    const taxaAprovacao = total > 0 ? ((aprovados / total) * 100).toFixed(1) : 0
    
    return { total, aprovados, taxaAprovacao }
  }, [candidates])

  const chartConfig = {
    candidatos: {
      label: "Total de Candidatos",
      color: "hsl(var(--primary))",
    },
    aprovados: {
      label: "Candidatos Aprovados",
      color: "hsl(var(--chart-2))",
    },
  }

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 text-primary animate-spin" />
            Carregando Gráfico...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full flex items-center justify-center">
            <div className="text-muted-foreground">Processando dados dos candidatos...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            Erro ao Carregar Dados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full flex items-center justify-center">
            <div className="text-center">
              <div className="text-destructive font-medium mb-2">❌ {error}</div>
              <div className="text-sm text-muted-foreground">
                Não foi possível carregar os dados dos candidatos
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!chartData.length) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Evolução de Candidatos</CardTitle>
          <CardDescription>
            Acompanhe o crescimento de candidatos e aprovações ao longo do tempo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <div className="text-lg font-medium mb-2">Nenhum dado disponível</div>
              <div className="text-sm">Adicione candidatos para visualizar o gráfico</div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Evolução de Candidatos</CardTitle>
        <CardDescription>
          Acompanhe o crescimento de candidatos e aprovações ao longo do tempo
          {stats.total > 0 && (
            <span className="block mt-1 text-sm">
              Total: {stats.total} candidatos • Taxa de aprovação: {stats.taxaAprovacao}%
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <AreaChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="month" 
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              tickLine={false}
              axisLine={false}
            />
            <ChartTooltip
              content={<ChartTooltipContent />}
            />
            <Area
              type="monotone"
              dataKey="candidatos"
              stackId="1"
              stroke="var(--color-candidatos)"
              fill="var(--color-candidatos)"
              fillOpacity={0.6}
            />
            <Area
              type="monotone"
              dataKey="aprovados"
              stackId="2"
              stroke="var(--color-aprovados)"
              fill="var(--color-aprovados)"
              fillOpacity={0.8}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}