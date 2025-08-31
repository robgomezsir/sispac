-- =====================================================
-- CORREÇÃO DAS POLÍTICAS RLS DO SUPABASE
-- =====================================================
-- Este script corrige as políticas RLS que estavam causando problemas
-- Execute este script no SQL Editor do Supabase

-- 1. CORRIGIR POLÍTICAS DA TABELA RESULTS
-- =====================================================

-- Remover políticas antigas incorretas
DROP POLICY IF EXISTS "Service role can manage results" ON public.results;

-- Criar política correta para service_role
CREATE POLICY "Service role can manage results" ON public.results
    FOR ALL USING (auth.role() = 'service_role');

-- 2. CORRIGIR POLÍTICAS DA TABELA CANDIDATES
-- =====================================================

-- Remover políticas antigas incorretas
DROP POLICY IF EXISTS "Service role can manage candidates" ON public.candidates;

-- Criar política correta para service_role
CREATE POLICY "Service role can manage candidates" ON public.candidates
    FOR ALL USING (auth.role() = 'service_role');

-- 3. CORRIGIR POLÍTICAS DA TABELA QUESTIONS
-- =====================================================

-- Remover políticas antigas incorretas
DROP POLICY IF EXISTS "Service role can manage questions" ON public.questions;

-- Criar política correta para service_role
CREATE POLICY "Service role can manage questions" ON public.questions
    FOR ALL USING (auth.role() = 'service_role');

-- 4. CORRIGIR POLÍTICAS DA TABELA QUESTION_ANSWERS
-- =====================================================

-- Remover políticas antigas incorretas
DROP POLICY IF EXISTS "Service role can manage question answers" ON public.question_answers;

-- Criar política correta para service_role
CREATE POLICY "Service role can manage question answers" ON public.question_answers
    FOR ALL USING (auth.role() = 'service_role');

-- 5. CORRIGIR POLÍTICAS DA TABELA TEST_SESSIONS
-- =====================================================

-- Remover políticas antigas incorretas
DROP POLICY IF EXISTS "Service role can manage test sessions" ON public.test_sessions;

-- Criar política correta para service_role
CREATE POLICY "Service role can manage test sessions" ON public.test_sessions
    FOR ALL USING (auth.role() = 'service_role');

-- 6. CORRIGIR POLÍTICAS DA TABELA AUDIT_LOGS
-- =====================================================

-- Remover políticas antigas incorretas
DROP POLICY IF EXISTS "Service role can manage audit logs" ON public.audit_logs;

-- Criar política correta para service_role
CREATE POLICY "Service role can manage audit logs" ON public.audit_logs
    FOR ALL USING (auth.role() = 'service_role');

-- 7. VERIFICAR STATUS DAS POLÍTICAS
-- =====================================================

-- Listar todas as políticas criadas
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
ORDER BY tablename, policyname;

-- 8. VERIFICAR RLS ATIVADO
-- =====================================================

-- Verificar se RLS está ativado em todas as tabelas
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- =====================================================
-- MENSAGEM DE CONCLUSÃO
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'POLÍTICAS RLS CORRIGIDAS COM SUCESSO!';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'Todas as políticas incorretas foram removidas.';
    RAISE NOTICE 'Novas políticas usando auth.role() foram criadas.';
    RAISE NOTICE 'Service role agora deve funcionar corretamente.';
    RAISE NOTICE '=====================================================';
END $$;
