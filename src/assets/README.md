# 📁 Guia de Assets - Imagens e Ícones

## 🎯 **Estrutura de Diretórios:**

```
src/assets/
├── images/          # Imagens gerais (fotos, backgrounds, etc.)
├── icons/           # Ícones SVG/PNG (botões, navegação, etc.)
├── logos/           # Logos da empresa/marca
└── index.js         # Arquivo central para importações
```

## 🖼️ **Como Adicionar Imagens:**

### **1. Coloque o arquivo no diretório correto:**
- **Imagens:** `src/assets/images/`
- **Ícones:** `src/assets/icons/`
- **Logos:** `src/assets/logos/`

### **2. Adicione a exportação no `index.js`:**
```javascript
// src/assets/index.js
export { default as minhaImagem } from './images/minha-imagem.jpg'
export { default as meuIcone } from './icons/meu-icone.svg'
```

### **3. Importe no componente:**
```javascript
import { minhaImagem, meuIcone } from '../assets'

function MeuComponente() {
  return (
    <div>
      <img src={minhaImagem} alt="Descrição da imagem" />
      <img src={meuIcone} alt="Descrição do ícone" />
    </div>
  )
}
```

## 📋 **Formatos Suportados:**

### **🖼️ Imagens:**
- **JPG/JPEG** - Para fotos e imagens complexas
- **PNG** - Para imagens com transparência
- **WebP** - Formato moderno e otimizado
- **SVG** - Para gráficos vetoriais

### **🎨 Ícones:**
- **SVG** - Recomendado (escalável, editável)
- **PNG** - Para ícones complexos
- **ICO** - Para favicons

## 🚀 **Exemplos Práticos:**

### **Logo no Header:**
```javascript
// src/assets/index.js
export { default as logo } from './logos/sispac-logo.svg'

// src/App.jsx
import { logo } from './assets'

function NavBar() {
  return (
    <header>
      <img src={logo} alt="SisPAC Logo" className="h-8" />
    </header>
  )
}
```

### **Ícone de Botão:**
```javascript
// src/assets/index.js
export { default as downloadIcon } from './icons/download.svg'

// src/pages/Dashboard.jsx
import { downloadIcon } from '../assets'

function Dashboard() {
  return (
    <button>
      <img src={downloadIcon} alt="Download" className="w-4 h-4" />
      Download
    </button>
  )
}
```

### **Imagem de Background:**
```javascript
// src/assets/index.js
export { default as heroBg } from './images/hero-background.jpg'

// src/pages/Home.jsx
import { heroBg } from '../assets'

function Home() {
  return (
    <div 
      className="bg-cover bg-center min-h-screen"
      style={{ backgroundImage: `url(${heroBg})` }}
    >
      {/* Conteúdo */}
    </div>
  )
}
```

## ⚡ **Dicas de Performance:**

### **1. Otimização de Imagens:**
- **Comprima imagens** antes de adicionar
- **Use formatos apropriados** (WebP para web)
- **Considere lazy loading** para imagens grandes

### **2. Ícones SVG:**
- **Inline SVG** para ícones pequenos
- **Sprite sheets** para muitos ícones
- **Icon fonts** como alternativa

### **3. Lazy Loading:**
```javascript
import { lazy } from 'react'

const LazyImage = lazy(() => import('../assets/images/heavy-image.jpg'))

function Component() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <img src={LazyImage} alt="Imagem pesada" />
    </Suspense>
  )
}
```

## 🔧 **Configuração do Vite:**

O Vite já está configurado para lidar com assets. Ele:
- **Processa automaticamente** imagens e ícones
- **Otimiza formatos** quando possível
- **Gera hashes** para cache busting
- **Suporta import direto** de assets

## 📱 **Responsividade:**

### **Imagens Responsivas:**
```javascript
<img 
  src={minhaImagem} 
  alt="Descrição"
  className="w-full h-auto md:w-auto md:h-64"
/>
```

### **Ícones Adaptativos:**
```javascript
<img 
  src={meuIcone} 
  alt="Ícone"
  className="w-4 h-4 sm:w-6 sm:h-6 lg:w-8 lg:h-8"
/>
```

## 🎨 **Alternativas aos Ícones:**

### **1. Lucide React (já instalado):**
```javascript
import { Download, User, Settings } from 'lucide-react'

function Component() {
  return (
    <div>
      <Download className="w-4 h-4" />
      <User className="w-5 h-5" />
      <Settings className="w-6 h-6" />
    </div>
  )
}
```

### **2. Heroicons:**
```bash
npm install @heroicons/react
```

```javascript
import { DownloadIcon, UserIcon } from '@heroicons/react/24/outline'
```

## 📝 **Checklist de Boas Práticas:**

- [ ] **Organize por tipo** (images, icons, logos)
- [ ] **Use nomes descritivos** para arquivos
- [ ] **Exporte tudo no `index.js`** para centralizar
- [ ] **Otimize imagens** antes de adicionar
- [ ] **Use formatos apropriados** (SVG para ícones)
- [ ] **Adicione alt text** em todas as imagens
- [ ] **Considere lazy loading** para imagens grandes
- [ ] **Teste responsividade** em diferentes tamanhos

## 🆘 **Solução de Problemas:**

### **Imagem não carrega:**
1. Verifique o caminho no `index.js`
2. Confirme se o arquivo existe no diretório
3. Verifique se o formato é suportado
4. Teste o import direto

### **Ícone muito grande/pequeno:**
1. Use classes CSS para dimensionar
2. Considere usar SVG inline para controle total
3. Ajuste com `w-` e `h-` do Tailwind

### **Performance ruim:**
1. Comprima imagens grandes
2. Use lazy loading
3. Considere formatos modernos (WebP)
4. Implemente cache de imagens

