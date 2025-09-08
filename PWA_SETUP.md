# SisPAC PWA - Configuração e Funcionalidades

## Visão Geral

O SisPAC agora é uma **Progressive Web App (PWA)** que permite instalação direta no computador através do navegador, oferecendo funcionalidades offline e uma experiência similar a aplicações nativas.

## Funcionalidades Implementadas

### ✅ Instalação PWA
- **Prompt de instalação automático** quando disponível
- **Ícones em diferentes tamanhos** para compatibilidade
- **Manifest.json** configurado para instalação
- **Shortcuts** para acesso rápido ao Dashboard e Formulário

### ✅ Cache Offline
- **Service Worker** com estratégias de cache inteligentes
- **Cache First** para arquivos estáticos
- **Network First** para APIs do Supabase
- **Fallback** para páginas SPA quando offline

### ✅ Indicadores de Status
- **Indicador offline** quando não há conexão
- **Prompt de instalação** com status de conectividade
- **Logs detalhados** para debugging

### ✅ Funcionalidades Avançadas
- **Sincronização em background** (preparado para futuras implementações)
- **Notificações push** (estrutura implementada)
- **Atualizações automáticas** do Service Worker

## Arquivos Criados/Modificados

### Novos Arquivos
- `public/manifest.json` - Configuração do PWA
- `public/sw.js` - Service Worker
- `src/components/PWAInstallPrompt.jsx` - Componente de instalação
- `src/components/OfflineIndicator.jsx` - Indicador offline
- `src/hooks/usePWA.jsx` - Hook para funcionalidades PWA

### Arquivos Modificados
- `index.html` - Adicionadas meta tags e scripts PWA
- `src/App.jsx` - Integração dos componentes PWA
- Arquivo de configuração de deploy - Headers específicos para PWA

## Como Testar

### 1. Desenvolvimento Local
```bash
npm run dev
```
- Abra o DevTools (F12)
- Vá para a aba "Application" > "Manifest"
- Verifique se o manifest está carregado
- Vá para "Service Workers" e verifique se está registrado

### 2. Build de Produção
```bash
npm run build
npm run preview
```
- Teste em HTTPS (necessário para PWA)
- Verifique se o prompt de instalação aparece
- Teste funcionalidades offline

### 3. Deploy
- O PWA funciona automaticamente após deploy
- Verifique se os headers estão configurados corretamente
- Teste em diferentes dispositivos

## Estratégias de Cache

### Cache First (Arquivos Estáticos)
- CSS, JS, imagens, ícones
- Carregamento rápido
- Funciona offline

### Network First (APIs)
- Requisições para Supabase
- Fallback para cache quando offline
- Atualização automática quando online

## Compatibilidade

### Navegadores Suportados
- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari (iOS/macOS)
- ⚠️ Internet Explorer (limitado)

### Dispositivos
- ✅ Desktop (Windows, macOS, Linux)
- ✅ Mobile (Android, iOS)
- ✅ Tablet

## Próximos Passos

### Funcionalidades Futuras
1. **Sincronização offline** de formulários
2. **Notificações push** para novos candidatos
3. **Background sync** para dados pendentes
4. **Atualizações automáticas** com notificação

### Melhorias Técnicas
1. **Cache mais inteligente** baseado em uso
2. **Compressão de assets** para melhor performance
3. **Analytics** de uso offline
4. **Testes automatizados** para PWA

## Troubleshooting

### Problemas Comuns

#### Prompt de instalação não aparece
- Verifique se está em HTTPS
- Confirme se o manifest.json está acessível
- Verifique se o Service Worker está registrado
- Teste em modo incógnito

#### Cache não funciona
- Verifique se o Service Worker está ativo
- Limpe o cache do navegador
- Verifique os logs no console
- Confirme se os headers estão corretos

#### Funcionalidades offline limitadas
- Verifique se as APIs estão sendo cacheadas
- Confirme se o fallback está funcionando
- Teste com diferentes tipos de conteúdo

### Logs Úteis
```javascript
// Verificar status do PWA
console.log('PWA Status:', {
  isInstalled: window.matchMedia('(display-mode: standalone)').matches,
  hasServiceWorker: 'serviceWorker' in navigator,
  isOnline: navigator.onLine
})

// Verificar cache
caches.keys().then(names => console.log('Caches:', names))
```

## Recursos Adicionais

- [MDN PWA Guide](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Web.dev PWA](https://web.dev/progressive-web-apps/)
- [PWA Builder](https://www.pwabuilder.com/)
- [Lighthouse PWA Audit](https://developers.google.com/web/tools/lighthouse)
