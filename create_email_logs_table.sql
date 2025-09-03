-- =====================================================
-- CRIAÇÃO DA TABELA DE LOGS DE E-MAIL
-- =====================================================
-- Execute este script no SQL Editor do Supabase

-- 1. CRIAR TABELA EMAIL_LOGS
-- =====================================================
CREATE TABLE IF NOT EXISTS public.email_logs (
    id BIGSERIAL PRIMARY KEY,
    to_email TEXT NOT NULL,
    subject TEXT NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'pending')),
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. CRIAR ÍNDICES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_email_logs_to_email ON public.email_logs(to_email);
CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at ON public.email_logs(sent_at);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON public.email_logs(status);

-- 3. CRIAR POLÍTICAS RLS
-- =====================================================
-- Remover políticas existentes
DROP POLICY IF EXISTS "Service role can manage email logs" ON public.email_logs;
DROP POLICY IF EXISTS "Authenticated users can view email logs" ON public.email_logs;

-- Criar políticas corretas
CREATE POLICY "Service role can manage email logs" ON public.email_logs
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Authenticated users can view email logs" ON public.email_logs
    FOR SELECT USING (auth.role() = 'authenticated');

-- 4. HABILITAR RLS
-- =====================================================
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- 5. VERIFICAR ESTRUTURA DA TABELA
-- =====================================================
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'email_logs'
ORDER BY ordinal_position;

-- 6. TESTAR INSERÇÃO DE DADOS
-- =====================================================
INSERT INTO public.email_logs (to_email, subject, status) 
VALUES ('teste@exemplo.com', 'Teste de E-mail', 'sent')
ON CONFLICT DO NOTHING;

-- Verificar se funcionou
SELECT id, to_email, subject, status, sent_at FROM public.email_logs WHERE to_email = 'teste@exemplo.com';

-- Limpar teste
DELETE FROM public.email_logs WHERE to_email = 'teste@exemplo.com';

-- 7. VERIFICAR POLÍTICAS RLS
-- =====================================================
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'email_logs'
ORDER BY policyname;

-- =====================================================
-- MENSAGEM DE CONCLUSÃO
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'TABELA EMAIL_LOGS CRIADA COM SUCESSO!';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'Tabela email_logs criada com:';
    RAISE NOTICE '- Colunas: id, to_email, subject, sent_at, status, error_message';
    RAISE NOTICE '- Índices: to_email, sent_at, status';
    RAISE NOTICE '- Políticas RLS configuradas';
    RAISE NOTICE 'Sistema pronto para logs de e-mail!';
    RAISE NOTICE '=====================================================';
END $$;
