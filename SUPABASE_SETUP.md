# Configuração do Supabase para SisPAC

## Problema Identificado

O erro `"new row violates row-level security policy for table 'candidates'"` indica que o Supabase está configurado com Row Level Security (RLS) ativado, mas não há políticas que permitam inserção de dados para usuários anônimos.

## Soluções

### Opção 1: Desabilitar RLS (Mais Simples)

1. Acesse o [Dashboard do Supabase](https://supabase.com/dashboard)
2. Vá para o seu projeto
3. Navegue para **Database** > **Tables**
4. Selecione a tabela `candidates`
5. Clique em **Settings** (ícone de engrenagem)
6. Desabilite a opção **"Enable Row Level Security (RLS)"**
7. Repita o processo para a tabela `results`

### Opção 2: Configurar Políticas RLS (Mais Seguro)

1. Acesse o [Dashboard do Supabase](https://supabase.com/dashboard)
2. Vá para o seu projeto
3. Navegue para **Database** > **Tables**
4. Selecione a tabela `candidates`
5. Clique em **Policies**
6. Clique em **"New Policy"**
7. Configure a política:

```sql
-- Política para permitir inserção de candidatos
CREATE POLICY "Enable insert for all users" ON "public"."candidates"
FOR INSERT WITH CHECK (true);

-- Política para permitir leitura de candidatos
CREATE POLICY "Enable read access for all users" ON "public"."candidates"
FOR SELECT USING (true);
```

8. Repita o processo para a tabela `results`

### Opção 3: Usar Chave de Serviço (Para Desenvolvimento)

1. Acesse o [Dashboard do Supabase](https://supabase.com/dashboard)
2. Vá para o seu projeto
3. Navegue para **Settings** > **API**
4. Copie a **Service Role Key** (chave privada)
5. Crie um arquivo `.env` na raiz do projeto:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 🔧 Configuração das URLs de Redirecionamento

### ⚠️ **IMPORTANTE: Use estas URLs específicas**

O Vercel intercepta rotas como `/welcome` e `/join`. Use estas rotas alternativas:

**URLs Recomendadas para Supabase:**
- `https://sispac-kfs8jdgkd-rob-gomezs-projects.vercel.app/setup-password`
- `https://sispac-kfs8jdgkd-rob-gomezs-projects.vercel.app/complete-invite`

**URLs que NÃO funcionam (interceptadas pelo Vercel):**
- ❌ `/welcome` - Interceptada pelo Vercel
- ❌ `/join` - Interceptada pelo Vercel
- ❌ `/auth/confirm` - Interceptada pelo Vercel

### 4. Configuração de Email Templates (Opcional)

Para personalizar os emails de convite:

1. Vá para **Authentication** > **Email Templates**
2. Selecione **"Invite"**
3. Configure o template para incluir a URL correta:

```html
<!-- Exemplo de template de convite -->
<p>Você foi convidado para participar do SisPAC.</p>
<p>Clique no link abaixo para aceitar o convite:</p>
<a href="{{ .ConfirmationURL }}">Aceitar Convite</a>
```

## Recomendação

Para desenvolvimento e testes, use a **Opção 1** (desabilitar RLS).
Para produção, use a **Opção 2** (configurar políticas RLS adequadas).

## Estrutura das Tabelas

### Tabela `candidates`
- `id` (uuid, primary key)
- `name` (text)
- `email` (text)
- `answers` (jsonb)
- `score` (integer)
- `status` (text)
- `created_at` (timestamp)

### Tabela `results`
- `id` (uuid, primary key)
- `candidate_id` (uuid, foreign key)
- `details` (text)
- `created_at` (timestamp)

### Tabela `profiles` (Nova - Para Sistema de Convites)
- `id` (uuid, primary key, references auth.users.id)
- `email` (text)
- `role` (text, default: 'rh')
- `password_set` (boolean, default: false)
- `created_at` (timestamp, default: now())
- `updated_at` (timestamp, default: now())

## Configuração da Tabela Profiles

Para o sistema de convites funcionar corretamente, execute o seguinte SQL no seu projeto Supabase:

```sql
-- Criar tabela profiles se não existir
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    role TEXT DEFAULT 'rh',
    password_set BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS na tabela profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Criar políticas para profiles
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Service role can manage all profiles" ON public.profiles
    FOR ALL USING (auth.role() = 'service_role');

-- Criar função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para atualizar updated_at
CREATE TRIGGER handle_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
```

## Teste

Após configurar, teste o formulário:
1. Acesse `/form`
2. Responda as perguntas
3. Preencha nome e email
4. Clique em "Enviar Respostas"

Se ainda houver erro, verifique os logs do console do navegador para mais detalhes.

## Sistema de Convites

Com a tabela `profiles` configurada, o sistema agora:
1. Detecta automaticamente usuários convidados (sem senha definida)
2. Redireciona para página de criação de senha
3. Evita login automático no dashboard
4. Permite que o usuário crie sua senha antes de acessar o sistema

## Troubleshooting de Convites

### Problema: Convite redireciona para Vercel em vez do SisPAC

**Solução:**
1. Verifique se a **Site URL** está configurada corretamente
2. Confirme se as **Redirect URLs** incluem `/auth/confirm`
3. Teste o link do convite em uma aba anônima
4. Verifique se não há conflitos com outras configurações de URL

### Problema: Usuário não consegue criar senha

**Solução:**
1. Verifique se a tabela `profiles` foi criada
2. Confirme se as políticas RLS estão configuradas
3. Verifique os logs do console para erros
4. Teste com um usuário admin primeiro
