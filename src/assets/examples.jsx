// 📚 EXEMPLOS PRÁTICOS DE USO DOS ASSETS
// Este arquivo demonstra como usar todos os assets criados

import React from 'react'
import { 
  // 🖼️ IMAGENS
  heroBackground,
  
  // 🎨 ÍCONES
  favicon,
  downloadIcon,
  eyeIcon,
  refreshIcon,
  userPlusIcon,
  trashIcon,
  saveIcon,
  alertTriangleIcon,
  closeIcon,
  menuIcon,
  
  // 🏷️ LOGOS
  sispacLogo,
  logo192,
  logo512
} from './index'

// 🎯 EXEMPLO 1: Header com Logo
export function HeaderExample() {
  return (
    <header className="bg-white shadow-sm p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img src={sispacLogo} alt="SisPAC Logo" className="h-8" />
          <span className="text-xl font-bold text-gray-800">SisPAC</span>
        </div>
        
        <button className="md:hidden">
          <img src={menuIcon} alt="Menu" className="w-6 h-6" />
        </button>
      </div>
    </header>
  )
}

// 🎯 EXEMPLO 2: Botões com Ícones
export function ButtonExamples() {
  return (
    <div className="space-y-4 p-4">
      <h3 className="text-lg font-semibold">Botões com Ícones</h3>
      
      <div className="flex flex-wrap gap-3">
        <button className="btn-primary flex items-center space-x-2">
          <img src={downloadIcon} alt="Download" className="w-4 h-4" />
          <span>Download</span>
        </button>
        
        <button className="btn-secondary flex items-center space-x-2">
          <img src={refreshIcon} alt="Atualizar" className="w-4 h-4" />
          <span>Atualizar</span>
        </button>
        
        <button className="btn-secondary flex items-center space-x-2">
          <img src={eyeIcon} alt="Ver detalhes" className="w-4 h-4" />
          <span>Detalhar</span>
        </button>
      </div>
    </div>
  )
}

// 🎯 EXEMPLO 3: Botões de Configuração
export function ConfigButtonExamples() {
  return (
    <div className="space-y-4 p-4">
      <h3 className="text-lg font-semibold">Botões de Configuração</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button className="btn-primary flex items-center space-x-2">
          <img src={userPlusIcon} alt="Adicionar" className="w-4 h-4" />
          <span>Adicionar</span>
        </button>
        
        <button className="btn-danger flex items-center space-x-2">
          <img src={trashIcon} alt="Remover" className="w-4 h-4" />
          <span>Remover</span>
        </button>
        
        <button className="btn-secondary flex items-center space-x-2">
          <img src={saveIcon} alt="Backup" className="w-4 h-4" />
          <span>Backup</span>
        </button>
        
        <button className="btn-warning flex items-center space-x-2">
          <img src={alertTriangleIcon} alt="Limpar" className="w-4 h-4" />
          <span>Limpar</span>
        </button>
      </div>
    </div>
  )
}

// 🎯 EXEMPLO 4: Modal com Ícone de Fechar
export function ModalExample() {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Modal de Exemplo</h3>
          <button className="p-1 hover:bg-gray-100 rounded">
            <img src={closeIcon} alt="Fechar" className="w-5 h-5" />
          </button>
        </div>
        
        <p className="text-gray-600 mb-4">
          Este é um exemplo de modal usando o ícone de fechar.
        </p>
        
        <div className="flex justify-end space-x-2">
          <button className="btn-secondary">Cancelar</button>
          <button className="btn-primary">Confirmar</button>
        </div>
      </div>
    </div>
  )
}

// 🎯 EXEMPLO 5: Background com Imagem
export function BackgroundExample() {
  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center"
      style={{ backgroundImage: `url(${heroBackground})` }}
    >
      <div className="text-center text-white">
        <h1 className="text-4xl font-bold mb-4">Bem-vindo ao SisPAC</h1>
        <p className="text-xl mb-8">Sistema de Processamento e Análise de Candidatos</p>
        <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
          Começar
        </button>
      </div>
    </div>
  )
}

// 🎯 EXEMPLO 6: Lista de Assets Disponíveis
export function AssetsList() {
  const assets = [
    { name: 'sispacLogo', type: 'Logo', description: 'Logo principal do SisPAC' },
    { name: 'logo192', type: 'Logo', description: 'Logo 192x192 para PWA' },
    { name: 'logo512', type: 'Logo', description: 'Logo 512x512 para PWA' },
    { name: 'heroBackground', type: 'Imagem', description: 'Background hero da aplicação' },
    { name: 'downloadIcon', type: 'Ícone', description: 'Ícone de download' },
    { name: 'eyeIcon', type: 'Ícone', description: 'Ícone de visualizar' },
    { name: 'refreshIcon', type: 'Ícone', description: 'Ícone de atualizar' },
    { name: 'userPlusIcon', type: 'Ícone', description: 'Ícone de adicionar usuário' },
    { name: 'trashIcon', type: 'Ícone', description: 'Ícone de lixeira' },
    { name: 'saveIcon', type: 'Ícone', description: 'Ícone de salvar' },
    { name: 'alertTriangleIcon', type: 'Ícone', description: 'Ícone de alerta' },
    { name: 'closeIcon', type: 'Ícone', description: 'Ícone de fechar' },
    { name: 'menuIcon', type: 'Ícone', description: 'Ícone de menu' },
    { name: 'favicon', type: 'Ícone', description: 'Favicon da aplicação' }
  ]

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-4">Assets Disponíveis</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {assets.map((asset) => (
          <div key={asset.name} className="border rounded-lg p-3">
            <div className="font-mono text-sm text-blue-600">{asset.name}</div>
            <div className="text-xs text-gray-500 uppercase">{asset.type}</div>
            <div className="text-sm text-gray-700">{asset.description}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// 🎯 EXEMPLO 7: Como Importar
export function ImportExample() {
  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Como Importar</h3>
      
      <div className="space-y-3">
        <div>
          <h4 className="font-medium">Importar tudo:</h4>
          <code className="block bg-gray-800 text-green-400 p-2 rounded text-sm">
            import * as assets from '../assets'
          </code>
        </div>
        
        <div>
          <h4 className="font-medium">Importar específicos:</h4>
          <code className="block bg-gray-800 text-green-400 p-2 rounded text-sm">
            import { sispacLogo, downloadIcon, heroBackground } from '../assets'
          </code>
        </div>
        
        <div>
          <h4 className="font-medium">Importar com alias:</h4>
          <code className="block bg-gray-800 text-green-400 p-2 rounded text-sm">
            import { sispacLogo as logo, downloadIcon as download } from '../assets'
          </code>
        </div>
      </div>
    </div>
  )
}

// 🎯 EXEMPLO 8: Uso Responsivo
export function ResponsiveExample() {
  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-4">Uso Responsivo</h3>
      
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <img src={sispacLogo} alt="Logo" className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24" />
          <div>
            <h4 className="font-medium">Logo Responsivo</h4>
            <p className="text-sm text-gray-600">w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <img src={downloadIcon} alt="Download" className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
          <div>
            <h4 className="font-medium">Ícone Responsivo</h4>
            <p className="text-sm text-gray-600">w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <img src={heroBackground} alt="Background" className="w-32 h-20 md:w-48 md:h-32 lg:w-64 lg:h-40" />
          <div>
            <h4 className="font-medium">Imagem Responsiva</h4>
            <p className="text-sm text-gray-600">w-32 h-20 md:w-48 md:h-32 lg:w-64 lg:h-40</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// 🎯 EXEMPLO 9: Componente Completo
export function CompleteExample() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <HeaderExample />
      
      {/* Main Content */}
      <main className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Hero Section */}
          <BackgroundExample />
          
          {/* Buttons Section */}
          <ButtonExamples />
          
          {/* Config Section */}
          <ConfigButtonExamples />
          
          {/* Assets List */}
          <AssetsList />
          
          {/* Import Guide */}
          <ImportExample />
          
          {/* Responsive Guide */}
          <ResponsiveExample />
        </div>
      </main>
    </div>
  )
}

// 📋 NOTAS IMPORTANTES:
// 1. Todos os assets são exportados do arquivo index.js
// 2. Use sempre alt text descritivo para acessibilidade
// 3. Ajuste tamanhos com classes Tailwind (w-4 h-4, etc.)
// 4. Para backgrounds, use style={{ backgroundImage: `url(${asset})` }}
// 5. Ícones SVG podem ser estilizados com currentColor
// 6. Use lazy loading para imagens grandes
// 7. Teste responsividade em diferentes tamanhos de tela
