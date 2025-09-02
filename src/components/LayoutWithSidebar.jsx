import React from 'react'
import { ModernSidebar } from './ModernSidebar.jsx'
import { useSidebar } from '../contexts/SidebarContext.jsx'
import { cn } from '../lib/utils'

export function LayoutWithSidebar({ children }) {
  const { isCollapsed, isMobile } = useSidebar()

  return (
    <div className="min-h-screen bg-background">
      <ModernSidebar />
      
      {/* Main content area */}
      <main className={cn(
        "transition-all duration-300 ease-in-out min-h-screen",
        // Desktop: compress content when sidebar is open
        !isMobile && !isCollapsed && "ml-80",
        !isMobile && isCollapsed && "ml-16",
        // Mobile: overlay when sidebar is open
        isMobile && "ml-0"
      )}>
        <div className="w-full px-6 py-6">
          {children}
        </div>
      </main>
      
      {/* Mobile overlay when sidebar is open */}
      {isMobile && !isCollapsed && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => {/* Sidebar will handle closing */}}
        />
      )}
    </div>
  )
}
