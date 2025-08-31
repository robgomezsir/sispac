import React, { useState } from 'react'
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Users, 
  Target,
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react'
import { getStatusProfileStats, getAllStatusProfiles } from '../config/statusProfiles.js'

export default function StatusProfileStats({ candidates, className = "" }) {
  const [viewMode, setViewMode] = useState('cards') // 'cards' ou 'chart'
  const [expandedStats, setExpandedStats] = useState({})
  
  const stats = getStatusProfileStats(candidates)
  const allProfiles = getAllStatusProfiles()
  
  const toggleExpanded = (status) => {
    setExpandedStats(prev => ({
      ...prev,
      [status]: !prev[status]
    }))
  }

  const totalCandidates = candidates.length
  
  // Calcular métricas adicionais
  const averageScore = totalCandidates > 0 
    ? Math.round(candidates.reduce((sum, c) => sum + c.score, 0) / totalCandidates)
    : 0
  
  const scoreDistribution = {
    '0-50': candidates.filter(c => c.score <= 50).length,
    '51-67': candidates.filter(c => c.score > 50 && c.score <= 67).length,
    '68-75': candidates.filter(c => c.score > 67 && c.score <= 75).length,
    '76-95': candidates.filter(c => c.score > 75 && c.score <= 95).length,
    '96+': candidates.filter(c => c.score > 95).length
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header com métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card-modern p-4 text-center">
          <div className="text-2xl font-bold text-foreground">{totalCandidates}</div>
          <div className="text-sm text-muted-foreground">Total de Candidatos</div>
        </div>
        
        <div className="card-modern p-4 text-center">
          <div className="text-2xl font-bold text-foreground">{averageScore}</div>
          <div className="text-sm text-muted-foreground">Pontuação Média</div>
        </div>
        
        <div className="card-modern p-4 text-center">
          <div className="text-2xl font-bold text-foreground">
            {stats['ACIMA DA EXPECTATIVA']?.count + stats['SUPEROU A EXPECTATIVA']?.count || 0}
          </div>
          <div className="text-sm text-muted-foreground">Alto Desempenho</div>
        </div>
        
        <div className="card-modern p-4 text-center">
          <div className="text-2xl font-bold text-foreground">
            {stats['ABAIXO DA EXPECTATIVA']?.count || 0}
          </div>
          <div className="text-sm text-muted-foreground">Necessitam Apoio</div>
        </div>
      </div>

      {/* Controles de visualização */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-foreground">Análise dos Perfis de Status</h3>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('cards')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
              viewMode === 'cards' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            <BarChart3 size={16} className="inline mr-2" />
            Cards
          </button>
          
          <button
            onClick={() => setViewMode('chart')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
              viewMode === 'chart' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            <PieChart size={16} className="inline mr-2" />
            Gráfico
          </button>
        </div>
      </div>

      {/* Visualização em cards */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {allProfiles.map(({ status, ...profile }) => {
            const stat = stats[status]
            if (!stat) return null
            
            return (
              <div key={status} className="card-modern p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 bg-gradient-to-br from-${profile.cor}/20 to-${profile.cor}/10 rounded-xl flex items-center justify-center border border-${profile.cor}/20`}>
                      <Target size={20} className={`text-${profile.cor}`} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{status}</h4>
                      <p className="text-sm text-muted-foreground">{profile.faixa}</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => toggleExpanded(status)}
                    className="p-2 hover:bg-muted/50 rounded-lg transition-colors duration-200"
                  >
                    {expandedStats[status] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>

                {/* Estatísticas básicas */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">{stat.count}</div>
                    <div className="text-xs text-muted-foreground">Candidatos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">{stat.percentage}%</div>
                    <div className="text-xs text-muted-foreground">Percentual</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">{profile.prioridade}</div>
                    <div className="text-xs text-muted-foreground">Prioridade</div>
                  </div>
                </div>

                {/* Conteúdo expandido */}
                {expandedStats[status] && (
                  <div className="border-t border-border/50 pt-4 space-y-3 animate-in slide-in-from-top-2 duration-300">
                    <div>
                      <h5 className="text-sm font-semibold text-foreground mb-2">Perfil</h5>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {profile.perfil}
                      </p>
                    </div>
                    
                    <div>
                      <h5 className="text-sm font-semibold text-foreground mb-2">Comportamento</h5>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {profile.comportamento}
                      </p>
                    </div>
                    
                    <div>
                      <h5 className="text-sm font-semibold text-foreground mb-2">Liderança</h5>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {profile.lideranca}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Visualização em gráfico */}
      {viewMode === 'chart' && (
        <div className="card-modern p-6">
          <div className="space-y-6">
            {/* Gráfico de barras horizontal */}
            <div>
              <h4 className="text-lg font-semibold text-foreground mb-4">Distribuição por Status</h4>
              <div className="space-y-3">
                {allProfiles.map(({ status, cor }) => {
                  const stat = stats[status]
                  if (!stat || stat.count === 0) return null
                  
                  const barWidth = totalCandidates > 0 ? (stat.count / totalCandidates) * 100 : 0
                  
                  return (
                    <div key={status} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-foreground">{status}</span>
                        <span className="text-muted-foreground">
                          {stat.count} ({stat.percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                        <div 
                          className={`h-full bg-${cor} transition-all duration-500 ease-out`}
                          style={{ width: `${barWidth}%` }}
                        ></div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Distribuição de pontuações */}
            <div>
              <h4 className="text-lg font-semibold text-foreground mb-4">Distribuição de Pontuações</h4>
              <div className="grid grid-cols-5 gap-2">
                {Object.entries(scoreDistribution).map(([range, count]) => (
                  <div key={range} className="text-center">
                    <div className="text-lg font-bold text-foreground">{count}</div>
                    <div className="text-xs text-muted-foreground">{range}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Informações adicionais */}
      <div className="card-modern p-4 bg-muted/30">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Info size={16} />
          <span>
            Os perfis são baseados em análise comportamental avançada e fornecem insights detalhados 
            sobre competências, liderança e áreas de desenvolvimento para cada faixa de pontuação.
          </span>
        </div>
      </div>
    </div>
  )
}
