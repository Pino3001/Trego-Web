import { useCallback, useMemo, useState } from "react";
import ModalBase, { Z_MODAL } from "./ModalBase";
import DireccionFormCarrito from "../cliente/DireccionFormCarrito.js";
import { useCarrito } from "../../context/CarritoContext";

export default function DireccionEnvioModal() {
  const {
    direccionModalAbierto,
    cerrarModalDireccion,
    direcciones,
    setDireccionSeleccionada,
    setMensajeCarrito,
    modalSuperior,
  } = useCarrito();

  const [tab, setTab] = useState("guardadas");

  // Estado inicial limpio que cumple con la interfaz DTODireccion
  const estadoInicialDraft = {
    tag: "",
    calle: "",
    numero: "",
    apartamento: "",
    esquina: "",
    latitud: 0,
    longitud: 0,
  };

  // Estado local para el formulario de "Ubicación Actual"
  const [draftActual, setDraftActual] = useState(estadoInicialDraft);

  const direccionesUi = useMemo(() => direcciones ?? [], [direcciones]);

  // Función auxiliar para centralizar el cierre exitoso
  const confirmarSeleccion = (mensaje) => {
    setMensajeCarrito(mensaje);
    cerrarModalDireccion();
  };

  // Maneja la selección de una dirección del listado "Mis direcciones"
  const seleccionarGuardada = (d) => {
    setDireccionSeleccionada({
      tipo: "guardada",
      data: {
        tag: d.nombre,
        calle: d.datos?.calle || "",
        numero: d.datos?.numero || "",
        apartamento: d.datos?.apartamento || "",
        esquina: d.datos?.esquina || "",
        latitud: d.datos?.latitud || 0,
        longitud: d.datos?.longitud || 0,
      },
    });
    confirmarSeleccion(`Dirección seleccionada: ${d.nombre}`);
  };

  // Recibe directamente el 'draftFinal' enviado por DireccionFormCarrito
  const handleSaveUbicacionActual = useCallback(
    (draftFinal) => {
      const nombreFormateado =
        `${draftFinal.calle} ${draftFinal.numero}`.trim();

      setDireccionSeleccionada({
        tipo: "actual",
        data: draftFinal, // Se envía directo respetando DireccionContexto
      });

      confirmarSeleccion(`Dirección seleccionada: ${nombreFormateado}`);
    },
    [setDireccionSeleccionada, cerrarModalDireccion, setMensajeCarrito],
  );

  // Resetear el draft al cambiar a la pestaña de guardadas
  const cambiarTab = (nuevaTab) => {
    if (nuevaTab === "guardadas") {
      setDraftActual(estadoInicialDraft);
    }
    setTab(nuevaTab);
  };

  return (
    <ModalBase
      abierto={direccionModalAbierto}
      onCerrar={cerrarModalDireccion}
      ariaLabel="Seleccionar dirección"
      zIndex={Z_MODAL.direccion}
      escucharEscape={modalSuperior === "direccion"}
    >
      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-[18px] font-extrabold text-gray-900">
            Dirección de envío
          </h2>
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
              onClick={() => cambiarTab("guardadas")}
              className={`flex-1 rounded-xl py-2 text-[12px] font-extrabold transition ${
                tab === "guardadas"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:bg-white/60"
              }`}
            >
              Tus Direcciones
            </button>
            <button
              type="button"
              onClick={() => setTab("actual")}
              className={`flex-1 rounded-xl py-2 text-[12px] font-extrabold transition ${
                tab === "actual"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:bg-white/60"
              }`}
            >
              Ubicación Actual
            </button>
          </div>
        </div>

        {tab === "guardadas" && (
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
                    <p className="text-[14px] font-extrabold text-gray-900">
                      {d.nombre}
                    </p>
                    <p className="mt-0.5 text-[12px] text-gray-500">
                      {d.descripcion}
                    </p>
                  </div>
                  <span className="text-[12px] font-extrabold text-trego-orange">
                    Elegir
                  </span>
                </button>
              ))
            )}
          </div>
        )}

        {tab === "actual" && (
          <div className="mt-4">
            <DireccionFormCarrito
              draft={draftActual}
              onChange={setDraftActual}
              onSave={handleSaveUbicacionActual}
              onCancel={() => setTab("guardadas")}
              autoLocate={true}
            />
          </div>
        )}
      </div>
    </ModalBase>
  );
}
