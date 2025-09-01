import React from 'react'
import { WifiOff, Wifi } from 'lucide-react'
import { usePWA } from '../hooks/usePWA.jsx'

export default function OfflineIndicator() {
  const { isOnline } = usePWA()

  if (isOnline) {
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-orange-100 dark:bg-orange-900 border border-orange-300 dark:border-orange-700 rounded-lg px-3 py-2 shadow-lg">
        <div className="flex items-center space-x-2">
          <WifiOff className="w-4 h-4 text-orange-600 dark:text-orange-400" />
          <span className="text-sm font-medium text-orange-800 dark:text-orange-200">
            Modo Offline
          </span>
        </div>
        <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
          Algumas funcionalidades podem estar limitadas
        </p>
      </div>
    </div>
  )
}
