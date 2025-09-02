import React, { useCallback, useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '../lib/utils'
import { useSidebar } from '../contexts/SidebarContext.jsx'

export default function Modal({ open, onClose, title, children, size = "default" }){
  const { isMobile } = useSidebar()
  
  // Fechar modal com ESC
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && open) {
        onClose()
      }
    }

    if (open) {
      document.addEventListener('keydown', handleEscape)
      // Prevenir scroll do body quando modal estiver aberto
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [open, onClose])

  // Fechar modal ao clicar fora
  const handleBackdropClick = useCallback((e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }, [onClose])

  // Fechar modal
  const handleClose = useCallback(() => {
    onClose()
  }, [onClose])

  const sizeClasses = {
    sm: "max-w-md",
    default: "max-w-2xl",
    lg: "max-w-4xl",
    xl: "max-w-6xl",
    full: "max-w-[95vw]"
  }

  if (!open) return null

  return (
    <div 
      className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      style={{
        left: isMobile ? '0' : '20rem', // Respeitar largura da sidebar fixa apenas em desktop
        right: '0',
        top: '0',
        bottom: '0',
        width: isMobile ? '100vw' : 'calc(100vw - 20rem)'
      }}
      onClick={handleBackdropClick}
    >
      <div className={cn(
        "bg-card text-card-foreground rounded-lg border shadow-lg w-full max-h-[90vh] overflow-hidden",
        sizeClasses[size]
      )}>
        <div className="flex items-center justify-between p-6 border-b bg-muted/50">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button 
            className="h-8 w-8 p-0 hover:bg-muted rounded-md transition-colors" 
            onClick={handleClose}
            aria-label="Fechar modal"
          >
            <X size={16} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {children}
        </div>
      </div>
    </div>
  )
}
