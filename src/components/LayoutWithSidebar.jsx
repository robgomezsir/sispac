import React, { useState } from 'react'
import { ModernSidebar } from './ModernSidebar.jsx'
import { useSidebar } from '../contexts/SidebarContext.jsx'
import { Menu, X } from 'lucide-react'
// Usando elemento HTML padrão temporariamente

export function LayoutWithSidebar({ children }) {
  const { isMobile } = useSidebar()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <>
      {/* Mobile Header */}
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/30 p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center">
                <img src="/logo192.png" alt="SisPAC" className="w-5 h-5" />
              </div>
              <h1 className="font-semibold text-foreground">SisPAC</h1>
            </div>
            <button
              onClick={toggleSidebar}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0"
            >
              {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <ModernSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main content area */}
      <div 
        className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 transition-all duration-300 ease-in-out"
        style={{
          marginLeft: isMobile ? '0' : '20rem',
          paddingTop: isMobile ? '4rem' : '0', // Espaço para header mobile
          minHeight: '100vh',
          width: isMobile ? '100%' : 'calc(100% - 20rem)'
        }}
      >
        <div className="w-full px-4 sm:px-6 py-4 sm:py-6">
          {children}
        </div>
      </div>

      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-all duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  )
}