import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

interface BusquedaContextValue {
  busqueda: string;
  setBusqueda: (val: string) => void;
  placeholder: string;
  setPlaceholder: (val: string) => void;
}

const BusquedaContext = createContext<BusquedaContextValue | undefined>(
  undefined,
);

export function BusquedaProvider({ children }: { children: ReactNode }) {
  const [busqueda, setBusqueda] = useState("");
  const [placeholder, setPlaceholder] = useState("Buscar restaurante...");

  return (
    <BusquedaContext.Provider
      value={{ busqueda, setBusqueda, placeholder, setPlaceholder }}
    >
      {children}
    </BusquedaContext.Provider>
  );
}

interface BusquedaConfig {
  placeholder?: string;
}

export function useBusqueda(config?: BusquedaConfig) {
  const ctx = useContext(BusquedaContext);
  if (!ctx)
    throw new Error("useBusqueda debe usarse dentro de un BusquedaProvider");

  useEffect(() => {
    // Al montar: aplicar el placeholder que la página pide
    if (config?.placeholder !== undefined) {
      ctx.setPlaceholder(config.placeholder);
    }
    // Al desmontar: limpiar la búsqueda al salir de la página
    return () => {
      ctx.setBusqueda("");
    };
  }, []);

  return ctx;
}
