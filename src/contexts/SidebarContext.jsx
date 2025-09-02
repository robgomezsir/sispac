import React, { createContext, useContext, useState, useCallback } from 'react'

const SidebarContext = createContext()

export function SidebarProvider({ children }) {
  const [isMobile, setIsMobile] = useState(false)

  const checkMobile = useCallback(() => {
    const mobile = window.innerWidth < 768
    setIsMobile(mobile)
  }, [])

  // Check mobile on mount and resize
  React.useEffect(() => {
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [checkMobile])

  const value = {
    isMobile
  }

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider')
  }
  return context
}