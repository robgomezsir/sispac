import { useState, useEffect } from 'react'

export function usePWA() {
  const [isInstalled, setIsInstalled] = useState(false)
  const [canInstall, setCanInstall] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [swRegistration, setSwRegistration] = useState(null)

  useEffect(() => {
    // Verificar se já está instalado
    const checkIfInstalled = () => {
      if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true)
        return true
      }
      return false
    }

    // Verificar se já está instalado
    if (checkIfInstalled()) {
      return
    }

    // Detectar prompt de instalação
    const handleBeforeInstallPrompt = (e) => {
      console.log('📱 [PWA] Prompt de instalação detectado')
      e.preventDefault()
      setDeferredPrompt(e)
      setCanInstall(true)
    }

    // Detectar se foi instalado
    const handleAppInstalled = () => {
      console.log('✅ [PWA] Aplicação instalada')
      setIsInstalled(true)
      setCanInstall(false)
      setDeferredPrompt(null)
    }

    // Detectar mudanças de conectividade
    const handleOnline = () => {
      console.log('🌐 [PWA] Conexão restaurada')
      setIsOnline(true)
    }

    const handleOffline = () => {
      console.log('📴 [PWA] Conexão perdida')
      setIsOnline(false)
    }

    // Registrar Service Worker
    const registerServiceWorker = async () => {
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js')
          console.log('✅ [PWA] Service Worker registrado:', registration.scope)
          setSwRegistration(registration)
        } catch (error) {
          console.error('❌ [PWA] Erro ao registrar Service Worker:', error)
        }
      }
    }

    // Adicionar event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Registrar Service Worker
    registerServiceWorker()

    // Verificar periodicamente se foi instalado
    const interval = setInterval(() => {
      if (checkIfInstalled()) {
        clearInterval(interval)
      }
    }, 1000)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      clearInterval(interval)
    }
  }, [])

  const installApp = async () => {
    if (!deferredPrompt) {
      console.log('❌ [PWA] Prompt de instalação não disponível')
      return { success: false, error: 'Prompt não disponível' }
    }

    try {
      console.log('🚀 [PWA] Iniciando instalação...')
      deferredPrompt.prompt()
      
      const { outcome } = await deferredPrompt.userChoice
      console.log('📱 [PWA] Resultado da instalação:', outcome)
      
      if (outcome === 'accepted') {
        console.log('✅ [PWA] Usuário aceitou a instalação')
        setCanInstall(false)
        setDeferredPrompt(null)
        return { success: true, outcome }
      } else {
        console.log('❌ [PWA] Usuário rejeitou a instalação')
        return { success: false, outcome }
      }
    } catch (error) {
      console.error('❌ [PWA] Erro durante instalação:', error)
      return { success: false, error: error.message }
    }
  }

  const checkForUpdates = async () => {
    if (!swRegistration) return false

    try {
      await swRegistration.update()
      console.log('🔄 [PWA] Verificação de atualizações concluída')
      return true
    } catch (error) {
      console.error('❌ [PWA] Erro ao verificar atualizações:', error)
      return false
    }
  }

  const clearCache = async () => {
    if (!swRegistration) return false

    try {
      const cacheNames = await caches.keys()
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      )
      console.log('🗑️ [PWA] Cache limpo com sucesso')
      return true
    } catch (error) {
      console.error('❌ [PWA] Erro ao limpar cache:', error)
      return false
    }
  }

  return {
    isInstalled,
    canInstall,
    isOnline,
    swRegistration,
    installApp,
    checkForUpdates,
    clearCache
  }
}
