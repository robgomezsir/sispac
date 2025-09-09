-- =====================================================
-- CORREÇÃO DAS POLÍTICAS RLS - Supabase
-- =====================================================
-- Execute este script no SQL Editor do Supabase para corrigir problemas de RLS

-- 1. REMOVER políticas existentes da tabela profiles (se existirem)
DROP POLICY IF EXISTS "Permitir operações para usuários autenticados" ON profiles;
DROP POLICY IF EXISTS "Permitir operações para service_role" ON profiles;
DROP POLICY IF EXISTS "Permitir inserção para usuários autenticados" ON profiles;
DROP POLICY IF EXISTS "Permitir leitura para usuários autenticados" ON profiles;
DROP POLICY IF EXISTS "Permitir atualização para usuários autenticados" ON profiles;
DROP POLICY IF EXISTS "Permitir exclusão para usuários autenticados" ON profiles;

-- 2. DESABILITAR RLS temporariamente na tabela profiles
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 3. HABILITAR RLS novamente
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 4. CRIAR políticas mais permissivas para profiles
CREATE POLICY "Permitir todas as operações para authenticated" ON profiles
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Permitir todas as operações para service_role" ON profiles
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 5. CRIAR política específica para inserção de novos perfis
CREATE POLICY "Permitir inserção de novos perfis" ON profiles
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- 6. VERIFICAR se as políticas foram criadas corretamente
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
WHERE tablename = 'profiles'
ORDER BY policyname;

-- 7. VERIFICAR se RLS está habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'profiles';
