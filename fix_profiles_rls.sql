-- =====================================================
-- CORREÇÃO DAS POLÍTICAS RLS PARA TABELA PROFILES
-- =====================================================
-- Este script corrige as políticas RLS que estão causando problemas
-- Execute este script no SQL Editor do Supabase

-- 1. VERIFICAR SE A TABELA PROFILES EXISTE
-- =====================================================
SELECT 
    table_name, 
    table_schema 
FROM information_schema.tables 
WHERE table_name = 'profiles' AND table_schema = 'public';

-- 2. REMOVER TODAS AS POLÍTICAS EXISTENTES DA TABELA PROFILES
-- =====================================================
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Service role can manage profiles" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Everyone can view profiles" ON public.profiles;

-- 3. CRIAR POLÍTICAS CORRETAS PARA PROFILES
-- =====================================================

-- Política para service_role (bypass RLS)
CREATE POLICY "Service role can manage profiles" ON public.profiles
    FOR ALL USING (auth.role() = 'service_role');

-- Política para usuários autenticados verem perfis
CREATE POLICY "Authenticated users can view profiles" ON public.profiles
    FOR SELECT USING (auth.role() = 'authenticated');

-- Política para usuários inserirem seu próprio perfil
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Política para usuários atualizarem seu próprio perfil
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- 4. VERIFICAR SE RLS ESTÁ HABILITADO
-- =====================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 5. VERIFICAR POLÍTICAS CRIADAS
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
WHERE schemaname = 'public' AND tablename = 'profiles'
ORDER BY policyname;

-- 6. TESTAR ACESSO À TABELA
-- =====================================================
-- Este comando deve funcionar se as políticas estiverem corretas
SELECT COUNT(*) as total_profiles FROM public.profiles;

-- 7. VERIFICAR SE HÁ ALGUMA REFERÊNCIA À TABELA USERS
-- =====================================================
SELECT 
    schemaname,
    tablename,
    policyname,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND (qual LIKE '%users%' OR with_check LIKE '%users%');

-- =====================================================
-- MENSAGEM DE CONCLUSÃO
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'POLÍTICAS RLS PARA PROFILES CORRIGIDAS!';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'Todas as políticas antigas foram removidas.';
    RAISE NOTICE 'Novas políticas foram criadas:';
    RAISE NOTICE '- Service role pode gerenciar todos os perfis';
    RAISE NOTICE '- Usuários autenticados podem ver perfis';
    RAISE NOTICE '- Usuários podem inserir/atualizar próprio perfil';
    RAISE NOTICE '=====================================================';
END $$;
