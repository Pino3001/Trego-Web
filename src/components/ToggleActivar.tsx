import React, { useState } from 'react';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
export interface ToggleActivarProps {
  /** Modo controlado: valor externo */
  value?: boolean;
  /** Modo no controlado: valor inicial (default: false) */
  defaultValue?: boolean;
  /** Callback al cambiar estado */
  onChange?: (activo: boolean) => void;
  /** Deshabilita el toggle */
  disabled?: boolean;
}

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------
const ToggleActivar: React.FC<ToggleActivarProps> = ({
  value,
  defaultValue = false,
  onChange,
  disabled = false,
}) => {
  const [interno, setInterno] = useState(defaultValue);

  // Si `value` viene de afuera, el componente es controlado
  const isControlled = value !== undefined;
  const isActive = isControlled ? value! : interno;

  const toggle = () => {
    if (disabled) return;
    const next = !isActive;
    if (!isControlled) setInterno(next);
    onChange?.(next);
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isActive}
      // El label describe la acción que ejecutará el clic, no el estado actual
      aria-label={isActive ? 'Desactivar' : 'Activar'}
      onClick={toggle}
      className={[
        // Base
        'relative inline-flex items-center',
        'h-8 w-28 rounded-full px-1',
        'select-none transition-colors duration-300 ease-in-out',
        // Focus visible
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
        // Cursor
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
        // Color de fondo por estado
        isActive
          ? 'bg-emerald-500 focus-visible:outline-emerald-500'
          : 'bg-gray-400   focus-visible:outline-gray-400',
      ].join(' ')}
    >
      {/* ── "ACTIVAR" ─────────────────────────────────────────────────────
          Queda a la derecha; el knob ocupa la izquierda cuando está activo.
          ──────────────────────────────────────────────────────────────── */}
      <span
        aria-hidden="true"
        className={[
          'absolute right-3',
          'text-white text-[9px] font-bold tracking-wider uppercase whitespace-nowrap',
          'transition-opacity duration-200',
          isActive ? 'opacity-100' : 'opacity-0',
        ].join(' ')}
      >
        activada
      </span>

      {/* ── "DESACTIVAR" ──────────────────────────────────────────────────
          Queda a la izquierda; el knob ocupa la derecha cuando está inactivo.
          ──────────────────────────────────────────────────────────────── */}
      <span
        aria-hidden="true"
        className={[
          'absolute left-3',
          'text-white text-[9px] font-bold tracking-wider uppercase whitespace-nowrap',
          'transition-opacity duration-200',
          !isActive ? 'opacity-100' : 'opacity-0',
        ].join(' ')}
      >
        desactivada
      </span>

      {/* ── Knob ─────────────────────────────────────────────────────────
          top-1 / w-6 / h-6 → 4 px de margen en todos los lados dentro
          del pill (h-8 = 32 px; h-6 = 24 px; 32-24 = 8 px / 2 = 4 px).
          ──────────────────────────────────────────────────────────────── */}
      <span
        className={[
          'absolute top-1 w-6 h-6',
          'bg-white rounded-full shadow-sm',
          'transition-all duration-300 ease-in-out',
          isActive ? 'left-1' : 'right-1',
        ].join(' ')}
      />
    </button>
  );
};

export default ToggleActivar;