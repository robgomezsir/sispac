-- =====================================================
-- CORREÇÃO DEFINITIVA DO ERRO DE CHAVE PRIMÁRIA PROFILES
-- =====================================================
-- Execute este script no SQL Editor do Supabase

-- 1. VERIFICAR CONSTRAINT ATUAL DA CHAVE PRIMÁRIA
-- =====================================================
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.profiles'::regclass 
AND contype = 'p';

-- 2. VERIFICAR SE EXISTEM DADOS DUPLICADOS
-- =====================================================
SELECT id, email, COUNT(*) as count
FROM public.profiles 
GROUP BY id, email
HAVING COUNT(*) > 1;

-- 3. VERIFICAR SE EXISTEM IDs NULOS
-- =====================================================
SELECT COUNT(*) as null_ids
FROM public.profiles 
WHERE id IS NULL;

-- 4. CORRIGIR POSSÍVEIS PROBLEMAS DE CONSTRAINT
-- =====================================================
-- Remover constraint de chave primária se existir problema
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_pkey;

-- Recriar constraint de chave primária
ALTER TABLE public.profiles ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);

-- 5. VERIFICAR SE A CONSTRAINT FOI CRIADA CORRETAMENTE
-- =====================================================
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.profiles'::regclass 
AND contype = 'p';

-- 6. VERIFICAR ESTRUTURA DA TABELA
-- =====================================================
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 7. TESTAR INSERÇÃO DE DADOS
-- =====================================================
-- Testar inserção com ID específico
INSERT INTO public.profiles (id, email, full_name, role, is_active) 
VALUES (gen_random_uuid(), 'teste-pkey@exemplo.com', 'Teste PKey', 'rh', true)
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- Verificar se funcionou
SELECT id, email, full_name, role FROM public.profiles WHERE email = 'teste-pkey@exemplo.com';

-- Limpar teste
DELETE FROM public.profiles WHERE email = 'teste-pkey@exemplo.com';

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

-- =====================================================
-- MENSAGEM DE CONCLUSÃO
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'CONSTRAINT DE CHAVE PRIMÁRIA PROFILES CORRIGIDA!';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'Constraint profiles_pkey recriada com sucesso';
    RAISE NOTICE 'Tabela profiles: FUNCIONANDO';
    RAISE NOTICE 'Sistema pronto para uso!';
    RAISE NOTICE '=====================================================';
END $$;
