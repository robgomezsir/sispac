-- =====================================================
-- CORREÇÃO DO ERRO DE CONSTRAINT NA TABELA PROFILES
-- =====================================================
-- Execute este script no SQL Editor do Supabase

-- 1. VERIFICAR CONSTRAINT ATUAL
-- =====================================================
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.profiles'::regclass 
AND conname LIKE '%role%';

-- 2. REMOVER CONSTRAINT PROBLEMÁTICA
-- =====================================================
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- 3. CRIAR NOVA CONSTRAINT CORRETA
-- =====================================================
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('admin', 'rh', 'user'));

-- 4. VERIFICAR SE A CONSTRAINT FOI CRIADA CORRETAMENTE
-- =====================================================
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.profiles'::regclass 
AND conname = 'profiles_role_check';

-- 5. TESTAR INSERÇÃO DE DADOS
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

-- 6. LIMPAR DADOS DE TESTE
-- =====================================================
DELETE FROM public.profiles 
WHERE email IN ('teste-rh@exemplo.com', 'teste-admin@exemplo.com', 'teste-user@exemplo.com');

-- 7. VERIFICAR ESTRUTURA FINAL
-- =====================================================
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'profiles'
ORDER BY ordinal_position;

-- =====================================================
-- MENSAGEM DE CONCLUSÃO
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'CONSTRAINT DA TABELA PROFILES CORRIGIDA COM SUCESSO!';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'Constraint profiles_role_check criada corretamente';
    RAISE NOTICE 'Valores permitidos: admin, rh, user';
    RAISE NOTICE 'Sistema pronto para uso!';
    RAISE NOTICE '=====================================================';
END $$;
