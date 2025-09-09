-- Script AGRESSIVO para corrigir RLS no Supabase
-- Execute este script no SQL Editor do Supabase

-- 1. DESABILITAR RLS COMPLETAMENTE na tabela profiles
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 2. REMOVER TODAS as políticas existentes
DROP POLICY IF EXISTS "Permitir operações para usuários autenticados" ON profiles;
DROP POLICY IF EXISTS "Permitir operações para service_role" ON profiles;
DROP POLICY IF EXISTS "Permitir inserção para usuários autenticados" ON profiles;
DROP POLICY IF EXISTS "Permitir leitura para usuários autenticados" ON profiles;
DROP POLICY IF EXISTS "Permitir atualização para usuários autenticados" ON profiles;
DROP POLICY IF EXISTS "Permitir exclusão para usuários autenticados" ON profiles;
DROP POLICY IF EXISTS "Permitir tudo para authenticated" ON profiles;
DROP POLICY IF EXISTS "Permitir tudo para service_role" ON profiles;

-- 3. VERIFICAR se RLS está desabilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'profiles';

-- 4. TESTAR inserção direta (deve funcionar agora)
INSERT INTO profiles (id, email, role) 
VALUES (gen_random_uuid(), 'test@example.com', 'rh')
ON CONFLICT (email) DO UPDATE SET 
  role = EXCLUDED.role,
  updated_at = NOW();

-- 5. VERIFICAR se inserção funcionou
SELECT * FROM profiles WHERE email = 'test@example.com';

-- 6. LIMPAR teste (opcional - comentado para manter o registro)
-- DELETE FROM profiles WHERE email = 'test@example.com';
