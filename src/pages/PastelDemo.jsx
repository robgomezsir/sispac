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
          <Card variant="modern" interactive className="hover:shadow-2xl">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Heart className="h-5 w-5 text-primary" />
                <CardTitle>Card Moderno</CardTitle>
              </div>
              <CardDescription>
                Um cartão com design pastel suave e feedback tátil.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Este cartão demonstra o design pastel com gradientes suaves e 
                efeitos de hover responsivos.
              </p>
            </CardContent>
            <CardFooter>
              <Button size="sm" variant="default">
                Explorar
              </Button>
            </CardFooter>
          </Card>

          {/* Card 2 - Success */}
          <Card variant="pastel" interactive className="hover:shadow-2xl">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-success" />
                <CardTitle>Card Pastel</CardTitle>
              </div>
              <CardDescription>
                Design com tons verdes pastéis harmoniosos.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Perfeito para indicar ações bem-sucedidas ou status positivos.
              </p>
            </CardContent>
            <CardFooter>
              <Button size="sm" variant="success">
                Confirmar
              </Button>
            </CardFooter>
          </Card>

          {/* Card 3 - Glass */}
          <Card variant="glass" interactive className="hover:shadow-2xl">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <CardTitle>Card Glass</CardTitle>
              </div>
              <CardDescription>
                Efeito glassmorphism com backdrop blur.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Design moderno com transparência e efeitos de vidro.
              </p>
            </CardContent>
            <CardFooter>
              <Button size="sm" variant="glass">
                Visualizar
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Separator */}
        <Separator className="my-8" />

        {/* Areas Section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-center">Áreas Delimitadas</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Area 1 */}
            <Card variant="modern" interactive className="hover:shadow-2xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-info" />
                  <span>Área Informativa</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Esta área demonstra como as delimitações suaves funcionam 
                  com tons pastéis.
                </p>
                <div className="space-y-2">
                  <Input placeholder="Digite algo..." variant="modern" />
                  <div className="flex space-x-2">
                    <Badge variant="secondary">Tag 1</Badge>
                    <Badge variant="outline">Tag 2</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Area 2 */}
            <Card variant="pastel" interactive className="hover:shadow-2xl">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-warning" />
                  <span>Área de Aviso</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Tons amarelos pastéis para chamar atenção sem ser agressivo.
                </p>
                <div className="space-y-2">
                  <Input placeholder="Campo de entrada..." variant="glass" />
                  <div className="flex space-x-2">
                    <Badge variant="secondary">Importante</Badge>
                    <Badge variant="outline">Urgente</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Buttons Section */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-center">Botões Pastéis</h2>
          
          <div className="flex flex-wrap gap-4 justify-center">
            <Button variant="default">
              <Palette className="h-4 w-4" />
              Padrão
            </Button>
            <Button variant="success">
              <Shield className="h-4 w-4" />
              Sucesso
            </Button>
            <Button variant="warning">
              <Star className="h-4 w-4" />
              Aviso
            </Button>
            <Button variant="info">
              <Zap className="h-4 w-4" />
              Info
            </Button>
            <Button variant="glass">
              <Sparkles className="h-4 w-4" />
              Glass
            </Button>
            <Button variant="outline">
              <Sun className="h-4 w-4" />
              Outline
            </Button>
            <Button variant="pastel">
              <Moon className="h-4 w-4" />
              Pastel
            </Button>
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
