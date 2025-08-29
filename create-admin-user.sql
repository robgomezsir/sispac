-- Script para criar usuário ADMIN GERAL no Supabase
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se a tabela auth.users existe
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'auth' 
  AND table_name = 'users'
);

-- 2. Verificar usuários existentes
SELECT id, email, created_at, email_confirmed_at 
FROM auth.users 
WHERE email = 'robgomez.sir@gmail.com';

-- 3. Se não existir usuário, criar via painel do Supabase:
-- Vá para: Authentication > Users > Add User
-- Email: robgomez.sir@gmail.com
-- Password: admin1641
-- Email Confirm: true

-- 4. Após criar o usuário, verificar se foi criado
SELECT id, email, created_at, email_confirmed_at 
FROM auth.users 
WHERE email = 'robgomez.sir@gmail.com';

-- 5. Criar tabela de perfis se não existir
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'rh' CHECK (role IN ('admin', 'rh')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Habilitar RLS na tabela profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 7. Criar políticas para profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- 8. Inserir perfil do usuário admin
INSERT INTO public.profiles (id, email, role, created_at)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'robgomez.sir@gmail.com'),
  'robgomez.sir@gmail.com',
  'admin',
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  role = EXCLUDED.role,
  updated_at = NOW();

-- 9. Verificar se o perfil foi criado
SELECT p.*, u.email_confirmed_at 
FROM public.profiles p
JOIN auth.users u ON p.id = u.id
WHERE p.email = 'robgomez.sir@gmail.com';

-- 10. Verificar todas as políticas RLS
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
