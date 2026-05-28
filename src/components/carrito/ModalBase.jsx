import React, { useEffect } from 'react'

export const Z_MODAL = {
  detalle: 60,
  carrito: 70,
  direccion: 80,
  pago: 90,
}

export default function ModalBase({
  abierto,
  onCerrar,
  children,
  className = '',
  ariaLabel = 'Modal',
  escucharEscape = true,
  zIndex = Z_MODAL.carrito,
}) {
  useEffect(() => {
    if (!abierto || !escucharEscape) return

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onCerrar?.()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [abierto, escucharEscape, onCerrar])

  useEffect(() => {
    if (!abierto) return
    const overflowAnterior = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = overflowAnterior
    }
  }, [abierto])

  if (!abierto) return null

  function cerrarSiClickEnFondo(e) {
    if (e.target === e.currentTarget) onCerrar?.()
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/20 p-4 backdrop-blur-[2px]"
      style={{ zIndex }}
      onMouseDown={cerrarSiClickEnFondo}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        onMouseDown={(e) => e.stopPropagation()}
        className={`w-full max-w-[540px] rounded-3xl border border-gray-200 bg-white shadow-2xl ${className}`}
      >
        {children}
      </div>
    </div>
  )
}
