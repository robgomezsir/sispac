import React from 'react'

export default function Modal({ open, onClose, title, children }){
  if(!open) return null
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
      <div className="card max-w-2xl w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button className="btn-secondary hover:bg-gray-100 transition-colors" onClick={onClose}>✕ Fechar</button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  )
}
