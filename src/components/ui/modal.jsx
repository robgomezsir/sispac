import React, { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '../../lib/utils'
import { Button } from './button'

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  className,
  ...props 
}) => {
  const modalRef = useRef(null)

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus()
    }
  }, [isOpen])

  if (!isOpen) return null

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-7xl'
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in-0 duration-300"
        onClick={closeOnOverlayClick ? onClose : undefined}
      />
      
      {/* Modal */}
      <div
        ref={modalRef}
        className={cn(
          "relative w-full bg-background rounded-2xl shadow-2xl border border-border/50",
          "animate-in zoom-in-95 fade-in-0 duration-300",
          sizeClasses[size],
          className
        )}
        tabIndex={-1}
        {...props}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between p-6 border-b border-border/50">
            <h2 className="text-xl font-semibold text-foreground">{title}</h2>
            {showCloseButton && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-muted/50"
                onClick={onClose}
              >
                <X size={16} />
              </Button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>,
    document.body
  )
}

const ModalHeader = ({ children, className, ...props }) => (
  <div className={cn("flex items-center justify-between p-6 border-b border-border/50", className)} {...props}>
    {children}
  </div>
)

const ModalTitle = ({ children, className, ...props }) => (
  <h2 className={cn("text-xl font-semibold text-foreground", className)} {...props}>
    {children}
  </h2>
)

const ModalContent = ({ children, className, ...props }) => (
  <div className={cn("p-6", className)} {...props}>
    {children}
  </div>
)

const ModalFooter = ({ children, className, ...props }) => (
  <div className={cn("flex items-center justify-end gap-3 p-6 border-t border-border/50", className)} {...props}>
    {children}
  </div>
)

const ModalClose = ({ children, className, ...props }) => (
  <Button
    variant="ghost"
    size="sm"
    className={cn("h-8 w-8 p-0 hover:bg-muted/50", className)}
    {...props}
  >
    {children || <X size={16} />}
  </Button>
)

export { Modal, ModalHeader, ModalTitle, ModalContent, ModalFooter, ModalClose }
