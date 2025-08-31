import React, { useState } from 'react'
import { 
  AlertCircle, 
  Target, 
  TrendingUp, 
  Award, 
  ChevronDown, 
  ChevronUp,
  Users,
  Lightbulb,
  BookOpen,
  Star,
  Zap,
  Heart,
  User
} from 'lucide-react'
import { getStatusProfile } from '../config/statusProfiles.js'

const STATUS_ICONS = {
  "ABAIXO DA EXPECTATIVA": AlertCircle,
  "DENTRO DA EXPECTATIVA": Target,
  "ACIMA DA EXPECTATIVA": TrendingUp,
  "SUPEROU A EXPECTATIVA": Award
}

const STATUS_COLORS = {
  "ABAIXO DA EXPECTATIVA": "destructive",
  "DENTRO DA EXPECTATIVA": "warning",
  "ACIMA DA EXPECTATIVA": "success",
  "SUPEROU A EXPECTATIVA": "primary"
}

export default function StatusProfileCard({ status, count, percentage, isExpanded = false, onToggle }) {
  const [expanded, setExpanded] = useState(isExpanded)
  const profile = getStatusProfile(status)
  
  if (!profile) {
    return null
  }

  const IconComponent = STATUS_ICONS[status] || Target
  const statusColor = STATUS_COLORS[status] || "muted"
  
  const toggleExpanded = () => {
    const newExpanded = !expanded
    setExpanded(newExpanded)
    if (onToggle) {
      onToggle(newExpanded)
    }
  }

  return (
    <div className={`card-modern p-6 transition-all duration-300 ${
      expanded ? 'ring-2 ring-primary/20 shadow-lg' : 'hover:shadow-md'
    }`}>
      {/* Header do card */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 bg-gradient-to-br from-${statusColor}/20 to-${statusColor}/10 rounded-2xl flex items-center justify-center border border-${statusColor}/20`}>
            <IconComponent size={24} className={`text-${statusColor}`} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">{status}</h3>
            <p className="text-sm text-muted-foreground">{profile.faixa}</p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-2xl font-bold text-foreground">{count}</div>
          <div className="text-sm text-muted-foreground">{percentage}%</div>
        </div>
      </div>

      {/* Botão para expandir/recolher */}
      <button
        onClick={toggleExpanded}
        className="w-full flex items-center justify-center gap-2 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 rounded-lg hover:bg-muted/50"
      >
        {expanded ? (
          <>
            <ChevronUp size={16} />
            <span>Recolher detalhes</span>
          </>
        ) : (
          <>
            <ChevronDown size={16} />
            <span>Ver detalhes</span>
          </>
        )}
      </button>

      {/* Conteúdo expandido */}
      {expanded && (
        <div className="mt-6 space-y-6 animate-in slide-in-from-top-2 duration-300">
          {/* Perfil */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <User size={16} />
              <span>Perfil</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {profile.perfil}
            </p>
          </div>

          {/* Comportamento */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Zap size={16} />
              <span>Comportamento</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {profile.comportamento}
            </p>
          </div>

          {/* Competências */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Star size={16} />
              <span>Competências</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {profile.competencias}
            </p>
          </div>

          {/* Liderança */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Users size={16} />
              <span>Liderança</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {profile.lideranca}
            </p>
          </div>

          {/* Áreas de Desenvolvimento */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Lightbulb size={16} />
              <span>Áreas de Desenvolvimento</span>
            </div>
            <ul className="space-y-2">
              {profile.areas_desenvolvimento.map((area, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span>{area}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Recomendações */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <BookOpen size={16} />
              <span>Recomendações</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {profile.recomendacoes}
            </p>
          </div>

          {/* Separador visual */}
          <div className="border-t border-border/50 pt-4">
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Heart size={12} />
              <span>Perfil baseado em análise comportamental avançada</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
