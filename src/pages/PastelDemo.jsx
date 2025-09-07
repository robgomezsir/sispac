import React from 'react'
// Usando elementos HTML padrão temporariamente
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
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-2xl transition-shadow">
            <div className="flex flex-col space-y-1.5 p-6">
              <div className="flex items-center space-x-2">
                <Heart className="h-5 w-5 text-primary" />
                <h3 className="text-2xl font-semibold leading-none tracking-tight">Card Moderno</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Um cartão com design pastel suave e feedback tátil.
              </p>
            </div>
            <div className="p-6 pt-0">
              <p className="text-sm text-muted-foreground">
                Este cartão demonstra o design pastel com gradientes suaves e 
                efeitos de hover responsivos.
              </p>
            </div>
            <div className="flex items-center p-6 pt-0">
              <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 rounded-md px-3">
                Explorar
              </button>
            </div>
          </div>

          {/* Card 2 - Success */}
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-2xl transition-shadow">
            <div className="flex flex-col space-y-1.5 p-6">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-success" />
                <h3 className="text-2xl font-semibold leading-none tracking-tight">Card Pastel</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Design com tons verdes pastéis harmoniosos.
              </p>
            </div>
            <div className="p-6 pt-0">
              <p className="text-sm text-muted-foreground">
                Perfeito para indicar ações bem-sucedidas ou status positivos.
              </p>
            </div>
            <div className="flex items-center p-6 pt-0">
              <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground hover:bg-secondary/80 h-9 rounded-md px-3">
                Confirmar
              </button>
            </div>
          </div>

          {/* Card 3 - Glass */}
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-2xl transition-shadow">
            <div className="flex flex-col space-y-1.5 p-6">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <h3 className="text-2xl font-semibold leading-none tracking-tight">Card Glass</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Efeito glassmorphism com backdrop blur.
              </p>
            </div>
            <div className="p-6 pt-0">
              <p className="text-sm text-muted-foreground">
                Design moderno com transparência e efeitos de vidro.
              </p>
            </div>
            <div className="flex items-center p-6 pt-0">
              <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3">
                Visualizar
              </button>
            </div>
          </div>
        </div>

        {/* Separator */}
        <div className="my-8 h-px bg-border w-full" />

        {/* Areas Section */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">Áreas de Conteúdo</h2>
            <p className="text-muted-foreground">
              Demonstração de diferentes layouts e espaçamentos
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Area 1 */}
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-2xl transition-shadow">
              <div className="flex flex-col space-y-1.5 p-6">
                <h3 className="text-2xl font-semibold leading-none tracking-tight flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-info" />
                  <span>Área Informativa</span>
                </h3>
              </div>
              <div className="p-6 pt-0">
                <p className="text-sm text-muted-foreground mb-4">
                  Esta área demonstra como as delimitações suaves funcionam 
                  em diferentes contextos.
                </p>
                <div className="space-y-2">
                  <input 
                    placeholder="Digite algo..." 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  <div className="flex space-x-2">
                    <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 bg-secondary text-secondary-foreground hover:bg-secondary/80">Tag 1</span>
                    <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/80">Tag 2</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Area 2 */}
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-2xl transition-shadow">
              <div className="flex flex-col space-y-1.5 p-6">
                <h3 className="text-2xl font-semibold leading-none tracking-tight flex items-center space-x-2">
                  <Palette className="h-5 w-5 text-warning" />
                  <span>Paleta de Cores</span>
                </h3>
              </div>
              <div className="p-6 pt-0">
                <p className="text-sm text-muted-foreground mb-4">
                  Explore nossa paleta de cores pastéis cuidadosamente selecionadas.
                </p>
                <div className="grid grid-cols-4 gap-2">
                  <div className="h-12 rounded-lg bg-primary/20 border border-primary/30"></div>
                  <div className="h-12 rounded-lg bg-secondary/20 border border-secondary/30"></div>
                  <div className="h-12 rounded-lg bg-accent/20 border border-accent/30"></div>
                  <div className="h-12 rounded-lg bg-muted/20 border border-muted/30"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            Design system moderno com foco em acessibilidade e usabilidade
          </p>
        </div>
      </div>
    </div>
  )
}