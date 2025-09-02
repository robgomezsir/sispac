import React from 'react'
import { ModernSidebar } from './ModernSidebar.jsx'
import { useSidebar } from '../contexts/SidebarContext.jsx'

export function LayoutWithSidebar({ children }) {
  const { isMobile } = useSidebar()

  return (
    <>
      {/* Fixed Sidebar - Always visible */}
      <ModernSidebar />
      
      {/* Main content area with fixed left margin */}
      <div 
        className="min-h-screen bg-background transition-all duration-300 ease-in-out"
        style={{
          marginLeft: isMobile ? '0' : '20rem', // 20rem = 320px (w-80)
          minHeight: '100vh',
          width: isMobile ? '100%' : 'calc(100% - 20rem)'
        }}
      >
        <div className="w-full px-6 py-6">
          {children}
        </div>
      </div>
    </>
  )
}