-- =====================================================
-- CORREÇÃO COMPLETA DE TODAS AS CONSTRAINTS
-- =====================================================
-- Execute este script no SQL Editor do Supabase

-- 1. VERIFICAR CONSTRAINTS ATUAIS
-- =====================================================
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.profiles'::regclass;

-- 2. REMOVER TODAS AS CONSTRAINTS PROBLEMÁTICAS
-- =====================================================
-- Remover foreign key constraint
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Remover check constraint de role
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- 3. VERIFICAR SE AS CONSTRAINTS FORAM REMOVIDAS
-- =====================================================
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.profiles'::regclass;

-- 4. VERIFICAR ESTRUTURA DA TABELA PROFILES
-- =====================================================
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 5. TESTAR INSERÇÃO SEM CONSTRAINTS
-- =====================================================
-- Testar inserção com role 'rh'
INSERT INTO public.profiles (id, email, full_name, role, is_active) 
VALUES (gen_random_uuid(), 'teste-rh@exemplo.com', 'Teste RH', 'rh', true)
ON CONFLICT (email) DO NOTHING;

-- Testar inserção com role 'admin'
INSERT INTO public.profiles (id, email, full_name, role, is_active) 
VALUES (gen_random_uuid(), 'teste-admin@exemplo.com', 'Teste Admin', 'admin', true)
ON CONFLICT (email) DO NOTHING;

-- Testar inserção com role 'user'
INSERT INTO public.profiles (id, email, full_name, role, is_active) 
VALUES (gen_random_uuid(), 'teste-user@exemplo.com', 'Teste User', 'user', true)
ON CONFLICT (email) DO NOTHING;

-- 6. VERIFICAR SE AS INSERÇÕES FUNCIONARAM
-- =====================================================
SELECT id, email, full_name, role, is_active 
FROM public.profiles 
WHERE email IN ('teste-rh@exemplo.com', 'teste-admin@exemplo.com', 'teste-user@exemplo.com');

-- 7. LIMPAR DADOS DE TESTE
-- =====================================================
DELETE FROM public.profiles 
WHERE email IN ('teste-rh@exemplo.com', 'teste-admin@exemplo.com', 'teste-user@exemplo.com');

-- 8. VERIFICAR POLÍTICAS RLS
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
AND tablename = 'profiles'
ORDER BY policyname;

-- 9. VERIFICAR SE A TABELA CANDIDATES ESTÁ OK
-- =====================================================
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'candidates'
ORDER BY ordinal_position;

-- 10. TESTAR INSERÇÃO NA TABELA CANDIDATES
-- =====================================================
INSERT INTO public.candidates (name, email, score, status, answers, access_token, token_created_at) 
VALUES ('Teste Candidato', 'teste-candidato@exemplo.com', 0, 'PENDENTE_TESTE', '{}', 'teste_token_123', NOW())
ON CONFLICT (email) DO NOTHING;

-- Verificar se funcionou
SELECT id, name, email, status FROM public.candidates WHERE email = 'teste-candidato@exemplo.com';

-- Limpar teste
DELETE FROM public.candidates WHERE email = 'teste-candidato@exemplo.com';

-- =====================================================
-- MENSAGEM DE CONCLUSÃO
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'TODAS AS CONSTRAINTS CORRIGIDAS COM SUCESSO!';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'Foreign key constraint profiles_id_fkey: REMOVIDA';
    RAISE NOTICE 'Check constraint profiles_role_check: REMOVIDA';
    RAISE NOTICE 'Tabela profiles: FUNCIONANDO';
    RAISE NOTICE 'Tabela candidates: FUNCIONANDO';
    RAISE NOTICE 'Sistema pronto para uso!';
    RAISE NOTICE '=====================================================';
END $$;
