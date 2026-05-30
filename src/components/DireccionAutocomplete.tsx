import { useState, useEffect, useRef } from "react";
import type { DireccionGeoapify } from "../data/DireccionGeoapify.js";
import { buscarDireccionesGeoapify } from "../api/apiGeoapify.js";

interface AddressAutocompleteProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  onSelectAddress: (direccion: DireccionGeoapify) => void;
  error?: string | undefined;
}

export default function AddressAutocomplete({
  label = "Dirección",
  placeholder = "Ej: Av 8 de Octubre 2020",
  value,
  onChangeText,
  onSelectAddress,
  error,
}: AddressAutocompleteProps) {
  const [sugerencias, setSugerencias] = useState<DireccionGeoapify[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  const wrapperRef = useRef<HTMLDivElement>(null);
  // Para no hacer una peticion cada vez que el usuario escribe una letra en el buscador
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Manejar click afuera para cerrar el menú ──
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ── Manejar escritura del usuario (con Debounce) ──
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    onChangeText(text); // Actualizamos el string en el form padre

    // Limpiamos el timeout anterior si el usuario sigue escribiendo
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (text.trim().length < 3) {
      setSugerencias([]);
      setIsOpen(false);
      return;
    }

    // Esperamos 400ms después de que deje de escribir para llamar a la API
    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const resultados = await buscarDireccionesGeoapify(text);
        setSugerencias(resultados);
        setIsOpen(resultados.length > 0);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }, 400);
  };

  const handleSelect = (sug: DireccionGeoapify) => {
    onChangeText(sug.direccionCompleta); // Ponemos el texto lindo en el input
    onSelectAddress(sug); // Le pasamos el objeto completo al componente padre
    setIsOpen(false);
  };

  return (
    <div className="relative w-full flex flex-col" ref={wrapperRef}>
      {/* Label */}
      {label && <h1 className="text-sm font-semibold px-5">{label}</h1>}
      
      {/* Input */}
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={handleChange}
          onFocus={() => { if (sugerencias.length > 0) setIsOpen(true); }}
          placeholder={placeholder}
          className={`
            w-full border rounded-full h-13 p-3 outline-none transition-all
            ${error ? "border-red-500 focus:ring-red-500" : "border-gray-400 focus:border-trego-restaurante focus:ring-1 focus:ring-trego-restaurante"}
          `}
        />
        
        {/* Spinner de carga (opcional) */}
        {isSearching && (
          <div className="absolute right-4 top-3.5 w-5 h-5 border-2 border-gray-300 border-t-trego-restaurante rounded-full animate-spin" />
        )}
      </div>

      {/* Mensaje de Error */}
      {error && <span className="text-xs text-red-500 px-5 mt-1">{error}</span>}

      {/* Lista Desplegable */}
      {isOpen && sugerencias.length > 0 && (
        <ul className="absolute z-50 left-0 right-0 top-[calc(100%+4px)] bg-white border border-gray-200 rounded-2xl shadow-xl max-h-60 overflow-y-auto">
          {sugerencias.map((sug, index) => (
            <li
              key={index}
              onClick={() => handleSelect(sug)}
              className="px-5 py-3 hover:bg-green-50 text-sm text-gray-700 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors duration-150 flex flex-col"
            >
              <span className="font-semibold text-gray-900">{sug.calle} {sug.numero}</span>
              <span className="text-xs text-gray-500 truncate">{sug.direccionCompleta}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}