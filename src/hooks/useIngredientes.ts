import { useState, useEffect, useCallback } from "react";
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

  // Sincroniza con el padre cada vez que cambia la lista seleccionada
  useEffect(() => {
    onListaCambiada?.(listaIngredientes);
  }, [listaIngredientes, onListaCambiada]);

  const agregarIngrediente = useCallback((item: DTOIngrediente | undefined) => {
    // Si el item es undefined (el usuario le dio a la X), limpiamos el buscador
    if (!item) {
      setIngredienteSeleccionado(undefined);
      return;
    }

    // Si hay un item válido, lo agregamos a la lista y lo marcamos como seleccionado
    setListaIngredientes((prev) => {
      if (prev.some((i) => i.idIngrediente === item.idIngrediente)) return prev;
      return [...prev, item];
    });
    setIngredienteSeleccionado(item);
  }, []);

  const quitarIngrediente = useCallback((ing: DTOIngrediente) => {
    setListaIngredientes((prev) =>
      prev.filter((i) => i.idIngrediente !== ing.idIngrediente),
    );
    setIngredienteSeleccionado((prev) =>
      prev?.idIngrediente === ing.idIngrediente ? undefined : prev,
    );
  }, []);

  const crearIngredienteLocal = useCallback(async () => {
    const nombre = nuevoIngrediente.trim();
    if (!nombre) return;
    try {
      const nuevo = await crearIngrediente(nombre);
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
    crearIngredienteLocal,
  };
}
