import React from 'react'
import { 
  ModernCard, 
  ModernCardHeader, 
  ModernCardContent, 
  ModernCardFooter, 
  ModernStatCard, 
  ModernActionCard 
} from '../ui/ModernCard'
import { Button } from '../ui/button.jsx'
import { 
  Users, 
  Star, 
  TrendingUp, 
  Target, 
  TrendingDown,
  Download,
  Eye,
  Plus,
  Settings,
  BarChart3,
  FileText,
  Zap
} from 'lucide-react'

export function ModernComponentsDemo() {
  return (
    <div className="space-y-8 p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Componentes Modernos</h1>
        <p className="text-muted-foreground">Demonstração dos novos componentes com design suave e responsivo</p>
      </div>

      {/* Cartões de Estatísticas */}
      <section>
        <h2 className="text-2xl font-semibold text-foreground mb-4">Cartões de Estatísticas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <ModernStatCard
            title="Total"
            value="1,234"
            icon={<Users size={20} className="text-primary" />}
            trend="up"
            trendValue="+12%"
          />
          <ModernStatCard
            title="Superaram"
            value="456"
            icon={<Star size={20} className="text-success" />}
            trend="up"
            trendValue="+8%"
          />
          <ModernStatCard
            title="Acima"
            value="321"
            icon={<TrendingUp size={20} className="text-info" />}
            trend="down"
            trendValue="-3%"
          />
          <ModernStatCard
            title="Dentro"
            value="234"
            icon={<Target size={20} className="text-warning" />}
            trend="up"
            trendValue="+5%"
          />
          <ModernStatCard
            title="Abaixo"
            value="123"
            icon={<TrendingDown size={20} className="text-muted-foreground" />}
            trend="down"
            trendValue="-2%"
          />
        </div>
      </section>

      {/* Cartões de Ação */}
      <section>
        <h2 className="text-2xl font-semibold text-foreground mb-4">Cartões de Ação</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ModernActionCard
            title="Novo Candidato"
            description="Adicionar um novo candidato ao sistema"
            icon={<Plus size={24} className="text-primary" />}
            action={
              <Button className="btn-modern-primary w-full">
                <Plus size={16} className="mr-2" />
                Adicionar
              </Button>
            }
          />
          <ModernActionCard
            title="Relatórios"
            description="Gerar relatórios detalhados"
            icon={<BarChart3 size={24} className="text-info" />}
            action={
              <Button className="btn-modern-secondary w-full">
                <BarChart3 size={16} className="mr-2" />
                Gerar
              </Button>
            }
          />
          <ModernActionCard
            title="Configurações"
            description="Configurar sistema e preferências"
            icon={<Settings size={24} className="text-warning" />}
            action={
              <Button className="btn-modern-outline w-full">
                <Settings size={16} className="mr-2" />
                Configurar
              </Button>
            }
          />
        </div>
      </section>

      {/* Cartões de Conteúdo */}
      <section>
        <h2 className="text-2xl font-semibold text-foreground mb-4">Cartões de Conteúdo</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ModernCard>
            <ModernCardHeader
              icon={<FileText size={20} className="text-primary" />}
              title="Informações do Sistema"
              subtitle="Dados gerais da aplicação"
              action={
                <Button size="sm" className="btn-modern-outline">
                  <Eye size={14} className="mr-1" />
                  Ver
                </Button>
              }
            />
            <ModernCardContent>
              <p className="text-muted-foreground mb-4">
                Este é um exemplo de cartão moderno com header, conteúdo e footer. 
                O design é responsivo e inclui efeitos hover suaves.
              </p>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <span className="text-sm font-medium text-success">Ativo</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Versão:</span>
                  <span className="text-sm font-medium text-foreground">1.0.0</span>
                </div>
              </div>
            </ModernCardContent>
            <ModernCardFooter>
              <Button size="sm" className="btn-modern-primary">
                <Download size={14} className="mr-1" />
                Baixar
              </Button>
              <Button size="sm" className="btn-modern-secondary">
                <Zap size={14} className="mr-1" />
                Atualizar
              </Button>
            </ModernCardFooter>
          </ModernCard>

          <ModernCard variant="glass">
            <ModernCardHeader
              icon={<BarChart3 size={20} className="text-info" />}
              title="Análise de Dados"
              subtitle="Estatísticas em tempo real"
            />
            <ModernCardContent>
              <div className="space-y-4">
                <div className="h-32 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl flex items-center justify-center">
                  <BarChart3 size={48} className="text-primary/50" />
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  Gráfico de análise de dados com design glassmorphism
                </p>
              </div>
            </ModernCardContent>
          </ModernCard>
        </div>
      </section>

      {/* Botões Modernos */}
      <section>
        <h2 className="text-2xl font-semibold text-foreground mb-4">Botões Modernos</h2>
        <div className="flex flex-wrap gap-4">
          <Button className="btn-modern-primary">
            <Plus size={16} className="mr-2" />
            Primário
          </Button>
          <Button className="btn-modern-secondary">
            <Settings size={16} className="mr-2" />
            Secundário
          </Button>
          <Button className="btn-modern-outline">
            <Eye size={16} className="mr-2" />
            Outline
          </Button>
        </div>
      </section>

      {/* Linhas Modernas */}
      <section>
        <h2 className="text-2xl font-semibold text-foreground mb-4">Linhas Modernas</h2>
        <div className="space-y-4">
          <div className="line-modern-smooth"></div>
          <div className="line-modern-smooth-thick"></div>
        </div>
      </section>
    </div>
  )
}
