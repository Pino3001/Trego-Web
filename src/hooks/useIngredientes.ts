import { useState, useEffect, useCallback, useRef } from "react";
import type { DTOIngrediente } from "../data/DTOIngrediente.js";
import { crearIngrediente, listarIngredientes } from "../api/apiRestaurante.js";

interface UseIngredientesOptions {
  onError?: (mensaje: string) => void;
  onListaCambiada?: (lista: DTOIngrediente[]) => void;
  initialIngredientes?: DTOIngrediente[];
}

export function useIngredientes({
  onError,
  onListaCambiada,
  initialIngredientes,
}: UseIngredientesOptions = {}) {
  const [listaIngredientesBackend, setListaIngredientesBackend] = useState<
    DTOIngrediente[]
  >([]);
  const [listaIngredientes, setListaIngredientes] = useState<DTOIngrediente[]>(
    initialIngredientes ?? [],
  );
  const [ingredienteSeleccionado, setIngredienteSeleccionado] = useState<
    DTOIngrediente | undefined
  >();
  const [nuevoIngrediente, setNuevoIngrediente] = useState("");
  const [mostrarFormIngrediente, setMostrarFormIngrediente] = useState(false);

  const onListaCambiadaRef = useRef(onListaCambiada);
  useEffect(() => {
    onListaCambiadaRef.current = onListaCambiada;
  }, [onListaCambiada]);

  // Carga inicial de ingredientes
  useEffect(() => {
    let cancelado = false;
    const cargarIngredientes = async () => {
      try {
        const lista = await listarIngredientes();
        if (!cancelado) setListaIngredientesBackend(lista);
      } catch (e) {
        if (!cancelado) {
          const mensaje = e instanceof Error ? e.message : "Error inesperado";
          onError?.(mensaje);
        }
      }
    };
    cargarIngredientes();
    return () => {
      cancelado = true;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    onListaCambiadaRef.current?.(listaIngredientes);
  }, [listaIngredientes]);

  const yaEstaEnLista = useCallback(
    (lista: DTOIngrediente[], item: DTOIngrediente) =>
      lista.some(
        (i) =>
          (item.idIngrediente != null &&
            i.idIngrediente === item.idIngrediente) ||
          i.nombre.trim().toLowerCase() === item.nombre.trim().toLowerCase(),
      ),
    [],
  );

  const agregarIngrediente = useCallback(
    (item: DTOIngrediente | undefined) => {
      if (!item) {
        setIngredienteSeleccionado(undefined);
        return;
      }

      setListaIngredientes((prev) => {
        if (yaEstaEnLista(prev, item)) return prev;
        return [...prev, item];
      });

      setIngredienteSeleccionado(undefined);
    },
    [yaEstaEnLista],
  );

  const quitarIngrediente = useCallback((ing: DTOIngrediente) => {
    setListaIngredientes((prev) => {
      return prev.filter((i) =>
        ing.idIngrediente != null
          ? i.idIngrediente !== ing.idIngrediente
          : i.nombre.trim().toLowerCase() !== ing.nombre.trim().toLowerCase(),
      );
    });

    setIngredienteSeleccionado((prev) =>
      prev &&
        ((ing.idIngrediente != null &&
          prev.idIngrediente === ing.idIngrediente) ||
          prev.nombre.trim().toLowerCase() === ing.nombre.trim().toLowerCase())
        ? undefined
        : prev,
    );
  }, []);

  const limpiarIngredientes = useCallback(() => {
    setListaIngredientes([]);
    setIngredienteSeleccionado(undefined);
  }, []);

  const crearIngredienteLocal = useCallback(async () => {
    const nombre = nuevoIngrediente.trim();
    if (!nombre) return;
    try {
      const nuevo = await crearIngrediente(nombre);
      console.log("Devuelve el back el siguiente ingrediente: ", nuevo)
      setListaIngredientesBackend((prev) => [...prev, nuevo]);
      
      agregarIngrediente(nuevo); 
      
      setMostrarFormIngrediente(false);
      setNuevoIngrediente("");
    } catch (error) {
      onError?.(
        error instanceof Error
          ? error.message
          : "Error al crear el ingrediente",
      );
    }
  }, [nuevoIngrediente, agregarIngrediente, onError]);

  return {
    listaIngredientesBackend,
    listaIngredientes,
    ingredienteSeleccionado,
    nuevoIngrediente,
    setNuevoIngrediente,
    mostrarFormIngrediente,
    setMostrarFormIngrediente,
    agregarIngrediente,
    quitarIngrediente,
    limpiarIngredientes,
    crearIngredienteLocal,
  };
}