import React from 'react'
import { ModernSidebar } from './ModernSidebar.jsx'
import { useSidebar } from '../contexts/SidebarContext.jsx'
import { cn } from '../lib/utils'

export function LayoutWithSidebar({ children }) {
  const { isCollapsed, isMobile, toggleSidebar } = useSidebar()

  return (
    <div className="min-h-screen bg-background">
      {/* Fixed Sidebar */}
      <ModernSidebar />
      
      {/* Main content area with fixed positioning */}
      <main className={cn(
        "fixed top-0 right-0 bottom-0 transition-all duration-300 ease-in-out bg-background",
        // Desktop: compress content when sidebar is open
        !isMobile && !isCollapsed && "left-80 border-l border-border/20",
        !isMobile && isCollapsed && "left-16 border-l border-border/20",
        // Mobile: full width when sidebar is closed, overlay when open
        isMobile && !isCollapsed && "left-0",
        isMobile && isCollapsed && "left-0"
      )}>
        <div className="w-full h-full overflow-y-auto px-6 py-6">
          {children}
        </div>
      </main>
      
      {/* Mobile overlay when sidebar is open */}
      {isMobile && !isCollapsed && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={toggleSidebar}
        />
      )}
    </div>
  )
}
