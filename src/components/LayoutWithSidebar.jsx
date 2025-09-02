import React from 'react'
import { ModernSidebar } from './ModernSidebar.jsx'
import { useSidebar } from '../contexts/SidebarContext.jsx'
import { cn } from '../lib/utils'

export function LayoutWithSidebar({ children }) {
  const { isCollapsed, isMobile, toggleSidebar } = useSidebar()

  return (
    <>
      {/* Fixed Sidebar - Always on top */}
      <ModernSidebar />
      
      {/* Main content area */}
      <div 
        className={cn(
          "transition-all duration-300 ease-in-out min-h-screen bg-background",
          // Desktop: add left margin based on sidebar state
          !isMobile && !isCollapsed && "ml-80",
          !isMobile && isCollapsed && "ml-16",
          // Mobile: no margin, sidebar overlays
          isMobile && "ml-0"
        )}
        style={{
          // Ensure content never overlaps sidebar
          minHeight: '100vh',
          width: isMobile ? '100%' : isCollapsed ? 'calc(100% - 4rem)' : 'calc(100% - 20rem)'
        }}
      >
        <div className="w-full px-6 py-6">
          {children}
        </div>
      </div>
      
      {/* Mobile overlay when sidebar is open */}
      {isMobile && !isCollapsed && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={toggleSidebar}
        />
      )}
    </>
  )
}