// ⚡ CONFIGURAÇÕES DE PERFORMANCE
// Este arquivo contém configurações para otimizar a performance da aplicação

export const PERFORMANCE_CONFIG = {
  // Debounce delays
  DEBOUNCE: {
    SEARCH: 300,        // Busca de candidatos
    FORM_INPUT: 500,    // Inputs de formulário
    BUTTON_CLICK: 100,  // Cliques de botão
  },
  
  // Cache settings
  CACHE: {
    ROLE_TTL: 5 * 60 * 1000,  // 5 minutos para cache de role
    DATA_TTL: 2 * 60 * 1000,  // 2 minutos para cache de dados
    MAX_ITEMS: 100,            // Máximo de itens no cache
  },
  
  // Pagination
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,
    LOAD_MORE_THRESHOLD: 5,    // Carregar mais quando faltar 5 itens
  },
  
  // API limits
  API: {
    MAX_CONCURRENT_REQUESTS: 3,
    REQUEST_TIMEOUT: 10000,    // 10 segundos
    RETRY_ATTEMPTS: 2,
    RETRY_DELAY: 1000,         // 1 segundo
  },
  
  // UI optimizations
  UI: {
    LAZY_LOAD_THRESHOLD: 0.1,  // Lazy load quando 10% da tela estiver visível
    ANIMATION_DURATION: 200,    // Duração das animações
    SCROLL_THROTTLE: 16,        // Throttle do scroll (60fps)
  },
  
  // Database
  DATABASE: {
    BATCH_SIZE: 50,             // Tamanho do lote para operações em massa
    MAX_QUERY_RESULTS: 1000,    // Máximo de resultados por query
    CONNECTION_POOL_SIZE: 5,    // Tamanho do pool de conexões
  }
}

// 🚀 Funções de otimização

/**
 * Throttle function para limitar a frequência de execução
 */
export function throttle(func, limit) {
  let inThrottle
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

/**
 * Debounce function para atrasar a execução
 */
export function debounce(func, wait, immediate) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      timeout = null
      if (!immediate) func.apply(this, args)
    }
    const callNow = immediate && !timeout
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
    if (callNow) func.apply(this, args)
  }
}

/**
 * Memoize function com TTL
 */
export function memoizeWithTTL(fn, ttl = PERFORMANCE_CONFIG.CACHE.DATA_TTL) {
  const cache = new Map()
  
  return function(...args) {
    const key = JSON.stringify(args)
    const now = Date.now()
    
    if (cache.has(key)) {
      const { value, timestamp } = cache.get(key)
      if (now - timestamp < ttl) {
        return value
      }
      cache.delete(key)
    }
    
    const result = fn.apply(this, args)
    cache.set(key, { value: result, timestamp: now })
    
    // Limpar cache antigo
    if (cache.size > PERFORMANCE_CONFIG.CACHE.MAX_ITEMS) {
      const oldestKey = cache.keys().next().value
      cache.delete(oldestKey)
    }
    
    return result
  }
}

/**
 * Batch operations para múltiplas operações
 */
export function batchOperations(operations, batchSize = PERFORMANCE_CONFIG.DATABASE.BATCH_SIZE) {
  const batches = []
  for (let i = 0; i < operations.length; i += batchSize) {
    batches.push(operations.slice(i, i + batchSize))
  }
  return batches
}

/**
 * Lazy loading helper
 */
export function createLazyLoader(items, pageSize = PERFORMANCE_CONFIG.PAGINATION.DEFAULT_PAGE_SIZE) {
  let currentPage = 0
  
  return {
    hasMore: () => currentPage * pageSize < items.length,
    loadMore: () => {
      const start = currentPage * pageSize
      const end = start + pageSize
      currentPage++
      return items.slice(start, end)
    },
    reset: () => {
      currentPage = 0
    }
  }
}

/**
 * Performance monitor
 */
export class PerformanceMonitor {
  constructor() {
    this.metrics = new Map()
    this.startTimes = new Map()
  }
  
  start(label) {
    this.startTimes.set(label, performance.now())
  }
  
  end(label) {
    const startTime = this.startTimes.get(label)
    if (startTime) {
      const duration = performance.now() - startTime
      this.metrics.set(label, duration)
      this.startTimes.delete(label)
      
      // Log performance warnings apenas em desenvolvimento
      if (import.meta.env.DEV && duration > 100) {
        console.warn(`⚠️ Performance: ${label} levou ${duration.toFixed(2)}ms`)
      }
    }
  }
  
  getMetrics() {
    return Object.fromEntries(this.metrics)
  }
  
  clear() {
    this.metrics.clear()
    this.startTimes.clear()
  }
}

// Instância global do monitor de performance
export const performanceMonitor = new PerformanceMonitor()

// 🎯 Configurações específicas para diferentes ambientes
export const ENV_CONFIG = {
  development: {
    ...PERFORMANCE_CONFIG,
    DEBUG: true,
    LOG_LEVEL: 'debug',
    CACHE: {
      ...PERFORMANCE_CONFIG.CACHE,
      ROLE_TTL: 1 * 60 * 1000,  // 1 minuto em desenvolvimento
    }
  },
  production: {
    ...PERFORMANCE_CONFIG,
    DEBUG: false,
    LOG_LEVEL: 'error',
    CACHE: {
      ...PERFORMANCE_CONFIG.CACHE,
      ROLE_TTL: 10 * 60 * 1000, // 10 minutos em produção
    }
  }
}

// Exportar configuração baseada no ambiente
export const config = ENV_CONFIG[import.meta.env.MODE] || PERFORMANCE_CONFIG
