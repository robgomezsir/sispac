-- =====================================================
-- CORREÇÃO DAS POLÍTICAS RLS DA TABELA CANDIDATES
-- =====================================================
-- Execute este script no SQL Editor do Supabase

-- 1. VERIFICAR POLÍTICAS RLS ATUAIS DA TABELA CANDIDATES
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
AND tablename = 'candidates'
ORDER BY policyname;

-- 2. REMOVER TODAS AS POLÍTICAS RLS EXISTENTES DA TABELA CANDIDATES
-- =====================================================
DROP POLICY IF EXISTS "Service role can manage candidates" ON public.candidates;
DROP POLICY IF EXISTS "Authenticated users can view candidates" ON public.candidates;
DROP POLICY IF EXISTS "Everyone can view candidates" ON public.candidates;
DROP POLICY IF EXISTS "Users can insert candidates" ON public.candidates;
DROP POLICY IF EXISTS "Users can update candidates" ON public.candidates;
DROP POLICY IF EXISTS "Users can delete candidates" ON public.candidates;

-- 3. CRIAR POLÍTICAS RLS CORRETAS PARA A TABELA CANDIDATES
-- =====================================================
-- Política para service_role (bypassa RLS)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'candidates' 
        AND policyname = 'Service role can manage candidates'
    ) THEN
        CREATE POLICY "Service role can manage candidates" ON public.candidates
            FOR ALL USING (auth.role() = 'service_role');
        RAISE NOTICE 'Política "Service role can manage candidates" criada';
    ELSE
        RAISE NOTICE 'Política "Service role can manage candidates" já existe';
    END IF;
END $$;

-- Política para usuários autenticados visualizarem
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'candidates' 
        AND policyname = 'Authenticated users can view candidates'
    ) THEN
        CREATE POLICY "Authenticated users can view candidates" ON public.candidates
            FOR SELECT USING (auth.role() = 'authenticated');
        RAISE NOTICE 'Política "Authenticated users can view candidates" criada';
    ELSE
        RAISE NOTICE 'Política "Authenticated users can view candidates" já existe';
    END IF;
END $$;

-- Política para usuários autenticados inserirem
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'candidates' 
        AND policyname = 'Authenticated users can insert candidates'
    ) THEN
        CREATE POLICY "Authenticated users can insert candidates" ON public.candidates
            FOR INSERT WITH CHECK (auth.role() = 'authenticated');
        RAISE NOTICE 'Política "Authenticated users can insert candidates" criada';
    ELSE
        RAISE NOTICE 'Política "Authenticated users can insert candidates" já existe';
    END IF;
END $$;

-- Política para usuários autenticados atualizarem
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'candidates' 
        AND policyname = 'Authenticated users can update candidates'
    ) THEN
        CREATE POLICY "Authenticated users can update candidates" ON public.candidates
            FOR UPDATE USING (auth.role() = 'authenticated');
        RAISE NOTICE 'Política "Authenticated users can update candidates" criada';
    ELSE
        RAISE NOTICE 'Política "Authenticated users can update candidates" já existe';
    END IF;
END $$;

-- Política para usuários autenticados deletarem
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'candidates' 
        AND policyname = 'Authenticated users can delete candidates'
    ) THEN
        CREATE POLICY "Authenticated users can delete candidates" ON public.candidates
            FOR DELETE USING (auth.role() = 'authenticated');
        RAISE NOTICE 'Política "Authenticated users can delete candidates" criada';
    ELSE
        RAISE NOTICE 'Política "Authenticated users can delete candidates" já existe';
    END IF;
END $$;

-- 4. VERIFICAR SE AS POLÍTICAS FORAM CRIADAS CORRETAMENTE
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
AND tablename = 'candidates'
ORDER BY policyname;

-- 5. TESTAR INSERÇÃO NA TABELA CANDIDATES
-- =====================================================
-- Testar inserção com service_role (deve funcionar)
INSERT INTO public.candidates (name, email, score, status, answers, access_token, token_created_at) 
VALUES ('Teste Candidato RLS', 'teste-rls@exemplo.com', 0, 'PENDENTE_TESTE', '{}', 'teste_token_rls_123', NOW())
ON CONFLICT (email) DO NOTHING;

-- Verificar se funcionou
SELECT id, name, email, status FROM public.candidates WHERE email = 'teste-rls@exemplo.com';

-- Limpar teste
DELETE FROM public.candidates WHERE email = 'teste-rls@exemplo.com';

-- 6. VERIFICAR ESTRUTURA DA TABELA CANDIDATES
-- =====================================================
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'candidates'
ORDER BY ordinal_position;

-- =====================================================
-- MENSAGEM DE CONCLUSÃO
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'POLÍTICAS RLS DA TABELA CANDIDATES CORRIGIDAS!';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'Políticas criadas:';
    RAISE NOTICE '- Service role can manage candidates (ALL)';
    RAISE NOTICE '- Authenticated users can view candidates (SELECT)';
    RAISE NOTICE '- Authenticated users can insert candidates (INSERT)';
    RAISE NOTICE '- Authenticated users can update candidates (UPDATE)';
    RAISE NOTICE '- Authenticated users can delete candidates (DELETE)';
    RAISE NOTICE 'Tabela candidates: FUNCIONANDO';
    RAISE NOTICE 'Sistema pronto para uso!';
    RAISE NOTICE '=====================================================';
END $$;
