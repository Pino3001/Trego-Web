import React, { useMemo, useState } from 'react'
import ModalBase, { Z_MODAL } from './ModalBase'
import { useCarrito } from '../../context/CarritoContext'
import { useGeolocation } from '../../hooks/useGeolocation'

function formatearDireccionActual(coords) {
  if (!coords) return 'Ubicación actual'
  const { latitud, longitud } = coords
  return `Lat ${latitud.toFixed(4)}, Lng ${longitud.toFixed(4)}`
}

export default function DireccionEnvioModal() {
  const {
    direccionModalAbierto,
    cerrarModalDireccion,
    direcciones,
    setDireccionSeleccionada,
    modalSuperior,
  } = useCarrito()

  const { coords, cargandoUbicacion, tieneUbicacion, solicitar, ubicacionDenegada } = useGeolocation(false)
  const [tab, setTab] = useState('guardadas') // guardadas | actual

  const direccionesUi = useMemo(() => direcciones ?? [], [direcciones])

  function seleccionarGuardada(d) {
    setDireccionSeleccionada({
      tipo: 'guardada',
      id: d.id,
      nombre: d.nombre,
      descripcion: d.descripcion,
      datos: d.datos,
    })
    cerrarModalDireccion()
  }

  function seleccionarActual() {
    if (!tieneUbicacion) {
      solicitar()
      return
    }
    setDireccionSeleccionada({ tipo: 'actual', coords })
    cerrarModalDireccion()
  }

  return (
    <ModalBase
      abierto={direccionModalAbierto}
      onCerrar={cerrarModalDireccion}
      ariaLabel="Seleccionar dirección"
      zIndex={Z_MODAL.direccion}
      escucharEscape={modalSuperior === 'direccion'}
    >
      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-[18px] font-extrabold text-gray-900">Dirección de envío</h2>
          <button
            type="button"
            onClick={cerrarModalDireccion}
            className="rounded-full px-3 py-1.5 text-[12px] font-bold text-gray-500 hover:bg-gray-100"
          >
            Cerrar
          </button>
        </div>

        <div className="mt-4 rounded-2xl border border-gray-200 bg-[#f5f5f5] p-2">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setTab('guardadas')}
              className={`flex-1 rounded-xl py-2 text-[12px] font-extrabold transition ${
                tab === 'guardadas' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:bg-white/60'
              }`}
            >
              Tus Direcciones
            </button>
            <button
              type="button"
              onClick={() => setTab('actual')}
              className={`flex-1 rounded-xl py-2 text-[12px] font-extrabold transition ${
                tab === 'actual' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:bg-white/60'
              }`}
            >
              Ubicación Actual
            </button>
          </div>
        </div>

        {tab === 'guardadas' && (
          <div className="mt-4 grid gap-3">
            {direccionesUi.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-white py-10 text-center text-gray-600">
                No tenés direcciones guardadas.
              </div>
            ) : (
              direccionesUi.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => seleccionarGuardada(d)}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white p-4 text-left hover:bg-gray-50"
                >
                  <div className="min-w-0">
                    <p className="text-[14px] font-extrabold text-gray-900">{d.nombre}</p>
                    <p className="mt-0.5 text-[12px] text-gray-500">{d.descripcion}</p>
                  </div>
                  <span className="text-[12px] font-extrabold text-trego-orange">Elegir</span>
                </button>
              ))
            )}
          </div>
        )}

        {tab === 'actual' && (
          <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-4">
            <p className="text-[13px] text-gray-600">
              {tieneUbicacion ? (
                <>
                  Ubicación detectada:{' '}
                  <span className="font-extrabold text-gray-900">{formatearDireccionActual(coords)}</span>
                </>
              ) : ubicacionDenegada ? (
                'No se pudo acceder a tu ubicación. Habilitá permisos del navegador.'
              ) : (
                'Usá tu ubicación actual para el envío.'
              )}
            </p>

            <button
              type="button"
              onClick={seleccionarActual}
              className="mt-4 w-full rounded-full bg-trego-orange px-6 py-3 text-[13px] font-extrabold text-white shadow-md hover:bg-orange-600 active:scale-[0.99] disabled:opacity-50"
              disabled={cargandoUbicacion}
            >
              {cargandoUbicacion ? 'Obteniendo ubicación…' : 'Usar ubicación actual'}
            </button>
          </div>
        )}
      </div>
    </ModalBase>
  )
}

