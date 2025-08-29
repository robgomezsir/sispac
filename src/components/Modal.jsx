import React, { useCallback, useEffect } from 'react'

export default function Modal({ open, onClose, title, children }){
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

  if (!open) return null

  return (
    <div 
      className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
    >
      <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4 sticky top-0 bg-white pb-2">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button 
            className="btn-secondary hover:bg-gray-100 transition-colors" 
            onClick={handleClose}
            aria-label="Fechar modal"
          >
            ✕ Fechar
          </button>
        </div>
        <div className="min-h-0">
          {children}
        </div>
      </div>
    </div>
  )
}
