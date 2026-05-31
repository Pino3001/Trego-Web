import { useEffect, useRef, useState } from "react";

// ── Types ────────────────────────────────────────────────────────────────────

export interface SearchItem {
  id: string | number;
  label: string;
}

interface TextSearchProps<T> {
  items: T[];
  placeholder?: string;
  colorStyle?: string;
  onSelect: (item: T | undefined) => void;
  selected?: T | undefined;
  mapToItem: (item: T) => SearchItem;
}

// ── Helper: convierte colorStyle a color hex/tailwind para hover ─────────────

const colorMap: Record<string, string> = {
  "trego-restaurante": "#fff3e0",
  "trego-cliente": "#e3f2fd",
  "blue-500": "#eff6ff",
  "green-500": "#f0fdf4",
  "red-500": "#fef2f2",
  "purple-500": "#faf5ff",
};

// ── Component ────────────────────────────────────────────────────────────────

export const TextBuscador = <T,>({
  items,
  placeholder = "Buscar...",
  colorStyle = "trego-restaurante",
  onSelect,
  selected = undefined,
  mapToItem,
}: TextSearchProps<T>) => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [dropdownDir, setDropdownDir] = useState<"down" | "up">("down");

  const selectedMapped = selected ? mapToItem(selected) : undefined;

  // ✅ Fix: filtra solo cuando hay query, si no muestra todos
  const filtered = query.length > 0
    ? items.filter((item) =>
        mapToItem(item).label.toLowerCase().includes(query.toLowerCase())
      )
    : items;

  // Cierra el dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (item: T) => {
    onSelect(item);
    setQuery("");
    setIsOpen(false);
  };

  const handleClear = () => {
    onSelect(undefined);
    setQuery("");
    setIsOpen(false);
    // ✅ Fix: devuelve el foco al input después de limpiar
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const openDropdown = () => {
    const rect = inputRef.current?.getBoundingClientRect();
    if (rect) {
      const spaceBelow = window.innerHeight - rect.bottom;
      const dropdownHeight = 220;
      setDropdownDir(spaceBelow < dropdownHeight ? "up" : "down");
    }
    setIsOpen(true);
  };

  // ✅ Fix: el placeholder flota solo cuando hay foco, query o selección real
  const isFloating = isFocused || query.length > 0 || !!selected;

  // ✅ Color de hover basado en colorStyle
  const hoverBg = colorMap[colorStyle] ?? "#f3f4f6";

  return (
    <div ref={wrapperRef} className="relative w-full">
      {/* Input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          // ✅ Fix: muestra label del seleccionado o query, nunca undefined
          value={selectedMapped ? selectedMapped.label : query}
          readOnly={!!selected}
          onChange={(e) => {
            const newQuery = e.target.value;
            setQuery(newQuery);
            if (selected) onSelect(undefined);
            openDropdown();
          }}
          onFocus={() => {
            setIsFocused(true);
            // ✅ Fix: al enfocar con selección, limpia para permitir nueva búsqueda
            if (selected) {
              setQuery(selectedMapped?.label ?? "");
              onSelect(undefined);
            }
            openDropdown();
          }}
          onBlur={() => setIsFocused(false)}
          // ✅ Fix: placeholder vacío porque usamos floating label
          placeholder=""
          className={`
            peer w-full h-13 border border-gray-300 rounded-full px-5 pr-10
            outline-none
            focus:border-${colorStyle} focus:ring-1 focus:ring-${colorStyle}
            transition-all duration-200
            ${selected ? "cursor-default text-gray-700" : "text-gray-700"}
          `}
        />

        {/* ✅ Fix: Floating label — siempre visible, flota al enfocar */}
        <label
          onClick={() => inputRef.current?.focus()}
          className={`
            absolute left-5 pointer-events-none transition-all duration-200 select-none
            ${
              isFloating
                ? `-top-2.5 text-xs text-${colorStyle} bg-white px-1 font-medium`
                : "top-3.5 text-sm text-gray-400"
            }
          `}
        >
          {placeholder}
        </label>

        {/* Icono derecho: limpiar o lupa */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center">
          {selected ? (
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault() // ✅ evita que onBlur se dispare antes
                handleClear()
              }}
              className={`text-gray-400 hover:text-${colorStyle} transition-colors`}
              aria-label="Limpiar selección"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          ) : (
            // ✅ Fix: botón de lupa despliega la lista al hacer click
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault()
                inputRef.current?.focus()
                openDropdown()
              }}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Buscar"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && !selected && (
        <div
          className={`
            absolute left-0 right-0 z-50 bg-white border border-gray-200
            rounded-2xl shadow-lg overflow-hidden
            ${dropdownDir === "up" ? "bottom-[calc(100%+6px)]" : "top-[calc(100%+6px)]"}
          `}
        >
          {filtered.length === 0 ? (
            <p className="px-4 py-3 text-sm text-gray-400 text-center">
              Sin resultados
            </p>
          ) : (
            <ul className="max-h-52 overflow-y-auto py-1">
              {filtered.map((item) => {
                const mapped = mapToItem(item);
                const isSelected = selectedMapped?.id === mapped.id;
                return (
                  <li
                    key={mapped.id}
                    onMouseDown={() => handleSelect(item)}
                    // ✅ Fix: hover con color del colorStyle muy claro via style inline
                    style={{ "--hover-bg": hoverBg } as React.CSSProperties}
                    className={`
                      px-4 py-3 text-sm cursor-pointer transition-colors
                      border-b border-gray-100 last:border-b-0
                      ${isSelected
                        ? `text-${colorStyle} font-semibold bg-gray-50`
                        : "text-gray-700"
                      }
                    `}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        (e.currentTarget as HTMLElement).style.backgroundColor = hoverBg;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        (e.currentTarget as HTMLElement).style.backgroundColor = "";
                      }
                    }}
                  >
                    {/* ✅ Fix: items con mejor visual — icono + label */}
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-1.5 h-1.5 rounded-full shrink-0 bg-${colorStyle}`}
                      />
                      <span>{mapped.label}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};