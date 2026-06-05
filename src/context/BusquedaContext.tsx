import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface BusquedaContextValue {
  busqueda: string;
  setBusqueda: (val: string) => void;
}

const BusquedaContext = createContext<BusquedaContextValue | undefined>(undefined);

export function BusquedaProvider({ children }: { children: ReactNode }) {
  const [busqueda, setBusqueda] = useState('');

  return (
    <BusquedaContext.Provider value={{ busqueda, setBusqueda }}>
      {children}
    </BusquedaContext.Provider>
  );
}

export function useBusqueda() {
  const ctx = useContext(BusquedaContext);
  if (!ctx) throw new Error('useBusqueda debe usarse dentro de un BusquedaProvider');
  return ctx;
}