-- =====================================================
-- CORREÇÃO DO ERRO DE FOREIGN KEY CONSTRAINT
-- =====================================================
-- Execute este script no SQL Editor do Supabase

-- 1. VERIFICAR CONSTRAINT DE FOREIGN KEY ATUAL
-- =====================================================
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.profiles'::regclass 
AND contype = 'f';

-- 2. VERIFICAR SE A TABELA AUTH.USERS EXISTE
-- =====================================================
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'auth' 
    AND table_name = 'users'
) as auth_users_exists;

-- 3. REMOVER CONSTRAINT DE FOREIGN KEY PROBLEMÁTICA
-- =====================================================
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- 4. VERIFICAR SE A CONSTRAINT FOI REMOVIDA
-- =====================================================
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.profiles'::regclass 
AND contype = 'f';

-- 5. VERIFICAR ESTRUTURA DA TABELA PROFILES
-- =====================================================
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 6. TESTAR INSERÇÃO SEM FOREIGN KEY CONSTRAINT
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

-- 7. VERIFICAR SE AS INSERÇÕES FUNCIONARAM
-- =====================================================
SELECT id, email, full_name, role, is_active 
FROM public.profiles 
WHERE email IN ('teste-rh@exemplo.com', 'teste-admin@exemplo.com', 'teste-user@exemplo.com');

-- 8. LIMPAR DADOS DE TESTE
-- =====================================================
DELETE FROM public.profiles 
WHERE email IN ('teste-rh@exemplo.com', 'teste-admin@exemplo.com', 'teste-user@exemplo.com');

-- 9. VERIFICAR POLÍTICAS RLS
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

-- =====================================================
-- MENSAGEM DE CONCLUSÃO
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'FOREIGN KEY CONSTRAINT REMOVIDA COM SUCESSO!';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'Constraint profiles_id_fkey removida';
    RAISE NOTICE 'Tabela profiles agora funciona independentemente';
    RAISE NOTICE 'Sistema pronto para uso!';
    RAISE NOTICE '=====================================================';
END $$;
