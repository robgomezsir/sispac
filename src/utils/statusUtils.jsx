import React from 'react'
import { Badge } from '../components/ui'
import { TrendingUp, Minus, TrendingDown, Award } from 'lucide-react'

// Função para obter badge de status
export const getStatusBadge = (status) => {
  console.log('🔍 [getStatusBadge] Função chamada com status:', status)
  
  try {
    switch (status) {
      case 'SUPEROU A EXPECTATIVA':
        console.log('✅ [getStatusBadge] Retornando badge Excelente')
        return <Badge className="badge-success">Excelente</Badge>
      case 'ACIMA DA EXPECTATIVA':
        console.log('✅ [getStatusBadge] Retornando badge Muito Bom')
        return <Badge className="badge-info">Muito Bom</Badge>
      case 'DENTRO DA EXPECTATIVA':
        console.log('✅ [getStatusBadge] Retornando badge Bom')
        return <Badge className="badge-warning">Bom</Badge>
      case 'ABAIXO DA EXPECTATIVA':
        console.log('✅ [getStatusBadge] Retornando badge Regular')
        return <Badge className="badge-modern">Regular</Badge>
      default:
        console.log('✅ [getStatusBadge] Retornando badge Regular para status:', status)
        return <Badge className="badge-modern">Regular</Badge>
    }
  } catch (error) {
    console.error('❌ [getStatusBadge] Erro na função:', error)
    return <Badge className="badge-modern">Erro</Badge>
  }
}

// Função para obter ícone de status
export const getStatusIcon = (status) => {
  console.log('🔍 [getStatusIcon] Função chamada com status:', status)
  
  try {
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
  } catch (error) {
    console.error('❌ [getStatusIcon] Erro na função:', error)
    return <Minus size={18} className="text-muted-foreground" />
  }
}

// Função para obter cor de status
export const getStatusColor = (status) => {
  console.log('🔍 [getStatusColor] Função chamada com status:', status)
  
  try {
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
  } catch (error) {
    console.error('❌ [getStatusColor] Erro na função:', error)
    return 'text-muted-foreground'
  }
}
