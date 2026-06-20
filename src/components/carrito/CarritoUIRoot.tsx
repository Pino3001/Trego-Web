import CarritoModal from "./CarritoModal.js";
import DetalleProductoModal from "./DetalleProductoModal.js";
import DireccionEnvioModal from "./DireccionEnvioModal.jsx";
import PagoModal from "./PagoModal.jsx";

export default function CarritoUIRoot() {
  return (
    <>
      <DetalleProductoModal />
      <CarritoModal />
      <DireccionEnvioModal />
      <PagoModal />
    </>
  );
}
