import React from 'react'
import { 
  PastelCard, 
  PastelCardHeader, 
  PastelCardTitle, 
  PastelCardDescription, 
  PastelCardContent, 
  PastelCardFooter,
  PastelButton,
  PastelArea,
  PastelAreaHeader,
  PastelAreaTitle,
  PastelAreaContent,
  PastelSeparator,
  Input,
  Badge
} from '../components/ui'
import { 
  Heart, 
  Star, 
  Zap, 
  Shield, 
  Sparkles, 
  Palette,
  Sun,
  Moon
} from 'lucide-react'

export default function PastelDemo() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Design Pastel Moderno
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Uma demonstração dos novos componentes com cores pastéis suaves, 
            feedback tátil responsivo e animações elegantes.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 - Default */}
          <PastelCard interactive glow>
            <PastelCardHeader>
              <div className="flex items-center space-x-2">
                <Heart className="h-5 w-5 text-primary" />
                <PastelCardTitle>Card Padrão</PastelCardTitle>
              </div>
              <PastelCardDescription>
                Um cartão com design pastel suave e feedback tátil.
              </PastelCardDescription>
            </PastelCardHeader>
            <PastelCardContent>
              <p className="text-sm text-muted-foreground">
                Este cartão demonstra o design pastel com gradientes suaves e 
                efeitos de hover responsivos.
              </p>
            </PastelCardContent>
            <PastelCardFooter>
              <PastelButton size="sm" variant="primary">
                Explorar
              </PastelButton>
            </PastelCardFooter>
          </PastelCard>

          {/* Card 2 - Success */}
          <PastelCard variant="success" interactive>
            <PastelCardHeader>
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-success" />
                <PastelCardTitle>Card de Sucesso</PastelCardTitle>
              </div>
              <PastelCardDescription>
                Design com tons verdes pastéis harmoniosos.
              </PastelCardDescription>
            </PastelCardHeader>
            <PastelCardContent>
              <p className="text-sm text-muted-foreground">
                Perfeito para indicar ações bem-sucedidas ou status positivos.
              </p>
            </PastelCardContent>
            <PastelCardFooter>
              <PastelButton size="sm" variant="success">
                Confirmar
              </PastelButton>
            </PastelCardFooter>
          </PastelCard>

          {/* Card 3 - Glass */}
          <PastelCard variant="glass" interactive>
            <PastelCardHeader>
              <div className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <PastelCardTitle>Card Glass</PastelCardTitle>
              </div>
              <PastelCardDescription>
                Efeito glassmorphism com backdrop blur.
              </PastelCardDescription>
            </PastelCardHeader>
            <PastelCardContent>
              <p className="text-sm text-muted-foreground">
                Design moderno com transparência e efeitos de vidro.
              </p>
            </PastelCardContent>
            <PastelCardFooter>
              <PastelButton size="sm" variant="glass">
                Visualizar
              </PastelButton>
            </PastelCardFooter>
          </PastelCard>
        </div>

        {/* Separator */}
        <PastelSeparator variant="primary" animated />

        {/* Areas Section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-center">Áreas Delimitadas</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Area 1 */}
            <PastelArea variant="info" interactive>
              <PastelAreaHeader>
                <PastelAreaTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-info" />
                  <span>Área Informativa</span>
                </PastelAreaTitle>
              </PastelAreaHeader>
              <PastelAreaContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Esta área demonstra como as delimitações suaves funcionam 
                  com tons pastéis.
                </p>
                <div className="space-y-2">
                  <Input placeholder="Digite algo..." variant="glass" />
                  <div className="flex space-x-2">
                    <Badge variant="secondary">Tag 1</Badge>
                    <Badge variant="outline">Tag 2</Badge>
                  </div>
                </div>
              </PastelAreaContent>
            </PastelArea>

            {/* Area 2 */}
            <PastelArea variant="warning" interactive>
              <PastelAreaHeader>
                <PastelAreaTitle className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-warning" />
                  <span>Área de Aviso</span>
                </PastelAreaTitle>
              </PastelAreaHeader>
              <PastelAreaContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Tons amarelos pastéis para chamar atenção sem ser agressivo.
                </p>
                <div className="space-y-2">
                  <Input placeholder="Campo de entrada..." variant="filled" />
                  <div className="flex space-x-2">
                    <Badge variant="secondary">Importante</Badge>
                    <Badge variant="outline">Urgente</Badge>
                  </div>
                </div>
              </PastelAreaContent>
            </PastelArea>
          </div>
        </div>

        {/* Buttons Section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-center">Botões Pastéis</h2>
          
          <div className="flex flex-wrap gap-4 justify-center">
            <PastelButton variant="default" shimmer>
              <Palette className="h-4 w-4" />
              Padrão
            </PastelButton>
            <PastelButton variant="success" glow>
              <Shield className="h-4 w-4" />
              Sucesso
            </PastelButton>
            <PastelButton variant="warning">
              <Star className="h-4 w-4" />
              Aviso
            </PastelButton>
            <PastelButton variant="info">
              <Zap className="h-4 w-4" />
              Info
            </PastelButton>
            <PastelButton variant="glass">
              <Sparkles className="h-4 w-4" />
              Glass
            </PastelButton>
            <PastelButton variant="outline">
              <Sun className="h-4 w-4" />
              Outline
            </PastelButton>
          </div>
        </div>

        {/* Theme Demo */}
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Tema Claro/Escuro</h2>
          <p className="text-muted-foreground">
            Os componentes se adaptam automaticamente aos temas claro e escuro 
            com cores pastéis harmoniosas.
          </p>
          <div className="flex justify-center space-x-4">
            <div className="flex items-center space-x-2 p-3 rounded-xl bg-sun/10 border border-sun/20">
              <Sun className="h-5 w-5 text-yellow-500" />
              <span className="text-sm font-medium">Tema Claro</span>
            </div>
            <div className="flex items-center space-x-2 p-3 rounded-xl bg-moon/10 border border-moon/20">
              <Moon className="h-5 w-5 text-blue-500" />
              <span className="text-sm font-medium">Tema Escuro</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
