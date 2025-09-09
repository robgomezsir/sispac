import React from 'react'
import { Badge } from '../ui/badge.jsx'
import { TrendingUp, Minus, TrendingDown, Award } from 'lucide-react'

// Função para obter badge de status - OTIMIZADA
export const getStatusBadge = (status) => {
  switch (status) {
    case 'SUPEROU A EXPECTATIVA':
      return <Badge className="badge-success">SUPEROU A EXPECTATIVA</Badge>
    case 'ACIMA DA EXPECTATIVA':
      return <Badge className="badge-info">ACIMA DA EXPECTATIVA</Badge>
    case 'DENTRO DA EXPECTATIVA':
      return <Badge className="badge-warning">DENTRO DA EXPECTATIVA</Badge>
    case 'ABAIXO DA EXPECTATIVA':
      return <Badge className="badge-modern">ABAIXO DA EXPECTATIVA</Badge>
    default:
      return <Badge className="badge-modern">ABAIXO DA EXPECTATIVA</Badge>
  }
}

// Função para obter ícone de status - OTIMIZADA
export const getStatusIcon = (status) => {
  switch (status) {
    case 'SUPEROU A EXPECTATIVA':
      return <Award size={18} className="text-success" />
    case 'ACIMA DA EXPECTATIVA':
      return <TrendingUp size={18} className="text-info" />
    case 'DENTRO DA EXPECTATIVA':
      return <Minus size={18} className="text-warning" />
    case 'ABAIXO DA EXPECTATIVA':
      return <TrendingDown size={18} className="text-muted-foreground" />
    default:
      return <Minus size={18} className="text-muted-foreground" />
  }
}

// Função para obter cor de status - OTIMIZADA
export const getStatusColor = (status) => {
  switch (status) {
    case 'SUPEROU A EXPECTATIVA':
      return 'text-success'
    case 'ACIMA DA EXPECTATIVA':
      return 'text-info'
    case 'DENTRO DA EXPECTATIVA':
      return 'text-warning'
    case 'ABAIXO DA EXPECTATIVA':
      return 'text-muted-foreground'
    default:
      return 'text-muted-foreground'
  }
}
