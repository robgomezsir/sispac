# Guia de Conexão Correta com Supabase - SisPAC

## Problema Identificado

O sistema estava tentando usar uma API externa (`/api/candidates`) que não existe em produção no Vercel, causando erros de "Unexpected token '<'" porque o Vercel retornava HTML em vez de JSON.

## Solução Implementada

### 1. Conexão Direta com Supabase

**Antes (Problemático):**
```javascript
// Tentava usar API externa que não existe em produção
const res = await fetch('/api/candidates', { headers })
const data = await res.json() // ❌ Erro: HTML em vez de JSON
```

**Depois (Correto):**
```javascript
// Conexão direta com Supabase
const { data: candidates, error: candidatesError } = await supabase
  .from('candidates')
  .select('*')
  .order('created_at', { ascending: false })
```

### 2. Carregamento Otimizado

**Problema:** O dashboard recarregava automaticamente constantemente.

**Solução:** Implementado carregamento único e controlado:

```javascript
// Carregar dados apenas uma vez quando o usuário estiver autenticado
useEffect(() => {
  if (user && !initialLoad && !loading) {
    console.log("🔍 [Dashboard] Usuário autenticado detectado, carregando dados...")
    load()
  }
}, [user?.id]) // Dependência apenas no ID do usuário para evitar loops
```

## Passo a Passo para Conexão Correta

### Passo 1: Verificar Configuração do Supabase

1. **Arquivo:** `src/lib/supabase.js`
2. **Verificar se as variáveis estão corretas:**
   ```javascript
   const supabaseUrl = 'https://zibuyabpsvgulvigvdtb.supabase.co'
   const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
   ```

### Passo 2: Configurar RLS (Row Level Security)

1. **Acessar o painel do Supabase**
2. **Ir para Authentication > Policies**
3. **Configurar políticas para a tabela `candidates`:**

```sql
-- Política para permitir leitura para usuários autenticados
CREATE POLICY "Usuários autenticados podem ler candidatos" ON candidates
  FOR SELECT USING (auth.role() = 'authenticated');

-- Política para permitir inserção para usuários autenticados
CREATE POLICY "Usuários autenticados podem inserir candidatos" ON candidates
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Política para permitir atualização para usuários autenticados
CREATE POLICY "Usuários autenticados podem atualizar candidatos" ON candidates
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Política para permitir exclusão para usuários autenticados
CREATE POLICY "Usuários autenticados podem deletar candidatos" ON candidates
  FOR DELETE USING (auth.role() = 'authenticated');
```

### Passo 3: Estrutura da Tabela Candidates

**Verificar se a tabela `candidates` tem a estrutura correta:**

```sql
CREATE TABLE candidates (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  score INTEGER DEFAULT 0,
  status TEXT DEFAULT 'PENDENTE',
  answers JSONB,
  behavioral_profile JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Passo 4: Configuração de Desenvolvimento vs Produção

**Desenvolvimento (vite.config.js):**
```javascript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:3001', // Servidor local
      changeOrigin: true,
      secure: false
    }
  }
}
```

**Produção (Vercel):**
- Não usar proxy
- Conectar diretamente ao Supabase
- Usar variáveis de ambiente do Vercel

### Passo 5: Implementação no Dashboard

**1. Importar Supabase:**
```javascript
import { supabase } from '../lib/supabase'
```

**2. Função de Carregamento:**
```javascript
const load = useCallback(async () => {
  if (loading) return
  
  setLoading(true)
  setError(null)
  
  try {
    const { data: candidates, error: candidatesError } = await supabase
      .from('candidates')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (candidatesError) {
      throw new Error(`Erro ao carregar candidatos: ${candidatesError.message}`)
    }
    
    setRows(candidates || [])
    setInitialLoad(true)
    setError(null)
  } catch (err) {
    console.error("❌ Erro ao carregar dados:", err)
    setError(`Erro: ${err.message}`)
    setRows([])
  } finally {
    setLoading(false)
  }
}, [loading, user])
```

**3. Carregamento Controlado:**
```javascript
useEffect(() => {
  if (user && !initialLoad && !loading) {
    load()
  }
}, [user?.id]) // Apenas quando o usuário mudar
```

### Passo 6: Operações CRUD

**Criar Candidato:**
```javascript
const { data, error } = await supabase
  .from('candidates')
  .insert([{ name, email, status: 'PENDENTE' }])
  .select()
```

**Atualizar Candidato:**
```javascript
const { data, error } = await supabase
  .from('candidates')
  .update({ score: 85, status: 'ACIMA DA EXPECTATIVA' })
  .eq('id', candidateId)
```

**Deletar Candidato:**
```javascript
const { error } = await supabase
  .from('candidates')
  .delete()
  .eq('id', candidateId)
```

### Passo 7: Tratamento de Erros

**Tipos de Erro Comuns:**
1. **Erro de Autenticação:** Token expirado ou inválido
2. **Erro de Permissão:** RLS bloqueando operação
3. **Erro de Rede:** Problemas de conectividade
4. **Erro de Dados:** Validação ou constraint

**Implementação:**
```javascript
if (candidatesError) {
  if (candidatesError.code === 'PGRST301') {
    setError('Sessão expirada. Faça login novamente.')
  } else if (candidatesError.code === 'PGRST116') {
    setError('Candidato não encontrado.')
  } else {
    setError(`Erro: ${candidatesError.message}`)
  }
}
```

### Passo 8: Teste de Conexão

**Script de Teste:**
```javascript
// test_connection.js
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(url, key)

async function testConnection() {
  try {
    const { data, error } = await supabase
      .from('candidates')
      .select('*')
      .limit(1)
    
    if (error) throw error
    
    console.log('✅ Conexão OK:', data.length, 'registros')
    return true
  } catch (error) {
    console.error('❌ Erro:', error)
    return false
  }
}

testConnection()
```

## Checklist de Verificação

- [ ] Variáveis de ambiente configuradas corretamente
- [ ] RLS configurado na tabela candidates
- [ ] Estrutura da tabela correta
- [ ] Conexão direta com Supabase (não API externa)
- [ ] Carregamento controlado (sem loops)
- [ ] Tratamento de erros implementado
- [ ] Teste de conexão funcionando
- [ ] Operações CRUD funcionando
- [ ] Autenticação funcionando

## Benefícios da Solução

1. **Confiabilidade:** Conexão direta com Supabase
2. **Performance:** Menos requisições desnecessárias
3. **Manutenibilidade:** Código mais simples e direto
4. **Escalabilidade:** Funciona em desenvolvimento e produção
5. **Segurança:** RLS configurado corretamente

## Próximos Passos

1. Deploy das correções para produção
2. Teste completo em ambiente de produção
3. Monitoramento de erros
4. Documentação da API para integrações futuras
