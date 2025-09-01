// Service Worker para SisPAC PWA
const CACHE_NAME = 'sispac-v1.0.0';
const STATIC_CACHE = 'sispac-static-v1.0.0';
const DYNAMIC_CACHE = 'sispac-dynamic-v1.0.0';

// Arquivos para cache estático
const STATIC_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png'
];

// Estratégias de cache
const CACHE_STRATEGIES = {
  STATIC: 'cache-first',
  DYNAMIC: 'network-first',
  API: 'network-first'
};

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  console.log('🚀 [SW] Service Worker instalando...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('📦 [SW] Cache estático aberto');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('✅ [SW] Cache estático preenchido');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('❌ [SW] Erro ao instalar cache estático:', error);
      })
  );
});

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
  console.log('🔄 [SW] Service Worker ativando...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('🗑️ [SW] Removendo cache antigo:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ [SW] Service Worker ativado');
        return self.clients.claim();
      })
  );
});

// Interceptação de requisições
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Ignorar requisições não-GET
  if (request.method !== 'GET') {
    return;
  }
  
  // Estratégia para arquivos estáticos
  if (isStaticFile(url.pathname)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }
  
  // Estratégia para APIs do Supabase
  if (isSupabaseAPI(url)) {
    event.respondWith(networkFirst(request, DYNAMIC_CACHE));
    return;
  }
  
  // Estratégia padrão para outras requisições
  event.respondWith(networkFirst(request, DYNAMIC_CACHE));
});

// Função para verificar se é arquivo estático
function isStaticFile(pathname) {
  return STATIC_FILES.includes(pathname) ||
         pathname.startsWith('/assets/') ||
         pathname.endsWith('.js') ||
         pathname.endsWith('.css') ||
         pathname.endsWith('.png') ||
         pathname.endsWith('.jpg') ||
         pathname.endsWith('.svg') ||
         pathname.endsWith('.ico');
}

// Função para verificar se é API do Supabase
function isSupabaseAPI(url) {
  return url.hostname.includes('supabase.co') ||
         url.pathname.startsWith('/api/');
}

// Estratégia Cache First
async function cacheFirst(request, cacheName) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('📦 [SW] Cache hit:', request.url);
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
      console.log('💾 [SW] Cacheado:', request.url);
    }
    
    return networkResponse;
  } catch (error) {
    console.error('❌ [SW] Erro na estratégia cache-first:', error);
    throw error;
  }
}

// Estratégia Network First
async function networkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
      console.log('💾 [SW] Cacheado (network-first):', request.url);
    }
    
    return networkResponse;
  } catch (error) {
    console.log('🌐 [SW] Rede indisponível, tentando cache:', request.url);
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('📦 [SW] Cache hit (fallback):', request.url);
      return cachedResponse;
    }
    
    // Fallback para páginas SPA
    if (request.destination === 'document') {
      const fallbackResponse = await caches.match('/index.html');
      if (fallbackResponse) {
        console.log('📦 [SW] Fallback para index.html');
        return fallbackResponse;
      }
    }
    
    throw error;
  }
}

// Sincronização em background (para funcionalidades offline)
self.addEventListener('sync', (event) => {
  console.log('🔄 [SW] Sincronização em background:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(backgroundSync());
  }
});

// Função de sincronização em background
async function backgroundSync() {
  try {
    console.log('🔄 [SW] Executando sincronização em background...');
    // Aqui você pode implementar lógica para sincronizar dados offline
    // Por exemplo, enviar formulários salvos offline
  } catch (error) {
    console.error('❌ [SW] Erro na sincronização:', error);
  }
}

// Notificações push (opcional)
self.addEventListener('push', (event) => {
  console.log('🔔 [SW] Notificação push recebida');
  
  const options = {
    body: event.data ? event.data.text() : 'Nova notificação do SisPAC',
    icon: '/logo192.png',
    badge: '/logo192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Abrir',
        icon: '/logo192.png'
      },
      {
        action: 'close',
        title: 'Fechar',
        icon: '/logo192.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('SisPAC', options)
  );
});

// Clique em notificação
self.addEventListener('notificationclick', (event) => {
  console.log('👆 [SW] Notificação clicada:', event.action);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});
