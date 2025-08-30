// Utilitário para limpar caches e resolver problemas de estado persistente
export const clearAllCaches = () => {
  console.log('🧹 [CacheCleaner] Iniciando limpeza de caches...')
  
  try {
    // Limpar localStorage
    const keysToKeep = ['theme'] // Manter apenas configurações essenciais
    const allKeys = Object.keys(localStorage)
    
    allKeys.forEach(key => {
      if (!keysToKeep.includes(key)) {
        localStorage.removeItem(key)
        console.log(`🧹 [CacheCleaner] Removido do localStorage: ${key}`)
      }
    })
    
    // Limpar sessionStorage
    sessionStorage.clear()
    console.log('🧹 [CacheCleaner] sessionStorage limpo')
    
    // Limpar caches do navegador (se disponível)
    if ('caches' in window) {
      caches.keys().then(cacheNames => {
        cacheNames.forEach(cacheName => {
          caches.delete(cacheName)
          console.log(`🧹 [CacheCleaner] Cache removido: ${cacheName}`)
        })
      })
    }
    
    // Limpar IndexedDB (se disponível)
    if ('indexedDB' in window) {
      indexedDB.databases().then(databases => {
        databases.forEach(db => {
          if (db.name) {
            indexedDB.deleteDatabase(db.name)
            console.log(`🧹 [CacheCleaner] IndexedDB removido: ${db.name}`)
          }
        })
      })
    }
    
    console.log('✅ [CacheCleaner] Limpeza de caches concluída com sucesso')
    return true
  } catch (error) {
    console.error('❌ [CacheCleaner] Erro ao limpar caches:', error)
    return false
  }
}

// Função para limpar apenas caches de autenticação
export const clearAuthCache = () => {
  console.log('🧹 [CacheCleaner] Limpando cache de autenticação...')
  
  try {
    // Remover dados de autenticação do localStorage
    const authKeys = [
      'sb-zibuyabpsvgulvigvdtb-auth-token',
      'sb-zibuyabpsvgulvigvdtb-refresh-token',
      'supabase.auth.token',
      'supabase.auth.refreshToken'
    ]
    
    authKeys.forEach(key => {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key)
        console.log(`🧹 [CacheCleaner] Token removido: ${key}`)
      }
    })
    
    // Limpar sessionStorage
    sessionStorage.clear()
    
    console.log('✅ [CacheCleaner] Cache de autenticação limpo com sucesso')
    return true
  } catch (error) {
    console.error('❌ [CacheCleaner] Erro ao limpar cache de autenticação:', error)
    return false
  }
}

// Função para verificar se há problemas de cache
export const checkCacheHealth = () => {
  console.log('🔍 [CacheCleaner] Verificando saúde dos caches...')
  
  const issues = []
  
  try {
    // Verificar localStorage
    const localStorageSize = new Blob(Object.keys(localStorage).map(key => 
      key + localStorage.getItem(key)
    )).size
    console.log(`🔍 [CacheCleaner] Tamanho do localStorage: ${localStorageSize} bytes`)
    
    if (localStorageSize > 1024 * 1024) { // 1MB
      issues.push('localStorage muito grande')
    }
    
    // Verificar sessionStorage
    const sessionStorageSize = new Blob(Object.keys(sessionStorage).map(key => 
      key + sessionStorage.getItem(key)
    )).size
    console.log(`🔍 [CacheCleaner] Tamanho do sessionStorage: ${sessionStorageSize} bytes`)
    
    // Verificar se há tokens expirados
    const hasExpiredTokens = Object.keys(localStorage).some(key => 
      key.includes('token') && key.includes('expires')
    )
    
    if (hasExpiredTokens) {
      issues.push('Tokens expirados detectados')
    }
    
    console.log(`🔍 [CacheCleaner] Problemas encontrados: ${issues.length}`)
    return {
      healthy: issues.length === 0,
      issues,
      localStorageSize,
      sessionStorageSize
    }
  } catch (error) {
    console.error('❌ [CacheCleaner] Erro ao verificar saúde dos caches:', error)
    return {
      healthy: false,
      issues: ['Erro ao verificar caches'],
      error: error.message
    }
  }
}

// Função para reset completo da aplicação
export const resetApplication = () => {
  console.log('🔄 [CacheCleaner] Iniciando reset completo da aplicação...')
  
  try {
    // Limpar todos os caches
    clearAllCaches()
    
    // Limpar cookies relacionados ao Supabase
    document.cookie.split(';').forEach(cookie => {
      const [name] = cookie.split('=')
      if (name.trim().includes('supabase') || name.trim().includes('sb-')) {
        document.cookie = `${name.trim()}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
        console.log(`🧹 [CacheCleaner] Cookie removido: ${name.trim()}`)
      }
    })
    
    // Forçar reload da página
    console.log('🔄 [CacheCleaner] Recarregando aplicação...')
    window.location.reload()
    
    return true
  } catch (error) {
    console.error('❌ [CacheCleaner] Erro no reset da aplicação:', error)
    return false
  }
}

export default {
  clearAllCaches,
  clearAuthCache,
  checkCacheHealth,
  resetApplication
}
