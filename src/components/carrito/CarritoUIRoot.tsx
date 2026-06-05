import CarritoModal from "./CarritoModal.jsx";
import DetalleProductoModal from "./DetalleProductoModal.jsx";
import DireccionEnvioModal from "./DireccionEnvioModal.jsx";
import PagoModal from "./PagoModal.jsx";

export default function CarritoUIRoot({
  restauranteAbierto,
}: {
  restauranteAbierto?: boolean;
}) {
  return (
    <>
      <DetalleProductoModal />
      <CarritoModal restauranteAbierto={restauranteAbierto} />
      <DireccionEnvioModal />
      <PagoModal />
    </>
  );
}
