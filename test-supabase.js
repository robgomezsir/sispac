// Script para testar a conexão com o Supabase
// Execute no console do navegador (F12)

console.log("🧪 Testando conexão com Supabase...")

// 1. Verificar se o cliente Supabase está configurado
console.log("🔍 Cliente Supabase:", window.supabase || "Não encontrado")

// 2. Verificar variáveis de ambiente
console.log("🔍 VITE_SUPABASE_URL:", import.meta.env.VITE_SUPABASE_URL)
console.log("🔍 VITE_SUPABASE_ANON_KEY:", import.meta.env.VITE_SUPABASE_ANON_KEY ? "Configurado" : "Não configurado")

// 3. Testar conexão básica
async function testSupabaseConnection() {
  try {
    console.log("🔍 Testando conexão...")
    
    // Testar se consegue acessar o cliente
    if (typeof supabase !== 'undefined') {
      console.log("✅ Cliente Supabase disponível")
      
      // Testar se consegue fazer uma consulta simples
      const { data, error } = await supabase.from('candidates').select('count').limit(1)
      console.log("📊 Teste de consulta:", { data, error })
      
      if (error) {
        console.error("❌ Erro na consulta:", error)
      } else {
        console.log("✅ Consulta funcionando")
      }
    } else {
      console.error("❌ Cliente Supabase não disponível")
    }
  } catch (err) {
    console.error("❌ Erro no teste:", err)
  }
}

// 4. Testar autenticação
async function testAuth() {
  try {
    console.log("🔐 Testando autenticação...")
    
    // Verificar usuário atual
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    console.log("👤 Usuário atual:", { user, userError })
    
    // Verificar sessão
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    console.log("🔑 Sessão atual:", { session, sessionError })
    
  } catch (err) {
    console.error("❌ Erro no teste de autenticação:", err)
  }
}

// 5. Executar testes
console.log("🚀 Executando testes...")
testSupabaseConnection()
testAuth()

// 6. Função para testar login manual
window.testLogin = async (email, password) => {
  console.log("🔐 Testando login manual:", { email, password: '***' })
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    console.log("🔐 Resultado do login:", { data, error })
    
    if (error) {
      console.error("❌ Erro no login:", error.message)
      return { success: false, error: error.message }
    }
    
    console.log("✅ Login bem-sucedido!")
    return { success: true, data }
  } catch (err) {
    console.error("❌ Exceção no login:", err)
    return { success: false, error: err.message }
  }
}

console.log("✅ Script de teste carregado. Use window.testLogin(email, password) para testar login")
