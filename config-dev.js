// Configuração para Modo Desenvolvimento
// Copie este conteúdo para um arquivo .env na raiz do projeto

export const devConfig = {
  // Supabase Configuration
  supabaseUrl: 'https://zibuyabpsvgulvigvdtb.supabase.co',
  supabaseAnonKey: 'SUA_CHAVE_ANONIMA_AQUI',
  supabaseServiceKey: 'SUA_CHAVE_SERVICO_AQUI',
  
  // Environment
  nodeEnv: 'development',
  appEnv: 'development',
  
  // Debug
  enableLogs: true,
  enableDebug: true
}

// INSTRUÇÕES PARA CRIAR O ARQUIVO .env:
// 1. Crie um arquivo chamado .env na raiz do projeto
// 2. Adicione o seguinte conteúdo:

/*
# Supabase Configuration - Modo Desenvolvimento
VITE_SUPABASE_URL=https://zibuyabpsvgulvigvdtb.supabase.co
VITE_SUPABASE_ANON_KEY=SUA_CHAVE_ANONIMA_AQUI
VITE_SUPABASE_SERVICE_ROLE_KEY=SUA_CHAVE_SERVICO_AQUI

# Modo Desenvolvimento
NODE_ENV=development
VITE_APP_ENV=development
VITE_DEBUG=true
*/

// 3. Substitua SUA_CHAVE_ANONIMA_AQUI pela sua chave anônima real
// 4. Substitua SUA_CHAVE_SERVICO_AQUI pela sua chave de serviço real
// 5. Salve o arquivo
// 6. Reinicie o servidor de desenvolvimento
