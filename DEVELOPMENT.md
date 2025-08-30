# 🚀 Modo Desenvolvimento - SisPAC

## Configuração Rápida

### 1. Criar Arquivo .env

Crie um arquivo `.env` na raiz do projeto com o seguinte conteúdo:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://zibuyabpsvgulvigvdtb.supabase.co
VITE_SUPABASE_ANON_KEY=SUA_CHAVE_ANONIMA_AQUI
VITE_SUPABASE_SERVICE_ROLE_KEY=SUA_CHAVE_SERVICO_AQUI

# Modo Desenvolvimento
NODE_ENV=development
VITE_APP_ENV=development
VITE_DEBUG=true
```

### 2. Obter Chaves do Supabase

1. Acesse: https://supabase.com/dashboard/project/zibuyabpsvgulvigvdtb
2. Vá para **Settings** > **API**
3. Copie:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** → `VITE_SUPABASE_ANON_KEY`
   - **service_role secret** → `VITE_SUPABASE_SERVICE_ROLE_KEY`

## 🎯 Scripts de Desenvolvimento

### Comandos Disponíveis

```bash
# Desenvolvimento básico
npm run dev

# Desenvolvimento com debug
npm run dev:debug

# Desenvolvimento com navegador automático
npm run dev:open

# Desenvolvimento local (acessível externamente)
npm run dev:local

# Setup automático de desenvolvimento
npm run setup:dev
```

### Scripts Detalhados

- **`npm run dev`**: Servidor básico na porta 5173
- **`npm run dev:debug`**: Modo debug com logs detalhados
- **`npm run dev:open`**: Abre navegador automaticamente
- **`npm run dev:local`**: Acessível de outros dispositivos na rede
- **`npm run setup:dev`**: Configuração automática completa

## 🔧 Configurações de Desenvolvimento

### Vite Config
- **Porta**: 5173
- **Host**: true (acesso externo)
- **Auto-open**: true (abre navegador)
- **Source maps**: habilitados
- **Hot reload**: ativo

### Logs e Debug
- **Nível**: debug
- **Console**: habilitado
- **Timestamps**: ativo
- **Modo desenvolvimento**: detectado automaticamente

## 📱 URLs de Acesso

### Local
- **Aplicação**: http://localhost:5173
- **Preview**: http://localhost:4173

### Rede Local
- **Aplicação**: http://0.0.0.0:5173
- **Acessível de**: Qualquer dispositivo na mesma rede

## 🐛 Debug e Troubleshooting

### Verificar Configuração
```javascript
// No console do navegador
console.log('Modo desenvolvimento:', import.meta.env.DEV)
console.log('Variáveis:', import.meta.env)
```

### Logs de Desenvolvimento
```javascript
import { devLog, devError } from './src/config/development'

devLog('Mensagem de debug')
devError('Erro capturado', error)
```

### Problemas Comuns

1. **Porta 5173 ocupada**
   ```bash
   # Matar processo na porta
   npx kill-port 5173
   ```

2. **Arquivo .env não carregado**
   ```bash
   # Reiniciar servidor
   npm run dev
   ```

3. **Supabase não conecta**
   - Verificar chaves no arquivo .env
   - Verificar URL do projeto
   - Verificar políticas RLS

## 🚀 Deploy de Desenvolvimento

### Build de Desenvolvimento
```bash
npm run build:dev
```

### Preview Local
```bash
npm run preview:dev
```

## 📋 Checklist de Desenvolvimento

- [ ] Arquivo `.env` criado com chaves corretas
- [ ] Servidor rodando na porta 5173
- [ ] Navegador abriu automaticamente
- [ ] Logs de desenvolvimento visíveis no console
- [ ] Supabase conectando corretamente
- [ ] Hot reload funcionando
- [ ] Formulário testado e funcionando

## 🔒 Segurança em Desenvolvimento

- **Nunca commitar** o arquivo `.env`
- **Usar chaves de desenvolvimento** quando possível
- **Não expor** chaves de serviço em produção
- **Testar** políticas RLS adequadamente

## 📞 Suporte

Se encontrar problemas:
1. Verificar console do navegador
2. Verificar logs do terminal
3. Verificar arquivo `.env`
4. Verificar configurações do Supabase
5. Reiniciar servidor de desenvolvimento
