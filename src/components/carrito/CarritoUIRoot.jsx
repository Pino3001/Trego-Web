import React from 'react'
import CarritoModal from './CarritoModal'
import DireccionEnvioModal from './DireccionEnvioModal'
import DetalleProductoModal from './DetalleProductoModal'
import PagoModal from './PagoModal'

export default function CarritoUIRoot({ restauranteAbierto }) {
  return (
    <>
      <DetalleProductoModal />
      <CarritoModal restauranteAbierto={restauranteAbierto} />
      <DireccionEnvioModal />
      <PagoModal />
    </>
  )
}

