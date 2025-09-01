import React, { useState } from 'react'
import { X, Download, Smartphone, Wifi, WifiOff } from 'lucide-react'
import { usePWA } from '../hooks/usePWA.jsx'

export default function PWAInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false)
  const { isInstalled, canInstall, isOnline, installApp } = usePWA()

  // Mostrar prompt quando pode instalar
  React.useEffect(() => {
    if (canInstall && !isInstalled) {
      setShowPrompt(true)
    } else {
      setShowPrompt(false)
    }
  }, [canInstall, isInstalled])

  const handleInstall = async () => {
    const result = await installApp()
    if (result.success) {
      setShowPrompt(false)
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
  }

  // Não mostrar se já está instalado ou se não há prompt
  if (isInstalled || !showPrompt) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Smartphone className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Instalar SisPAC
            </h3>
            {!isOnline && (
              <WifiOff className="w-4 h-4 text-orange-500" title="Modo offline" />
            )}
          </div>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          Instale o SisPAC no seu dispositivo para acesso rápido e funcionalidades offline.
          {!isOnline && (
            <span className="block mt-1 text-orange-600 dark:text-orange-400">
              ⚠️ Você está offline, mas pode usar funcionalidades básicas
            </span>
          )}
          <span className="block mt-1 text-blue-600 dark:text-blue-400 text-xs">
            ✨ Acesso direto, notificações e sincronização automática
          </span>
        </p>
        
        <div className="flex space-x-2">
          <button
            onClick={handleInstall}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Instalar</span>
          </button>
          
          <button
            onClick={handleDismiss}
            className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white text-sm font-medium transition-colors"
          >
            Agora não
          </button>
        </div>
      </div>
    </div>
  )
}
