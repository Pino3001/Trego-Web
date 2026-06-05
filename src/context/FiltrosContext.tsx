    import { createContext, useContext, useState, type ReactNode } from 'react';

interface FiltrosContextValue {
  filtrosAbiertos: boolean;
  abrirFiltros: () => void;
  cerrarFiltros: () => void;
}

const FiltrosContext = createContext<FiltrosContextValue | undefined>(undefined);

export function FiltrosUIProvider({ children }: { children: ReactNode }) {
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false);

  const abrirFiltros = () => setFiltrosAbiertos(true);
  const cerrarFiltros = () => setFiltrosAbiertos(false);

  return (
    <FiltrosContext.Provider value={{ filtrosAbiertos, abrirFiltros, cerrarFiltros }}>
      {children}
    </FiltrosContext.Provider>
  );
}

export function useFiltros() {
  const ctx = useContext(FiltrosContext);
  if (!ctx) {
    throw new Error('useFiltrosUI debe usarse dentro de un FiltrosUIProvider');
  }
  return ctx;
}