import React, { useState, useCallback } from 'react'
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '../lib/utils'
import { Button, Card, CardContent, CardHeader, CardTitle, Label, Input, Badge } from './ui'

export function AdvancedFilters({ 
  filters, 
  onFiltersChange, 
  className 
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [localFilters, setLocalFilters] = useState(filters)

  const handleFilterChange = useCallback((key, value) => {
    const newFilters = { ...localFilters, [key]: value }
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
  }, [localFilters, onFiltersChange])

  const clearFilters = useCallback(() => {
    const clearedFilters = Object.keys(localFilters).reduce((acc, key) => {
      acc[key] = ''
      return acc
    }, {})
    setLocalFilters(clearedFilters)
    onFiltersChange(clearedFilters)
  }, [localFilters, onFiltersChange])

  const hasActiveFilters = Object.values(localFilters).some(value => value !== '')

  return (
    <Card className={cn("border-0 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter size={20} className="text-primary" />
            Filtros Avançados
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-2 bg-primary/20 text-primary">
                {Object.values(localFilters).filter(v => v !== '').length} ativo{Object.values(localFilters).filter(v => v !== '').length !== 1 ? 's' : ''}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="text-xs h-8 px-3"
              >
                <X size={14} className="mr-1" />
                Limpar
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 w-8 p-0"
            >
              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status-filter" className="text-sm font-medium">
                Status
              </Label>
              <select
                id="status-filter"
                value={localFilters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">Todos os status</option>
                <option value="SUPEROU A EXPECTATIVA">Superou a Expectativa</option>
                <option value="ACIMA DA EXPECTATIVA">Acima da Expectativa</option>
                <option value="DENTRO DA EXPECTATIVA">Dentro da Expectativa</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="score-min" className="text-sm font-medium">
                Pontuação Mínima
              </Label>
              <Input
                id="score-min"
                type="number"
                placeholder="0"
                value={localFilters.scoreMin || ''}
                onChange={(e) => handleFilterChange('scoreMin', e.target.value)}
                className="h-9"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="score-max" className="text-sm font-medium">
                Pontuação Máxima
              </Label>
              <Input
                id="score-max"
                type="number"
                placeholder="100"
                value={localFilters.scoreMax || ''}
                onChange={(e) => handleFilterChange('scoreMax', e.target.value)}
                className="h-9"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date-from" className="text-sm font-medium">
                Data a partir de
              </Label>
              <Input
                id="date-from"
                type="date"
                value={localFilters.dateFrom || ''}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="h-9"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date-to" className="text-sm font-medium">
                Data até
              </Label>
              <Input
                id="date-to"
                type="date"
                value={localFilters.dateTo || ''}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="h-9"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sort-by" className="text-sm font-medium">
                Ordenar por
              </Label>
              <select
                id="sort-by"
                value={localFilters.sortBy || 'created_at'}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="created_at">Data de Criação</option>
                <option value="name">Nome</option>
                <option value="email">Email</option>
                <option value="score">Pontuação</option>
                <option value="status">Status</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t mt-4">
            <div className="text-sm text-muted-foreground">
              Use os filtros para refinar sua busca
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                disabled={!hasActiveFilters}
              >
                <X size={16} className="mr-2" />
                Limpar Filtros
              </Button>
              <Button
                size="sm"
                onClick={() => setIsExpanded(false)}
              >
                Aplicar
              </Button>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
