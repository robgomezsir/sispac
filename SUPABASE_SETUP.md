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

## Teste

Após configurar, teste o formulário:
1. Acesse `/form`
2. Responda as perguntas
3. Preencha nome e email
4. Clique em "Enviar Respostas"

Se ainda houver erro, verifique os logs do console do navegador para mais detalhes.
